"use client";
import { useEffect, useRef, useState } from "react";

// Fast Robotics Navigation - Tuned for responsiveness
const GRID_RESOLUTION = 40; // Larger cells = faster planning
const NUM_ROBOTS = 4;
const ROBOT_RADIUS = 12;
const MAX_LINEAR_VEL = 8.0; // Much faster!
const MAX_ANGULAR_VEL = 2.0;
const GOAL_TOLERANCE = 25;
const OBSTACLE_PADDING = 15; // Less conservative padding

interface Pose {
  x: number;
  y: number;
  theta: number;
}

interface Velocity {
  linear: number;
  angular: number;
}

interface Robot {
  id: number;
  pose: Pose;
  velocity: Velocity;
  goal: Pose;
  path: Pose[];
  currentWaypoint: number;
  color: string;
  stuckTimer: number;
  trail: {x: number, y: number}[];
}

class FastOccupancyGrid {
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
      return true;
    }
    return this.grid[grid.y][grid.x];
  }

  clear() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.grid[y][x] = false;
      }
    }
  }

  getGrid(): boolean[][] {
    return this.grid;
  }
}

class FastPathPlanner {
  private grid: FastOccupancyGrid;

  constructor(grid: FastOccupancyGrid) {
    this.grid = grid;
  }

  planPath(start: Pose, goal: Pose): Pose[] | null {
    const startGrid = this.grid.worldToGrid(start.x, start.y);
    const goalGrid = this.grid.worldToGrid(goal.x, goal.y);
    
    // Simple line-of-sight check first
    if (!this.lineBlocked(start, goal)) {
      return [goal];
    }

    // Simplified A* for speed
    interface Node {
      x: number; y: number; g: number; h: number; f: number; parent: Node | null;
    }

    const openSet: Node[] = [];
    const closedSet = new Set<string>();
    const visited = new Map<string, Node>();
    
    const startNode: Node = {
      x: startGrid.x, y: startGrid.y, g: 0,
      h: Math.sqrt((goalGrid.x - startGrid.x)**2 + (goalGrid.y - startGrid.y)**2),
      f: 0, parent: null
    };
    startNode.f = startNode.g + startNode.h;
    openSet.push(startNode);
    visited.set(`${startGrid.x},${startGrid.y}`, startNode);

    let iterations = 0;
    const maxIterations = 200; // Limit search for speed

    while (openSet.length > 0 && iterations < maxIterations) {
      iterations++;
      
      // Get lowest f score
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;
      
      const currentKey = `${current.x},${current.y}`;
      if (closedSet.has(currentKey)) continue;
      closedSet.add(currentKey);

      // Goal check
      if (Math.abs(current.x - goalGrid.x) <= 1 && Math.abs(current.y - goalGrid.y) <= 1) {
        return this.reconstructPath(current);
      }

      // Check 8 neighbors
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;

          const neighborX = current.x + dx;
          const neighborY = current.y + dy;
          const neighborKey = `${neighborX},${neighborY}`;

          if (closedSet.has(neighborKey)) continue;

          const neighborWorld = this.grid.gridToWorld(neighborX, neighborY);
          if (this.grid.isOccupied(neighborWorld.x, neighborWorld.y)) continue;

          const g = current.g + (dx === 0 || dy === 0 ? 1 : 1.414);
          const h = Math.sqrt((goalGrid.x - neighborX)**2 + (goalGrid.y - neighborY)**2);
          const f = g + h;

          const existingNode = visited.get(neighborKey);
          if (!existingNode || g < existingNode.g) {
            const neighborNode: Node = { x: neighborX, y: neighborY, g, h, f, parent: current };
            visited.set(neighborKey, neighborNode);
            
            if (!existingNode) {
              openSet.push(neighborNode);
            }
          }
        }
      }
    }

    return null; // No path found
  }

  private lineBlocked(start: Pose, goal: Pose): boolean {
    const dx = goal.x - start.x;
    const dy = goal.y - start.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.floor(dist / 10); // Check every 10 pixels
    
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const checkX = start.x + dx * t;
      const checkY = start.y + dy * t;
      if (this.grid.isOccupied(checkX, checkY)) {
        return true;
      }
    }
    return false;
  }

  private reconstructPath(node: any): Pose[] {
    const path: Pose[] = [];
    let current = node;
    
    while (current) {
      const world = this.grid.gridToWorld(current.x, current.y);
      path.unshift({ x: world.x, y: world.y, theta: 0 });
      current = current.parent;
    }

    // Smooth path and calculate orientations
    for (let i = 0; i < path.length - 1; i++) {
      const dx = path[i + 1].x - path[i].x;
      const dy = path[i + 1].y - path[i].y;
      path[i].theta = Math.atan2(dy, dx);
    }

    return path.length > 1 ? path.slice(1) : path; // Skip first waypoint (current position)
  }
}

export default function FastRobots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const robotsRef = useRef<Robot[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const gridRef = useRef<FastOccupancyGrid | null>(null);
  const plannerRef = useRef<FastPathPlanner | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  // Initialize
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];
    
    robotsRef.current = Array.from({ length: NUM_ROBOTS }, (_, i) => ({
      id: i,
      pose: {
        x: 100 + i * 100,
        y: 100 + i * 50,
        theta: 0
      },
      velocity: { linear: 0, angular: 0 },
      goal: { x: width / 2, y: height / 2, theta: 0 },
      path: [],
      currentWaypoint: 0,
      color: colors[i],
      stuckTimer: 0,
      trail: []
    }));

    mouseRef.current = { x: width / 2, y: height / 2 };
    gridRef.current = new FastOccupancyGrid(width, height, GRID_RESOLUTION);
    plannerRef.current = new FastPathPlanner(gridRef.current);
  }, []);

  // Mouse tracking
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

  // Update grid - less frequently and less strict
  const updateGrid = () => {
    if (!gridRef.current) return;
    
    gridRef.current.clear();
    
    // Only get major UI elements
    const elements = Array.from(document.querySelectorAll("button, a, h1, h2, nav, footer"));
    
    elements.forEach(el => {
      if (el === canvasRef.current) return;
      
      const rect = el.getBoundingClientRect();
      if (rect.width < 30 || rect.height < 20) return; // Skip tiny elements
      
      const style = window.getComputedStyle(el);
      if (style.visibility === 'hidden' || style.opacity === '0') return;
      
      // Much less padding
      gridRef.current!.setObstacle(
        rect.left - OBSTACLE_PADDING,
        rect.top - OBSTACLE_PADDING,
        rect.width + OBSTACLE_PADDING * 2,
        rect.height + OBSTACLE_PADDING * 2
      );
    });
  };

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    updateGrid();
    const gridUpdateInterval = setInterval(updateGrid, 1000); // Less frequent updates

    const animate = () => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;

      robotsRef.current.forEach(robot => {
        robot.goal = { x: mouse.x, y: mouse.y, theta: 0 };

        // Check if we need a new path
        const distToGoal = Math.sqrt((robot.goal.x - robot.pose.x)**2 + (robot.goal.y - robot.pose.y)**2);
        const needsNewPath = robot.path.length === 0 || 
                           robot.currentWaypoint >= robot.path.length ||
                           distToGoal > 200; // Replan if goal moved far

        if (needsNewPath && plannerRef.current) {
          const newPath = plannerRef.current.planPath(robot.pose, robot.goal);
          if (newPath) {
            robot.path = newPath;
            robot.currentWaypoint = 0;
            robot.stuckTimer = 0;
          }
        }

        // Simple direct control
        let targetX = mouse.x;
        let targetY = mouse.y;

        // Use path if available
        if (robot.path.length > 0 && robot.currentWaypoint < robot.path.length) {
          const waypoint = robot.path[robot.currentWaypoint];
          targetX = waypoint.x;
          targetY = waypoint.y;
          
          const distToWaypoint = Math.sqrt((waypoint.x - robot.pose.x)**2 + (waypoint.y - robot.pose.y)**2);
          if (distToWaypoint < GOAL_TOLERANCE) {
            robot.currentWaypoint++;
          }
        }

        // Direct movement towards target
        const dx = targetX - robot.pose.x;
        const dy = targetY - robot.pose.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {
          const targetAngle = Math.atan2(dy, dx);
          let angleDiff = targetAngle - robot.pose.theta;
          
          // Normalize angle
          while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
          while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

          // Set velocities
          robot.velocity.angular = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff) * 3, MAX_ANGULAR_VEL);
          robot.velocity.linear = Math.min(distance / 50 * MAX_LINEAR_VEL, MAX_LINEAR_VEL);
          
          // Reduce speed when turning
          if (Math.abs(angleDiff) > 0.5) {
            robot.velocity.linear *= 0.3;
          }
        } else {
          robot.velocity.linear = 0;
          robot.velocity.angular = 0;
        }

        // Update pose - much faster timestep
        const dt = 0.1;
        robot.pose.x += robot.velocity.linear * Math.cos(robot.pose.theta) * dt;
        robot.pose.y += robot.velocity.linear * Math.sin(robot.pose.theta) * dt;
        robot.pose.theta += robot.velocity.angular * dt;

        // Simple collision check
        if (gridRef.current?.isOccupied(robot.pose.x, robot.pose.y)) {
          // Back up and turn
          robot.pose.x -= robot.velocity.linear * Math.cos(robot.pose.theta) * dt * 2;
          robot.pose.y -= robot.velocity.linear * Math.sin(robot.pose.theta) * dt * 2;
          robot.pose.theta += (Math.random() - 0.5) * 1.0;
          robot.path = []; // Force replanning
        }

        // Screen boundaries
        robot.pose.x = Math.max(ROBOT_RADIUS, Math.min(canvas.width - ROBOT_RADIUS, robot.pose.x));
        robot.pose.y = Math.max(ROBOT_RADIUS, Math.min(canvas.height - ROBOT_RADIUS, robot.pose.y));

        // Update trail
        robot.trail.push({ x: robot.pose.x, y: robot.pose.y });
        if (robot.trail.length > 20) robot.trail.shift();
      });

      // Draw debug grid
      if (debugMode && gridRef.current) {
        const grid = gridRef.current.getGrid();
        ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
        
        for (let y = 0; y < grid.length; y++) {
          for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x]) {
              const world = gridRef.current.gridToWorld(x, y);
              ctx.fillRect(world.x - GRID_RESOLUTION/2, world.y - GRID_RESOLUTION/2, 
                          GRID_RESOLUTION, GRID_RESOLUTION);
            }
          }
        }
      }

      // Draw robots
      robotsRef.current.forEach(robot => {
        // Trail
        if (robot.trail.length > 1) {
          ctx.strokeStyle = robot.color + "44";
          ctx.lineWidth = 3;
          ctx.beginPath();
          robot.trail.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }

        // Robot body
        ctx.save();
        ctx.translate(robot.pose.x, robot.pose.y);
        ctx.rotate(robot.pose.theta);
        
        ctx.fillStyle = robot.color;
        ctx.beginPath();
        ctx.arc(0, 0, ROBOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        // Direction arrow
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.moveTo(ROBOT_RADIUS - 3, 0);
        ctx.lineTo(-5, -4);
        ctx.lineTo(-5, 4);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();

        // Path visualization
        if (debugMode && robot.path.length > 0) {
          ctx.strokeStyle = robot.color + "88";
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(robot.pose.x, robot.pose.y);
          robot.path.forEach((waypoint, i) => {
            if (i >= robot.currentWaypoint) {
              ctx.lineTo(waypoint.x, waypoint.y);
            }
          });
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Mouse target
      ctx.strokeStyle = "rgba(255, 0, 100, 0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 20, 0, Math.PI * 2);
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
        <div className="fixed top-4 right-4 bg-black/80 text-white p-3 rounded text-sm font-mono z-50 pointer-events-none">
          <div>FAST ROBOTS DEBUG</div>
          <div>Max Speed: {MAX_LINEAR_VEL} px/frame</div>
          <div>Grid: {GRID_RESOLUTION}px cells</div>
          <div>Press 'D' to toggle</div>
        </div>
      )}
    </>
  );
}