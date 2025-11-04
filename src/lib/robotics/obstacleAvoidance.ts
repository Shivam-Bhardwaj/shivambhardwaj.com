/**
 * Obstacle Avoidance
 * 
 * Implements smart obstacle avoidance using potential fields method.
 * Detects UI elements (text, buttons, etc.) and navigates around them.
 * 
 * References:
 * - Real-Time Obstacle Avoidance for Manipulators and Mobile Robots (Khatib, 1986)
 * - Potential Field Methods and Their Limitations (Koren & Borenstein, 1991)
 */

import { Vector2 } from '@/lib/robotics/math';
import { Robot } from './robot';

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ObstacleAvoidance {
  private obstacles: Obstacle[] = [];
  private readonly repulsionStrength = 50; // Strength of repulsion force
  private readonly repulsionRadius = 30; // Radius of influence

  /**
   * Detect UI elements as obstacles
   */
  detectObstacles(): void {
    this.obstacles = [];
    
    // Get all potentially obstructing elements
    const selectors = [
      'nav', 'header', 'footer', 'button', 'a',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      '.navbar', '.footer', '[role="navigation"]',
      '[role="button"]', '.btn', '.button'
    ];
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const canvas = document.querySelector('canvas');
        if (!canvas) return;
        
        const canvasRect = canvas.getBoundingClientRect();
        
        // Check if element overlaps with canvas
        if (
          rect.right >= canvasRect.left &&
          rect.left <= canvasRect.right &&
          rect.bottom >= canvasRect.top &&
          rect.top <= canvasRect.bottom
        ) {
          // Convert to canvas coordinates
          const obstacle: Obstacle = {
            x: rect.left - canvasRect.left + rect.width / 2,
            y: rect.top - canvasRect.top + rect.height / 2,
            width: rect.width,
            height: rect.height
          };
          
          this.obstacles.push(obstacle);
        }
      });
    }
    
    // Also check for text elements
    const textElements = document.querySelectorAll('p, span, div, li');
    textElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const canvas = document.querySelector('canvas');
      if (!canvas) return;
      
      const canvasRect = canvas.getBoundingClientRect();
      
      // Only consider large text elements
      if (rect.width > 50 && rect.height > 20) {
        if (
          rect.right >= canvasRect.left &&
          rect.left <= canvasRect.right &&
          rect.bottom >= canvasRect.top &&
          rect.top <= canvasRect.bottom
        ) {
          const obstacle: Obstacle = {
            x: rect.left - canvasRect.left + rect.width / 2,
            y: rect.top - canvasRect.top + rect.height / 2,
            width: rect.width,
            height: rect.height
          };
          
          // Avoid duplicates
          const exists = this.obstacles.some(
            o => Math.abs(o.x - obstacle.x) < 10 && Math.abs(o.y - obstacle.y) < 10
          );
          
          if (!exists) {
            this.obstacles.push(obstacle);
          }
        }
      }
    });
  }

  /**
   * Calculate repulsion force from obstacles using potential fields
   */
  calculateRepulsionForce(robot: Robot): Vector2 {
    const robotPos = robot.state.position;
    let repulsionForce = Vector2.zero();
    
    for (const obstacle of this.obstacles) {
      // Calculate distance to obstacle center
      const obstacleCenter = new Vector2(obstacle.x, obstacle.y);
      const distance = robotPos.distanceTo(obstacleCenter);
      
      // Check if robot is within repulsion radius
      if (distance < this.repulsionRadius + Math.max(obstacle.width, obstacle.height) / 2) {
        // Calculate repulsion direction (away from obstacle)
        const direction = robotPos.subtract(obstacleCenter);
        if (direction.magnitude() > 0.01) {
          const normalizedDir = direction.normalize();
          
          // Repulsion strength decreases with distance
          const strength = this.repulsionStrength / (distance + 1);
          repulsionForce = repulsionForce.add(normalizedDir.multiply(strength));
        }
      }
    }
    
    return repulsionForce;
  }

  /**
   * Apply obstacle avoidance to robot's target velocity
   */
  applyObstacleAvoidance(robot: Robot, targetVelocity: Vector2): Vector2 {
    // Detect obstacles periodically (every 30 frames ~ 0.5 seconds at 60fps)
    if (Math.random() < 0.033) {
      this.detectObstacles();
    }
    
    // Calculate repulsion force
    const repulsionForce = this.calculateRepulsionForce(robot);
    
    // Combine target velocity with repulsion
    const avoidanceVelocity = targetVelocity.add(repulsionForce.multiply(0.1));
    
    // Limit maximum speed
    const maxSpeed = robot.state.type.speed * 1.5; // Allow slight speed boost for avoidance
    if (avoidanceVelocity.magnitude() > maxSpeed) {
      return avoidanceVelocity.normalize().multiply(maxSpeed);
    }
    
    return avoidanceVelocity;
  }

  /**
   * Check if position is clear of obstacles
   */
  isPositionClear(position: Vector2, robotSize: number): boolean {
    for (const obstacle of this.obstacles) {
      const obstacleCenter = new Vector2(obstacle.x, obstacle.y);
      const distance = position.distanceTo(obstacleCenter);
      const minDistance = robotSize + Math.max(obstacle.width, obstacle.height) / 2;
      
      if (distance < minDistance) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get all detected obstacles
   */
  getObstacles(): Obstacle[] {
    return this.obstacles;
  }

  /**
   * Render obstacles for debugging
   */
  render(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    
    for (const obstacle of this.obstacles) {
      ctx.fillRect(
        obstacle.x - obstacle.width / 2,
        obstacle.y - obstacle.height / 2,
        obstacle.width,
        obstacle.height
      );
      ctx.strokeRect(
        obstacle.x - obstacle.width / 2,
        obstacle.y - obstacle.height / 2,
        obstacle.width,
        obstacle.height
      );
    }
  }
}

