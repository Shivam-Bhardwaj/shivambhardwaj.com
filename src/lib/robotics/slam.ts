/**
 * SLAM System
 * 
 * Simultaneous Localization and Mapping using occupancy grid mapping.
 * Robots build a shared map of obstacles while localizing themselves.
 * 
 * References:
 * - Probabilistic Robotics (Thrun et al., 2005)
 * - An Introduction to Graph-Based SLAM (Grisetti et al., 2010)
 */

import { Vector2 } from '@/lib/robotics/math';
import { Robot } from './robot';

export interface OccupancyCell {
  x: number;
  y: number;
  probability: number; // 0 = free, 1 = occupied, 0.5 = unknown
  visits: number;
}

export interface Landmark {
  id: number;
  position: Vector2;
  observedBy: Set<number>; // Robot IDs that have observed this landmark
  confidence: number;
}

export class SLAMSystem {
  private occupancyGrid: Map<string, OccupancyCell>;
  private landmarks: Map<number, Landmark>;
  private gridSize: number;
  private width: number;
  private height: number;
  private nextLandmarkId: number;

  constructor(canvasWidth: number, canvasHeight: number, gridSize: number = 20) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.gridSize = gridSize;
    this.occupancyGrid = new Map();
    this.landmarks = new Map();
    this.nextLandmarkId = 0;
  }

  /**
   * Update occupancy grid based on robot sensor readings
   */
  updateOccupancyGrid(robot: Robot, obstacles: Array<{ x: number; y: number; width: number; height: number }>): void {
    const robotPos = robot.state.position;
    const sensorRange = robot.getSensorRange(8); // robot size = 8
    
    // Mark free space along sensor rays
    for (const obstacle of obstacles) {
      const obstacleCenter = new Vector2(obstacle.x, obstacle.y);
      const distance = robotPos.distanceTo(obstacleCenter);
      
      if (distance <= sensorRange) {
        // Mark obstacle as occupied
        const gridX = Math.floor(obstacle.x / this.gridSize);
        const gridY = Math.floor(obstacle.y / this.gridSize);
        const key = `${gridX},${gridY}`;
        
        let cell = this.occupancyGrid.get(key);
        if (!cell) {
          cell = {
            x: gridX * this.gridSize + this.gridSize / 2,
            y: gridY * this.gridSize + this.gridSize / 2,
            probability: 0.5,
            visits: 0
          };
        }
        
        // Update occupancy probability (log odds)
        cell.probability = Math.min(1, cell.probability + 0.1);
        cell.visits++;
        this.occupancyGrid.set(key, cell);
        
        // Create landmark if high confidence
        if (cell.probability > 0.7 && cell.visits > 3) {
          this.addLandmark(new Vector2(obstacle.x, obstacle.y), robot.state.id);
        }
      }
    }
    
    // Mark free space around robot
    const robotGridX = Math.floor(robotPos.x / this.gridSize);
    const robotGridY = Math.floor(robotPos.y / this.gridSize);
    
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const gridX = robotGridX + dx;
        const gridY = robotGridY + dy;
        const key = `${gridX},${gridY}`;
        
        let cell = this.occupancyGrid.get(key);
        if (!cell) {
          cell = {
            x: gridX * this.gridSize + this.gridSize / 2,
            y: gridY * this.gridSize + this.gridSize / 2,
            probability: 0.5,
            visits: 0
          };
        }
        
        // Mark as free space
        if (cell.probability > 0) {
          cell.probability = Math.max(0, cell.probability - 0.05);
        }
        this.occupancyGrid.set(key, cell);
      }
    }
  }

  /**
   * Add landmark to map
   */
  private addLandmark(position: Vector2, observedBy: number): void {
    // Check if landmark already exists nearby
    for (const [id, landmark] of this.landmarks) {
      if (landmark.position.distanceTo(position) < this.gridSize * 2) {
        landmark.observedBy.add(observedBy);
        landmark.confidence = Math.min(1, landmark.confidence + 0.1);
        return;
      }
    }
    
    // Create new landmark
    const landmark: Landmark = {
      id: this.nextLandmarkId++,
      position,
      observedBy: new Set([observedBy]),
      confidence: 0.5
    };
    
    this.landmarks.set(landmark.id, landmark);
  }

  /**
   * Share map data between robots
   */
  shareMapData(robots: Robot[]): void {
    for (let i = 0; i < robots.length; i++) {
      for (let j = i + 1; j < robots.length; j++) {
        const robot1 = robots[i];
        const robot2 = robots[j];
        
        if (robot1.canCommunicateWith(robot2)) {
          // Share occupancy grid data
          for (const [key, cell] of this.occupancyGrid) {
            // Both robots update their explored areas
            const [gridX, gridY] = key.split(',').map(Number);
            robot1.markExplored(gridX, gridY);
            robot2.markExplored(gridX, gridY);
          }
          
          // Share landmarks
          for (const landmark of this.landmarks.values()) {
            landmark.observedBy.add(robot1.state.id);
            landmark.observedBy.add(robot2.state.id);
          }
        }
      }
    }
  }

  /**
   * Get occupancy grid
   */
  getOccupancyGrid(): Map<string, OccupancyCell> {
    return this.occupancyGrid;
  }

  /**
   * Get landmarks
   */
  getLandmarks(): Landmark[] {
    return Array.from(this.landmarks.values());
  }

  /**
   * Render SLAM map
   */
  render(ctx: CanvasRenderingContext2D): void {
    // Render occupancy grid
    for (const [key, cell] of this.occupancyGrid) {
      if (cell.probability > 0.3) {
        const alpha = cell.probability * 0.3;
        ctx.fillStyle = `rgba(100, 100, 100, ${alpha})`;
        ctx.fillRect(
          cell.x - this.gridSize / 2,
          cell.y - this.gridSize / 2,
          this.gridSize,
          this.gridSize
        );
      }
    }
    
    // Render landmarks
    ctx.fillStyle = 'rgba(255, 200, 0, 0.6)';
    for (const landmark of this.landmarks.values()) {
      ctx.beginPath();
      ctx.arc(landmark.position.x, landmark.position.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Reset SLAM map
   */
  reset(): void {
    this.occupancyGrid.clear();
    this.landmarks.clear();
    this.nextLandmarkId = 0;
  }
}

