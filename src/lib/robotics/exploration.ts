/**
 * Distributed Exploration Algorithm
 * 
 * Implements consensus-based exploration where robots share information
 * to avoid redundant exploration and maximize coverage efficiency.
 * 
 * References:
 * - Distributed Coverage Control for Mobile Sensing Networks (Cortes et al., 2004)
 * - Consensus-based Cooperative Multi-Agent Target Tracking (Olfati-Saber, 2007)
 */

import { Vector2 } from '@/lib/robotics/math';
import { Robot } from './robot';
import { FogOfWar } from './fogOfWar';

export class DistributedExploration {
  /**
   * Calculate exploration target for a robot using consensus algorithm
   * Robots prefer unexplored areas but also consider coordination with neighbors
   */
  static calculateExplorationTarget(
    robot: Robot,
    robots: Robot[],
    fogOfWar: FogOfWar,
    mouseTarget: Vector2 | null
  ): Vector2 {
    // If mouse target exists, use it as primary goal (with exploration bias)
    if (mouseTarget) {
      // Add exploration bias - prefer areas near unexplored regions
      const explorationBias = this.getExplorationBias(robot, fogOfWar, mouseTarget);
      
      // Combine mouse target with exploration bias
      const target = mouseTarget.lerp(explorationBias, 0.3);
      return target;
    }
    
    // Otherwise, use pure exploration algorithm
    return this.getExplorationBias(robot, fogOfWar, robot.state.position);
  }

  /**
   * Get exploration bias - prefer unexplored areas
   */
  private static getExplorationBias(
    robot: Robot,
    fogOfWar: FogOfWar,
    center: Vector2
  ): Vector2 {
    // Sample points around the robot to find unexplored areas
    const sampleRadius = robot.getSensorRange(10) * 2; // Look ahead
    const sampleCount = 8;
    let bestTarget: Vector2 | null = null;
    let maxUnexploredScore = 0;
    
    for (let i = 0; i < sampleCount; i++) {
      const angle = (i / sampleCount) * Math.PI * 2;
      const samplePos = new Vector2(
        center.x + Math.cos(angle) * sampleRadius,
        center.y + Math.sin(angle) * sampleRadius
      );
      
      // Calculate unexplored score (prefer unexplored areas)
      const unexploredScore = this.calculateUnexploredScore(samplePos, fogOfWar, robot);
      
      if (unexploredScore > maxUnexploredScore) {
        maxUnexploredScore = unexploredScore;
        bestTarget = samplePos;
      }
    }
    
    return bestTarget || center;
  }

  /**
   * Calculate score for a position based on exploration value
   */
  private static calculateUnexploredScore(
    position: Vector2,
    fogOfWar: FogOfWar,
    robot: Robot
  ): number {
    // Check if position is explored
    const isExplored = fogOfWar.isExplored(position.x, position.y);
    
    if (isExplored) {
      return 0; // Already explored, low priority
    }
    
    // Higher score for unexplored areas
    // Also consider distance (prefer closer unexplored areas)
    const distance = robot.state.position.distanceTo(position);
    const distanceScore = 1 / (1 + distance / 100); // Decay with distance
    
    return distanceScore * 10; // Boost unexplored areas
  }

  /**
   * Apply consensus algorithm - robots share exploration data
   */
  static applyConsensus(robots: Robot[]): void {
    for (let i = 0; i < robots.length; i++) {
      for (let j = i + 1; j < robots.length; j++) {
        const robot1 = robots[i];
        const robot2 = robots[j];
        
        if (robot1.canCommunicateWith(robot2)) {
          // Share exploration data
          robot1.shareExplorationData(robot2);
          
          // Consensus on target areas (simplified)
          // Robots avoid areas their neighbors are exploring
          // This is a simplified version - full consensus would use more complex algorithms
        }
      }
    }
  }

  /**
   * Calculate formation-based exploration
   * Robots maintain loose formation while exploring
   */
  static calculateFormationTarget(
    robot: Robot,
    robots: Robot[],
    mouseTarget: Vector2 | null
  ): Vector2 {
    if (!mouseTarget) return robot.state.position;
    
    // Find nearby robots
    const nearbyRobots = robots.filter(r => 
      r.state.id !== robot.state.id &&
      robot.state.position.distanceTo(r.state.position) < robot.state.type.commRange
    );
    
    if (nearbyRobots.length === 0) {
      return mouseTarget; // No neighbors, go directly to target
    }
    
    // Calculate formation offset
    // Simple: spread out around the target
    const formationRadius = 40;
    const angleOffset = (robot.state.id % 6) * (Math.PI * 2 / 6); // Spread in 6 directions
    
    const formationOffset = new Vector2(
      Math.cos(angleOffset) * formationRadius,
      Math.sin(angleOffset) * formationRadius
    );
    
    return mouseTarget.add(formationOffset);
  }
}

