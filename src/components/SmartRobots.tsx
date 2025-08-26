"use client";
import { useEffect, useRef, useState } from "react";

const NUM_ROBOTS = 6;
const ROBOT_SIZE = 8;
const MAX_SPEED = 2.5;
const MAX_FORCE = 0.15;
const COMMUNICATION_RADIUS = 100;
const OBSTACLE_PADDING = 15;

interface Robot {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  trail: { x: number; y: number }[];
  knownObstacles: Set<string>;
  connections: Set<number>;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
}

export default function SmartRobots() {
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
      knownObstacles: new Set(),
      connections: new Set()
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

  // Detect DOM elements as obstacles - more accurate detection
  const updateObstacles = () => {
    const elements = Array.from(document.querySelectorAll(
      "button, a, h1, h2, h3, h4, h5, h6, p, span, label, input, textarea, nav, footer, header, section[id], div[role]"
    ));
    
    obstaclesRef.current = elements
      .map((el, index) => {
        const rect = el.getBoundingClientRect();
        
        // Skip if too small or is the canvas
        if (rect.width < 10 || rect.height < 10) return null;
        if (el === canvasRef.current) return null;
        
        // Skip if no visible content
        const style = window.getComputedStyle(el);
        if (style.visibility === 'hidden' || style.opacity === '0') return null;
        
        // Check if element has text content or is interactive
        const hasText = el.textContent?.trim().length > 0;
        const isInteractive = ['BUTTON', 'A', 'INPUT', 'TEXTAREA'].includes(el.tagName);
        const hasRole = el.getAttribute('role') !== null;
        
        if (!hasText && !isInteractive && !hasRole) return null;
        
        return {
          x: rect.left - OBSTACLE_PADDING,
          y: rect.top - OBSTACLE_PADDING,
          width: rect.width + (OBSTACLE_PADDING * 2),
          height: rect.height + (OBSTACLE_PADDING * 2),
          id: `obstacle-${index}`
        };
      })
      .filter(Boolean) as Obstacle[];
  };

  // A* Pathfinding for smarter navigation
  const findPath = (start: {x: number, y: number}, end: {x: number, y: number}): {x: number, y: number}[] => {
    // Simplified pathfinding - just check if direct path is blocked
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(distance / 20);
    
    let blocked = false;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const checkX = start.x + dx * t;
      const checkY = start.y + dy * t;
      
      for (const obstacle of obstaclesRef.current) {
        if (checkX > obstacle.x && 
            checkX < obstacle.x + obstacle.width &&
            checkY > obstacle.y && 
            checkY < obstacle.y + obstacle.height) {
          blocked = true;
          break;
        }
      }
      if (blocked) break;
    }
    
    if (!blocked) {
      return [end]; // Direct path is clear
    }
    
    // Find waypoint around obstacle
    const waypoints: {x: number, y: number}[] = [];
    for (const obstacle of obstaclesRef.current) {
      // Check if this obstacle is between robot and target
      const obsCenterX = obstacle.x + obstacle.width / 2;
      const obsCenterY = obstacle.y + obstacle.height / 2;
      
      const toObsDist = Math.sqrt(
        Math.pow(obsCenterX - start.x, 2) + 
        Math.pow(obsCenterY - start.y, 2)
      );
      
      const toTargetDist = Math.sqrt(
        Math.pow(end.x - start.x, 2) + 
        Math.pow(end.y - start.y, 2)
      );
      
      if (toObsDist < toTargetDist) {
        // Add waypoints around obstacle corners
        waypoints.push(
          { x: obstacle.x - 10, y: obstacle.y - 10 },
          { x: obstacle.x + obstacle.width + 10, y: obstacle.y - 10 },
          { x: obstacle.x - 10, y: obstacle.y + obstacle.height + 10 },
          { x: obstacle.x + obstacle.width + 10, y: obstacle.y + obstacle.height + 10 }
        );
      }
    }
    
    // Find best waypoint
    let bestWaypoint = end;
    let bestScore = Infinity;
    
    for (const waypoint of waypoints) {
      const distToWaypoint = Math.sqrt(
        Math.pow(waypoint.x - start.x, 2) + 
        Math.pow(waypoint.y - start.y, 2)
      );
      const distFromWaypointToEnd = Math.sqrt(
        Math.pow(end.x - waypoint.x, 2) + 
        Math.pow(end.y - waypoint.y, 2)
      );
      const score = distToWaypoint + distFromWaypointToEnd;
      
      if (score < bestScore) {
        bestScore = score;
        bestWaypoint = waypoint;
      }
    }
    
    return [bestWaypoint, end];
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
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;

      // Update robot connections
      robotsRef.current.forEach(robot => {
        robot.connections.clear();
        robotsRef.current.forEach(other => {
          if (robot.id !== other.id) {
            const dist = Math.sqrt(
              Math.pow(other.x - robot.x, 2) + 
              Math.pow(other.y - robot.y, 2)
            );
            if (dist < COMMUNICATION_RADIUS) {
              robot.connections.add(other.id);
              // Share obstacle knowledge
              other.knownObstacles.forEach(obs => robot.knownObstacles.add(obs));
            }
          }
        });
      });

      // Draw communication links
      ctx.strokeStyle = "rgba(6, 182, 212, 0.1)";
      ctx.lineWidth = 1;
      robotsRef.current.forEach(robot => {
        robot.connections.forEach(otherId => {
          if (robot.id < otherId) { // Draw each link only once
            const other = robotsRef.current[otherId];
            ctx.beginPath();
            ctx.moveTo(robot.x, robot.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
            
            // Draw data transfer pulse
            const t = (Date.now() / 1000) % 1;
            const pulseX = robot.x + (other.x - robot.x) * t;
            const pulseY = robot.y + (other.y - robot.y) * t;
            ctx.fillStyle = "rgba(6, 182, 212, 0.5)";
            ctx.beginPath();
            ctx.arc(pulseX, pulseY, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      });

      // Update each robot
      robotsRef.current.forEach(robot => {
        // Get path to target
        const path = findPath(robot, mouse);
        const target = path[0];
        
        // Calculate desired velocity
        let desiredVx = target.x - robot.x;
        let desiredVy = target.y - robot.y;
        const distance = Math.sqrt(desiredVx * desiredVx + desiredVy * desiredVy);
        
        if (distance > 0) {
          desiredVx = (desiredVx / distance) * MAX_SPEED;
          desiredVy = (desiredVy / distance) * MAX_SPEED;
        }

        // Check for immediate obstacle collision
        let avoidX = 0;
        let avoidY = 0;
        
        for (const obstacle of obstaclesRef.current) {
          // Predictive collision detection
          const futureX = robot.x + robot.vx * 10;
          const futureY = robot.y + robot.vy * 10;
          
          if (futureX > obstacle.x && 
              futureX < obstacle.x + obstacle.width &&
              futureY > obstacle.y && 
              futureY < obstacle.y + obstacle.height) {
            
            // Calculate escape vector
            const centerX = obstacle.x + obstacle.width / 2;
            const centerY = obstacle.y + obstacle.height / 2;
            const escapeX = robot.x - centerX;
            const escapeY = robot.y - centerY;
            const escapeDist = Math.sqrt(escapeX * escapeX + escapeY * escapeY);
            
            if (escapeDist > 0) {
              avoidX += (escapeX / escapeDist) * 10;
              avoidY += (escapeY / escapeDist) * 10;
            }
            
            // Mark obstacle as known
            robot.knownObstacles.add(obstacle.id);
          }
        }

        // Combine steering forces
        const steerX = desiredVx + avoidX;
        const steerY = desiredVy + avoidY;
        
        // Apply steering
        robot.vx += steerX * MAX_FORCE;
        robot.vy += steerY * MAX_FORCE;
        
        // Limit speed
        const speed = Math.sqrt(robot.vx * robot.vx + robot.vy * robot.vy);
        if (speed > MAX_SPEED) {
          robot.vx = (robot.vx / speed) * MAX_SPEED;
          robot.vy = (robot.vy / speed) * MAX_SPEED;
        }

        // Update position
        robot.x += robot.vx;
        robot.y += robot.vy;

        // Damping
        robot.vx *= 0.95;
        robot.vy *= 0.95;

        // Keep on screen
        robot.x = Math.max(ROBOT_SIZE, Math.min(canvas.width - ROBOT_SIZE, robot.x));
        robot.y = Math.max(ROBOT_SIZE, Math.min(canvas.height - ROBOT_SIZE, robot.y));

        // Update trail
        if (Math.random() < 0.3) {
          robot.trail.push({ x: robot.x, y: robot.y });
          if (robot.trail.length > 15) robot.trail.shift();
        }
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
        
        // Connection indicator
        if (robot.connections.size > 0) {
          ctx.strokeStyle = robot.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, 0, ROBOT_SIZE + 3, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.restore();
      });

      // Draw mouse target
      ctx.strokeStyle = "rgba(236, 72, 153, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 15, 0, Math.PI * 2);
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