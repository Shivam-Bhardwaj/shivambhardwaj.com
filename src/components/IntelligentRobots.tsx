"use client";
import { useEffect, useRef } from "react";

const NUM_ROBOTS = 6;
const ROBOT_SIZE = 8;
const MAX_SPEED = 2;
const OBSTACLE_PADDING = 30; // Much larger padding around text

interface Robot {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  trail: { x: number; y: number }[];
  stuckCounter: number;
  lastPosition: { x: number; y: number };
  wanderAngle: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function IntelligentRobots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const robotsRef = useRef<Robot[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const obstaclesRef = useRef<Obstacle[]>([]);

  // Initialize robots
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const colors = ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];
    
    robotsRef.current = Array.from({ length: NUM_ROBOTS }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      color: colors[i % colors.length],
      trail: [],
      stuckCounter: 0,
      lastPosition: { x: 0, y: 0 },
      wanderAngle: Math.random() * Math.PI * 2
    }));

    mouseRef.current = { x: width / 2, y: height / 2 };
  }, []);

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Better obstacle detection
  const updateObstacles = () => {
    const elements = Array.from(document.querySelectorAll(
      "button, a, h1, h2, h3, h4, h5, h6, p, span, label, input, textarea, nav, footer, div[class*='text'], div[class*='font']"
    ));
    
    obstaclesRef.current = elements
      .map(el => {
        const rect = el.getBoundingClientRect();
        
        // Skip tiny elements or canvas
        if (rect.width < 5 || rect.height < 5) return null;
        if (el === canvasRef.current) return null;
        
        // Check visibility
        const style = window.getComputedStyle(el);
        if (style.visibility === 'hidden' || style.opacity === '0' || style.display === 'none') return null;
        
        // Only include if has text or is interactive
        const hasText = el.textContent?.trim().length > 0;
        const isButton = ['BUTTON', 'A'].includes(el.tagName);
        const isInput = ['INPUT', 'TEXTAREA'].includes(el.tagName);
        
        if (!hasText && !isButton && !isInput) return null;
        
        // Add generous padding
        return {
          x: rect.left - OBSTACLE_PADDING,
          y: rect.top - OBSTACLE_PADDING,
          width: rect.width + (OBSTACLE_PADDING * 2),
          height: rect.height + (OBSTACLE_PADDING * 2)
        };
      })
      .filter(Boolean) as Obstacle[];
  };

  // Check if point is inside obstacle
  const isInsideObstacle = (x: number, y: number): boolean => {
    for (const obstacle of obstaclesRef.current) {
      if (x > obstacle.x && x < obstacle.x + obstacle.width &&
          y > obstacle.y && y < obstacle.y + obstacle.height) {
        return true;
      }
    }
    return false;
  };

  // Get nearest free point from obstacles
  const getNearestFreePoint = (x: number, y: number): {x: number, y: number} => {
    if (!isInsideObstacle(x, y)) return {x, y};
    
    // Spiral search for free space
    for (let radius = 10; radius < 200; radius += 10) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
        const testX = x + Math.cos(angle) * radius;
        const testY = y + Math.sin(angle) * radius;
        if (!isInsideObstacle(testX, testY)) {
          return {x: testX, y: testY};
        }
      }
    }
    return {x, y}; // Fallback
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
      // Clear with fade
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;

      // Update each robot
      robotsRef.current.forEach(robot => {
        // Check if stuck (hasn't moved much)
        const moveDist = Math.sqrt(
          Math.pow(robot.x - robot.lastPosition.x, 2) + 
          Math.pow(robot.y - robot.lastPosition.y, 2)
        );
        
        if (moveDist < 0.5) {
          robot.stuckCounter++;
        } else {
          robot.stuckCounter = Math.max(0, robot.stuckCounter - 1);
        }
        
        robot.lastPosition = { x: robot.x, y: robot.y };

        // If stuck, use wander behavior
        if (robot.stuckCounter > 30) {
          // Random wander
          robot.wanderAngle += (Math.random() - 0.5) * 0.5;
          const wanderX = Math.cos(robot.wanderAngle) * MAX_SPEED;
          const wanderY = Math.sin(robot.wanderAngle) * MAX_SPEED;
          
          robot.vx = wanderX;
          robot.vy = wanderY;
          
          // Reset stuck counter after wandering
          if (robot.stuckCounter > 60) {
            robot.stuckCounter = 0;
            // Jump to a new position if really stuck
            const freePoint = getNearestFreePoint(robot.x, robot.y);
            robot.x = freePoint.x;
            robot.y = freePoint.y;
          }
        } else {
          // Normal behavior - seek mouse
          let targetX = mouse.x;
          let targetY = mouse.y;
          
          // If target is in obstacle, find nearest free point
          const freeTarget = getNearestFreePoint(targetX, targetY);
          targetX = freeTarget.x;
          targetY = freeTarget.y;
          
          // Calculate desired direction
          let dx = targetX - robot.x;
          let dy = targetY - robot.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 5) {
            // Normalize direction
            dx /= distance;
            dy /= distance;
            
            // Check ahead for obstacles
            const lookAhead = 50;
            const futureX = robot.x + dx * lookAhead;
            const futureY = robot.y + dy * lookAhead;
            
            if (isInsideObstacle(futureX, futureY)) {
              // Try to go around obstacle
              // Calculate tangent vectors (perpendicular)
              const leftX = -dy;
              const leftY = dx;
              const rightX = dy;
              const rightY = -dx;
              
              // Check which side is clearer
              const leftClear = !isInsideObstacle(robot.x + leftX * lookAhead, robot.y + leftY * lookAhead);
              const rightClear = !isInsideObstacle(robot.x + rightX * lookAhead, robot.y + rightY * lookAhead);
              
              if (leftClear && !rightClear) {
                dx = leftX;
                dy = leftY;
              } else if (rightClear && !leftClear) {
                dx = rightX;
                dy = rightY;
              } else if (leftClear && rightClear) {
                // Choose randomly
                if (Math.random() > 0.5) {
                  dx = leftX;
                  dy = leftY;
                } else {
                  dx = rightX;
                  dy = rightY;
                }
              } else {
                // Both blocked, try to back up
                dx = -dx;
                dy = -dy;
              }
            }
            
            // Apply velocity
            robot.vx = dx * MAX_SPEED;
            robot.vy = dy * MAX_SPEED;
          } else {
            // Close to target, slow down
            robot.vx *= 0.9;
            robot.vy *= 0.9;
          }
        }

        // Update position
        robot.x += robot.vx;
        robot.y += robot.vy;

        // Apply friction
        robot.vx *= 0.95;
        robot.vy *= 0.95;

        // Keep on screen
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
        if (Math.random() < 0.5) {
          robot.trail.push({ x: robot.x, y: robot.y });
          if (robot.trail.length > 20) robot.trail.shift();
        }
      });

      // Draw connections between nearby robots
      ctx.strokeStyle = "rgba(6, 182, 212, 0.1)";
      ctx.lineWidth = 1;
      robotsRef.current.forEach((robot, i) => {
        robotsRef.current.forEach((other, j) => {
          if (i < j) {
            const dist = Math.sqrt(
              Math.pow(other.x - robot.x, 2) + 
              Math.pow(other.y - robot.y, 2)
            );
            if (dist < 100) {
              ctx.beginPath();
              ctx.moveTo(robot.x, robot.y);
              ctx.lineTo(other.x, other.y);
              ctx.stroke();
            }
          }
        });
      });

      // Draw robots
      robotsRef.current.forEach(robot => {
        // Draw trail
        if (robot.trail.length > 1) {
          ctx.strokeStyle = robot.color + "22";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          robot.trail.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }

        // Draw robot
        ctx.save();
        ctx.translate(robot.x, robot.y);
        const angle = Math.atan2(robot.vy, robot.vx);
        ctx.rotate(angle);
        
        // Robot body
        ctx.fillStyle = robot.color;
        ctx.beginPath();
        ctx.moveTo(ROBOT_SIZE, 0);
        ctx.lineTo(-ROBOT_SIZE/2, -ROBOT_SIZE/2);
        ctx.lineTo(-ROBOT_SIZE/2, ROBOT_SIZE/2);
        ctx.closePath();
        ctx.fill();
        
        // Stuck indicator
        if (robot.stuckCounter > 20) {
          ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, ROBOT_SIZE + 5, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.restore();
      });

      // Draw mouse target
      ctx.strokeStyle = "rgba(236, 72, 153, 0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

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