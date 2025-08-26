"use client";
import { useEffect, useRef, useState } from "react";

// A more optimized Robot definition using a class
class Robot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  
  constructor(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
  }

  update(width: number, height: number) {
    this.x += this.vx;
    this.y += this.vy;

    // Wrap around edges
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;

    // Add a slight random walk
    this.vx += (Math.random() - 0.5) * 0.02;
    this.vy += (Math.random() - 0.5) * 0.02;

    // Regulate speed
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > 1) {
      this.vx /= speed;
      this.vy /= speed;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "rgba(78, 205, 196, 1)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Spatial grid for optimizing neighbor finding
class SpatialGrid {
  private grid: Map<string, Robot[]> = new Map();
  private cellSize: number;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  private getKey(x: number, y: number) {
    return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
  }

  insert(robot: Robot) {
    const key = this.getKey(robot.x, robot.y);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(robot);
  }

  query(robot: Robot, range: number): Robot[] {
    const neighbors: Robot[] = [];
    const startX = Math.floor((robot.x - range) / this.cellSize);
    const startY = Math.floor((robot.y - range) / this.cellSize);
    const endX = Math.floor((robot.x + range) / this.cellSize);
    const endY = Math.floor((robot.y + range) / this.cellSize);

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const key = `${x},${y}`;
        if (this.grid.has(key)) {
          neighbors.push(...this.grid.get(key)!);
        }
      }
    }
    return neighbors;
  }

  clear() {
    this.grid.clear();
  }
}

export default function BackgroundSwarmCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const robotsRef = useRef<Robot[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  
  const ROBOT_COUNT = 50;
  const NEIGHBOR_RADIUS = 150;
  const GRID_CELL_SIZE = NEIGHBOR_RADIUS;

  useEffect(() => {
    // Enable on all devices for now to ensure visibility
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setIsEnabled(false);
      return;
    }
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const grid = new SpatialGrid(GRID_CELL_SIZE);
    let lastTime = 0;
    const interval = 1000 / 30; // Target 30 FPS

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      robotsRef.current = Array.from({ length: ROBOT_COUNT }, () => new Robot(canvas.width, canvas.height));
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = (timestamp: number) => {
      animationRef.current = requestAnimationFrame(animate);
      const deltaTime = timestamp - lastTime;

      if (deltaTime < interval) return;
      lastTime = timestamp - (deltaTime % interval);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      grid.clear();

      robotsRef.current.forEach(robot => {
        robot.update(canvas.width, canvas.height);
        grid.insert(robot);
        robot.draw(ctx);
      });

      ctx.strokeStyle = "rgba(78, 205, 196, 0.3)";
      ctx.lineWidth = 1;
      robotsRef.current.forEach(robot => {
        const neighbors = grid.query(robot, NEIGHBOR_RADIUS);
        neighbors.forEach(neighbor => {
          if (robot === neighbor) return;
          const dx = robot.x - neighbor.x;
          const dy = robot.y - neighbor.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < NEIGHBOR_RADIUS) {
            ctx.beginPath();
            ctx.moveTo(robot.x, robot.y);
            ctx.lineTo(neighbor.x, neighbor.y);
            ctx.stroke();
          }
        });
      });
    };

    const startAnimation = () => {
      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    const stopAnimation = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAnimation();
      } else {
        startAnimation();
      }
    };

    const timeoutId = setTimeout(startAnimation, 500);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopAnimation();
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(timeoutId);
    };
  }, [isEnabled]);
  
  if (!isEnabled) return null;
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1, opacity: 0.8 }}
      aria-hidden="true"
    />
  );
}
