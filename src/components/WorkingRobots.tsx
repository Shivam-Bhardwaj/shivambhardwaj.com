"use client";
import { useEffect, useRef, useState } from "react";

const NUM_ROBOTS = 5;
const ROBOT_SIZE = 12;
const MAX_SPEED = 2.5;
const OBSTACLE_AVOID_DISTANCE = 80;
const FORMATION_DISTANCE = 60;

interface Robot {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  color: string;
  trail: { x: number; y: number }[];
  role: 'leader' | 'follower';
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function WorkingRobots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const robotsRef = useRef<Robot[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const [debugMode] = useState(false);

  // Initialize robots
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];
    
    robotsRef.current = Array.from({ length: NUM_ROBOTS }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      targetX: width / 2,
      targetY: height / 2,
      color: colors[i],
      trail: [],
      role: i === 0 ? 'leader' : 'follower'
    }));

    mouseRef.current = { x: width / 2, y: height / 2 };
    lastMouseRef.current = { x: width / 2, y: height / 2 };
  }, []);

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      lastMouseRef.current = { ...mouseRef.current };
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Detect obstacles (simplified but effective)
  const updateObstacles = () => {
    const elements = Array.from(document.querySelectorAll(
      "button, a, h1, h2, h3, p, nav, footer, input, textarea"
    ));
    
    obstaclesRef.current = elements
      .map(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 20 || rect.height < 20 || el === canvasRef.current) return null;
        
        const style = window.getComputedStyle(el);
        if (style.visibility === 'hidden' || style.opacity === '0') return null;
        
        return {
          x: rect.left - 20,
          y: rect.top - 20,
          width: rect.width + 40,
          height: rect.height + 40
        };
      })
      .filter(Boolean) as Obstacle[];
  };

  // Check if point is inside obstacle
  const isInObstacle = (x: number, y: number): boolean => {
    return obstaclesRef.current.some(obs => 
      x > obs.x && x < obs.x + obs.width &&
      y > obs.y && y < obs.y + obs.height
    );
  };

  // Get closest point outside obstacle
  const getValidPosition = (x: number, y: number): { x: number, y: number } => {
    if (!isInObstacle(x, y)) return { x, y };
    
    // Simple approach: move outward from center
    const canvas = canvasRef.current;
    if (!canvas) return { x, y };
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const angle = Math.atan2(y - centerY, x - centerX);
    
    for (let dist = 50; dist < 300; dist += 20) {
      const testX = x + Math.cos(angle) * dist;
      const testY = y + Math.sin(angle) * dist;
      if (!isInObstacle(testX, testY)) {
        return { x: testX, y: testY };
      }
    }
    
    return { x, y };
  };

  // Main animation loop
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
      // Clear canvas
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;
      const lastMouse = lastMouseRef.current;
      
      // Calculate mouse velocity for prediction
      const mouseVx = mouse.x - lastMouse.x;
      const mouseVy = mouse.y - lastMouse.y;
      const predictedX = mouse.x + mouseVx * 10;
      const predictedY = mouse.y + mouseVy * 10;

      // Update each robot
      robotsRef.current.forEach((robot, index) => {
        // Determine target position based on role
        let targetX, targetY;
        
        if (robot.role === 'leader') {
          // Leader goes directly to mouse
          targetX = predictedX;
          targetY = predictedY;
        } else {
          // Followers form formation around leader
          const leader = robotsRef.current[0];
          const angle = ((index - 1) / (NUM_ROBOTS - 1)) * Math.PI * 2;
          targetX = leader.x + Math.cos(angle) * FORMATION_DISTANCE;
          targetY = leader.y + Math.sin(angle) * FORMATION_DISTANCE;
        }
        
        // Validate target position
        const validTarget = getValidPosition(targetX, targetY);
        targetX = validTarget.x;
        targetY = validTarget.y;
        
        robot.targetX = targetX;
        robot.targetY = targetY;

        // Calculate desired velocity
        const dx = targetX - robot.x;
        const dy = targetY - robot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
          // Normal pursuit
          const desiredVx = (dx / distance) * MAX_SPEED;
          const desiredVy = (dy / distance) * MAX_SPEED;
          
          // Smooth acceleration
          robot.vx += (desiredVx - robot.vx) * 0.1;
          robot.vy += (desiredVy - robot.vy) * 0.1;
        } else {
          // Slow down when close
          robot.vx *= 0.9;
          robot.vy *= 0.9;
        }

        // Obstacle avoidance
        let avoidX = 0;
        let avoidY = 0;
        
        obstaclesRef.current.forEach(obstacle => {
          const closestX = Math.max(obstacle.x, Math.min(robot.x, obstacle.x + obstacle.width));
          const closestY = Math.max(obstacle.y, Math.min(robot.y, obstacle.y + obstacle.height));
          
          const distX = robot.x - closestX;
          const distY = robot.y - closestY;
          const dist = Math.sqrt(distX * distX + distY * distY);
          
          if (dist < OBSTACLE_AVOID_DISTANCE && dist > 0) {
            const force = (OBSTACLE_AVOID_DISTANCE - dist) / OBSTACLE_AVOID_DISTANCE;
            avoidX += (distX / dist) * force * 3;
            avoidY += (distY / dist) * force * 3;
          }
        });
        
        robot.vx += avoidX;
        robot.vy += avoidY;
        
        // Limit speed
        const speed = Math.sqrt(robot.vx * robot.vx + robot.vy * robot.vy);
        if (speed > MAX_SPEED) {
          robot.vx = (robot.vx / speed) * MAX_SPEED;
          robot.vy = (robot.vy / speed) * MAX_SPEED;
        }

        // Update position
        robot.x += robot.vx;
        robot.y += robot.vy;

        // Keep on screen
        robot.x = Math.max(ROBOT_SIZE, Math.min(canvas.width - ROBOT_SIZE, robot.x));
        robot.y = Math.max(ROBOT_SIZE, Math.min(canvas.height - ROBOT_SIZE, robot.y));

        // Update trail
        robot.trail.push({ x: robot.x, y: robot.y });
        if (robot.trail.length > 15) robot.trail.shift();
      });

      // Draw debug info
      if (debugMode) {
        // Draw obstacles
        ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
        ctx.lineWidth = 1;
        obstaclesRef.current.forEach(obstacle => {
          ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
        
        // Draw targets
        robotsRef.current.forEach(robot => {
          ctx.strokeStyle = robot.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(robot.x, robot.y);
          ctx.lineTo(robot.targetX, robot.targetY);
          ctx.stroke();
        });
      }

      // Draw robots
      robotsRef.current.forEach(robot => {
        // Draw trail
        if (robot.trail.length > 1) {
          ctx.strokeStyle = robot.color + "33";
          ctx.lineWidth = 2;
          ctx.beginPath();
          robot.trail.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }

        // Draw robot body
        ctx.save();
        ctx.translate(robot.x, robot.y);
        
        // Calculate rotation based on velocity
        const angle = Math.atan2(robot.vy, robot.vx);
        ctx.rotate(angle);
        
        // Robot body (triangle)
        ctx.fillStyle = robot.color;
        ctx.beginPath();
        ctx.moveTo(ROBOT_SIZE, 0);
        ctx.lineTo(-ROBOT_SIZE/2, -ROBOT_SIZE/2);
        ctx.lineTo(-ROBOT_SIZE/2, ROBOT_SIZE/2);
        ctx.closePath();
        ctx.fill();
        
        // Outline
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Role indicator
        if (robot.role === 'leader') {
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      });

      // Draw mouse target
      ctx.strokeStyle = "rgba(255, 0, 100, 0.5)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Crosshair
      ctx.strokeStyle = "rgba(255, 0, 100, 0.7)";
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
  }, [debugMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10"
      style={{ background: "transparent" }}
    />
  );
}