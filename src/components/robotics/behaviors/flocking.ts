import { RobotConfig } from '../../../lib/components/types';

export interface FlockingForce {
  x: number;
  y: number;
  magnitude: number;
}

export interface FlockingSettings {
  separationRadius: number;
  alignmentRadius: number;
  cohesionRadius: number;
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
  maxSpeed: number;
  maxForce: number;
}

export class FlockingBehavior {
  private settings: FlockingSettings = {
    separationRadius: 25,
    alignmentRadius: 50,
    cohesionRadius: 50,
    separationWeight: 1.5,
    alignmentWeight: 1.0,
    cohesionWeight: 1.0,
    maxSpeed: 2,
    maxForce: 0.1,
  };

  constructor(settings?: Partial<FlockingSettings>) {
    if (settings) {
      this.settings = { ...this.settings, ...settings };
    }
  }

  calculateFlockingForce(robot: RobotConfig, nearbyRobots: RobotConfig[]): FlockingForce {
    const neighbors = this.getNeighbors(robot, nearbyRobots);
    
    if (neighbors.length === 0) {
      return { x: 0, y: 0, magnitude: 0 };
    }

    const separation = this.calculateSeparation(robot, neighbors);
    const alignment = this.calculateAlignment(robot, neighbors);
    const cohesion = this.calculateCohesion(robot, neighbors);

    const totalForce = {
      x: separation.x * this.settings.separationWeight +
         alignment.x * this.settings.alignmentWeight +
         cohesion.x * this.settings.cohesionWeight,
      y: separation.y * this.settings.separationWeight +
         alignment.y * this.settings.alignmentWeight +
         cohesion.y * this.settings.cohesionWeight,
      magnitude: 0,
    };

    totalForce.magnitude = Math.sqrt(totalForce.x * totalForce.x + totalForce.y * totalForce.y);

    if (totalForce.magnitude > this.settings.maxForce) {
      const scale = this.settings.maxForce / totalForce.magnitude;
      totalForce.x *= scale;
      totalForce.y *= scale;
      totalForce.magnitude = this.settings.maxForce;
    }

    return totalForce;
  }

  private calculateSeparation(robot: RobotConfig, neighbors: RobotConfig[]): FlockingForce {
    const steer = { x: 0, y: 0 };
    let count = 0;

    for (const neighbor of neighbors) {
      const distance = this.calculateDistance(robot.position, neighbor.position);
      
      if (distance > 0 && distance < this.settings.separationRadius) {
        const diff = {
          x: robot.position.x - neighbor.position.x,
          y: robot.position.y - neighbor.position.y,
        };

        // Weight by distance (closer neighbors have more influence)
        const weight = this.settings.separationRadius / distance;
        steer.x += (diff.x / distance) * weight;
        steer.y += (diff.y / distance) * weight;
        count++;
      }
    }

    if (count > 0) {
      steer.x /= count;
      steer.y /= count;

      // Normalize to desired speed
      const magnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
      if (magnitude > 0) {
        steer.x = (steer.x / magnitude) * this.settings.maxSpeed;
        steer.y = (steer.y / magnitude) * this.settings.maxSpeed;

        // Steering = Desired - Current velocity
        steer.x -= robot.velocity.x;
        steer.y -= robot.velocity.y;
      }
    }

    return {
      x: steer.x,
      y: steer.y,
      magnitude: Math.sqrt(steer.x * steer.x + steer.y * steer.y),
    };
  }

  private calculateAlignment(robot: RobotConfig, neighbors: RobotConfig[]): FlockingForce {
    const sum = { x: 0, y: 0 };
    let count = 0;

    for (const neighbor of neighbors) {
      const distance = this.calculateDistance(robot.position, neighbor.position);
      
      if (distance > 0 && distance < this.settings.alignmentRadius) {
        sum.x += neighbor.velocity.x;
        sum.y += neighbor.velocity.y;
        count++;
      }
    }

    if (count > 0) {
      sum.x /= count;
      sum.y /= count;

      // Normalize to desired speed
      const magnitude = Math.sqrt(sum.x * sum.x + sum.y * sum.y);
      if (magnitude > 0) {
        sum.x = (sum.x / magnitude) * this.settings.maxSpeed;
        sum.y = (sum.y / magnitude) * this.settings.maxSpeed;

        // Steering = Desired - Current velocity
        sum.x -= robot.velocity.x;
        sum.y -= robot.velocity.y;
      }
    }

    return {
      x: sum.x,
      y: sum.y,
      magnitude: Math.sqrt(sum.x * sum.x + sum.y * sum.y),
    };
  }

  private calculateCohesion(robot: RobotConfig, neighbors: RobotConfig[]): FlockingForce {
    const sum = { x: 0, y: 0 };
    let count = 0;

    for (const neighbor of neighbors) {
      const distance = this.calculateDistance(robot.position, neighbor.position);
      
      if (distance > 0 && distance < this.settings.cohesionRadius) {
        sum.x += neighbor.position.x;
        sum.y += neighbor.position.y;
        count++;
      }
    }

    if (count > 0) {
      sum.x /= count;
      sum.y /= count;

      // Seek towards the center of mass
      return this.seek(robot, sum);
    }

    return { x: 0, y: 0, magnitude: 0 };
  }

  private seek(robot: RobotConfig, target: { x: number; y: number }): FlockingForce {
    const desired = {
      x: target.x - robot.position.x,
      y: target.y - robot.position.y,
    };

    const magnitude = Math.sqrt(desired.x * desired.x + desired.y * desired.y);
    
    if (magnitude > 0) {
      desired.x = (desired.x / magnitude) * this.settings.maxSpeed;
      desired.y = (desired.y / magnitude) * this.settings.maxSpeed;

      // Steering = Desired - Current velocity
      const steer = {
        x: desired.x - robot.velocity.x,
        y: desired.y - robot.velocity.y,
      };

      return {
        x: steer.x,
        y: steer.y,
        magnitude: Math.sqrt(steer.x * steer.x + steer.y * steer.y),
      };
    }

    return { x: 0, y: 0, magnitude: 0 };
  }

  private getNeighbors(robot: RobotConfig, allRobots: RobotConfig[]): RobotConfig[] {
    const maxRadius = Math.max(
      this.settings.separationRadius,
      this.settings.alignmentRadius,
      this.settings.cohesionRadius
    );

    return allRobots.filter(other => {
      if (other.id === robot.id) return false;
      const distance = this.calculateDistance(robot.position, other.position);
      return distance <= maxRadius;
    });
  }

  private calculateDistance(
    pos1: { x: number; y: number },
    pos2: { x: number; y: number }
  ): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Configuration methods
  updateSettings(newSettings: Partial<FlockingSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  getSettings(): FlockingSettings {
    return { ...this.settings };
  }

  // Preset configurations
  static createTightFlock(): FlockingBehavior {
    return new FlockingBehavior({
      separationRadius: 15,
      alignmentRadius: 30,
      cohesionRadius: 30,
      separationWeight: 2.0,
      alignmentWeight: 1.5,
      cohesionWeight: 1.5,
      maxSpeed: 1.5,
      maxForce: 0.15,
    });
  }

  static createLooseFlock(): FlockingBehavior {
    return new FlockingBehavior({
      separationRadius: 35,
      alignmentRadius: 70,
      cohesionRadius: 70,
      separationWeight: 1.0,
      alignmentWeight: 0.8,
      cohesionWeight: 0.8,
      maxSpeed: 2.5,
      maxForce: 0.08,
    });
  }

  static createChaotic(): FlockingBehavior {
    return new FlockingBehavior({
      separationRadius: 20,
      alignmentRadius: 25,
      cohesionRadius: 40,
      separationWeight: 0.5,
      alignmentWeight: 0.3,
      cohesionWeight: 2.0,
      maxSpeed: 3.0,
      maxForce: 0.2,
    });
  }
}