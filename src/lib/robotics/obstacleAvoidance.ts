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
  private obstacleCache: Obstacle[] = [];
  private lastCacheUpdate: number = 0;
  private readonly repulsionStrength = 80; // Increased strength for better avoidance
  private readonly repulsionRadius = 50; // Larger radius of influence
  private readonly cacheUpdateInterval = 200; // Update cache every 200ms
  private readonly obstacleMargin = 10; // Safety margin around obstacles for pathfinding

  /**
   * Detect UI elements as obstacles
   * Called more frequently to detect dynamic content changes
   */
  detectObstacles(): void {
    const now = Date.now();
    
    // Use cache if recent enough
    if (now - this.lastCacheUpdate < this.cacheUpdateInterval && this.obstacleCache.length > 0) {
      this.obstacles = [...this.obstacleCache];
      return;
    }
    
    this.obstacles = [];
    
    // Get all potentially obstructing elements
    const selectors = [
      'nav', 'header', 'footer', 'button', 'a',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'div', 'section', 'article', 'aside',
      '.navbar', '.footer', '[role="navigation"]',
      '[role="button"]', '[role="main"]', '[role="contentinfo"]',
      '.btn', '.button', '.card', '.container'
    ];
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const canvas = document.querySelector('canvas');
        if (!canvas) return;
        
        const canvasRect = canvas.getBoundingClientRect();
        
        // Check if element overlaps with viewport and is visible
        if (
          rect.right >= 0 &&
          rect.left <= window.innerWidth &&
          rect.bottom >= 0 &&
          rect.top <= window.innerHeight &&
          rect.width > 30 && // Ignore tiny elements
          rect.height > 20 &&
          window.getComputedStyle(element).visibility !== 'hidden' &&
          window.getComputedStyle(element).display !== 'none'
        ) {
          // Convert to canvas coordinates with safety margin
          const obstacle: Obstacle = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: rect.width + this.obstacleMargin * 2, // Add margin for safer navigation
            height: rect.height + this.obstacleMargin * 2
          };
          
          // Avoid duplicates
          const exists = this.obstacles.some(
            o => Math.abs(o.x - obstacle.x) < 20 && Math.abs(o.y - obstacle.y) < 20
          );
          
          if (!exists) {
            this.obstacles.push(obstacle);
          }
        }
      });
    }
    
    // Update cache
    this.obstacleCache = [...this.obstacles];
    this.lastCacheUpdate = now;
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
   * Now optimized to work with pathfinding - provides local avoidance only
   */
  applyObstacleAvoidance(robot: Robot, targetVelocity: Vector2): Vector2 {
    // Always detect obstacles (caching handles performance)
    this.detectObstacles();
    
    // Calculate repulsion force
    const repulsionForce = this.calculateRepulsionForce(robot);
    
    // When using pathfinding, use lighter avoidance for local corrections
    // Pathfinding handles the main navigation, this handles dynamic obstacles
    const targetStrength = targetVelocity.magnitude();
    const avoidanceStrength = targetStrength > 0.5 ? 0.1 : 0.2; // Lighter avoidance when pathfinding
    
    // Combine target velocity with repulsion
    const avoidanceVelocity = targetVelocity.add(repulsionForce.multiply(avoidanceStrength));
    
    // Limit maximum speed
    const maxSpeed = robot.state.type.speed * 1.5;
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
    // Ensure obstacles are detected
    if (this.obstacles.length === 0) {
      this.detectObstacles();
    }
    return this.obstacles;
  }

  /**
   * Force refresh obstacle cache (useful when content changes significantly)
   */
  refreshObstacles(): void {
    this.lastCacheUpdate = 0;
    this.detectObstacles();
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

