"use client";
import { useEffect, useRef } from "react";

// Clean, predictable robot system focused on working behavior
const NUM_ROBOTS = 4;
const ROBOT_SIZE = 10;
const MAX_SPEED = 3;
const SEEK_FORCE = 0.1;
const AVOID_FORCE = 2;
const AVOID_DISTANCE = 50;

interface Robot {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  trail: { x: number; y: number }[];
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function CleanRobots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const robotsRef = useRef<Robot[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const obstaclesRef = useRef<Obstacle[]>([]);

  // Initialize robots
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];
    
    robotsRef.current = Array.from({ length: NUM_ROBOTS }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      color: colors[i],
      trail: []
    }));

    mouseRef.current = { x: width / 2, y: height / 2 };
  }, []);

  // Track mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Update obstacles - only major blocking elements
  const updateObstacles = () => {
    const elements = Array.from(document.querySelectorAll("nav, footer, .card"));
    
    obstaclesRef.current = elements
      .map(el => {
        if (el === canvasRef.current) return null;
        
        const rect = el.getBoundingClientRect();
        if (rect.width < 100 || rect.height < 40) return null; // Only big elements
        
        return {
          x: rect.left - 20,
          y: rect.top - 20,
          width: rect.width + 40,
          height: rect.height + 40
        };
      })
      .filter(Boolean) as Obstacle[];
  };

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    updateObstacles();
    const obstacleInterval = setInterval(updateObstacles, 1000);

    const animate = () => {
      // Clear with subtle fade
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;

      // Update each robot with simple steering
      robotsRef.current.forEach(robot => {
        // SEEK: Move towards mouse
        let seekX = mouse.x - robot.x;
        let seekY = mouse.y - robot.y;
        const distance = Math.sqrt(seekX * seekX + seekY * seekY);
        
        if (distance > 0) {
          seekX = (seekX / distance) * MAX_SPEED;
          seekY = (seekY / distance) * MAX_SPEED;
        }

        // AVOID: Stay away from obstacles
        let avoidX = 0;
        let avoidY = 0;
        
        obstaclesRef.current.forEach(obstacle => {
          // Distance to obstacle center
          const centerX = obstacle.x + obstacle.width / 2;
          const centerY = obstacle.y + obstacle.height / 2;
          const dx = robot.x - centerX;
          const dy = robot.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < AVOID_DISTANCE && dist > 0) {
            const force = (AVOID_DISTANCE - dist) / AVOID_DISTANCE;
            avoidX += (dx / dist) * force * AVOID_FORCE;
            avoidY += (dy / dist) * force * AVOID_FORCE;
          }
        });

        // Apply steering forces
        robot.vx += (seekX - robot.vx) * SEEK_FORCE + avoidX * 0.1;
        robot.vy += (seekY - robot.vy) * SEEK_FORCE + avoidY * 0.1;
        
        // Limit speed
        const speed = Math.sqrt(robot.vx * robot.vx + robot.vy * robot.vy);
        if (speed > MAX_SPEED) {
          robot.vx = (robot.vx / speed) * MAX_SPEED;
          robot.vy = (robot.vy / speed) * MAX_SPEED;
        }

        // Update position
        robot.x += robot.vx;
        robot.y += robot.vy;

        // Screen boundaries
        if (robot.x < ROBOT_SIZE) {
          robot.x = ROBOT_SIZE;
          robot.vx = Math.abs(robot.vx);
        }
        if (robot.x > canvas.width - ROBOT_SIZE) {
          robot.x = canvas.width - ROBOT_SIZE;
          robot.vx = -Math.abs(robot.vx);
        }
        if (robot.y < ROBOT_SIZE) {
          robot.y = ROBOT_SIZE;
          robot.vy = Math.abs(robot.vy);
        }
        if (robot.y > canvas.height - ROBOT_SIZE) {
          robot.y = canvas.height - ROBOT_SIZE;
          robot.vy = -Math.abs(robot.vy);
        }

        // Update trail
        robot.trail.push({ x: robot.x, y: robot.y });
        if (robot.trail.length > 30) robot.trail.shift();
      });

      // Draw prediction lines (always visible)
      robotsRef.current.forEach(robot => {
        ctx.strokeStyle = robot.color + "66";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(robot.x, robot.y);
        
        // Show intended direction
        const futureX = robot.x + robot.vx * 20;
        const futureY = robot.y + robot.vy * 20;
        ctx.lineTo(futureX, futureY);
        
        // Show line to target
        ctx.moveTo(robot.x, robot.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
        ctx.setLineDash([]);
      });

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
        ctx.translate(robot.x, robot.y);
        
        const angle = Math.atan2(robot.vy, robot.vx);
        ctx.rotate(angle);
        
        // Triangle shape
        ctx.fillStyle = robot.color;
        ctx.beginPath();
        ctx.moveTo(ROBOT_SIZE, 0);
        ctx.lineTo(-ROBOT_SIZE/2, -ROBOT_SIZE/2);
        ctx.lineTo(-ROBOT_SIZE/2, ROBOT_SIZE/2);
        ctx.closePath();
        ctx.fill();
        
        // White dot for direction
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(ROBOT_SIZE/2, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });

      // Draw mouse target
      ctx.strokeStyle = "rgba(255, 0, 100, 0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 20, 0, Math.PI * 2);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      updateObstacles();
    };
    
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(obstacleInterval);
      window.removeEventListener("resize", handleResize);
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