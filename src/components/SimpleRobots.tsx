"use client";
import { useEffect, useRef, useState } from "react";

const NUM_ROBOTS = 8;
const ROBOT_SIZE = 10;
const MAX_SPEED = 3;
const MAX_FORCE = 0.2;
const OBSTACLE_AVOID_RADIUS = 60;
const OBSTACLE_DETECT_RADIUS = 100;

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

export default function SimpleRobots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const robotsRef = useRef<Robot[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const [debug, setDebug] = useState(false);

  // Initialize robots
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const colors = ["#00ffff", "#ff00ff", "#ffff00", "#00ff00", "#ff6600", "#6600ff", "#ff0066", "#66ff00"];
    
    robotsRef.current = Array.from({ length: NUM_ROBOTS }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      color: colors[i % colors.length],
      trail: []
    }));

    // Set initial mouse position to center
    mouseRef.current = { x: width / 2, y: height / 2 };
  }, []);

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'd') setDebug(prev => !prev);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keypress", handleKeyPress);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, []);

  // Detect DOM elements as obstacles
  const updateObstacles = () => {
    const elements = Array.from(document.querySelectorAll("button, a, h1, h2, h3, h4, h5, h6, p, span, div[class*='card'], div[class*='button'], input, textarea, label"));
    
    obstaclesRef.current = elements
      .map(el => {
        const rect = el.getBoundingClientRect();
        // Filter out tiny elements and the canvas itself
        if (rect.width < 20 || rect.height < 20) return null;
        if (el === canvasRef.current) return null;
        
        // Check if element has visible text or is interactive
        const hasText = el.textContent?.trim().length > 0;
        const isInteractive = el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'INPUT';
        
        if (!hasText && !isInteractive) return null;
        
        return {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        };
      })
      .filter(Boolean) as Obstacle[];
  };

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Update obstacles periodically
    updateObstacles();
    const obstacleInterval = setInterval(updateObstacles, 500);

    const animate = () => {
      // Clear canvas with fade effect
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;

      // Update each robot
      robotsRef.current.forEach(robot => {
        // Calculate desired velocity towards mouse (SEEK behavior)
        let desiredVx = mouse.x - robot.x;
        let desiredVy = mouse.y - robot.y;
        let distance = Math.sqrt(desiredVx * desiredVx + desiredVy * desiredVy);
        
        if (distance > 0) {
          // Normalize and scale by max speed
          desiredVx = (desiredVx / distance) * MAX_SPEED;
          desiredVy = (desiredVy / distance) * MAX_SPEED;
        }

        // AVOID behavior - check obstacles
        let avoidX = 0;
        let avoidY = 0;
        
        obstaclesRef.current.forEach(obstacle => {
          // Check if robot is near obstacle
          const centerX = obstacle.x + obstacle.width / 2;
          const centerY = obstacle.y + obstacle.height / 2;
          
          // Calculate distance to obstacle edge
          const closestX = Math.max(obstacle.x, Math.min(robot.x, obstacle.x + obstacle.width));
          const closestY = Math.max(obstacle.y, Math.min(robot.y, obstacle.y + obstacle.height));
          
          const dx = robot.x - closestX;
          const dy = robot.y - closestY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < OBSTACLE_DETECT_RADIUS && dist > 0) {
            // Calculate repulsion force
            const force = 1 - (dist / OBSTACLE_DETECT_RADIUS);
            avoidX += (dx / dist) * force * 5;
            avoidY += (dy / dist) * force * 5;
          }
        });

        // Combine seek and avoid behaviors
        let steerX = desiredVx + avoidX;
        let steerY = desiredVy + avoidY;
        
        // Limit steering force
        let steerMag = Math.sqrt(steerX * steerX + steerY * steerY);
        if (steerMag > MAX_FORCE) {
          steerX = (steerX / steerMag) * MAX_FORCE;
          steerY = (steerY / steerMag) * MAX_FORCE;
        }

        // Apply steering to velocity
        robot.vx += steerX;
        robot.vy += steerY;
        
        // Limit speed
        let speed = Math.sqrt(robot.vx * robot.vx + robot.vy * robot.vy);
        if (speed > MAX_SPEED) {
          robot.vx = (robot.vx / speed) * MAX_SPEED;
          robot.vy = (robot.vy / speed) * MAX_SPEED;
        }

        // Update position
        robot.x += robot.vx;
        robot.y += robot.vy;

        // Keep robots on screen
        if (robot.x < ROBOT_SIZE) {
          robot.x = ROBOT_SIZE;
          robot.vx *= -0.5;
        }
        if (robot.x > canvas.width - ROBOT_SIZE) {
          robot.x = canvas.width - ROBOT_SIZE;
          robot.vx *= -0.5;
        }
        if (robot.y < ROBOT_SIZE) {
          robot.y = ROBOT_SIZE;
          robot.vy *= -0.5;
        }
        if (robot.y > canvas.height - ROBOT_SIZE) {
          robot.y = canvas.height - ROBOT_SIZE;
          robot.vy *= -0.5;
        }

        // Update trail
        robot.trail.push({ x: robot.x, y: robot.y });
        if (robot.trail.length > 20) {
          robot.trail.shift();
        }
      });

      // Draw debug info if enabled
      if (debug) {
        // Draw obstacles
        ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
        ctx.lineWidth = 2;
        obstaclesRef.current.forEach(obstacle => {
          ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          
          // Draw detection radius
          ctx.strokeStyle = "rgba(255, 0, 0, 0.1)";
          ctx.lineWidth = 1;
          const centerX = obstacle.x + obstacle.width / 2;
          const centerY = obstacle.y + obstacle.height / 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, OBSTACLE_DETECT_RADIUS, 0, Math.PI * 2);
          ctx.stroke();
        });
      }

      // Draw robots
      robotsRef.current.forEach(robot => {
        // Draw trail
        ctx.strokeStyle = robot.color + "33";
        ctx.lineWidth = 2;
        ctx.beginPath();
        robot.trail.forEach((point, i) => {
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();

        // Draw robot body
        ctx.save();
        ctx.translate(robot.x, robot.y);
        
        // Calculate rotation based on velocity
        const angle = Math.atan2(robot.vy, robot.vx);
        ctx.rotate(angle);
        
        // Draw triangle shape
        ctx.fillStyle = robot.color;
        ctx.beginPath();
        ctx.moveTo(ROBOT_SIZE, 0);
        ctx.lineTo(-ROBOT_SIZE/2, -ROBOT_SIZE/2);
        ctx.lineTo(-ROBOT_SIZE/2, ROBOT_SIZE/2);
        ctx.closePath();
        ctx.fill();
        
        // Draw outline
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
      });

      // Draw mouse target
      ctx.strokeStyle = "rgba(255, 0, 100, 0.5)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw crosshair
      ctx.strokeStyle = "rgba(255, 0, 100, 0.8)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mouse.x - 10, mouse.y);
      ctx.lineTo(mouse.x + 10, mouse.y);
      ctx.moveTo(mouse.x, mouse.y - 10);
      ctx.lineTo(mouse.x, mouse.y + 10);
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
  }, [debug]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none -z-10"
        style={{ background: "transparent" }}
      />
      <div className="fixed top-4 right-4 font-mono text-xs text-gray-600 pointer-events-none z-50">
        <div>Simple Robots v2.0</div>
        <div>Press 'D' for debug mode</div>
        <div>{NUM_ROBOTS} robots active</div>
        {debug && <div className="text-red-500">DEBUG MODE ON</div>}
      </div>
    </>
  );
}