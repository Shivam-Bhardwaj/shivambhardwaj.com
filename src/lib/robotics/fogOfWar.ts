/**
 * Fog of War System
 * 
 * Implements exploration-based fog of war where robots reveal areas
 * as they explore. Features city names/landmarks hidden behind fog.
 */

import { Vector2 } from '@/lib/robotics/math';
import { Robot } from './robot';

export interface Landmark {
  id: string;
  name: string;
  position: Vector2;
  discovered: boolean;
  discoveryTime?: number;
}

export class FogOfWar {
  private exploredGrid: boolean[][];
  private gridSize: number; // Size of each grid cell in pixels
  private width: number;
  private height: number;
  private landmarks: Landmark[];

  constructor(canvasWidth: number, canvasHeight: number, gridSize: number = 20) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.gridSize = gridSize;
    
    // Initialize grid - all unexplored
    const cols = Math.ceil(canvasWidth / gridSize);
    const rows = Math.ceil(canvasHeight / gridSize);
    this.exploredGrid = Array(rows).fill(null).map(() => Array(cols).fill(false));
    
    // Generate landmarks (city names)
    this.landmarks = this.generateLandmarks();
  }

  /**
   * Generate city names/landmarks at random positions
   */
  private generateLandmarks(): Landmark[] {
    const cities = [
      'San Jose', 'Palo Alto', 'Mountain View', 'Cupertino', 'Sunnyvale',
      'Santa Clara', 'Los Gatos', 'Saratoga', 'Campbell', 'Milpitas',
      'Fremont', 'Newark', 'Union City', 'Hayward', 'San Mateo'
    ];

    const landmarks: Landmark[] = [];
    const landmarkCount = Math.min(8, cities.length);
    
    for (let i = 0; i < landmarkCount; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      landmarks.push({
        id: `landmark-${i}`,
        name: cities[i],
        position: new Vector2(x, y),
        discovered: false
      });
    }
    
    return landmarks;
  }

  /**
   * Update explored areas based on robot positions
   */
  update(robots: Robot[], robotSize: number): void {
    for (const robot of robots) {
      if (!robot.isOperational()) continue;
      
      const sensorRange = robot.getSensorRange(robotSize);
      const pos = robot.state.position;
      
      // Reveal grid cells within sensor range
      const startCol = Math.floor(Math.max(0, pos.x - sensorRange) / this.gridSize);
      const endCol = Math.floor(Math.min(this.width, pos.x + sensorRange) / this.gridSize);
      const startRow = Math.floor(Math.max(0, pos.y - sensorRange) / this.gridSize);
      const endRow = Math.floor(Math.min(this.height, pos.y + sensorRange) / this.gridSize);
      
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          if (row >= 0 && row < this.exploredGrid.length && 
              col >= 0 && col < this.exploredGrid[0].length) {
            const cellX = col * this.gridSize;
            const cellY = row * this.gridSize;
            const cellCenter = new Vector2(cellX + this.gridSize / 2, cellY + this.gridSize / 2);
            const distance = pos.distanceTo(cellCenter);
            
            if (distance <= sensorRange) {
              this.exploredGrid[row][col] = true;
              robot.markExplored(col, row);
              
              // Check if landmark is discovered
              for (const landmark of this.landmarks) {
                if (!landmark.discovered && 
                    landmark.position.distanceTo(cellCenter) < sensorRange) {
                  landmark.discovered = true;
                  landmark.discoveryTime = Date.now();
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * Share exploration data between communicating robots
   */
  shareExplorationData(robots: Robot[]): void {
    for (let i = 0; i < robots.length; i++) {
      for (let j = i + 1; j < robots.length; j++) {
        const robot1 = robots[i];
        const robot2 = robots[j];
        
        if (robot1.canCommunicateWith(robot2)) {
          robot1.shareExplorationData(robot2);
          
          // Update explored grid based on shared data
          for (const cell of robot1.state.exploredArea) {
            const [col, row] = cell.split(',').map(Number);
            if (row >= 0 && row < this.exploredGrid.length && 
                col >= 0 && col < this.exploredGrid[0].length) {
              this.exploredGrid[row][col] = true;
            }
          }
        }
      }
    }
  }

  /**
   * Check if a position is explored
   */
  isExplored(x: number, y: number): boolean {
    const col = Math.floor(x / this.gridSize);
    const row = Math.floor(y / this.gridSize);
    
    if (row >= 0 && row < this.exploredGrid.length && 
        col >= 0 && col < this.exploredGrid[0].length) {
      return this.exploredGrid[row][col];
    }
    return false;
  }

  /**
   * Get exploration percentage
   */
  getExplorationPercentage(): number {
    let explored = 0;
    let total = 0;
    
    for (const row of this.exploredGrid) {
      for (const cell of row) {
        total++;
        if (cell) explored++;
      }
    }
    
    return total > 0 ? (explored / total) * 100 : 0;
  }

  /**
   * Get all landmarks
   */
  getLandmarks(): Landmark[] {
    return this.landmarks;
  }

  /**
   * Get discovered landmarks
   */
  getDiscoveredLandmarks(): Landmark[] {
    return this.landmarks.filter(l => l.discovered);
  }

  /**
   * Reset fog of war
   */
  reset(): void {
    for (let row = 0; row < this.exploredGrid.length; row++) {
      for (let col = 0; col < this.exploredGrid[0].length; col++) {
        this.exploredGrid[row][col] = false;
      }
    }
    
    for (const landmark of this.landmarks) {
      landmark.discovered = false;
      landmark.discoveryTime = undefined;
    }
  }

  /**
   * Render fog of war overlay
   */
  render(ctx: CanvasRenderingContext2D): void {
    const cols = this.exploredGrid[0].length;
    const rows = this.exploredGrid.length;
    
    // Draw fog overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; // Dark fog
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Clear explored areas
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (this.exploredGrid[row][col]) {
          ctx.clearRect(
            col * this.gridSize,
            row * this.gridSize,
            this.gridSize,
            this.gridSize
          );
        }
      }
    }
    
    // Draw discovered landmarks
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (const landmark of this.landmarks) {
      if (landmark.discovered) {
        ctx.fillStyle = '#10b981'; // Green for discovered
        ctx.fillText(
          landmark.name,
          landmark.position.x,
          landmark.position.y - 20
        );
      }
    }
  }
}

