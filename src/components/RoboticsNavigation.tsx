"use client";
import { useEffect, useRef, useState } from "react";

// Robotics Navigation System
// Treats this as a real robotics problem with proper mapping and path planning

const GRID_RESOLUTION = 25; // pixels per grid cell
const NUM_ROBOTS = 4;
const ROBOT_RADIUS = 15;
const MAX_LINEAR_VEL = 2.0;
const MAX_ANGULAR_VEL = 0.5;
const GOAL_TOLERANCE = 20;

interface Pose {
  x: number;
  y: number;
  theta: number;
}

interface Velocity {
  linear: number;
  angular: number;
}

interface GridCell {
  x: number;
  y: number;
  occupied: boolean;
  cost: number;
}

interface Path {
  waypoints: Pose[];
  currentWaypoint: number;
}

interface Robot {
  id: number;
  pose: Pose;
  velocity: Velocity;
  goal: Pose;
  path: Path;
  color: string;
  stuck: boolean;
  lastValidPose: Pose;
}

class OccupancyGrid {
  private grid: boolean[][];
  private width: number;
  private height: number;
  private resolution: number;

  constructor(screenWidth: number, screenHeight: number, resolution: number) {
    this.resolution = resolution;
    this.width = Math.ceil(screenWidth / resolution);
    this.height = Math.ceil(screenHeight / resolution);
    this.grid = Array(this.height).fill(null).map(() => Array(this.width).fill(false));
  }

  worldToGrid(worldX: number, worldY: number): { x: number, y: number } {
    return {
      x: Math.floor(worldX / this.resolution),
      y: Math.floor(worldY / this.resolution)
    };
  }

  gridToWorld(gridX: number, gridY: number): { x: number, y: number } {
    return {
      x: gridX * this.resolution + this.resolution / 2,
      y: gridY * this.resolution + this.resolution / 2
    };
  }

  setObstacle(worldX: number, worldY: number, width: number, height: number) {
    const startGrid = this.worldToGrid(worldX, worldY);
    const endGrid = this.worldToGrid(worldX + width, worldY + height);
    
    for (let gy = Math.max(0, startGrid.y); gy <= Math.min(this.height - 1, endGrid.y); gy++) {
      for (let gx = Math.max(0, startGrid.x); gx <= Math.min(this.width - 1, endGrid.x); gx++) {
        this.grid[gy][gx] = true;
      }
    }
  }

  isOccupied(worldX: number, worldY: number): boolean {
    const grid = this.worldToGrid(worldX, worldY);
    if (grid.x < 0 || grid.x >= this.width || grid.y < 0 || grid.y >= this.height) {
      return true; // Out of bounds is occupied
    }
    return this.grid[grid.y][grid.x];
  }

  isRobotColliding(pose: Pose, radius: number): boolean {
    // Check multiple points around robot circle
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
      const checkX = pose.x + Math.cos(angle) * radius;
      const checkY = pose.y + Math.sin(angle) * radius;
      if (this.isOccupied(checkX, checkY)) {
        return true;
      }
    }
    return this.isOccupied(pose.x, pose.y);
  }

  getGrid(): boolean[][] {
    return this.grid;
  }

  clear() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.grid[y][x] = false;
      }
    }
  }
}

class AStarPlanner {
  private grid: OccupancyGrid;

  constructor(grid: OccupancyGrid) {
    this.grid = grid;
  }

  planPath(start: Pose, goal: Pose): Pose[] | null {
    const startGrid = this.grid.worldToGrid(start.x, start.y);
    const goalGrid = this.grid.worldToGrid(goal.x, goal.y);
    
    interface Node {
      x: number;
      y: number;
      g: number;
      h: number;
      f: number;
      parent: Node | null;
    }

    const openSet: Node[] = [];
    const closedSet = new Set<string>();
    
    const startNode: Node = {
      x: startGrid.x,
      y: startGrid.y,
      g: 0,
      h: this.heuristic(startGrid, goalGrid),
      f: 0,
      parent: null
    };
    startNode.f = startNode.g + startNode.h;
    openSet.push(startNode);

    while (openSet.length > 0) {
      // Find node with lowest f score
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;
      
      const currentKey = `${current.x},${current.y}`;
      if (closedSet.has(currentKey)) continue;
      closedSet.add(currentKey);

      // Check if we reached the goal
      if (Math.abs(current.x - goalGrid.x) <= 1 && Math.abs(current.y - goalGrid.y) <= 1) {
        return this.reconstructPath(current);
      }

      // Check neighbors (8-connected)
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;

          const neighborX = current.x + dx;
          const neighborY = current.y + dy;
          const neighborKey = `${neighborX},${neighborY}`;

          if (closedSet.has(neighborKey)) continue;

          const neighborWorld = this.grid.gridToWorld(neighborX, neighborY);
          if (this.grid.isOccupied(neighborWorld.x, neighborWorld.y)) continue;

          const g = current.g + (dx === 0 || dy === 0 ? 1 : 1.414); // Diagonal cost
          const h = this.heuristic({x: neighborX, y: neighborY}, goalGrid);
          const f = g + h;

          const existingNode = openSet.find(n => n.x === neighborX && n.y === neighborY);
          if (!existingNode || g < existingNode.g) {
            const neighborNode: Node = {
              x: neighborX,
              y: neighborY,
              g,
              h,
              f,
              parent: current
            };
            
            if (existingNode) {
              const index = openSet.indexOf(existingNode);
              openSet[index] = neighborNode;
            } else {
              openSet.push(neighborNode);
            }
          }
        }
      }
    }

    return null; // No path found
  }

  private heuristic(a: {x: number, y: number}, b: {x: number, y: number}): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  private reconstructPath(node: any): Pose[] {
    const path: Pose[] = [];
    let current = node;
    
    while (current) {
      const world = this.grid.gridToWorld(current.x, current.y);
      path.unshift({
        x: world.x,
        y: world.y,
        theta: 0 // Will be calculated later
      });
      current = current.parent;
    }

    // Calculate orientations
    for (let i = 0; i < path.length - 1; i++) {
      const dx = path[i + 1].x - path[i].x;
      const dy = path[i + 1].y - path[i].y;
      path[i].theta = Math.atan2(dy, dx);
    }

    return path;
  }
}

class DynamicWindowApproach {
  private grid: OccupancyGrid;

  constructor(grid: OccupancyGrid) {
    this.grid = grid;
  }

  computeVelocity(robot: Robot, targetPose: Pose): Velocity {
    const bestVel = { linear: 0, angular: 0 };
    let bestScore = -Infinity;

    // Sample velocity space
    for (let v = -MAX_LINEAR_VEL; v <= MAX_LINEAR_VEL; v += 0.2) {
      for (let w = -MAX_ANGULAR_VEL; w <= MAX_ANGULAR_VEL; w += 0.1) {
        const score = this.evaluateTrajectory(robot, v, w, targetPose);
        if (score > bestScore) {
          bestScore = score;
          bestVel.linear = v;
          bestVel.angular = w;
        }
      }
    }

    return bestVel;
  }

  private evaluateTrajectory(robot: Robot, v: number, w: number, target: Pose): number {
    const simTime = 1.0;
    const dt = 0.1;
    let pose = { ...robot.pose };
    
    // Simulate trajectory
    for (let t = 0; t < simTime; t += dt) {
      pose.x += v * Math.cos(pose.theta) * dt;
      pose.y += v * Math.sin(pose.theta) * dt;
      pose.theta += w * dt;
      
      // Check for collision
      if (this.grid.isRobotColliding(pose, ROBOT_RADIUS)) {
        return -1000; // Collision penalty
      }
    }

    // Score based on distance to target
    const distToTarget = Math.sqrt((pose.x - target.x) ** 2 + (pose.y - target.y) ** 2);
    const headingError = Math.abs(Math.atan2(target.y - pose.y, target.x - pose.x) - pose.theta);
    
    return 100 / (distToTarget + 1) - headingError * 10;
  }
}

export default function RoboticsNavigation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const robotsRef = useRef<Robot[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const occupancyGridRef = useRef<OccupancyGrid | null>(null);
  const plannerRef = useRef<AStarPlanner | null>(null);
  const dwaRef = useRef<DynamicWindowApproach | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  // Initialize robots
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];
    
    robotsRef.current = Array.from({ length: NUM_ROBOTS }, (_, i) => ({
      id: i,
      pose: {
        x: Math.random() * width,
        y: Math.random() * height,
        theta: Math.random() * Math.PI * 2
      },
      velocity: { linear: 0, angular: 0 },
      goal: { x: width / 2, y: height / 2, theta: 0 },
      path: { waypoints: [], currentWaypoint: 0 },
      color: colors[i],
      stuck: false,
      lastValidPose: { x: 0, y: 0, theta: 0 }
    }));

    mouseRef.current = { x: width / 2, y: height / 2 };

    // Initialize navigation system
    occupancyGridRef.current = new OccupancyGrid(width, height, GRID_RESOLUTION);
    plannerRef.current = new AStarPlanner(occupancyGridRef.current);
    dwaRef.current = new DynamicWindowApproach(occupancyGridRef.current);
  }, []);

  // Track mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'd') setDebugMode(prev => !prev);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keypress", handleKeyPress);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, []);

  // Update occupancy grid from DOM
  const updateOccupancyGrid = () => {
    if (!occupancyGridRef.current) return;
    
    occupancyGridRef.current.clear();
    
    const elements = Array.from(document.querySelectorAll(
      "button, a, h1, h2, h3, p, nav, footer, input, textarea, div[class*='card']"
    ));
    
    elements.forEach(el => {
      if (el === canvasRef.current) return;
      
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      
      if (rect.width < 10 || rect.height < 10) return;
      if (style.visibility === 'hidden' || style.opacity === '0') return;
      
      // Add padding for robot safety
      const padding = ROBOT_RADIUS * 2;
      occupancyGridRef.current!.setObstacle(
        rect.left - padding,
        rect.top - padding,
        rect.width + padding * 2,
        rect.height + padding * 2
      );
    });
  };

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    updateOccupancyGrid();
    const gridUpdateInterval = setInterval(updateOccupancyGrid, 500);

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;

      // Update each robot
      robotsRef.current.forEach(robot => {
        // Update goal to mouse position
        robot.goal = { x: mouse.x, y: mouse.y, theta: 0 };

        // Plan path if needed
        if (robot.path.waypoints.length === 0 || 
            robot.path.currentWaypoint >= robot.path.waypoints.length) {
          
          if (plannerRef.current) {
            const path = plannerRef.current.planPath(robot.pose, robot.goal);
            if (path && path.length > 1) {
              robot.path.waypoints = path;
              robot.path.currentWaypoint = 0;
              robot.stuck = false;
            } else {
              robot.stuck = true;
            }
          }
        }

        // Follow path
        if (robot.path.waypoints.length > 0 && 
            robot.path.currentWaypoint < robot.path.waypoints.length) {
          
          const target = robot.path.waypoints[robot.path.currentWaypoint];
          const dist = Math.sqrt(
            (target.x - robot.pose.x) ** 2 + (target.y - robot.pose.y) ** 2
          );

          if (dist < GOAL_TOLERANCE) {
            robot.path.currentWaypoint++;
          } else if (dwaRef.current) {
            // Use DWA for local navigation
            robot.velocity = dwaRef.current.computeVelocity(robot, target);
          }
        } else if (robot.stuck) {
          // Stuck behavior - try to find alternative
          robot.velocity.linear = 0.5;
          robot.velocity.angular = 0.3;
        }

        // Update robot pose
        const dt = 0.05;
        const newPose = { ...robot.pose };
        newPose.x += robot.velocity.linear * Math.cos(robot.pose.theta) * dt;
        newPose.y += robot.velocity.linear * Math.sin(robot.pose.theta) * dt;
        newPose.theta += robot.velocity.angular * dt;

        // Check if new pose is valid
        if (!occupancyGridRef.current?.isRobotColliding(newPose, ROBOT_RADIUS)) {
          robot.pose = newPose;
          robot.lastValidPose = { ...newPose };
        } else {
          // Revert to last valid pose and replan
          robot.pose = { ...robot.lastValidPose };
          robot.path.waypoints = [];
        }

        // Keep on screen
        robot.pose.x = Math.max(ROBOT_RADIUS, Math.min(canvas.width - ROBOT_RADIUS, robot.pose.x));
        robot.pose.y = Math.max(ROBOT_RADIUS, Math.min(canvas.height - ROBOT_RADIUS, robot.pose.y));
      });

      // Draw debug info
      if (debugMode && occupancyGridRef.current) {
        const grid = occupancyGridRef.current.getGrid();
        ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
        
        for (let y = 0; y < grid.length; y++) {
          for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x]) {
              const world = occupancyGridRef.current.gridToWorld(x, y);
              ctx.fillRect(world.x - GRID_RESOLUTION/2, world.y - GRID_RESOLUTION/2, 
                          GRID_RESOLUTION, GRID_RESOLUTION);
            }
          }
        }
      }

      // Draw robots
      robotsRef.current.forEach(robot => {
        ctx.save();
        ctx.translate(robot.pose.x, robot.pose.y);
        ctx.rotate(robot.pose.theta);
        
        // Robot body
        ctx.fillStyle = robot.color;
        ctx.beginPath();
        ctx.arc(0, 0, ROBOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        // Direction indicator
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(ROBOT_RADIUS/2, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Stuck indicator
        if (robot.stuck) {
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, ROBOT_RADIUS + 5, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.restore();

        // Draw path
        if (debugMode && robot.path.waypoints.length > 0) {
          ctx.strokeStyle = robot.color + "88";
          ctx.lineWidth = 2;
          ctx.beginPath();
          robot.path.waypoints.forEach((waypoint, i) => {
            if (i === 0) ctx.moveTo(waypoint.x, waypoint.y);
            else ctx.lineTo(waypoint.x, waypoint.y);
          });
          ctx.stroke();
        }
      });

      // Draw mouse target
      ctx.strokeStyle = "rgba(255, 0, 100, 0.7)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 15, 0, Math.PI * 2);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      clearInterval(gridUpdateInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [debugMode]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none -z-10"
        style={{ background: "transparent" }}
      />
      {debugMode && (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded text-sm font-mono z-50 pointer-events-none">
          <div>ROBOTICS NAVIGATION DEBUG</div>
          <div>Press 'D' to toggle debug</div>
          <div>Red: Occupied cells</div>
          <div>Lines: Planned paths</div>
          <div>Red rings: Stuck robots</div>
        </div>
      )}
    </>
  );
}