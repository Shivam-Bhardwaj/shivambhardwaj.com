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

const ROBOT_COUNT = 15; // Fewer robots for background performance
const ROBOT_SIZE = 6; // Smaller robots for subtle background effect

export default function SwarmBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const robotsRef = useRef<Robot[]>([]);
  const obstacleAvoidanceRef = useRef<ObstacleAvoidance | null>(null);
  const communicationGraphRef = useRef<CommunicationGraph | null>(null);
  const lastFrameTimeRef = useRef(0);
  const [isVisible, setIsVisible] = useState(true);

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
    
    if (!obstacleAvoidance || !communicationGraph) return;
    
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
      for (const robot of currentRobots) {
        if (!robot.isOperational()) continue;
        
        // Gentle random exploration with stronger obstacle avoidance
        const randomDirection = new Vector2(
          (Math.random() - 0.5) * 0.5, // Reduced random movement
          (Math.random() - 0.5) * 0.5
        );
        
        // Apply obstacle avoidance (primary force - navigates around content)
        const avoidanceVelocity = obstacleAvoidance.applyObstacleAvoidance(
          robot,
          randomDirection
        );
        
        // Add slight wander behavior
        const wanderAngle = robot.state.angle + (Math.random() - 0.5) * 0.1;
        const wanderDirection = new Vector2(Math.cos(wanderAngle), Math.sin(wanderAngle));
        
        // Combine avoidance with wander
        const finalVelocity = avoidanceVelocity.add(wanderDirection.multiply(0.3));
        
        robot.setTargetVelocity(finalVelocity);
        robot.update(deltaTime);
        
        // Keep robots in bounds
        robot.state.position.x = Math.max(ROBOT_SIZE, Math.min(canvas.width - ROBOT_SIZE, robot.state.position.x));
        robot.state.position.y = Math.max(ROBOT_SIZE, Math.min(canvas.height - ROBOT_SIZE, robot.state.position.y));
      }
      
      // Update communication graph
      communicationGraph.update(currentRobots);
      
      // Render robots (subtle, semi-transparent for background)
      for (const robot of currentRobots) {
        if (!robot.isOperational()) continue;
        
        const pos = robot.state.position;
        
        // Draw robot body with reduced opacity
        const color = robot.state.type.color;
        ctx.fillStyle = color + '40'; // 25% opacity
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, ROBOT_SIZE, 0, Math.PI * 2);
        ctx.fill();
        
        // Subtle border
        ctx.strokeStyle = color + '80'; // 50% opacity
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      
      // Render communication graph (very subtle)
      ctx.save();
      ctx.globalAlpha = 0.2;
      communicationGraph.render(ctx);
      ctx.restore();
      
      // Render sensors only occasionally for performance
      if (Math.random() < 0.1) {
        ctx.save();
        ctx.globalAlpha = 0.15;
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
  }, []);

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

