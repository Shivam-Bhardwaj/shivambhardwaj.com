"use client";
import { useEffect, useRef } from "react";
import logger from "@/lib/logger";
import { robotEngine, type Robot, type Obstacle } from "@/lib/robot/RobotEngine";
import { getCurrentTheme, getThemeColor, getRobotColor } from "@/lib/theme/themeUtils";

// Refactored SmartAvoidanceRobots using modular RobotEngine
const NUM_ROBOTS = 6;
const ROBOT_SIZE = 12;
const MAX_SPEED = 3;
// GTA-style seeking and avoidance with improved stability constants
const SEEK_FORCE = 0.2;
const AVOID_FORCE = 1.2;
const OBSTACLE_AVOIDANCE_DISTANCE = 120;
// const WALL_AVOIDANCE_DISTANCE = 80;
// Enhanced swarm coordination constants
const SEPARATION_DISTANCE = 70;
const ALIGNMENT_FORCE = 0.1;
const COHESION_FORCE = 0.05;
const SEPARATION_FORCE = 0.2;
// Advanced ray casting constants
const RAY_ANGLES = [-Math.PI/3, -Math.PI/6, 0, Math.PI/6, Math.PI/3];
// const RAY_STEP = 8;
const NEIGHBOR_RADIUS = 100;
const WANDER_FORCE = 0.02;
// Obstacle avoidance distances for different element types
const TEXT_AVOID_DISTANCE = 60;
const BUTTON_AVOID_DISTANCE = 80;

interface TelemetryCollector {
  collectSnapshot: (robots: Robot[]) => void;
  updateFrameRate: () => void;
}

interface SmartAvoidanceRobotsProps {
  telemetryCollector?: TelemetryCollector;
}

export default function SmartAvoidanceRobots({ telemetryCollector }: SmartAvoidanceRobotsProps = {}) {
  logger.log('SmartAvoidanceRobots component mounted.');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const robotsRef = useRef<Robot[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const logoImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Static obstacles will be initialized after component mounts
  const STATIC_OBSTACLES: Obstacle[] = [];

  // Initialize robots using the modular engine
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Configure the robot engine with appropriate settings
    robotEngine.updateConfig({
      seekForce: SEEK_FORCE,
      avoidForce: AVOID_FORCE,
      separationForce: SEPARATION_FORCE,
      alignmentForce: ALIGNMENT_FORCE,
      cohesionForce: COHESION_FORCE,
      wanderForce: WANDER_FORCE,
      maxSpeed: MAX_SPEED,
      obstacleAvoidanceDistance: OBSTACLE_AVOIDANCE_DISTANCE,
      separationDistance: SEPARATION_DISTANCE,
      neighborRadius: NEIGHBOR_RADIUS
    });

    // Create robots using the engine
    robotsRef.current = robotEngine.createRobots(NUM_ROBOTS, width, height);
    mouseRef.current = { x: width / 2, y: height / 2 };
  }, []);

  // Track pointer/mouse/touch
  useEffect(() => {
    const updateMouse = (x: number, y: number) => {
      mouseRef.current = { x, y };
      if (Math.random() < 0.1) {
        // console.log('Mouse:', x, y); // Removed for production
      }
    };

    const handlePointerMove = (e: PointerEvent) => updateMouse(e.clientX, e.clientY);
    const handleMouseMove = (e: MouseEvent) => updateMouse(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) updateMouse(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener("pointermove", handlePointerMove, { capture: true });
    window.addEventListener("mousemove", handleMouseMove, { capture: true });
    window.addEventListener("touchmove", handleTouchMove, { capture: true });
    // console.log('Pointer tracking initialized'); // Removed for production
    return () => {
      window.removeEventListener("pointermove", handlePointerMove, { capture: true });
      window.removeEventListener("mousemove", handleMouseMove, { capture: true });
      window.removeEventListener("touchmove", handleTouchMove, { capture: true });
    };
  }, []);

  const updateObstacles = () => {
    // Only consider semantic text and interactive elements, skip large containers
    const selector = "button, a, input, textarea, select, [role='button'], h1, h2, h3, h4, h5, h6, p, label";
    const allElements = Array.from(document.querySelectorAll(selector));

    // Create dynamic obstacles from DOM elements
    const dynamicObstacles = allElements
      .map(el => {
        if (el === canvasRef.current || el === document.body || el === document.documentElement || !document.body) return null;
        
        const rect = el.getBoundingClientRect();
        
        // Skip tiny, hidden, or very large layout containers
        if (rect.width < 20 || rect.height < 20) return null;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        if (rect.width > vw * 0.85 || rect.height > vh * 0.6) return null;
        
        const style = window.getComputedStyle(el);
        if (style.visibility === 'hidden' || style.opacity === '0' || style.display === 'none') return null;
        
        // Check if element has text content (simplified logic)
        const hasText = el.textContent && el.textContent.trim().length > 2;
        if (!hasText) return null;
        
        // Categorize element type
        let type: 'text' | 'button' | 'interactive' | 'container' = 'text';
        let avoidDistance = TEXT_AVOID_DISTANCE;
        let padding = 40;
        
        const tagName = el.tagName.toLowerCase();
        const role = el.getAttribute('role');
        
        if (tagName === 'button' || role === 'button' || el.getAttribute('data-role') === 'button') {
          type = 'button';
          avoidDistance = BUTTON_AVOID_DISTANCE;
          padding = 60;
        } else if (tagName === 'a' && (el as HTMLAnchorElement).href) {
          // Only treat links with href as interactive elements
          type = 'button';
          avoidDistance = BUTTON_AVOID_DISTANCE;
          padding = 50;
        } else if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
          type = 'interactive';
          avoidDistance = BUTTON_AVOID_DISTANCE;
          padding = 50;
        } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
          type = 'text';
          avoidDistance = TEXT_AVOID_DISTANCE;
          padding = 45;
        } else if (["p", "label"].includes(tagName)) {
          type = 'text';
          avoidDistance = TEXT_AVOID_DISTANCE - 10;
          padding = 35;
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

    obstaclesRef.current = [...dynamicObstacles, ...STATIC_OBSTACLES];
    logger.log(`Updated obstacles. Found ${dynamicObstacles.length} dynamic obstacles and ${STATIC_OBSTACLES.length} static obstacles.`);
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
      // Use theme utilities
      const currentTheme = getCurrentTheme();
      const isDarkMode = currentTheme === 'dark';
      
      // Clear with fade - theme aware
      ctx.fillStyle = getThemeColor('background.overlay');
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;

      // Update each robot using the modular engine
      robotsRef.current.forEach(robot => {
        // Calculate all forces using the engine
        const forces = robotEngine.calculateForces(
          robot,
          robotsRef.current,
          obstaclesRef.current,
          mouse
        );

        // Apply role-based multipliers
        const roleMultiplier = robot.role === 'leader' ? 1.3 :
                              robot.role === 'scout' ? 0.7 : 1.0;

        // Scale forces based on role and mouse proximity
        const distance = Math.sqrt((mouse.x - robot.x) ** 2 + (mouse.y - robot.y) ** 2);
        const nearMouseFactor = Math.min(1, distance / 150);

        forces.seek.x *= roleMultiplier;
        forces.seek.y *= roleMultiplier;
        forces.avoid.x *= nearMouseFactor;
        forces.avoid.y *= nearMouseFactor;

        // Update robot using the engine
        robotEngine.updateRobot(robot, forces, canvas.width, canvas.height);
      });

      // Collect telemetry data
      if (telemetryCollector) {
        telemetryCollector.collectSnapshot(robotsRef.current);
        telemetryCollector.updateFrameRate();
      }

      // Draw all obstacles as logos
      STATIC_OBSTACLES.forEach((obstacle: Obstacle & { logoName?: string }) => {
        const logoImage = obstacle.logoName ? logoImagesRef.current.get(obstacle.logoName) : null;
        
        if (logoImage && logoImage.complete) {
          // Draw logo image
          ctx.save();
          ctx.globalAlpha = 0.6;
          ctx.drawImage(logoImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          ctx.restore();
          
          // Add subtle glow effect - theme aware
          ctx.shadowBlur = 10;
          ctx.shadowColor = isDarkMode ? 'rgba(100, 200, 255, 0.7)' : 'rgba(100, 200, 255, 0.5)';
          ctx.strokeStyle = isDarkMode ? 'rgba(100, 200, 255, 0.5)' : 'rgba(100, 200, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          ctx.shadowBlur = 0;
        } else {
          // Fallback to simple shapes if image not loaded - theme aware
          ctx.fillStyle = isDarkMode ? "rgba(200, 200, 200, 0.25)" : "rgba(100, 100, 100, 0.15)";
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
      });
      
      // Draw robots with enhanced role-based visuals
      robotsRef.current.forEach(robot => {
        // Enhanced trail with role-based styling - using theme utilities
        if (robot.trail.length > 1) {
          ctx.strokeStyle = getRobotColor(robot.role as 'leader' | 'scout' | 'worker', 'trail');
          ctx.lineWidth = robot.role === 'leader' ? 4 : 3;
          ctx.beginPath();
          robot.trail.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }

        // Robot body with role-based size and shape
        ctx.save();
        ctx.translate(robot.x, robot.y);
        
        const angle = Math.atan2(robot.vy, robot.vx);
        ctx.rotate(angle);
        
        // Role-based size modifier
        const sizeMultiplier = robot.role === 'leader' ? 1.3 : robot.role === 'scout' ? 0.8 : 1.0;
        const size = ROBOT_SIZE * sizeMultiplier;
        
        // Robot shape based on role - using theme utilities
        ctx.fillStyle = getRobotColor(robot.role as 'leader' | 'scout' | 'worker', 'body');
        ctx.beginPath();
        
        if (robot.role === 'leader') {
          // Diamond shape for leaders
          ctx.moveTo(size, 0);
          ctx.lineTo(0, -size/2);
          ctx.lineTo(-size/2, 0);
          ctx.lineTo(0, size/2);
        } else if (robot.role === 'scout') {
          // Circle for scouts
          ctx.arc(0, 0, size/2, 0, Math.PI * 2);
        } else {
          // Triangle for followers
          ctx.moveTo(size, 0);
          ctx.lineTo(-size/2, -size/2);
          ctx.lineTo(-size/2, size/2);
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Role indicator outline - using theme utilities
        ctx.strokeStyle = getRobotColor(robot.role as 'leader' | 'scout' | 'worker', 'outline');
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Direction indicator - theme aware
        ctx.fillStyle = getThemeColor('text.primary');
        ctx.beginPath();
        ctx.arc(size/3, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();

        // Debug: Show avoidance rays for the first robot
        if (robot.id === 0) {
          const robotAngle = Math.atan2(robot.vy, robot.vx);
          
          ctx.strokeStyle = isDarkMode ? "rgba(255, 100, 100, 0.6)" : "rgba(255, 0, 0, 0.4)";
          ctx.lineWidth = 1;
          
          RAY_ANGLES.forEach(angleOffset => {
            const rayAngle = robotAngle + angleOffset;
            const rayDx = Math.cos(rayAngle);
            const rayDy = Math.sin(rayAngle);
            
            ctx.beginPath();
            ctx.moveTo(robot.x, robot.y);
            ctx.lineTo(
              robot.x + rayDx * OBSTACLE_AVOIDANCE_DISTANCE, 
              robot.y + rayDy * OBSTACLE_AVOIDANCE_DISTANCE
            );
            ctx.stroke();
          });
        }
      });

      // Draw mouse target - theme aware
      ctx.strokeStyle = isDarkMode ? "rgba(255, 100, 150, 0.8)" : "rgba(255, 0, 100, 0.6)";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ background: "transparent", pointerEvents: "none" }}
    />
  );
}