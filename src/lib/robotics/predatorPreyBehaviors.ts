/**
 * Predator-Prey Behaviors
 * 
 * Implements autonomous behaviors for prey, predator, and scavenger robots
 * with sensor-based detection and emergent behaviors.
 */

import { Vector2 } from '@/lib/robotics/math';
import { Robot } from './robot';

export type RobotRole = 'prey' | 'predator' | 'scavenger';

export interface DetectedRobot {
  robot: Robot;
  distance: number;
  angle: number;
}

export class PredatorPreyBehaviors {
  /**
   * Calculate autonomous behavior target for a robot
   */
  static calculateBehaviorTarget(
    robot: Robot,
    allRobots: Robot[],
    energySources: Vector2[],
    deltaTime: number
  ): Vector2 {
    const role = robot.state.type.role as RobotRole;
    
    switch (role) {
      case 'prey':
        return this.calculatePreyBehavior(robot, allRobots, deltaTime);
      case 'predator':
        return this.calculatePredatorBehavior(robot, allRobots, energySources, deltaTime);
      case 'scavenger':
        return this.calculateScavengerBehavior(robot, allRobots, energySources, deltaTime);
      default:
        return this.wander(robot, deltaTime);
    }
  }

  /**
   * Prey behavior: flee from predators, flock with other prey, wander when safe
   */
  private static calculatePreyBehavior(
    robot: Robot,
    allRobots: Robot[],
    deltaTime: number
  ): Vector2 {
    const detected = this.detectRobots(robot, allRobots);
    const predators = detected.filter(d => d.robot.state.type.role === 'predator');
    const prey = detected.filter(d => d.robot.state.type.role === 'prey');

    // Priority 1: Flee from nearby predators
    if (predators.length > 0) {
      const fleeTarget = this.fleeFromPredators(robot, predators);
      return fleeTarget;
    }

    // Priority 2: Flock with other prey for safety
    if (prey.length > 0) {
      const flockTarget = this.flock(robot, prey.map(d => d.robot));
      return flockTarget;
    }

    // Priority 3: Wander when safe
    return this.wander(robot, deltaTime);
  }

  /**
   * Predator behavior: hunt prey, rest when low energy
   */
  private static calculatePredatorBehavior(
    robot: Robot,
    allRobots: Robot[],
    energySources: Vector2[],
    deltaTime: number
  ): Vector2 {
    // Rest if energy is too low
    if (robot.state.battery < 20) {
      return this.rest(robot);
    }

    const detected = this.detectRobots(robot, allRobots);
    const prey = detected.filter(d => d.robot.state.type.role === 'prey');

    // Hunt nearest prey
    if (prey.length > 0) {
      const huntTarget = this.hunt(robot, prey);
      return huntTarget;
    }

    // Wander looking for prey
    return this.wander(robot, deltaTime);
  }

  /**
   * Scavenger behavior: collect energy, avoid predators
   */
  private static calculateScavengerBehavior(
    robot: Robot,
    allRobots: Robot[],
    energySources: Vector2[],
    deltaTime: number
  ): Vector2 {
    const detected = this.detectRobots(robot, allRobots);
    const predators = detected.filter(d => d.robot.state.type.role === 'predator');

    // Avoid predators
    if (predators.length > 0) {
      const avoidTarget = this.fleeFromPredators(robot, predators);
      return avoidTarget;
    }

    // Seek energy sources
    if (energySources.length > 0) {
      const nearestEnergy = this.findNearest(robot.state.position, energySources);
      if (nearestEnergy) {
        const distance = robot.state.position.distanceTo(nearestEnergy);
        if (distance > 10) {
          return nearestEnergy;
        }
      }
    }

    // Wander
    return this.wander(robot, deltaTime);
  }

  /**
   * Detect robots within sensor range
   */
  private static detectRobots(robot: Robot, allRobots: Robot[]): DetectedRobot[] {
    const sensorRange = robot.getSensorRange(8); // ROBOT_SIZE
    const detected: DetectedRobot[] = [];

    for (const other of allRobots) {
      if (other.state.id === robot.state.id || !other.isOperational()) continue;

      const distance = robot.state.position.distanceTo(other.state.position);
      if (distance <= sensorRange) {
        const angle = Math.atan2(
          other.state.position.y - robot.state.position.y,
          other.state.position.x - robot.state.position.x
        );
        detected.push({ robot: other, distance, angle });
      }
    }

    return detected;
  }

  /**
   * Flee from predators
   */
  private static fleeFromPredators(
    robot: Robot,
    predators: DetectedRobot[]
  ): Vector2 {
    let fleeDirection = Vector2.zero();

    for (const predator of predators) {
      // Calculate direction away from predator
      const away = robot.state.position.subtract(predator.robot.state.position);
      const normalized = away.normalize();
      // Weight by distance (closer predators = stronger flee)
      const weight = 1 / (predator.distance + 1);
      fleeDirection = fleeDirection.add(normalized.multiply(weight));
    }

    if (fleeDirection.magnitude() > 0.1) {
      return robot.state.position.add(fleeDirection.normalize().multiply(50));
    }

    return robot.state.position;
  }

  /**
   * Hunt nearest prey
   */
  private static hunt(robot: Robot, prey: DetectedRobot[]): Vector2 {
    // Find nearest prey
    let nearest: DetectedRobot | null = null;
    let minDistance = Infinity;

    for (const p of prey) {
      if (p.distance < minDistance) {
        minDistance = p.distance;
        nearest = p;
      }
    }

    if (nearest) {
      return nearest.robot.state.position;
    }

    return robot.state.position;
  }

  /**
   * Flock with other robots (cohesion + separation + alignment)
   */
  private static flock(robot: Robot, neighbors: Robot[]): Vector2 {
    if (neighbors.length === 0) return robot.state.position;

    let cohesion = Vector2.zero();
    let separation = Vector2.zero();
    let alignment = Vector2.zero();

    for (const neighbor of neighbors) {
      // Cohesion: move toward center of neighbors
      cohesion = cohesion.add(neighbor.state.position);

      // Separation: avoid crowding
      const diff = robot.state.position.subtract(neighbor.state.position);
      const distance = diff.magnitude();
      if (distance > 0) {
        separation = separation.add(diff.normalize().multiply(1 / distance));
      }

      // Alignment: match velocity direction
      alignment = alignment.add(neighbor.state.velocity);
    }

    cohesion = cohesion.multiply(1 / neighbors.length).subtract(robot.state.position);
    separation = separation.multiply(1 / neighbors.length);
    alignment = alignment.multiply(1 / neighbors.length);

    // Combine behaviors
    const target = cohesion
      .multiply(1.0)
      .add(separation.multiply(1.5))
      .add(alignment.multiply(0.5));

    return robot.state.position.add(target.normalize().multiply(30));
  }

  /**
   * Wander behavior - random exploration
   */
  private static wander(robot: Robot, deltaTime: number): Vector2 {
    // Add some randomness to current direction
    const wanderAngle = robot.state.angle + (Math.random() - 0.5) * 0.5;
    const wanderDistance = 40;
    
    return new Vector2(
      robot.state.position.x + Math.cos(wanderAngle) * wanderDistance,
      robot.state.position.y + Math.sin(wanderAngle) * wanderDistance
    );
  }

  /**
   * Rest behavior - slow movement when low energy
   */
  private static rest(robot: Robot): Vector2 {
    // Move very slowly or stay in place
    return robot.state.position.add(
      robot.state.velocity.normalize().multiply(5)
    );
  }

  /**
   * Find nearest point from a list
   */
  private static findNearest(position: Vector2, points: Vector2[]): Vector2 | null {
    if (points.length === 0) return null;

    let nearest = points[0];
    let minDistance = position.distanceTo(nearest);

    for (const point of points) {
      const distance = position.distanceTo(point);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    }

    return nearest;
  }

  /**
   * Check if predator catches prey (for energy transfer)
   */
  static checkPredatorCatch(predator: Robot, prey: Robot): boolean {
    const distance = predator.state.position.distanceTo(prey.state.position);
    const catchRadius = 12; // Close enough to catch
    return distance < catchRadius;
  }
}

