import { Vector3 } from 'three';
import { RobotConfig, CollisionZone } from '../../../lib/components/types';

export interface AvoidanceForce {
  x: number;
  y: number;
  magnitude: number;
}

export class AvoidanceBehavior {
  private detectionRadius = 100;
  private avoidanceStrength = 0.8;
  private personalSpaceRadius = 30;

  constructor(
    detectionRadius?: number,
    avoidanceStrength?: number,
    personalSpaceRadius?: number
  ) {
    if (detectionRadius) this.detectionRadius = detectionRadius;
    if (avoidanceStrength) this.avoidanceStrength = avoidanceStrength;
    if (personalSpaceRadius) this.personalSpaceRadius = personalSpaceRadius;
  }

  calculateObstacleAvoidance(
    robot: RobotConfig,
    collisionZones: CollisionZone[]
  ): AvoidanceForce {
    let totalForce = { x: 0, y: 0, magnitude: 0 };

    for (const zone of collisionZones) {
      const avoidanceForce = this.calculateZoneAvoidance(robot, zone);
      totalForce.x += avoidanceForce.x;
      totalForce.y += avoidanceForce.y;
    }

    totalForce.magnitude = Math.sqrt(totalForce.x * totalForce.x + totalForce.y * totalForce.y);
    
    if (totalForce.magnitude > 0) {
      const normalized = this.normalizeForce(totalForce, this.avoidanceStrength);
      return normalized;
    }

    return { x: 0, y: 0, magnitude: 0 };
  }

  calculateRobotAvoidance(
    robot: RobotConfig,
    nearbyRobots: RobotConfig[]
  ): AvoidanceForce {
    let totalForce = { x: 0, y: 0, magnitude: 0 };

    for (const other of nearbyRobots) {
      if (other.id === robot.id) continue;

      const distance = this.calculateDistance(robot.position, other.position);
      
      if (distance < this.personalSpaceRadius && distance > 0) {
        const strength = this.personalSpaceRadius / distance;
        const direction = {
          x: (robot.position.x - other.position.x) / distance,
          y: (robot.position.y - other.position.y) / distance,
        };

        totalForce.x += direction.x * strength * this.avoidanceStrength;
        totalForce.y += direction.y * strength * this.avoidanceStrength;
      }
    }

    totalForce.magnitude = Math.sqrt(totalForce.x * totalForce.x + totalForce.y * totalForce.y);
    return totalForce;
  }

  calculateWallAvoidance(
    robot: RobotConfig,
    boundaries: { width: number; height: number }
  ): AvoidanceForce {
    const margin = 50;
    let force = { x: 0, y: 0, magnitude: 0 };

    // Left wall
    if (robot.position.x < margin) {
      const strength = (margin - robot.position.x) / margin;
      force.x += strength * this.avoidanceStrength;
    }

    // Right wall
    if (robot.position.x > boundaries.width - margin) {
      const strength = (robot.position.x - (boundaries.width - margin)) / margin;
      force.x -= strength * this.avoidanceStrength;
    }

    // Top wall
    if (robot.position.y < margin) {
      const strength = (margin - robot.position.y) / margin;
      force.y += strength * this.avoidanceStrength;
    }

    // Bottom wall
    if (robot.position.y > boundaries.height - margin) {
      const strength = (robot.position.y - (boundaries.height - margin)) / margin;
      force.y -= strength * this.avoidanceStrength;
    }

    force.magnitude = Math.sqrt(force.x * force.x + force.y * force.y);
    return force;
  }

  private calculateZoneAvoidance(robot: RobotConfig, zone: CollisionZone): AvoidanceForce {
    const rect = zone.element.getBoundingClientRect();
    const expandedRect = {
      left: rect.left - zone.padding,
      top: rect.top - zone.padding,
      right: rect.right + zone.padding,
      bottom: rect.bottom + zone.padding,
    };

    const robotPos = { x: robot.position.x, y: robot.position.y };
    const closestPoint = this.getClosestPointOnRect(robotPos, expandedRect);
    const distance = this.calculateDistance(robotPos, closestPoint);

    if (distance > this.detectionRadius) {
      return { x: 0, y: 0, magnitude: 0 };
    }

    if (distance === 0) {
      // Robot is inside the collision zone, push it out in a random direction
      const angle = Math.random() * Math.PI * 2;
      return {
        x: Math.cos(angle) * this.avoidanceStrength,
        y: Math.sin(angle) * this.avoidanceStrength,
        magnitude: this.avoidanceStrength,
      };
    }

    const strength = Math.max(0, (this.detectionRadius - distance) / this.detectionRadius);
    const direction = {
      x: (robotPos.x - closestPoint.x) / distance,
      y: (robotPos.y - closestPoint.y) / distance,
    };

    const priorityMultiplier = zone.priority || 1;

    return {
      x: direction.x * strength * this.avoidanceStrength * priorityMultiplier,
      y: direction.y * strength * this.avoidanceStrength * priorityMultiplier,
      magnitude: strength * this.avoidanceStrength * priorityMultiplier,
    };
  }

  private getClosestPointOnRect(point: { x: number; y: number }, rect: any): { x: number; y: number } {
    return {
      x: Math.max(rect.left, Math.min(point.x, rect.right)),
      y: Math.max(rect.top, Math.min(point.y, rect.bottom)),
    };
  }

  private calculateDistance(pos1: { x: number; y: number }, pos2: { x: number; y: number }): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private normalizeForce(force: AvoidanceForce, maxMagnitude: number): AvoidanceForce {
    if (force.magnitude === 0) return force;

    const scale = Math.min(maxMagnitude, force.magnitude) / force.magnitude;
    return {
      x: force.x * scale,
      y: force.y * scale,
      magnitude: force.magnitude * scale,
    };
  }

  // Configuration setters
  setDetectionRadius(radius: number): void {
    this.detectionRadius = Math.max(10, radius);
  }

  setAvoidanceStrength(strength: number): void {
    this.avoidanceStrength = Math.max(0, Math.min(2, strength));
  }

  setPersonalSpaceRadius(radius: number): void {
    this.personalSpaceRadius = Math.max(5, radius);
  }

  // Getters for debugging
  getDetectionRadius(): number {
    return this.detectionRadius;
  }

  getAvoidanceStrength(): number {
    return this.avoidanceStrength;
  }

  getPersonalSpaceRadius(): number {
    return this.personalSpaceRadius;
  }
}