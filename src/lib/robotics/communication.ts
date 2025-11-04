/**
 * Communication Graph Visualization
 * 
 * Visualizes the communication network between robots showing:
 * - Communication links (edges) when robots are in range
 * - Signal strength visualization
 * - Network topology
 * 
 * References:
 * - Communication Topology in Swarm Robotics (Turgut et al., 2008)
 * - Distributed Consensus in Networks (Olfati-Saber et al., 2007)
 */

import { Vector2 } from '@/lib/robotics/math';
import { Robot } from './robot';

export interface CommunicationLink {
  robot1: Robot;
  robot2: Robot;
  distance: number;
  signalStrength: number; // 0-100
}

export class CommunicationGraph {
  private links: CommunicationLink[] = [];

  /**
   * Update communication graph based on current robot positions
   */
  update(robots: Robot[]): void {
    this.links = [];
    
    for (let i = 0; i < robots.length; i++) {
      for (let j = i + 1; j < robots.length; j++) {
        const robot1 = robots[i];
        const robot2 = robots[j];
        
        if (!robot1.isOperational() || !robot2.isOperational()) continue;
        
        // Check if robots can communicate
        if (robot1.canCommunicateWith(robot2)) {
          const distance = robot1.state.position.distanceTo(robot2.state.position);
          
          // Calculate signal strength based on distance and battery
          const maxRange = Math.min(robot1.state.type.commRange, robot2.state.type.commRange);
          const distanceFactor = 1 - (distance / maxRange);
          const batteryFactor = (robot1.state.battery / robot1.state.type.batteryCapacity + 
                                robot2.state.battery / robot2.state.type.batteryCapacity) / 2;
          
          const signalStrength = Math.max(0, Math.min(100, distanceFactor * batteryFactor * 100));
          
          this.links.push({
            robot1,
            robot2,
            distance,
            signalStrength
          });
          
          // Update neighbor sets
          robot1.state.neighbors.add(robot2.state.id);
          robot2.state.neighbors.add(robot1.state.id);
        } else {
          // Remove from neighbors if out of range
          robot1.state.neighbors.delete(robot2.state.id);
          robot2.state.neighbors.delete(robot1.state.id);
        }
      }
    }
  }

  /**
   * Render communication graph
   */
  render(ctx: CanvasRenderingContext2D): void {
    for (const link of this.links) {
      const pos1 = link.robot1.state.position;
      const pos2 = link.robot2.state.position;
      
      // Color based on signal strength
      // Green (strong) -> Yellow (medium) -> Red (weak)
      let color: string;
      if (link.signalStrength > 70) {
        color = '#10b981'; // Green - strong signal
      } else if (link.signalStrength > 40) {
        color = '#f59e0b'; // Yellow - medium signal
      } else {
        color = '#ef4444'; // Red - weak signal
      }
      
      // Line width and opacity based on signal strength
      const opacity = link.signalStrength / 100;
      const lineWidth = 1 + (link.signalStrength / 100) * 2;
      
      ctx.strokeStyle = color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = lineWidth;
      
      ctx.beginPath();
      ctx.moveTo(pos1.x, pos1.y);
      ctx.lineTo(pos2.x, pos2.y);
      ctx.stroke();
      
      // Draw signal strength indicator (small dot at midpoint)
      if (link.signalStrength > 20) {
        const midX = (pos1.x + pos2.x) / 2;
        const midY = (pos1.y + pos2.y) / 2;
        
        ctx.fillStyle = color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(midX, midY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /**
   * Get all communication links
   */
  getLinks(): CommunicationLink[] {
    return this.links;
  }

  /**
   * Get number of active communication links
   */
  getLinkCount(): number {
    return this.links.length;
  }

  /**
   * Check if communication graph is connected
   */
  isConnected(): boolean {
    if (this.links.length === 0) return false;
    
    // Simple connectivity check: if all robots have at least one neighbor
    const robotsWithNeighbors = new Set<number>();
    for (const link of this.links) {
      robotsWithNeighbors.add(link.robot1.state.id);
      robotsWithNeighbors.add(link.robot2.state.id);
    }
    
    // This is a simplified check - full connectivity would require DFS/BFS
    return robotsWithNeighbors.size > 1;
  }

  /**
   * Get network statistics
   */
  getStatistics(): {
    totalLinks: number;
    averageSignalStrength: number;
    connectedRobots: number;
  } {
    const totalLinks = this.links.length;
    const averageSignalStrength = totalLinks > 0
      ? this.links.reduce((sum, link) => sum + link.signalStrength, 0) / totalLinks
      : 0;
    
    const connectedRobots = new Set<number>();
    for (const link of this.links) {
      connectedRobots.add(link.robot1.state.id);
      connectedRobots.add(link.robot2.state.id);
    }
    
    return {
      totalLinks,
      averageSignalStrength,
      connectedRobots: connectedRobots.size
    };
  }
}

