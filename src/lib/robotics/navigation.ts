/**
 * Navigation System
 * 
 * Combines A* pathfinding with obstacle avoidance for intelligent robot navigation.
 * Handles path planning, path following, stuck detection, and recovery behaviors.
 */

import { Vector2 } from './math';
import { Robot } from './robot';
import { AStarPlanner, Obstacle as PathObstacle } from './algorithms';
import { ObstacleAvoidance, Obstacle } from './obstacleAvoidance';

export interface RobotPath {
  waypoints: Vector2[];
  currentWaypointIndex: number;
  lastUpdateTime: number;
  isStuck: boolean;
  stuckStartTime: number | null;
  lastPosition: Vector2;
  positionHistory: Vector2[];
}

export class NavigationSystem {
  private pathPlanners: Map<number, AStarPlanner> = new Map();
  private robotPaths: Map<number, RobotPath> = new Map();
  private obstacleCache: Obstacle[] = [];
  private lastObstacleUpdate: number = 0;
  private readonly obstacleUpdateInterval = 500; // Update obstacles every 500ms
  private readonly pathUpdateInterval = 500; // Recalculate paths every 500ms
  private readonly stuckThreshold = 2000; // Milliseconds without movement
  private readonly stuckDistanceThreshold = 5; // Pixels
  private readonly pathResolution = 20; // Grid resolution for A*
  private readonly waypointReachDistance = 15; // Distance to consider waypoint reached

  constructor(
    private canvasWidth: number,
    private canvasHeight: number,
    private obstacleAvoidance: ObstacleAvoidance
  ) {}

  /**
   * Update canvas dimensions when window resizes
   */
  updateDimensions(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
    // Clear path planners to force regeneration with new dimensions
    this.pathPlanners.clear();
  }

  /**
   * Get or create path planner for a robot
   */
  private getPathPlanner(robotId: number): AStarPlanner {
    if (!this.pathPlanners.has(robotId)) {
      const obstacles = this.getObstaclesForPathfinding();
      this.pathPlanners.set(
        robotId,
        new AStarPlanner(
          this.canvasWidth,
          this.canvasHeight,
          this.pathResolution,
          obstacles
        )
      );
    }
    return this.pathPlanners.get(robotId)!;
  }

  /**
   * Convert obstacle avoidance obstacles to pathfinding obstacles
   */
  private getObstaclesForPathfinding(): PathObstacle[] {
    const obstacles = this.obstacleAvoidance.getObstacles();
    return obstacles.map(obs => ({
      x: obs.x - obs.width / 2,
      y: obs.y - obs.height / 2,
      width: obs.width,
      height: obs.height
    }));
  }

  /**
   * Update obstacle cache periodically
   */
  private updateObstacleCache(currentTime: number): void {
    if (currentTime - this.lastObstacleUpdate < this.obstacleUpdateInterval) {
      return;
    }

    this.obstacleCache = this.obstacleAvoidance.getObstacles();
    this.lastObstacleUpdate = currentTime;

    // Update all path planners with new obstacles
    const pathObstacles = this.getObstaclesForPathfinding();
    for (const planner of this.pathPlanners.values()) {
      planner.updateObstacles(pathObstacles);
    }
  }

  /**
   * Calculate path to target using A* pathfinding
   */
  calculatePath(robot: Robot, target: Vector2): Vector2[] | null {
    const planner = this.getPathPlanner(robot.state.id);
    const start = robot.state.position;
    
    // Clamp target to canvas bounds
    const clampedTarget = new Vector2(
      Math.max(0, Math.min(this.canvasWidth, target.x)),
      Math.max(0, Math.min(this.canvasHeight, target.y))
    );

    const path = planner.findPath(start, clampedTarget);
    
    if (path && path.length > 0) {
      // Smooth path by removing redundant waypoints
      return this.smoothPath(path);
    }
    
    return null;
  }

  /**
   * Smooth path by removing redundant waypoints
   */
  private smoothPath(path: Vector2[]): Vector2[] {
    if (path.length <= 2) return path;

    const smoothed: Vector2[] = [path[0]];
    
    for (let i = 1; i < path.length - 1; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      const next = path[i + 1];
      
      // Check if we can skip this waypoint (if direction change is minimal)
      const dir1 = curr.subtract(prev).normalize();
      const dir2 = next.subtract(curr).normalize();
      const dot = dir1.dot(dir2);
      
      // If directions are similar (dot product > 0.9), skip intermediate waypoint
      if (dot < 0.9) {
        smoothed.push(curr);
      }
    }
    
    smoothed.push(path[path.length - 1]);
    return smoothed;
  }

  /**
   * Get navigation target for robot (next waypoint or final target)
   */
  getNavigationTarget(robot: Robot, target: Vector2 | null, currentTime: number): Vector2 | null {
    if (!target) {
      // No target - clear path and return null for wandering behavior
      this.robotPaths.delete(robot.state.id);
      return null;
    }

    const robotId = robot.state.id;
    let robotPath = this.robotPaths.get(robotId);

    // Update obstacle cache
    this.updateObstacleCache(currentTime);

    // Check if we need to recalculate path
    const needsRecalculation = 
      !robotPath ||
      (currentTime - robotPath.lastUpdateTime > this.pathUpdateInterval) ||
      robotPath.waypoints.length === 0 ||
      robotPath.currentWaypointIndex >= robotPath.waypoints.length;

    if (needsRecalculation) {
      const newPath = this.calculatePath(robot, target);
      
      if (newPath && newPath.length > 0) {
        robotPath = {
          waypoints: newPath,
          currentWaypointIndex: 0,
          lastUpdateTime: currentTime,
          isStuck: false,
          stuckStartTime: null,
          lastPosition: robot.state.position,
          positionHistory: [robot.state.position]
        };
        this.robotPaths.set(robotId, robotPath);
      } else {
        // Path not found - robot might be stuck or target unreachable
        if (robotPath) {
          robotPath.isStuck = true;
        }
        return null;
      }
    }

    if (!robotPath || robotPath.waypoints.length === 0) {
      return null;
    }

    // Check if robot reached current waypoint
    const currentWaypoint = robotPath.waypoints[robotPath.currentWaypointIndex];
    const distanceToWaypoint = robot.state.position.distanceTo(currentWaypoint);

    if (distanceToWaypoint < this.waypointReachDistance) {
      // Move to next waypoint
      robotPath.currentWaypointIndex++;
      
      if (robotPath.currentWaypointIndex >= robotPath.waypoints.length) {
        // Reached final target - recalculate path
        robotPath.lastUpdateTime = 0; // Force recalculation
        return target;
      }
    }

    // Return current waypoint as navigation target
    return robotPath.waypoints[robotPath.currentWaypointIndex];
  }

  /**
   * Check if robot is stuck and update stuck state
   */
  checkStuckState(robot: Robot, currentTime: number): boolean {
    const robotId = robot.state.id;
    const robotPath = this.robotPaths.get(robotId);

    if (!robotPath) {
      return false;
    }

    // Track position history
    robotPath.positionHistory.push(robot.state.position);
    if (robotPath.positionHistory.length > 10) {
      robotPath.positionHistory.shift();
    }

    // Check if robot has moved significantly
    const distanceMoved = robot.state.position.distanceTo(robotPath.lastPosition);
    
    if (distanceMoved < this.stuckDistanceThreshold) {
      // Robot hasn't moved much
      if (!robotPath.isStuck) {
        if (robotPath.stuckStartTime === null) {
          robotPath.stuckStartTime = currentTime;
        } else if (currentTime - robotPath.stuckStartTime > this.stuckThreshold) {
          robotPath.isStuck = true;
        }
      }
    } else {
      // Robot is moving - reset stuck state
      robotPath.isStuck = false;
      robotPath.stuckStartTime = null;
      robotPath.lastPosition = robot.state.position;
    }

    return robotPath.isStuck;
  }

  /**
   * Get recovery direction when robot is stuck
   */
  getRecoveryDirection(robot: Robot): Vector2 {
    // Try to move away from nearby obstacles
    const obstacles = this.obstacleAvoidance.getObstacles();
    let escapeDirection = Vector2.zero();
    
    for (const obstacle of obstacles) {
      const obstacleCenter = new Vector2(obstacle.x, obstacle.y);
      const distance = robot.state.position.distanceTo(obstacleCenter);
      
      if (distance < 100) { // Within escape radius
        const awayFromObstacle = robot.state.position.subtract(obstacleCenter);
        if (awayFromObstacle.magnitude() > 0.01) {
          const normalized = awayFromObstacle.normalize();
          const strength = 1 / (distance + 1);
          escapeDirection = escapeDirection.add(normalized.multiply(strength));
        }
      }
    }

    // If no obstacles nearby, use random direction
    if (escapeDirection.magnitude() < 0.1) {
      const randomAngle = Math.random() * Math.PI * 2;
      escapeDirection = new Vector2(Math.cos(randomAngle), Math.sin(randomAngle));
    }

    return escapeDirection.normalize();
  }

  /**
   * Clear path for a robot (e.g., when target changes significantly)
   */
  clearPath(robotId: number): void {
    this.robotPaths.delete(robotId);
  }

  /**
   * Clear all paths
   */
  clearAllPaths(): void {
    this.robotPaths.clear();
  }

  /**
   * Get current path for debugging/visualization
   */
  getPath(robotId: number): Vector2[] | null {
    const robotPath = this.robotPaths.get(robotId);
    if (!robotPath) return null;
    
    return robotPath.waypoints.slice(robotPath.currentWaypointIndex);
  }
}

