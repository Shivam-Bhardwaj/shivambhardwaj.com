import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RobotConfig, RobotBehavior } from '../../src/lib/components/types';

// Robot behavior engine implementation
class RobotBehaviorEngine {
  private robots: Map<string, RobotConfig> = new Map();
  private obstacles: Array<{ x: number; y: number; radius: number }> = [];
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private frameTime: number = 16.67; // ~60fps

  addRobot(robot: RobotConfig): void {
    this.robots.set(robot.id, { ...robot });
  }

  removeRobot(id: string): void {
    this.robots.delete(id);
  }

  updateMousePosition(x: number, y: number): void {
    this.mousePosition = { x, y };
  }

  addObstacle(x: number, y: number, radius: number): void {
    this.obstacles.push({ x, y, radius });
  }

  clearObstacles(): void {
    this.obstacles = [];
  }

  updateRobot(id: string, deltaTime: number = this.frameTime): void {
    const robot = this.robots.get(id);
    if (!robot) return;

    const forces = this.calculateForces(robot);
    
    // Apply forces to velocity
    robot.velocity.x += forces.x * deltaTime * 0.001;
    robot.velocity.y += forces.y * deltaTime * 0.001;

    // Apply velocity damping
    robot.velocity.x *= 0.98;
    robot.velocity.y *= 0.98;

    // Limit velocity
    const maxSpeed = 2.0;
    const speed = Math.sqrt(robot.velocity.x ** 2 + robot.velocity.y ** 2);
    if (speed > maxSpeed) {
      robot.velocity.x = (robot.velocity.x / speed) * maxSpeed;
      robot.velocity.y = (robot.velocity.y / speed) * maxSpeed;
    }

    // Update position
    robot.position.x += robot.velocity.x;
    robot.position.y += robot.velocity.y;
  }

  calculateForces(robot: RobotConfig): { x: number; y: number } {
    let totalForceX = 0;
    let totalForceY = 0;

    for (const behavior of robot.behaviors) {
      if (!behavior.enabled) continue;

      const force = this.calculateBehaviorForce(robot, behavior);
      totalForceX += force.x * behavior.intensity;
      totalForceY += force.y * behavior.intensity;
    }

    return { x: totalForceX, y: totalForceY };
  }

  private calculateBehaviorForce(robot: RobotConfig, behavior: RobotBehavior): { x: number; y: number } {
    switch (behavior.type) {
      case 'follow':
        return this.calculateFollowForce(robot, behavior);
      case 'flee':
        return this.calculateFleeForce(robot, behavior);
      case 'avoid':
        return this.calculateAvoidForce(robot, behavior);
      case 'wander':
        return this.calculateWanderForce(robot, behavior);
      case 'flock':
        return this.calculateFlockForce(robot, behavior);
      default:
        return { x: 0, y: 0 };
    }
  }

  private calculateFollowForce(robot: RobotConfig, behavior: RobotBehavior): { x: number; y: number } {
    const dx = this.mousePosition.x - robot.position.x;
    const dy = this.mousePosition.y - robot.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0 || distance > behavior.radius) {
      return { x: 0, y: 0 };
    }

    const strength = 1 - (distance / behavior.radius);
    return {
      x: (dx / distance) * strength,
      y: (dy / distance) * strength,
    };
  }

  private calculateFleeForce(robot: RobotConfig, behavior: RobotBehavior): { x: number; y: number } {
    const dx = robot.position.x - this.mousePosition.x;
    const dy = robot.position.y - this.mousePosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0 || distance > behavior.radius) {
      return { x: 0, y: 0 };
    }

    const strength = 1 - (distance / behavior.radius);
    return {
      x: (dx / distance) * strength * 2, // Stronger flee response
      y: (dy / distance) * strength * 2,
    };
  }

  private calculateAvoidForce(robot: RobotConfig, behavior: RobotBehavior): { x: number; y: number } {
    let totalForceX = 0;
    let totalForceY = 0;

    for (const obstacle of this.obstacles) {
      const dx = robot.position.x - obstacle.x;
      const dy = robot.position.y - obstacle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = obstacle.radius + robot.size + behavior.radius;

      if (distance > 0 && distance < minDistance) {
        const strength = (minDistance - distance) / minDistance;
        totalForceX += (dx / distance) * strength * 3; // Strong avoidance
        totalForceY += (dy / distance) * strength * 3;
      }
    }

    return { x: totalForceX, y: totalForceY };
  }

  private calculateWanderForce(_robot: RobotConfig, _behavior: RobotBehavior): { x: number; y: number } {
    const angle = Math.random() * Math.PI * 2;
    const strength = 0.1 + Math.random() * 0.2;
    
    return {
      x: Math.cos(angle) * strength,
      y: Math.sin(angle) * strength,
    };
  }

  private calculateFlockForce(robot: RobotConfig, behavior: RobotBehavior): { x: number; y: number } {
    const neighbors = this.getRobotsInRadius(robot, behavior.radius);
    
    if (neighbors.length === 0) {
      return { x: 0, y: 0 };
    }

    // Separation, alignment, cohesion
    const separation = this.calculateSeparation(robot, neighbors);
    const alignment = this.calculateAlignment(robot, neighbors);
    const cohesion = this.calculateCohesion(robot, neighbors);

    return {
      x: separation.x * 0.5 + alignment.x * 0.3 + cohesion.x * 0.2,
      y: separation.y * 0.5 + alignment.y * 0.3 + cohesion.y * 0.2,
    };
  }

  private getRobotsInRadius(robot: RobotConfig, radius: number): RobotConfig[] {
    const neighbors: RobotConfig[] = [];
    
    for (const [id, otherRobot] of this.robots) {
      if (id === robot.id) continue;
      
      const dx = robot.position.x - otherRobot.position.x;
      const dy = robot.position.y - otherRobot.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= radius) {
        neighbors.push(otherRobot);
      }
    }
    
    return neighbors;
  }

  private calculateSeparation(robot: RobotConfig, neighbors: RobotConfig[]): { x: number; y: number } {
    let separationX = 0;
    let separationY = 0;
    
    for (const neighbor of neighbors) {
      const dx = robot.position.x - neighbor.position.x;
      const dy = robot.position.y - neighbor.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0 && distance < robot.size * 3) {
        const strength = (robot.size * 3 - distance) / (robot.size * 3);
        separationX += (dx / distance) * strength;
        separationY += (dy / distance) * strength;
      }
    }
    
    return { x: separationX, y: separationY };
  }

  private calculateAlignment(robot: RobotConfig, neighbors: RobotConfig[]): { x: number; y: number } {
    let avgVelX = 0;
    let avgVelY = 0;
    
    for (const neighbor of neighbors) {
      avgVelX += neighbor.velocity.x;
      avgVelY += neighbor.velocity.y;
    }
    
    avgVelX /= neighbors.length;
    avgVelY /= neighbors.length;
    
    return { x: avgVelX - robot.velocity.x, y: avgVelY - robot.velocity.y };
  }

  private calculateCohesion(robot: RobotConfig, neighbors: RobotConfig[]): { x: number; y: number } {
    let centerX = 0;
    let centerY = 0;
    
    for (const neighbor of neighbors) {
      centerX += neighbor.position.x;
      centerY += neighbor.position.y;
    }
    
    centerX /= neighbors.length;
    centerY /= neighbors.length;
    
    const dx = centerX - robot.position.x;
    const dy = centerY - robot.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return { x: 0, y: 0 };
    
    return { 
      x: (dx / distance) * 0.1, 
      y: (dy / distance) * 0.1 
    };
  }

  getRobot(id: string): RobotConfig | null {
    return this.robots.get(id) || null;
  }

  getAllRobots(): RobotConfig[] {
    return Array.from(this.robots.values());
  }

  clear(): void {
    this.robots.clear();
    this.obstacles = [];
  }
}

describe('RobotBehaviorEngine', () => {
  let behaviorEngine: RobotBehaviorEngine;
  let testRobot: RobotConfig;

  beforeEach(() => {
    behaviorEngine = new RobotBehaviorEngine();
    
    testRobot = {
      id: 'test-robot',
      position: { x: 100, y: 100, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      behaviors: [],
      size: 10,
      color: '#ff0000',
      interactive: true,
    };
  });

  describe('Robot Management', () => {
    it('should add robots successfully', () => {
      behaviorEngine.addRobot(testRobot);
      
      const retrievedRobot = behaviorEngine.getRobot('test-robot');
      expect(retrievedRobot).toEqual(testRobot);
    });

    it('should remove robots successfully', () => {
      behaviorEngine.addRobot(testRobot);
      behaviorEngine.removeRobot('test-robot');
      
      const retrievedRobot = behaviorEngine.getRobot('test-robot');
      expect(retrievedRobot).toBeNull();
    });

    it('should get all robots', () => {
      const robot2 = { ...testRobot, id: 'robot-2', position: { x: 200, y: 200, z: 0 } };
      
      behaviorEngine.addRobot(testRobot);
      behaviorEngine.addRobot(robot2);
      
      const allRobots = behaviorEngine.getAllRobots();
      expect(allRobots).toHaveLength(2);
    });
  });

  describe('Follow Behavior', () => {
    beforeEach(() => {
      const followBehavior: RobotBehavior = {
        type: 'follow',
        intensity: 1.0,
        radius: 200,
        enabled: true,
      };
      
      testRobot.behaviors = [followBehavior];
      behaviorEngine.addRobot(testRobot);
    });

    it('should move toward mouse position', () => {
      behaviorEngine.updateMousePosition(200, 200);
      
      const initialPosition = { ...testRobot.position };
      behaviorEngine.updateRobot('test-robot');
      
      const updatedRobot = behaviorEngine.getRobot('test-robot');
      expect(updatedRobot!.position.x).toBeGreaterThan(initialPosition.x);
      expect(updatedRobot!.position.y).toBeGreaterThan(initialPosition.y);
    });

    it('should not move when mouse is outside radius', () => {
      behaviorEngine.updateMousePosition(400, 400); // Outside radius of 200
      
      const initialPosition = { ...testRobot.position };
      behaviorEngine.updateRobot('test-robot');
      
      const updatedRobot = behaviorEngine.getRobot('test-robot');
      expect(updatedRobot!.position.x).toBeCloseTo(initialPosition.x, 1);
      expect(updatedRobot!.position.y).toBeCloseTo(initialPosition.y, 1);
    });

    it('should have stronger force when mouse is closer', () => {
      // Test close position
      behaviorEngine.updateMousePosition(110, 110);
      const forces1 = behaviorEngine.calculateForces(testRobot);
      
      // Test far position (but within radius)
      behaviorEngine.updateMousePosition(250, 250);
      const forces2 = behaviorEngine.calculateForces(testRobot);
      
      const magnitude1 = Math.sqrt(forces1.x ** 2 + forces1.y ** 2);
      const magnitude2 = Math.sqrt(forces2.x ** 2 + forces2.y ** 2);
      
      expect(magnitude1).toBeGreaterThan(magnitude2);
    });
  });

  describe('Flee Behavior', () => {
    beforeEach(() => {
      const fleeBehavior: RobotBehavior = {
        type: 'flee',
        intensity: 1.0,
        radius: 150,
        enabled: true,
      };
      
      testRobot.behaviors = [fleeBehavior];
      behaviorEngine.addRobot(testRobot);
    });

    it('should move away from mouse position', () => {
      behaviorEngine.updateMousePosition(120, 120); // Close to robot
      
      const initialPosition = { ...testRobot.position };
      behaviorEngine.updateRobot('test-robot');
      
      const updatedRobot = behaviorEngine.getRobot('test-robot');
      expect(updatedRobot!.position.x).toBeLessThan(initialPosition.x);
      expect(updatedRobot!.position.y).toBeLessThan(initialPosition.y);
    });

    it('should not flee when mouse is outside radius', () => {
      behaviorEngine.updateMousePosition(300, 300); // Outside radius
      
      const initialPosition = { ...testRobot.position };
      behaviorEngine.updateRobot('test-robot');
      
      const updatedRobot = behaviorEngine.getRobot('test-robot');
      expect(updatedRobot!.position.x).toBeCloseTo(initialPosition.x, 1);
      expect(updatedRobot!.position.y).toBeCloseTo(initialPosition.y, 1);
    });
  });

  describe('Avoid Behavior', () => {
    beforeEach(() => {
      const avoidBehavior: RobotBehavior = {
        type: 'avoid',
        intensity: 1.0,
        radius: 50,
        enabled: true,
      };
      
      testRobot.behaviors = [avoidBehavior];
      behaviorEngine.addRobot(testRobot);
    });

    it('should avoid obstacles', () => {
      behaviorEngine.addObstacle(120, 120, 20); // Close obstacle
      
      const initialPosition = { ...testRobot.position };
      behaviorEngine.updateRobot('test-robot');
      
      const updatedRobot = behaviorEngine.getRobot('test-robot');
      expect(updatedRobot!.position.x).toBeLessThan(initialPosition.x);
      expect(updatedRobot!.position.y).toBeLessThan(initialPosition.y);
    });

    it('should avoid multiple obstacles', () => {
      behaviorEngine.addObstacle(110, 110, 15);
      behaviorEngine.addObstacle(130, 90, 15);
      
      const forces = behaviorEngine.calculateForces(testRobot);
      const magnitude = Math.sqrt(forces.x ** 2 + forces.y ** 2);
      
      expect(magnitude).toBeGreaterThan(0);
    });

    it('should not be affected by distant obstacles', () => {
      behaviorEngine.addObstacle(300, 300, 20); // Far obstacle
      
      const forces = behaviorEngine.calculateForces(testRobot);
      expect(Math.abs(forces.x)).toBeLessThan(0.1);
      expect(Math.abs(forces.y)).toBeLessThan(0.1);
    });
  });

  describe('Wander Behavior', () => {
    beforeEach(() => {
      const wanderBehavior: RobotBehavior = {
        type: 'wander',
        intensity: 1.0,
        radius: 0, // Not used for wander
        enabled: true,
      };
      
      testRobot.behaviors = [wanderBehavior];
      behaviorEngine.addRobot(testRobot);
    });

    it('should generate random movement forces', () => {
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.5).mockReturnValueOnce(0.3);
      
      const forces = behaviorEngine.calculateForces(testRobot);
      
      expect(forces.x).not.toBe(0);
      expect(forces.y).not.toBe(0);
      expect(typeof forces.x).toBe('number');
      expect(typeof forces.y).toBe('number');
    });

    it('should cause robot to move over time', () => {
      const initialPosition = { ...testRobot.position };
      
      // Run multiple updates to accumulate movement
      for (let i = 0; i < 100; i++) {
        behaviorEngine.updateRobot('test-robot');
      }
      
      const updatedRobot = behaviorEngine.getRobot('test-robot');
      const distanceMoved = Math.sqrt(
        (updatedRobot!.position.x - initialPosition.x) ** 2 +
        (updatedRobot!.position.y - initialPosition.y) ** 2
      );
      
      expect(distanceMoved).toBeGreaterThan(1);
    });
  });

  describe('Flock Behavior', () => {
    let robot2: RobotConfig;
    let robot3: RobotConfig;

    beforeEach(() => {
      const flockBehavior: RobotBehavior = {
        type: 'flock',
        intensity: 1.0,
        radius: 100,
        enabled: true,
      };

      testRobot.behaviors = [flockBehavior];
      
      robot2 = {
        ...testRobot,
        id: 'robot-2',
        position: { x: 120, y: 120, z: 0 },
        velocity: { x: 1, y: 0, z: 0 },
        behaviors: [flockBehavior],
      };

      robot3 = {
        ...testRobot,
        id: 'robot-3',
        position: { x: 80, y: 120, z: 0 },
        velocity: { x: 0, y: 1, z: 0 },
        behaviors: [flockBehavior],
      };

      behaviorEngine.addRobot(testRobot);
      behaviorEngine.addRobot(robot2);
      behaviorEngine.addRobot(robot3);
    });

    it('should separate from nearby robots', () => {
      // Position robots very close
      const closeRobot = behaviorEngine.getRobot('robot-2')!;
      closeRobot.position = { x: 105, y: 105, z: 0 };
      
      const forces = behaviorEngine.calculateForces(testRobot);
      
      // Should have separation force pushing away
      expect(forces.x).toBeLessThan(0); // Away from robot-2
      expect(forces.y).toBeLessThan(0);
    });

    it('should align with neighbor velocities', () => {
      // Give neighbors strong velocity in one direction
      const neighbor = behaviorEngine.getRobot('robot-2')!;
      neighbor.velocity = { x: 2, y: 0, z: 0 };
      
      const forces = behaviorEngine.calculateForces(testRobot);
      
      // Should have some alignment component
      expect(typeof forces.x).toBe('number');
      expect(typeof forces.y).toBe('number');
    });

    it('should move toward center of mass', () => {
      // Position test robot away from others
      testRobot.position = { x: 50, y: 50, z: 0 };
      
      const forces = behaviorEngine.calculateForces(testRobot);
      
      // Should have cohesion force toward center
      expect(forces.x).toBeGreaterThan(0);
      expect(forces.y).toBeGreaterThan(0);
    });

    it('should not flock with robots outside radius', () => {
      // Move all other robots far away
      behaviorEngine.getRobot('robot-2')!.position = { x: 300, y: 300, z: 0 };
      behaviorEngine.getRobot('robot-3')!.position = { x: 400, y: 400, z: 0 };
      
      const forces = behaviorEngine.calculateForces(testRobot);
      
      // Should have minimal or no flocking forces
      expect(Math.abs(forces.x)).toBeLessThan(0.1);
      expect(Math.abs(forces.y)).toBeLessThan(0.1);
    });
  });

  describe('Multiple Behaviors', () => {
    it('should combine multiple behavior forces', () => {
      const followBehavior: RobotBehavior = {
        type: 'follow',
        intensity: 0.5,
        radius: 200,
        enabled: true,
      };

      const wanderBehavior: RobotBehavior = {
        type: 'wander',
        intensity: 0.3,
        radius: 0,
        enabled: true,
      };

      testRobot.behaviors = [followBehavior, wanderBehavior];
      behaviorEngine.addRobot(testRobot);
      behaviorEngine.updateMousePosition(200, 200);

      const forces = behaviorEngine.calculateForces(testRobot);
      
      expect(forces.x).not.toBe(0);
      expect(forces.y).not.toBe(0);
    });

    it('should respect behavior intensities', () => {
      const strongBehavior: RobotBehavior = {
        type: 'follow',
        intensity: 2.0,
        radius: 200,
        enabled: true,
      };

      const weakBehavior: RobotBehavior = {
        type: 'follow',
        intensity: 0.1,
        radius: 200,
        enabled: true,
      };

      behaviorEngine.updateMousePosition(200, 200);

      testRobot.behaviors = [strongBehavior];
      const strongForces = behaviorEngine.calculateForces(testRobot);

      testRobot.behaviors = [weakBehavior];
      const weakForces = behaviorEngine.calculateForces(testRobot);

      const strongMagnitude = Math.sqrt(strongForces.x ** 2 + strongForces.y ** 2);
      const weakMagnitude = Math.sqrt(weakForces.x ** 2 + weakForces.y ** 2);

      expect(strongMagnitude).toBeGreaterThan(weakMagnitude);
    });

    it('should ignore disabled behaviors', () => {
      const enabledBehavior: RobotBehavior = {
        type: 'follow',
        intensity: 1.0,
        radius: 200,
        enabled: true,
      };

      const disabledBehavior: RobotBehavior = {
        type: 'flee',
        intensity: 10.0, // Very strong but disabled
        radius: 200,
        enabled: false,
      };

      testRobot.behaviors = [enabledBehavior, disabledBehavior];
      behaviorEngine.addRobot(testRobot);
      behaviorEngine.updateMousePosition(200, 200);

      const forces = behaviorEngine.calculateForces(testRobot);
      
      // Should only have follow forces, no flee forces
      expect(forces.x).toBeGreaterThan(0); // Moving toward mouse
      expect(forces.y).toBeGreaterThan(0);
    });
  });

  describe('Physics Integration', () => {
    beforeEach(() => {
      const followBehavior: RobotBehavior = {
        type: 'follow',
        intensity: 1.0,
        radius: 200,
        enabled: true,
      };

      testRobot.behaviors = [followBehavior];
      behaviorEngine.addRobot(testRobot);
      behaviorEngine.updateMousePosition(200, 200);
    });

    it('should apply velocity damping', () => {
      // Give robot initial velocity
      const robot = behaviorEngine.getRobot('test-robot')!;
      robot.velocity = { x: 5, y: 5, z: 0 };

      behaviorEngine.updateRobot('test-robot');

      const updatedRobot = behaviorEngine.getRobot('test-robot')!;
      
      // Velocity should be reduced due to damping
      expect(Math.abs(updatedRobot.velocity.x)).toBeLessThan(5);
      expect(Math.abs(updatedRobot.velocity.y)).toBeLessThan(5);
    });

    it('should limit maximum velocity', () => {
      // Apply strong force to exceed max velocity
      const robot = behaviorEngine.getRobot('test-robot')!;
      robot.velocity = { x: 10, y: 10, z: 0 }; // Very high velocity

      for (let i = 0; i < 10; i++) {
        behaviorEngine.updateRobot('test-robot');
      }

      const updatedRobot = behaviorEngine.getRobot('test-robot')!;
      const speed = Math.sqrt(updatedRobot.velocity.x ** 2 + updatedRobot.velocity.y ** 2);
      
      expect(speed).toBeLessThanOrEqual(2.1); // Max speed is 2.0, allow small margin
    });

    it('should update position based on velocity', () => {
      const initialPosition = { ...testRobot.position };
      
      behaviorEngine.updateRobot('test-robot');
      
      const updatedRobot = behaviorEngine.getRobot('test-robot')!;
      
      // Position should change based on velocity
      expect(updatedRobot.position.x).not.toEqual(initialPosition.x);
      expect(updatedRobot.position.y).not.toEqual(initialPosition.y);
    });

    it('should handle custom delta time', () => {
      const initialPosition = { ...testRobot.position };
      
      // Update with different time steps
      behaviorEngine.updateRobot('test-robot', 33.33); // 30fps
      const position30fps = { ...behaviorEngine.getRobot('test-robot')!.position };
      
      // Reset and try 60fps
      const robot = behaviorEngine.getRobot('test-robot')!;
      robot.position = { ...initialPosition };
      robot.velocity = { x: 0, y: 0, z: 0 };
      
      behaviorEngine.updateRobot('test-robot', 16.67); // 60fps
      const position60fps = { ...behaviorEngine.getRobot('test-robot')!.position };
      
      // Different frame rates should produce different movements
      expect(position30fps.x).not.toBeCloseTo(position60fps.x, 5);
      expect(position30fps.y).not.toBeCloseTo(position60fps.y, 5);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle many robots efficiently', () => {
      const startTime = performance.now();
      
      // Add 100 robots with flocking behavior
      for (let i = 0; i < 100; i++) {
        const robot: RobotConfig = {
          id: `robot-${i}`,
          position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200, z: 0 },
          velocity: { x: 0, y: 0, z: 0 },
          behaviors: [{
            type: 'flock',
            intensity: 1.0,
            radius: 50,
            enabled: true,
          }],
          size: 5,
          color: '#ff0000',
          interactive: true,
        };
        behaviorEngine.addRobot(robot);
      }

      // Update all robots
      for (let i = 0; i < 100; i++) {
        behaviorEngine.updateRobot(`robot-${i}`);
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should handle robots at same position', () => {
      const samePositionRobot: RobotConfig = {
        ...testRobot,
        id: 'same-position-robot',
        position: { ...testRobot.position }, // Same position
      };

      behaviorEngine.addRobot(testRobot);
      behaviorEngine.addRobot(samePositionRobot);

      expect(() => {
        behaviorEngine.updateRobot('test-robot');
        behaviorEngine.updateRobot('same-position-robot');
      }).not.toThrow();
    });

    it('should handle extreme coordinate values', () => {
      const extremeRobot: RobotConfig = {
        ...testRobot,
        id: 'extreme-robot',
        position: { x: 999999, y: -999999, z: 0 },
      };

      behaviorEngine.addRobot(extremeRobot);

      expect(() => {
        behaviorEngine.updateRobot('extreme-robot');
      }).not.toThrow();
    });

    it('should clear all data properly', () => {
      behaviorEngine.addRobot(testRobot);
      behaviorEngine.addObstacle(100, 100, 10);
      
      behaviorEngine.clear();
      
      expect(behaviorEngine.getAllRobots()).toHaveLength(0);
      expect(behaviorEngine.getRobot('test-robot')).toBeNull();
    });
  });
});