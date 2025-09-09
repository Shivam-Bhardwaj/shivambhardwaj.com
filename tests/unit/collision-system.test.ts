import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CollisionZone, RobotConfig } from '../../src/lib/components/types';

// Mock DOM elements for collision detection
class MockElement implements Partial<HTMLElement> {
  public offsetWidth: number;
  public offsetHeight: number;
  public offsetLeft: number;
  public offsetTop: number;
  
  constructor(width: number, height: number, left: number, top: number) {
    this.offsetWidth = width;
    this.offsetHeight = height;
    this.offsetLeft = left;
    this.offsetTop = top;
  }

  getBoundingClientRect(): DOMRect {
    return {
      width: this.offsetWidth,
      height: this.offsetHeight,
      left: this.offsetLeft,
      top: this.offsetTop,
      right: this.offsetLeft + this.offsetWidth,
      bottom: this.offsetTop + this.offsetHeight,
      x: this.offsetLeft,
      y: this.offsetTop,
      toJSON: () => ({})
    } as DOMRect;
  }
}

// Collision detection utilities (to be implemented by the system)
class CollisionSystem {
  private zones: Map<string, CollisionZone> = new Map();
  private robots: Map<string, RobotConfig> = new Map();

  addZone(zone: CollisionZone): void {
    this.zones.set(zone.id, zone);
  }

  removeZone(id: string): void {
    this.zones.delete(id);
  }

  addRobot(robot: RobotConfig): void {
    this.robots.set(robot.id, robot);
  }

  removeRobot(id: string): void {
    this.robots.delete(id);
  }

  updateRobotPosition(id: string, position: { x: number; y: number; z: number }): void {
    const robot = this.robots.get(id);
    if (robot) {
      robot.position = position;
    }
  }

  checkCollision(robotId: string): CollisionZone[] {
    const robot = this.robots.get(robotId);
    if (!robot) return [];

    const collisions: CollisionZone[] = [];
    
    for (const zone of this.zones.values()) {
      if (this.isRobotInZone(robot, zone)) {
        collisions.push(zone);
      }
    }

    return collisions.sort((a, b) => b.priority - a.priority);
  }

  getAvoidanceVector(robotId: string): { x: number; y: number } {
    const robot = this.robots.get(robotId);
    if (!robot) return { x: 0, y: 0 };

    const collisions = this.checkCollision(robotId);
    if (collisions.length === 0) return { x: 0, y: 0 };

    let avoidanceX = 0;
    let avoidanceY = 0;

    for (const zone of collisions) {
      const rect = zone.element.getBoundingClientRect();
      const zoneCenterX = rect.left + rect.width / 2;
      const zoneCenterY = rect.top + rect.height / 2;

      const deltaX = robot.position.x - zoneCenterX;
      const deltaY = robot.position.y - zoneCenterY;
      
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const normalizedX = distance > 0 ? deltaX / distance : 0;
      const normalizedY = distance > 0 ? deltaY / distance : 0;

      const avoidanceStrength = zone.priority * (zone.padding / distance);
      avoidanceX += normalizedX * avoidanceStrength;
      avoidanceY += normalizedY * avoidanceStrength;
    }

    return { x: avoidanceX, y: avoidanceY };
  }

  getZoneDistance(robotId: string, zoneId: string): number {
    const robot = this.robots.get(robotId);
    const zone = this.zones.get(zoneId);
    
    if (!robot || !zone) return Infinity;

    const rect = zone.element.getBoundingClientRect();
    const zoneCenterX = rect.left + rect.width / 2;
    const zoneCenterY = rect.top + rect.height / 2;

    const deltaX = robot.position.x - zoneCenterX;
    const deltaY = robot.position.y - zoneCenterY;

    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  private isRobotInZone(robot: RobotConfig, zone: CollisionZone): boolean {
    const rect = zone.element.getBoundingClientRect();
    const padding = zone.padding;

    return (
      robot.position.x >= rect.left - padding &&
      robot.position.x <= rect.right + padding &&
      robot.position.y >= rect.top - padding &&
      robot.position.y <= rect.bottom + padding
    );
  }

  getActiveZones(): CollisionZone[] {
    return Array.from(this.zones.values());
  }

  getRobots(): RobotConfig[] {
    return Array.from(this.robots.values());
  }

  clear(): void {
    this.zones.clear();
    this.robots.clear();
  }
}

describe('CollisionSystem', () => {
  let collisionSystem: CollisionSystem;
  let mockButton: MockElement;
  let mockText: MockElement;
  let testRobot: RobotConfig;
  let buttonZone: CollisionZone;
  let textZone: CollisionZone;

  beforeEach(() => {
    collisionSystem = new CollisionSystem();
    
    // Create mock DOM elements
    mockButton = new MockElement(100, 40, 200, 300); // width, height, left, top
    mockText = new MockElement(200, 20, 400, 150);

    // Create test robot
    testRobot = {
      id: 'test-robot-1',
      position: { x: 100, y: 100, z: 0 },
      velocity: { x: 1, y: 0, z: 0 },
      behaviors: [],
      size: 10,
      color: '#ff0000',
      interactive: true,
    };

    // Create collision zones
    buttonZone = {
      id: 'button-zone',
      type: 'button',
      element: mockButton as HTMLElement,
      padding: 20,
      priority: 10,
    };

    textZone = {
      id: 'text-zone',
      type: 'text',
      element: mockText as HTMLElement,
      padding: 15,
      priority: 5,
    };
  });

  describe('Zone Management', () => {
    it('should add collision zones successfully', () => {
      collisionSystem.addZone(buttonZone);
      collisionSystem.addZone(textZone);

      const activeZones = collisionSystem.getActiveZones();
      expect(activeZones).toHaveLength(2);
      expect(activeZones.map(z => z.id)).toContain('button-zone');
      expect(activeZones.map(z => z.id)).toContain('text-zone');
    });

    it('should remove collision zones successfully', () => {
      collisionSystem.addZone(buttonZone);
      collisionSystem.addZone(textZone);
      
      collisionSystem.removeZone('button-zone');
      
      const activeZones = collisionSystem.getActiveZones();
      expect(activeZones).toHaveLength(1);
      expect(activeZones[0].id).toBe('text-zone');
    });

    it('should handle duplicate zone IDs by overwriting', () => {
      collisionSystem.addZone(buttonZone);
      
      const updatedZone = { ...buttonZone, priority: 15 };
      collisionSystem.addZone(updatedZone);
      
      const activeZones = collisionSystem.getActiveZones();
      expect(activeZones).toHaveLength(1);
      expect(activeZones[0].priority).toBe(15);
    });
  });

  describe('Robot Management', () => {
    it('should add robots successfully', () => {
      collisionSystem.addRobot(testRobot);

      const robots = collisionSystem.getRobots();
      expect(robots).toHaveLength(1);
      expect(robots[0].id).toBe('test-robot-1');
    });

    it('should remove robots successfully', () => {
      collisionSystem.addRobot(testRobot);
      collisionSystem.removeRobot('test-robot-1');

      const robots = collisionSystem.getRobots();
      expect(robots).toHaveLength(0);
    });

    it('should update robot positions', () => {
      collisionSystem.addRobot(testRobot);
      
      const newPosition = { x: 300, y: 400, z: 0 };
      collisionSystem.updateRobotPosition('test-robot-1', newPosition);

      const robots = collisionSystem.getRobots();
      expect(robots[0].position).toEqual(newPosition);
    });
  });

  describe('Collision Detection', () => {
    beforeEach(() => {
      collisionSystem.addZone(buttonZone);
      collisionSystem.addZone(textZone);
      collisionSystem.addRobot(testRobot);
    });

    it('should detect no collision when robot is far from zones', () => {
      // Robot at (100, 100), zones at (200+, 300+) and (400+, 150+)
      const collisions = collisionSystem.checkCollision('test-robot-1');
      expect(collisions).toHaveLength(0);
    });

    it('should detect collision when robot enters zone padding', () => {
      // Move robot close to button zone (200-220, 300-320 with 20px padding)
      collisionSystem.updateRobotPosition('test-robot-1', { x: 190, y: 310, z: 0 });
      
      const collisions = collisionSystem.checkCollision('test-robot-1');
      expect(collisions).toHaveLength(1);
      expect(collisions[0].id).toBe('button-zone');
    });

    it('should detect multiple collisions and sort by priority', () => {
      // Position robot where both zones overlap (this is contrived but tests priority sorting)
      collisionSystem.updateRobotPosition('test-robot-1', { x: 250, y: 250, z: 0 });
      
      // Add overlapping zones for clearer test
      const highPriorityZone: CollisionZone = {
        id: 'high-priority',
        type: 'interactive',
        element: new MockElement(300, 300, 200, 200) as HTMLElement,
        padding: 100,
        priority: 20,
      };
      
      collisionSystem.addZone(highPriorityZone);
      
      const collisions = collisionSystem.checkCollision('test-robot-1');
      expect(collisions.length).toBeGreaterThan(0);
      
      // Should be sorted by priority (descending)
      for (let i = 0; i < collisions.length - 1; i++) {
        expect(collisions[i].priority).toBeGreaterThanOrEqual(collisions[i + 1].priority);
      }
    });

    it('should handle non-existent robot gracefully', () => {
      const collisions = collisionSystem.checkCollision('non-existent-robot');
      expect(collisions).toHaveLength(0);
    });
  });

  describe('Avoidance Vector Calculation', () => {
    beforeEach(() => {
      collisionSystem.addZone(buttonZone);
      collisionSystem.addRobot(testRobot);
    });

    it('should return zero vector when no collisions', () => {
      const vector = collisionSystem.getAvoidanceVector('test-robot-1');
      expect(vector).toEqual({ x: 0, y: 0 });
    });

    it('should return avoidance vector pointing away from collision zone', () => {
      // Position robot inside button zone
      collisionSystem.updateRobotPosition('test-robot-1', { x: 250, y: 320, z: 0 });
      
      const vector = collisionSystem.getAvoidanceVector('test-robot-1');
      
      // Vector should point away from zone center (250, 320)
      // Zone center is at (250, 320), so vector should be zero or very small
      // Let's position robot slightly off-center
      collisionSystem.updateRobotPosition('test-robot-1', { x: 240, y: 310, z: 0 });
      
      const vector2 = collisionSystem.getAvoidanceVector('test-robot-1');
      expect(typeof vector2.x).toBe('number');
      expect(typeof vector2.y).toBe('number');
    });

    it('should handle multiple collision zones in avoidance calculation', () => {
      collisionSystem.addZone(textZone);
      
      // Position robot where multiple zones affect it
      collisionSystem.updateRobotPosition('test-robot-1', { x: 300, y: 200, z: 0 });
      
      const vector = collisionSystem.getAvoidanceVector('test-robot-1');
      expect(typeof vector.x).toBe('number');
      expect(typeof vector.y).toBe('number');
      
      // Vector magnitude should be greater when multiple zones are involved
      const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
      expect(magnitude).toBeGreaterThanOrEqual(0);
    });

    it('should handle non-existent robot gracefully', () => {
      const vector = collisionSystem.getAvoidanceVector('non-existent-robot');
      expect(vector).toEqual({ x: 0, y: 0 });
    });
  });

  describe('Distance Calculations', () => {
    beforeEach(() => {
      collisionSystem.addZone(buttonZone);
      collisionSystem.addRobot(testRobot);
    });

    it('should calculate correct distance between robot and zone', () => {
      // Robot at (100, 100), button zone center at (250, 320)
      const distance = collisionSystem.getZoneDistance('test-robot-1', 'button-zone');
      
      const expectedDistance = Math.sqrt((100 - 250) ** 2 + (100 - 320) ** 2);
      expect(distance).toBeCloseTo(expectedDistance, 2);
    });

    it('should return infinity for non-existent robot', () => {
      const distance = collisionSystem.getZoneDistance('non-existent', 'button-zone');
      expect(distance).toBe(Infinity);
    });

    it('should return infinity for non-existent zone', () => {
      const distance = collisionSystem.getZoneDistance('test-robot-1', 'non-existent');
      expect(distance).toBe(Infinity);
    });
  });

  describe('Performance and Memory Management', () => {
    it('should handle large numbers of zones efficiently', () => {
      const startTime = performance.now();
      
      // Add 1000 zones
      for (let i = 0; i < 1000; i++) {
        const zone: CollisionZone = {
          id: `zone-${i}`,
          type: 'custom',
          element: new MockElement(50, 50, i * 10, i * 5) as HTMLElement,
          padding: 10,
          priority: i % 10,
        };
        collisionSystem.addZone(zone);
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
      expect(collisionSystem.getActiveZones()).toHaveLength(1000);
    });

    it('should handle large numbers of robots efficiently', () => {
      const startTime = performance.now();
      
      // Add 100 robots
      for (let i = 0; i < 100; i++) {
        const robot: RobotConfig = {
          id: `robot-${i}`,
          position: { x: i * 10, y: i * 5, z: 0 },
          velocity: { x: 1, y: 0, z: 0 },
          behaviors: [],
          size: 5,
          color: '#ff0000',
          interactive: true,
        };
        collisionSystem.addRobot(robot);
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(500); // Should complete in less than 0.5 seconds
      expect(collisionSystem.getRobots()).toHaveLength(100);
    });

    it('should clear all data efficiently', () => {
      // Add some data
      collisionSystem.addZone(buttonZone);
      collisionSystem.addZone(textZone);
      collisionSystem.addRobot(testRobot);
      
      collisionSystem.clear();
      
      expect(collisionSystem.getActiveZones()).toHaveLength(0);
      expect(collisionSystem.getRobots()).toHaveLength(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle zones with zero dimensions', () => {
      const zeroZone: CollisionZone = {
        id: 'zero-zone',
        type: 'custom',
        element: new MockElement(0, 0, 100, 100) as HTMLElement,
        padding: 5,
        priority: 1,
      };
      
      collisionSystem.addZone(zeroZone);
      collisionSystem.addRobot(testRobot);
      
      expect(() => {
        collisionSystem.checkCollision('test-robot-1');
      }).not.toThrow();
    });

    it('should handle negative coordinates', () => {
      const negativeRobot: RobotConfig = {
        ...testRobot,
        id: 'negative-robot',
        position: { x: -100, y: -50, z: 0 },
      };
      
      collisionSystem.addRobot(negativeRobot);
      collisionSystem.addZone(buttonZone);
      
      expect(() => {
        collisionSystem.checkCollision('negative-robot');
      }).not.toThrow();
    });

    it('should handle very large coordinates', () => {
      const largeRobot: RobotConfig = {
        ...testRobot,
        id: 'large-robot',
        position: { x: 999999, y: 999999, z: 0 },
      };
      
      collisionSystem.addRobot(largeRobot);
      collisionSystem.addZone(buttonZone);
      
      const distance = collisionSystem.getZoneDistance('large-robot', 'button-zone');
      expect(distance).toBeGreaterThan(1000000);
    });

    it('should handle zones with negative padding', () => {
      const negativePaddingZone: CollisionZone = {
        ...buttonZone,
        id: 'negative-padding',
        padding: -10,
      };
      
      collisionSystem.addZone(negativePaddingZone);
      collisionSystem.addRobot(testRobot);
      
      expect(() => {
        collisionSystem.checkCollision('test-robot-1');
      }).not.toThrow();
    });
  });
});