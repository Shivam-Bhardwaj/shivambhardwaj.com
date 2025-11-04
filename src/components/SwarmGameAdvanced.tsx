/**
 * Advanced Swarm Game Component
 * 
 * Professional-grade swarm robotics simulator featuring:
 * - Heterogeneous robots with different sensor types
 * - Fog of war exploration
 * - Smart obstacle avoidance
 * - Communication graph visualization
 * - Research-backed algorithms
 */

"use client";
import { useEffect, useRef, useState } from "react";
import { Vector2 } from "@/lib/robotics/math";
import { Robot } from "@/lib/robotics/robot";
import { getRandomRobotTypes } from "@/lib/robotics/robotTypes";
import { FogOfWar } from "@/lib/robotics/fogOfWar";
import { ObstacleAvoidance } from "@/lib/robotics/obstacleAvoidance";
import { CommunicationGraph } from "@/lib/robotics/communication";
import { SensorVisualization } from "@/lib/robotics/sensorVisualization";
import { DistributedExploration } from "@/lib/robotics/exploration";
import SwarmTelemetry from "@/components/SwarmTelemetry";

const ROBOT_COUNT = 25;
const ROBOT_SIZE = 8;
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

export default function SwarmGameAdvanced() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const robotsRef = useRef<Robot[]>([]);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [showSensors, setShowSensors] = useState(true);
  const [showCommunication, setShowCommunication] = useState(true);
  
  // Refs for game systems
  const fogOfWarRef = useRef<FogOfWar | null>(null);
  const obstacleAvoidanceRef = useRef<ObstacleAvoidance | null>(null);
  const communicationGraphRef = useRef<CommunicationGraph | null>(null);
  const mouseTargetRef = useRef<Vector2 | null>(null);
  const startTimeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Initialize game systems
    fogOfWarRef.current = new FogOfWar(CANVAS_WIDTH, CANVAS_HEIGHT);
    obstacleAvoidanceRef.current = new ObstacleAvoidance();
    communicationGraphRef.current = new CommunicationGraph();
    
    // Initialize robots with random types
    const robotTypes = getRandomRobotTypes(ROBOT_COUNT);
    const newRobots: Robot[] = robotTypes.map((type, i) => {
      const pos = new Vector2(
        Math.random() * CANVAS_WIDTH,
        Math.random() * CANVAS_HEIGHT
      );
      return new Robot(i, type, pos);
    });
    
    setRobots(newRobots);
    robotsRef.current = newRobots;
  }, []);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const fogOfWar = fogOfWarRef.current;
    const obstacleAvoidance = obstacleAvoidanceRef.current;
    const communicationGraph = communicationGraphRef.current;
    
    if (!fogOfWar || !obstacleAvoidance || !communicationGraph) return;
    
    // Early return if robots not initialized
    if (robotsRef.current.length === 0) return;
    
    const animate = (currentTime: number) => {
      const deltaTime = lastFrameTimeRef.current === 0 
        ? 0.016 
        : Math.min((currentTime - lastFrameTimeRef.current) / 1000, 0.033); // Cap at 30fps
      
      lastFrameTimeRef.current = currentTime;
      
      // Clear canvas with neutral background
      ctx.fillStyle = "#f8fafc"; // Light gray background
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Update robots
      setRobots(currentRobots => {
        const updatedRobots = [...currentRobots];
        
        for (const robot of updatedRobots) {
          if (!robot.isOperational()) continue;
          
          // Calculate target velocity toward mouse or exploration target
          const mouseTarget = mouseTargetRef.current;
          const explorationTarget = DistributedExploration.calculateExplorationTarget(
            robot,
            updatedRobots,
            fogOfWar,
            mouseTarget
          );
          
          const targetVelocity = explorationTarget.subtract(robot.state.position);
          
          // Apply obstacle avoidance
          const avoidanceVelocity = obstacleAvoidance.applyObstacleAvoidance(
            robot,
            targetVelocity
          );
          
          robot.setTargetVelocity(avoidanceVelocity);
          robot.update(deltaTime);
          
          // Keep robots in bounds
          robot.state.position.x = Math.max(ROBOT_SIZE, Math.min(CANVAS_WIDTH - ROBOT_SIZE, robot.state.position.x));
          robot.state.position.y = Math.max(ROBOT_SIZE, Math.min(CANVAS_HEIGHT - ROBOT_SIZE, robot.state.position.y));
        }
        
        // Update communication graph
        communicationGraph.update(updatedRobots);
        
        // Update fog of war
        fogOfWar.update(updatedRobots, ROBOT_SIZE);
        fogOfWar.shareExplorationData(updatedRobots);
        
        // Apply consensus algorithm
        DistributedExploration.applyConsensus(updatedRobots);
        
        // Store robots for rendering
        robotsRef.current = updatedRobots;
        
        return updatedRobots;
      });
      
      // Use robots from ref for rendering
      const currentRobots = robotsRef.current;
      
      // Render robots first (before fog of war overlay)
      for (const robot of currentRobots) {
        if (!robot.isOperational()) continue;
        
        const pos = robot.state.position;
        
        // Draw robot body
        ctx.fillStyle = robot.state.type.color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, ROBOT_SIZE, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw robot border
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Draw direction indicator
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(
          pos.x + Math.cos(robot.state.angle) * ROBOT_SIZE * 1.5,
          pos.y + Math.sin(robot.state.angle) * ROBOT_SIZE * 1.5
        );
        ctx.stroke();
        
        // Draw battery indicator (small colored dot)
        const batteryPercent = robot.getBatteryPercentage();
        ctx.fillStyle = batteryPercent > 50 ? '#10b981' : batteryPercent > 20 ? '#f59e0b' : '#ef4444';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y - ROBOT_SIZE - 3, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Render sensors
      if (showSensors) {
        for (const robot of currentRobots) {
          SensorVisualization.render(ctx, robot, ROBOT_SIZE, currentTime);
        }
      }
      
      // Render communication graph
      if (showCommunication) {
        communicationGraph.render(ctx);
      }
      
      // Render fog of war (as overlay - last so it's on top)
      fogOfWar.render(ctx);
      
      // Draw mouse target indicator
      if (mouseTargetRef.current) {
        const target = mouseTargetRef.current;
        ctx.strokeStyle = "#e11d48";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(target.x, target.y, 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = "#e11d48";
        ctx.beginPath();
        ctx.arc(target.x, target.y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Update time
      if (isRunning) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setTime(elapsed);
        
        // Check if exploration is complete
        const explorationProgress = fogOfWar.getExplorationPercentage();
        if (explorationProgress >= 95) {
          setIsRunning(false);
          if (bestTime === null || elapsed < bestTime) {
            setBestTime(elapsed);
          }
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, bestTime, showSensors, showCommunication]);

  // Handle mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    mouseTargetRef.current = new Vector2(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    mouseTargetRef.current = null;
  };

  // Start game
  const handleStart = () => {
    setIsRunning(true);
    startTimeRef.current = Date.now();
    setTime(0);
    
    // Reset fog of war
    if (fogOfWarRef.current) {
      fogOfWarRef.current.reset();
    }
    
    // Reset robots
    setRobots(currentRobots => {
      return currentRobots.map(robot => {
        const pos = new Vector2(
          Math.random() * CANVAS_WIDTH,
          Math.random() * CANVAS_HEIGHT
        );
        return new Robot(robot.state.id, robot.state.type, pos);
      });
    });
  };

  // Reset game
  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    mouseTargetRef.current = null;
    
    if (fogOfWarRef.current) {
      fogOfWarRef.current.reset();
    }
    
    setRobots(currentRobots => {
      return currentRobots.map(robot => {
        const pos = new Vector2(
          Math.random() * CANVAS_WIDTH,
          Math.random() * CANVAS_HEIGHT
        );
        return new Robot(robot.state.id, robot.state.type, pos);
      });
    });
  };

  const explorationProgress = fogOfWarRef.current?.getExplorationPercentage() || 0;
  const discoveredLandmarks = fogOfWarRef.current?.getDiscoveredLandmarks().length || 0;
  const totalLandmarks = fogOfWarRef.current?.getLandmarks().length || 0;
  const activeConnections = communicationGraphRef.current?.getLinkCount() || 0;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Controls */}
      <div className="flex gap-4 items-center">
        <button
          onClick={handleStart}
          disabled={isRunning}
          className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? "Running..." : "Start Exploration"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Reset
        </button>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showSensors}
            onChange={(e) => setShowSensors(e.target.checked)}
          />
          <span className="text-sm">Show Sensors</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showCommunication}
            onChange={(e) => setShowCommunication(e.target.checked)}
          />
          <span className="text-sm">Show Communication</span>
        </label>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="border border-gray-300 shadow-lg cursor-crosshair"
      />

      {/* Telemetry */}
      <SwarmTelemetry
        robots={robots}
        explorationProgress={explorationProgress}
        discoveredLandmarks={discoveredLandmarks}
        totalLandmarks={totalLandmarks}
        activeConnections={activeConnections}
      />

      {/* Statistics */}
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">Time</div>
            <div className="text-xl font-bold">{time.toFixed(1)}s</div>
          </div>
          {bestTime && (
            <div>
              <div className="text-sm text-gray-600">Best Time</div>
              <div className="text-xl font-bold text-green-600">{bestTime.toFixed(1)}s</div>
            </div>
          )}
          <div>
            <div className="text-sm text-gray-600">Landmarks</div>
            <div className="text-xl font-bold">{discoveredLandmarks}/{totalLandmarks}</div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 max-w-2xl text-center">
        <p className="mb-2">
          <strong>How to Play:</strong> Move your mouse to guide the swarm. Robots with different sensor types
          (Lidar, Ultrasonic, Camera) explore the map and reveal hidden city names. Coordinate exploration
          by maintaining communication links between robots.
        </p>
        <p>
          Goal: Explore 95% of the map as quickly as possible!
        </p>
      </div>
    </div>
  );
}

