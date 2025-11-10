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
import { PredatorPreyBehaviors } from "@/lib/robotics/predatorPreyBehaviors";
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
  const energySourcesRef = useRef<Vector2[]>([]);
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
    
    // Initialize energy sources
    const energySources: Vector2[] = [];
    for (let i = 0; i < 8; i++) {
      energySources.push(new Vector2(
        Math.random() * CANVAS_WIDTH,
        Math.random() * CANVAS_HEIGHT
      ));
    }
    energySourcesRef.current = energySources;
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
        
        // Handle predator-prey interactions (energy transfer)
        for (let i = 0; i < updatedRobots.length; i++) {
          const predator = updatedRobots[i];
          if (!predator.isOperational() || predator.state.type.role !== 'predator') continue;
          
          for (let j = 0; j < updatedRobots.length; j++) {
            const prey = updatedRobots[j];
            if (!prey.isOperational() || prey.state.type.role !== 'prey') continue;
            
            if (PredatorPreyBehaviors.checkPredatorCatch(predator, prey)) {
              // Predator gains energy, prey loses energy
              predator.state.battery = Math.min(
                predator.state.type.batteryCapacity,
                predator.state.battery + 20
              );
              prey.state.battery = Math.max(0, prey.state.battery - 30);
              
              // If prey is caught, reset it to a random position
              if (prey.state.battery <= 0) {
                prey.state.position = new Vector2(
                  Math.random() * CANVAS_WIDTH,
                  Math.random() * CANVAS_HEIGHT
                );
                prey.state.battery = prey.state.type.batteryCapacity;
              }
            }
          }
        }
        
        // Handle scavenger energy collection
        for (const robot of updatedRobots) {
          if (!robot.isOperational() || robot.state.type.role !== 'scavenger') continue;
          
          for (const energySource of energySourcesRef.current) {
            const distance = robot.state.position.distanceTo(energySource);
            if (distance < 15) {
              robot.state.battery = Math.min(
                robot.state.type.batteryCapacity,
                robot.state.battery + 0.5 * deltaTime
              );
            }
          }
        }
        
        // Update robot behaviors
        for (const robot of updatedRobots) {
          if (!robot.isOperational()) continue;
          
          // Calculate autonomous behavior target
          const behaviorTarget = PredatorPreyBehaviors.calculateBehaviorTarget(
            robot,
            updatedRobots,
            energySourcesRef.current,
            deltaTime
          );
          
          const targetVelocity = behaviorTarget.subtract(robot.state.position);
          
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
        
        // Store robots for rendering
        robotsRef.current = updatedRobots;
        
        return updatedRobots;
      });
      
      // Use robots from ref for rendering
      const currentRobots = robotsRef.current;
      
      // Render fog of war FIRST (as background)
      fogOfWar.render(ctx);
      
      // Render energy sources
      for (const energySource of energySourcesRef.current) {
        ctx.fillStyle = '#fbbf24';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(energySource.x, energySource.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Render sensors (field of view visualization) - before robots
      if (showSensors) {
        for (const robot of currentRobots) {
          if (!robot.isOperational()) continue;
          const sensorRange = robot.getSensorRange(ROBOT_SIZE);
          const pos = robot.state.position;
          
          // Draw sensor range circle (semi-transparent)
          ctx.globalAlpha = 0.1;
          ctx.fillStyle = robot.state.type.color;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, sensorRange, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
          
          // Draw field of view cone
          ctx.globalAlpha = 0.15;
          ctx.fillStyle = robot.state.type.color;
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          const fovAngle = Math.PI / 3; // 60 degree field of view
          ctx.arc(
            pos.x, pos.y,
            sensorRange,
            robot.state.angle - fovAngle / 2,
            robot.state.angle + fovAngle / 2
          );
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      }
      
      // Render communication graph
      if (showCommunication) {
        communicationGraph.render(ctx);
      }
      
      // Render robots LAST (on top of everything)
      for (const robot of currentRobots) {
        if (!robot.isOperational()) continue;
        
        const pos = robot.state.position;
        const role = robot.state.type.role;
        
        // Draw robot body with role-based size
        const size = role === 'predator' ? ROBOT_SIZE * 1.2 : ROBOT_SIZE;
        ctx.fillStyle = robot.state.type.color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
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
          pos.x + Math.cos(robot.state.angle) * size * 1.5,
          pos.y + Math.sin(robot.state.angle) * size * 1.5
        );
        ctx.stroke();
        
        // Draw battery indicator (small colored dot)
        const batteryPercent = robot.getBatteryPercentage();
        ctx.fillStyle = batteryPercent > 50 ? '#10b981' : batteryPercent > 20 ? '#f59e0b' : '#ef4444';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y - size - 3, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw role indicator
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const roleSymbol = role === 'prey' ? 'P' : role === 'predator' ? 'X' : 'S';
        ctx.fillText(roleSymbol, pos.x, pos.y);
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
    
    if (fogOfWarRef.current) {
      fogOfWarRef.current.reset();
    }
    
    // Reset energy sources
    const energySources: Vector2[] = [];
    for (let i = 0; i < 8; i++) {
      energySources.push(new Vector2(
        Math.random() * CANVAS_WIDTH,
        Math.random() * CANVAS_HEIGHT
      ));
    }
    energySourcesRef.current = energySources;
    
    setRobots(currentRobots => {
      return currentRobots.map(robot => {
        const pos = new Vector2(
          Math.random() * CANVAS_WIDTH,
          Math.random() * CANVAS_HEIGHT
        );
        const newRobot = new Robot(robot.state.id, robot.state.type, pos);
        newRobot.state.battery = robot.state.type.batteryCapacity;
        return newRobot;
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
        className="border border-gray-300 shadow-lg"
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
          <strong>Autonomous Swarm Ecosystem:</strong> Watch autonomous robots with different behaviors interact!
          <br />
          <span className="text-green-600">Green (P)</span> = Prey robots - fast, flee from predators, flock together
          <br />
          <span className="text-red-600">Red (X)</span> = Predator robots - hunt prey for energy
          <br />
          <span className="text-yellow-600">Yellow (S)</span> = Scavenger robots - collect energy from sources
        </p>
        <p>
          Robots use sensors to detect each other and make autonomous decisions. No mouse control needed!
        </p>
      </div>
    </div>
  );
}

