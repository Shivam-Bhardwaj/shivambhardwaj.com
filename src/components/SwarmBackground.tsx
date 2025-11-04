/**
 * Swarm Background Component
 * 
 * Persistent background swarm simulation that runs across all pages.
 * Robots navigate around website content as a perpetual theme.
 */

"use client";
import { useEffect, useRef, useState } from "react";
import { Vector2 } from "@/lib/robotics/math";
import { Robot } from "@/lib/robotics/robot";
import { getRandomRobotTypes } from "@/lib/robotics/robotTypes";
import { ObstacleAvoidance } from "@/lib/robotics/obstacleAvoidance";
import { CommunicationGraph } from "@/lib/robotics/communication";
import { SensorVisualization } from "@/lib/robotics/sensorVisualization";
import { SLAMSystem } from "@/lib/robotics/slam";
import { CommunicationGraph as GraphTheoryGraph } from "@/lib/robotics/graphTheory";
import { useTheme } from "@/lib/ThemeProvider";

const ROBOT_COUNT = 15; // Fewer robots for background performance
const ROBOT_SIZE = 6; // Smaller robots for subtle background effect

export default function SwarmBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const robotsRef = useRef<Robot[]>([]);
  const obstacleAvoidanceRef = useRef<ObstacleAvoidance | null>(null);
  const communicationGraphRef = useRef<CommunicationGraph | null>(null);
  const slamSystemRef = useRef<SLAMSystem | null>(null);
  const graphTheoryRef = useRef<GraphTheoryGraph | null>(null);
  const lastFrameTimeRef = useRef(0);
  const [isVisible, setIsVisible] = useState(true);
  const { theme } = useTheme();
  const mousePositionRef = useRef<Vector2 | null>(null);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = new Vector2(e.clientX, e.clientY);
    };
    
    const handleMouseLeave = () => {
      mousePositionRef.current = null;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Initialize robots
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size to viewport
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    // Initialize game systems
    obstacleAvoidanceRef.current = new ObstacleAvoidance();
    communicationGraphRef.current = new CommunicationGraph();
    slamSystemRef.current = new SLAMSystem(window.innerWidth, window.innerHeight);
    graphTheoryRef.current = new GraphTheoryGraph();
    
    // Initialize robots with random types
    const robotTypes = getRandomRobotTypes(ROBOT_COUNT);
    const newRobots: Robot[] = robotTypes.map((type, i) => {
      const pos = new Vector2(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight
      );
      return new Robot(i, type, pos);
    });
    
    robotsRef.current = newRobots;
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const obstacleAvoidance = obstacleAvoidanceRef.current;
    const communicationGraph = communicationGraphRef.current;
    const slamSystem = slamSystemRef.current;
    const graphTheory = graphTheoryRef.current;
    
    if (!obstacleAvoidance || !communicationGraph || !slamSystem || !graphTheory) return;
    
    if (robotsRef.current.length === 0) return;

    const animate = (currentTime: number) => {
      const deltaTime = lastFrameTimeRef.current === 0 
        ? 0.016 
        : Math.min((currentTime - lastFrameTimeRef.current) / 1000, 0.033);
      
      lastFrameTimeRef.current = currentTime;

      // Clear canvas with transparent background (for overlay effect)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const currentRobots = robotsRef.current;
      
      // Update robots
      const mousePos = mousePositionRef.current;
      
      for (const robot of currentRobots) {
        if (!robot.isOperational()) continue;
        
        let targetDirection = new Vector2(0, 0);
        
        // Robots converge to mouse pointer with varying abilities
        if (mousePos) {
          const toMouse = mousePos.subtract(robot.state.position);
          const distanceToMouse = toMouse.magnitude();
          
          // Some robots have better sensor capabilities (Lidar) and can follow mouse better
          // Robots with Lidar sensors have stronger attraction to mouse
          const hasLidar = robot.state.type.sensors.includes('Lidar');
          const hasUltrasonic = robot.state.type.sensors.includes('Ultrasonic');
          
          // Calculate attraction strength based on sensor capabilities
          let attractionStrength = 0.3; // Base attraction
          if (hasLidar) {
            attractionStrength = 0.7; // Strong attraction for Lidar robots
          } else if (hasUltrasonic) {
            attractionStrength = 0.5; // Moderate attraction for Ultrasonic robots
          }
          
          // Reduce attraction if mouse is too far (based on sensor range)
          const sensorRange = robot.getSensorRange(ROBOT_SIZE);
          if (distanceToMouse > sensorRange * 3) {
            // Robot can't sense mouse if too far
            attractionStrength *= 0.3;
          } else if (distanceToMouse > sensorRange * 1.5) {
            // Weak signal if far
            attractionStrength *= 0.6;
          }
          
          // Normalize direction and apply attraction strength
          if (distanceToMouse > 5) { // Don't move if already very close
            const normalizedToMouse = toMouse.normalize();
            targetDirection = normalizedToMouse.multiply(attractionStrength);
          }
        }
        
        // Add gentle random exploration when no mouse target
        if (!mousePos || targetDirection.magnitude() < 0.1) {
          const randomDirection = new Vector2(
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3
          );
          targetDirection = targetDirection.add(randomDirection);
        }
        
        // Apply obstacle avoidance (primary force - navigates around content)
        const avoidanceVelocity = obstacleAvoidance.applyObstacleAvoidance(
          robot,
          targetDirection
        );
        
        // Combine mouse attraction with obstacle avoidance
        // Obstacle avoidance takes priority, but we blend with mouse following
        const finalVelocity = avoidanceVelocity.add(targetDirection.multiply(0.4));
        
        robot.setTargetVelocity(finalVelocity);
        robot.update(deltaTime);
        
        // Keep robots in bounds
        robot.state.position.x = Math.max(ROBOT_SIZE, Math.min(canvas.width - ROBOT_SIZE, robot.state.position.x));
        robot.state.position.y = Math.max(ROBOT_SIZE, Math.min(canvas.height - ROBOT_SIZE, robot.state.position.y));
      }
      
      // Update SLAM system
      const obstacles = obstacleAvoidance.getObstacles();
      for (const robot of currentRobots) {
        if (robot.isOperational()) {
          slamSystem.updateOccupancyGrid(robot, obstacles);
        }
      }
      slamSystem.shareMapData(currentRobots);
      
      // Update graph theory graph
      graphTheory.buildGraph(currentRobots);
      
      // Update communication graph
      communicationGraph.update(currentRobots);
      
      // Render robots with theme-adaptive colors
      const robotOpacity = theme === "dark" ? "CC" : "66"; // More visible in dark mode
      const borderOpacity = theme === "dark" ? "FF" : "80";
      
      for (const robot of currentRobots) {
        if (!robot.isOperational()) continue;
        
        const pos = robot.state.position;
        
        // Draw robot body with theme-adaptive opacity
        const color = robot.state.type.color;
        ctx.fillStyle = color + robotOpacity;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, ROBOT_SIZE, 0, Math.PI * 2);
        ctx.fill();
        
        // Subtle border - white in dark mode for better visibility
        ctx.strokeStyle = theme === "dark" ? "#ffffff" : color + borderOpacity;
        ctx.lineWidth = theme === "dark" ? 1.5 : 1;
        ctx.stroke();
      }
      
      // Render SLAM map (occupancy grid - very subtle)
      ctx.save();
      ctx.globalAlpha = theme === "dark" ? 0.15 : 0.08;
      slamSystem.render(ctx);
      ctx.restore();
      
      // Render graph theory visualization (Dijkstra's paths, connectivity)
      ctx.save();
      ctx.globalAlpha = theme === "dark" ? 0.4 : 0.3;
      
      // Find and highlight shortest path between random nodes if graph is connected
      if (graphTheory.isConnected()) {
        const nodes = graphTheory.getNodes();
        if (nodes.length >= 2) {
          const startId = nodes[Math.floor(Math.random() * nodes.length)].id;
          const endId = nodes[Math.floor(Math.random() * nodes.length)].id;
          if (startId !== endId) {
            const path = graphTheory.shortestPath(startId, endId);
            if (path) {
              graphTheory.render(ctx, path);
            } else {
              graphTheory.render(ctx);
            }
          }
        }
      } else {
        graphTheory.render(ctx);
      }
      
      ctx.restore();
      
      // Render communication graph connections
      ctx.save();
      ctx.globalAlpha = theme === "dark" ? 0.3 : 0.2;
      communicationGraph.render(ctx);
      ctx.restore();
      
      // Render sensors only occasionally for performance
      if (Math.random() < 0.1) {
        ctx.save();
        ctx.globalAlpha = theme === "dark" ? 0.25 : 0.15;
        for (const robot of currentRobots) {
          SensorVisualization.render(ctx, robot, ROBOT_SIZE, currentTime);
        }
        ctx.restore();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [theme]);

  // Pause when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.3 }}
    />
  );
}

