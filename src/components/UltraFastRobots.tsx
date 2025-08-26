"use client";
import { useEffect, useRef } from "react";

// Ultra-fast, minimally constrained robots with always-visible paths
const GRID_RESOLUTION = 60; // Even larger cells
const NUM_ROBOTS = 4;
const ROBOT_RADIUS = 10;
const MAX_LINEAR_VEL = 15.0; // Ultra fast!
const MAX_ANGULAR_VEL = 4.0;
const GOAL_TOLERANCE = 30;
const OBSTACLE_PADDING = 5; // Minimal padding

interface Pose {
  x: number;
  y: number;
  theta: number;
}

interface Robot {
  id: number;
  pose: Pose;
  goal: Pose;
  predictedPath: Pose[];
  color: string;
  trail: {x: number, y: number}[];
  stuckCounter: number;
  escapeMode: boolean;
}

class MinimalGrid {
  private width: number;
  private height: number;
  private resolution: number;
  private obstacles: Set<string>;

  constructor(screenWidth: number, screenHeight: number, resolution: number) {
    this.resolution = resolution;
    this.width = Math.ceil(screenWidth / resolution);
    this.height = Math.ceil(screenHeight / resolution);
    this.obstacles = new Set();
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
        this.obstacles.add(`${gx},${gy}`);
      }
    }
  }

  isOccupied(worldX: number, worldY: number): boolean {
    const grid = this.worldToGrid(worldX, worldY);
    if (grid.x < 0 || grid.x >= this.width || grid.y < 0 || grid.y >= this.height) {
      return true;
    }
    return this.obstacles.has(`${grid.x},${grid.y}`);
  }

  clear() {
    this.obstacles.clear();
  }

  getObstacles(): string[] {
    return Array.from(this.obstacles);
  }
}

class UltraFastPlanner {
  private grid: MinimalGrid;

  constructor(grid: MinimalGrid) {
    this.grid = grid;
  }

  planPath(start: Pose, goal: Pose): Pose[] {
    // Always show prediction path - even if direct
    const predictions = this.predictPath(start, goal, 20);
    
    // Check if direct path is clear
    if (this.isDirectPathClear(start, goal)) {
      return [goal];
    }

    // Try 8 directions around obstacles
    const directions = [
      { dx: 0, dy: -1 },   // North
      { dx: 1, dy: -1 },   // NE
      { dx: 1, dy: 0 },    // East
      { dx: 1, dy: 1 },    // SE
      { dx: 0, dy: 1 },    // South
      { dx: -1, dy: 1 },   // SW
      { dx: -1, dy: 0 },   // West
      { dx: -1, dy: -1 }   // NW
    ];

    const stepSize = 80;
    
    for (const dir of directions) {
      const waypoint = {
        x: start.x + dir.dx * stepSize,
        y: start.y + dir.dy * stepSize,
        theta: Math.atan2(dir.dy, dir.dx)
      };
      
      if (!this.grid.isOccupied(waypoint.x, waypoint.y) && 
          this.isDirectPathClear(waypoint, goal)) {
        return [waypoint, goal];
      }
    }

    // Fallback: go around largest obstacles
    return this.findWayAroundObstacle(start, goal);
  }

  private predictPath(start: Pose, goal: Pose, steps: number): Pose[] {
    const path: Pose[] = [];
    const dx = (goal.x - start.x) / steps;
    const dy = (goal.y - start.y) / steps;
    
    for (let i = 1; i <= steps; i++) {
      path.push({
        x: start.x + dx * i,
        y: start.y + dy * i,
        theta: Math.atan2(dy, dx)
      });
    }
    
    return path;
  }

  private isDirectPathClear(start: Pose, goal: Pose): boolean {
    const dx = goal.x - start.x;
    const dy = goal.y - start.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(10, Math.floor(dist / 20));
    
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const checkX = start.x + dx * t;
      const checkY = start.y + dy * t;
      if (this.grid.isOccupied(checkX, checkY)) {
        return false;
      }
    }
    return true;
  }

  private findWayAroundObstacle(start: Pose, goal: Pose): Pose[] {
    // Simple obstacle avoidance - go around in a wide arc
    const midX = (start.x + goal.x) / 2;
    const midY = (start.y + goal.y) / 2;
    
    // Try left and right detours
    const perpDx = -(goal.y - start.y);
    const perpDy = goal.x - start.x;
    const perpLen = Math.sqrt(perpDx * perpDx + perpDy * perpDy);
    
    if (perpLen > 0) {
      const normalizedPerpX = perpDx / perpLen;
      const normalizedPerpY = perpDy / perpLen;
      
      const detourDistance = 100;
      const leftWaypoint = {
        x: midX + normalizedPerpX * detourDistance,
        y: midY + normalizedPerpY * detourDistance,
        theta: 0
      };
      
      const rightWaypoint = {
        x: midX - normalizedPerpX * detourDistance,
        y: midY - normalizedPerpY * detourDistance,
        theta: 0
      };
      
      // Choose the clearer path
      if (!this.grid.isOccupied(leftWaypoint.x, leftWaypoint.y)) {
        return [leftWaypoint, goal];
      } else if (!this.grid.isOccupied(rightWaypoint.x, rightWaypoint.y)) {
        return [rightWaypoint, goal];
      }
    }
    
    return [goal]; // Give up, go direct
  }
}

export default function UltraFastRobots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const robotsRef = useRef<Robot[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const gridRef = useRef<MinimalGrid | null>(null);
  const plannerRef = useRef<UltraFastPlanner | null>(null);

  // Initialize
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];
    
    robotsRef.current = Array.from({ length: NUM_ROBOTS }, (_, i) => ({
      id: i,
      pose: {
        x: 100 + i * 150,
        y: 100 + i * 100,
        theta: Math.random() * Math.PI * 2
      },
      goal: { x: width / 2, y: height / 2, theta: 0 },
      predictedPath: [],
      color: colors[i],
      trail: [],
      stuckCounter: 0,
      escapeMode: false
    }));

    mouseRef.current = { x: width / 2, y: height / 2 };
    gridRef.current = new MinimalGrid(width, height, GRID_RESOLUTION);
    plannerRef.current = new UltraFastPlanner(gridRef.current);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Minimal grid updates - only major blocking elements
  const updateGrid = () => {
    if (!gridRef.current) return;
    
    gridRef.current.clear();
    
    // Only block major navigation elements
    const elements = Array.from(document.querySelectorAll("nav, footer"));
    
    elements.forEach(el => {
      if (el === canvasRef.current) return;
      
      const rect = el.getBoundingClientRect();
      if (rect.width < 50 || rect.height < 30) return;
      
      // Minimal padding
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
    const gridUpdateInterval = setInterval(updateGrid, 2000); // Very infrequent

    const animate = () => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;

      robotsRef.current.forEach(robot => {
        robot.goal = { x: mouse.x, y: mouse.y, theta: 0 };

        // Plan path and prediction
        if (plannerRef.current) {
          robot.predictedPath = plannerRef.current.planPath(robot.pose, robot.goal);
        }

        // Check if stuck
        const lastPos = robot.trail[robot.trail.length - 1];
        if (lastPos) {
          const distMoved = Math.sqrt(
            (robot.pose.x - lastPos.x) ** 2 + (robot.pose.y - lastPos.y) ** 2
          );
          if (distMoved < 2) {
            robot.stuckCounter++;
          } else {
            robot.stuckCounter = 0;
            robot.escapeMode = false;
          }
        }

        // Escape mode if stuck
        if (robot.stuckCounter > 20) {
          robot.escapeMode = true;
        }

        // Movement logic
        let targetX = mouse.x;
        let targetY = mouse.y;

        if (robot.escapeMode) {
          // Move randomly when stuck
          const escapeAngle = robot.pose.theta + (Math.random() - 0.5) * Math.PI;
          targetX = robot.pose.x + Math.cos(escapeAngle) * 100;
          targetY = robot.pose.y + Math.sin(escapeAngle) * 100;
        } else if (robot.predictedPath.length > 0) {
          // Follow first waypoint
          targetX = robot.predictedPath[0].x;
          targetY = robot.predictedPath[0].y;
        }

        // Ultra-fast direct movement
        const dx = targetX - robot.pose.x;
        const dy = targetY - robot.pose.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 10) {
          // High-speed movement
          const speed = Math.min(distance * 0.3, MAX_LINEAR_VEL);
          const moveX = (dx / distance) * speed;
          const moveY = (dy / distance) * speed;
          
          robot.pose.x += moveX;
          robot.pose.y += moveY;
          robot.pose.theta = Math.atan2(dy, dx);
        }

        // Screen boundaries (soft)
        if (robot.pose.x < 50) robot.pose.x = 50;
        if (robot.pose.x > canvas.width - 50) robot.pose.x = canvas.width - 50;
        if (robot.pose.y < 50) robot.pose.y = 50;
        if (robot.pose.y > canvas.height - 50) robot.pose.y = canvas.height - 50;

        // Update trail
        robot.trail.push({ x: robot.pose.x, y: robot.pose.y });
        if (robot.trail.length > 25) robot.trail.shift();
      });

      // Draw grid (minimal)
      if (gridRef.current) {
        const obstacles = gridRef.current.getObstacles();
        ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
        obstacles.forEach(obstacleKey => {
          const [gx, gy] = obstacleKey.split(',').map(Number);
          const world = gridRef.current!.gridToWorld(gx, gy);
          ctx.fillRect(world.x - GRID_RESOLUTION/2, world.y - GRID_RESOLUTION/2, 
                      GRID_RESOLUTION, GRID_RESOLUTION);
        });
      }

      // Draw robots with always-visible paths
      robotsRef.current.forEach(robot => {
        // Draw prediction path (always visible)
        if (robot.predictedPath.length > 0) {
          ctx.strokeStyle = robot.color + "66";
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 4]);
          ctx.beginPath();
          ctx.moveTo(robot.pose.x, robot.pose.y);
          robot.predictedPath.forEach(waypoint => {
            ctx.lineTo(waypoint.x, waypoint.y);
          });
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Draw thick trail
        if (robot.trail.length > 1) {
          ctx.strokeStyle = robot.color + "55";
          ctx.lineWidth = 4;
          ctx.beginPath();
          robot.trail.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }

        // Draw robot
        ctx.save();
        ctx.translate(robot.pose.x, robot.pose.y);
        ctx.rotate(robot.pose.theta);
        
        // Main body
        ctx.fillStyle = robot.color;
        ctx.beginPath();
        ctx.arc(0, 0, ROBOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        // Direction indicator
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.moveTo(ROBOT_RADIUS, 0);
        ctx.lineTo(-6, -4);
        ctx.lineTo(-6, 4);
        ctx.closePath();
        ctx.fill();
        
        // Escape mode indicator
        if (robot.escapeMode) {
          ctx.strokeStyle = "red";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, ROBOT_RADIUS + 8, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.restore();
      });

      // Large mouse target
      ctx.strokeStyle = "rgba(255, 0, 100, 0.8)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 25, 0, Math.PI * 2);
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10"
      style={{ background: "transparent" }}
    />
  );
}