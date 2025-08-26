"use client";
import { useEffect, useRef } from "react";

// Smart robots with proper text/button avoidance
const NUM_ROBOTS = 4;
const ROBOT_SIZE = 10;
const MAX_SPEED = 3;
const SEEK_FORCE = 0.08;
const AVOID_FORCE = 1.5;
const TEXT_AVOID_DISTANCE = 70; // Larger avoidance for text
const BUTTON_AVOID_DISTANCE = 80; // Even larger for interactive elements

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
  type: 'text' | 'button' | 'interactive' | 'container';
  avoidDistance: number;
}

export default function SmartAvoidanceRobots() {
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

  // Smart obstacle detection - categorize elements
  const updateObstacles = () => {
    const allElements = Array.from(document.querySelectorAll("*"));
    
    obstaclesRef.current = allElements
      .map(el => {
        if (el === canvasRef.current || el === document.body || el === document.documentElement) return null;
        
        const rect = el.getBoundingClientRect();
        
        // Skip tiny or hidden elements
        if (rect.width < 10 || rect.height < 10) return null;
        
        const style = window.getComputedStyle(el);
        if (style.visibility === 'hidden' || style.opacity === '0' || style.display === 'none') return null;
        
        // Check if element has text content
        const hasText = el.textContent && el.textContent.trim().length > 0;
        if (!hasText) return null;
        
        // Categorize element type
        let type: 'text' | 'button' | 'interactive' | 'container' = 'text';
        let avoidDistance = TEXT_AVOID_DISTANCE;
        let padding = 25;
        
        const tagName = el.tagName.toLowerCase();
        const role = el.getAttribute('role');
        
        if (tagName === 'button' || tagName === 'a' || role === 'button') {
          type = 'button';
          avoidDistance = BUTTON_AVOID_DISTANCE;
          padding = 35;
        } else if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
          type = 'interactive';
          avoidDistance = BUTTON_AVOID_DISTANCE;
          padding = 30;
        } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
          type = 'text';
          avoidDistance = TEXT_AVOID_DISTANCE;
          padding = 30;
        } else if (['p', 'span', 'div', 'label'].includes(tagName)) {
          type = 'text';
          avoidDistance = TEXT_AVOID_DISTANCE - 20; // Less avoidance for body text
          padding = 20;
        }
        
        return {
          x: rect.left - padding,
          y: rect.top - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
          type,
          avoidDistance
        };
      })
      .filter(Boolean) as Obstacle[];
  };

  // Check if robot will collide with obstacle
  const willCollideWithObstacle = (robot: Robot, obstacle: Obstacle): boolean => {
    const futureX = robot.x + robot.vx * 5;
    const futureY = robot.y + robot.vy * 5;
    
    return futureX > obstacle.x && 
           futureX < obstacle.x + obstacle.width &&
           futureY > obstacle.y && 
           futureY < obstacle.y + obstacle.height;
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
    const obstacleInterval = setInterval(updateObstacles, 800);

    const animate = () => {
      // Clear with fade
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;

      // Update each robot
      robotsRef.current.forEach(robot => {
        // SEEK: Move towards mouse
        let seekX = mouse.x - robot.x;
        let seekY = mouse.y - robot.y;
        const distance = Math.sqrt(seekX * seekX + seekY * seekY);
        
        if (distance > 0) {
          seekX = (seekX / distance) * MAX_SPEED;
          seekY = (seekY / distance) * MAX_SPEED;
        }

        // AVOID: Smart obstacle avoidance
        let avoidX = 0;
        let avoidY = 0;
        
        obstaclesRef.current.forEach(obstacle => {
          // Calculate distance to obstacle edge
          const closestX = Math.max(obstacle.x, Math.min(robot.x, obstacle.x + obstacle.width));
          const closestY = Math.max(obstacle.y, Math.min(robot.y, obstacle.y + obstacle.height));
          
          const dx = robot.x - closestX;
          const dy = robot.y - closestY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < obstacle.avoidDistance && dist > 0) {
            // Stronger avoidance for closer obstacles
            const force = (obstacle.avoidDistance - dist) / obstacle.avoidDistance;
            
            // Extra force multiplier based on obstacle type
            let multiplier = 1;
            if (obstacle.type === 'button' || obstacle.type === 'interactive') {
              multiplier = 2; // Avoid buttons more strongly
            }
            
            avoidX += (dx / dist) * force * AVOID_FORCE * multiplier;
            avoidY += (dy / dist) * force * AVOID_FORCE * multiplier;
          }
          
          // Predictive avoidance - check future collision
          if (willCollideWithObstacle(robot, obstacle)) {
            // Strong emergency avoidance
            const emergencyX = robot.x - (obstacle.x + obstacle.width / 2);
            const emergencyY = robot.y - (obstacle.y + obstacle.height / 2);
            const emergencyDist = Math.sqrt(emergencyX * emergencyX + emergencyY * emergencyY);
            
            if (emergencyDist > 0) {
              avoidX += (emergencyX / emergencyDist) * AVOID_FORCE * 3;
              avoidY += (emergencyY / emergencyDist) * AVOID_FORCE * 3;
            }
          }
        });

        // Apply steering forces
        robot.vx += (seekX - robot.vx) * SEEK_FORCE;
        robot.vy += (seekY - robot.vy) * SEEK_FORCE;
        
        // Apply avoidance
        robot.vx += avoidX * 0.2;
        robot.vy += avoidY * 0.2;
        
        // Limit speed (keep this speed - it's good)
        const speed = Math.sqrt(robot.vx * robot.vx + robot.vy * robot.vy);
        if (speed > MAX_SPEED) {
          robot.vx = (robot.vx / speed) * MAX_SPEED;
          robot.vy = (robot.vy / speed) * MAX_SPEED;
        }

        // Update position
        robot.x += robot.vx;
        robot.y += robot.vy;

        // Screen boundaries
        robot.x = Math.max(ROBOT_SIZE, Math.min(canvas.width - ROBOT_SIZE, robot.x));
        robot.y = Math.max(ROBOT_SIZE, Math.min(canvas.height - ROBOT_SIZE, robot.y));

        // Update trail
        robot.trail.push({ x: robot.x, y: robot.y });
        if (robot.trail.length > 25) robot.trail.shift();
      });

      // Draw prediction paths (velocity direction only - no mouse line)
      robotsRef.current.forEach(robot => {
        // Only show velocity vector
        ctx.strokeStyle = robot.color + "88";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.moveTo(robot.x, robot.y);
        
        const futureX = robot.x + robot.vx * 25;
        const futureY = robot.y + robot.vy * 25;
        ctx.lineTo(futureX, futureY);
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
        
        // Direction indicator
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(ROBOT_SIZE/2, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });

      // Draw mouse target
      ctx.strokeStyle = "rgba(255, 0, 100, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 15, 0, Math.PI * 2);
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