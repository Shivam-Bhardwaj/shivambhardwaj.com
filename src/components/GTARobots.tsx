'use client';

/**
 * GTARobots.tsx
 * Main component implementing GTA-style robot pursuit system
 * Features smooth 60fps physics, coordinated AI behavior, and debug visualization
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RobotNavigationAgent, type RobotState, type Vector2D, type NavigationCommand } from '@/lib/robotAI/RobotNavigationAgent';
import { OcclusionDetector, type CollisionMap } from '@/lib/robotAI/OcclusionDetector';
import { PursuitBehavior } from '@/lib/robotAI/PursuitBehavior';

interface GTARobotsProps {
  robotCount?: number;
  debugMode?: boolean;
  aggressiveness?: number; // 0-1
  onCaptureTarget?: () => void;
  disabled?: boolean;
}

interface RobotPhysics {
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  rotation: number;
  angularVelocity: number;
  trail: Vector2D[];
  energy: number;
}

interface DebugInfo {
  fps: number;
  robotStates: RobotState[];
  collisionMap?: CollisionMap;
  pursuitStats?: any;
  mousePosition: Vector2D;
  targetPrediction: Vector2D;
}

const GTARobots: React.FC<GTARobotsProps> = ({
  robotCount = 4,
  debugMode = false,
  aggressiveness = 0.7,
  onCaptureTarget,
  disabled = false
}) => {
  // Core system refs
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const navigationAgent = useRef<RobotNavigationAgent | null>(null);
  const occlusionDetector = useRef<OcclusionDetector | null>(null);
  const pursuitBehavior = useRef<PursuitBehavior | null>(null);

  // State management
  const [robots, setRobots] = useState<RobotPhysics[]>([]);
  const [mousePosition, setMousePosition] = useState<Vector2D>({ x: 0, y: 0 });
  const [screenSize, setScreenSize] = useState<Vector2D>({ x: 0, y: 0 });
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    fps: 0,
    robotStates: [],
    mousePosition: { x: 0, y: 0 },
    targetPrediction: { x: 0, y: 0 }
  });

  // Performance tracking
  const lastFrameTime = useRef<number>(Date.now());
  const frameCount = useRef<number>(0);
  const fpsUpdateTime = useRef<number>(Date.now());

  // Physics constants
  const ROBOT_SIZE = 20;
  const MAX_SPEED = 180;
  const ACCELERATION = 8;
  const FRICTION = 0.85;
  const TRAIL_LENGTH = 15;
  const CAPTURE_DISTANCE = 30;

  /**
   * Initialize the robot AI system
   */
  const initializeSystem = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    setScreenSize({ x: width, y: height });

    // Initialize AI systems
    navigationAgent.current = new RobotNavigationAgent(width, height, 25);
    occlusionDetector.current = new OcclusionDetector(width, height, 25);
    pursuitBehavior.current = new PursuitBehavior(width, height);

    // Initialize robots
    const initialRobots: RobotPhysics[] = [];
    for (let i = 0; i < robotCount; i++) {
      const angle = (2 * Math.PI * i) / robotCount;
      const spawnRadius = Math.min(width, height) * 0.4;
      
      initialRobots.push({
        position: {
          x: width / 2 + Math.cos(angle) * spawnRadius,
          y: height / 2 + Math.sin(angle) * spawnRadius
        },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        rotation: angle,
        angularVelocity: 0,
        trail: [],
        energy: 1.0
      });
    }

    setRobots(initialRobots);
  }, [robotCount]);

  /**
   * Update mouse position tracking
   */
  const updateMousePosition = useCallback((event: MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const newPosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    setMousePosition(newPosition);
  }, []);

  /**
   * Handle window resize
   */
  const handleResize = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    setScreenSize({ x: width, y: height });

    // Update AI systems
    if (navigationAgent.current) {
      navigationAgent.current.updateScreenSize(width, height);
    }
    if (occlusionDetector.current) {
      occlusionDetector.current.updateScreenSize(width, height);
    }
    if (pursuitBehavior.current) {
      pursuitBehavior.current.updateScreenSize(width, height);
    }
  }, []);

  /**
   * Main game loop - 60fps physics and AI updates
   */
  const gameLoop = useCallback(() => {
    if (disabled || !navigationAgent.current || !occlusionDetector.current || !pursuitBehavior.current) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const currentTime = Date.now();
    const deltaTime = currentTime - lastFrameTime.current;
    lastFrameTime.current = currentTime;

    // Update FPS counter
    frameCount.current++;
    if (currentTime - fpsUpdateTime.current >= 1000) {
      const fps = (frameCount.current * 1000) / (currentTime - fpsUpdateTime.current);
      frameCount.current = 0;
      fpsUpdateTime.current = currentTime;
      
      setDebugInfo(prev => ({ ...prev, fps }));
    }

    // Detect obstacles
    const collisionMap = occlusionDetector.current.detectOcclusions();
    navigationAgent.current.updateCollisionMap(collisionMap.grid);

    // Convert physics robots to AI robot states
    const robotStates: RobotState[] = robots.map((robot, index) => ({
      id: `robot-${index}`,
      position: robot.position,
      velocity: robot.velocity,
      heading: robot.rotation,
      maxSpeed: MAX_SPEED * aggressiveness,
      detectionRadius: 100,
      lastKnownTargetPosition: mousePosition,
      pursuitMode: 'hunting'
    }));

    // Get AI commands
    const pursuitCommands = pursuitBehavior.current.updatePursuit(
      robotStates,
      mousePosition,
      deltaTime
    );

    // Update robot physics
    setRobots(prevRobots => {
      return prevRobots.map((robot, index) => {
        const robotId = `robot-${index}`;
        const aiCommand = pursuitCommands.get(robotId);
        
        if (!aiCommand) return robot;

        // Get navigation command from AI agent
        const navCommand = navigationAgent.current!.navigate(
          robotStates[index],
          mousePosition,
          robotStates
        );

        // Apply physics
        const newRobot = { ...robot };

        // Calculate desired velocity (blend AI command with navigation)
        const desiredVel = {
          x: (navCommand.velocity.x + aiCommand.velocity.x) * 0.5,
          y: (navCommand.velocity.y + aiCommand.velocity.y) * 0.5
        };

        // Apply acceleration toward desired velocity
        const velDiff = {
          x: desiredVel.x - robot.velocity.x,
          y: desiredVel.y - robot.velocity.y
        };

        newRobot.acceleration = {
          x: velDiff.x * ACCELERATION * (deltaTime / 16),
          y: velDiff.y * ACCELERATION * (deltaTime / 16)
        };

        // Update velocity
        newRobot.velocity = {
          x: robot.velocity.x + newRobot.acceleration.x,
          y: robot.velocity.y + newRobot.acceleration.y
        };

        // Apply friction
        newRobot.velocity.x *= FRICTION;
        newRobot.velocity.y *= FRICTION;

        // Limit speed
        const speed = Math.sqrt(newRobot.velocity.x ** 2 + newRobot.velocity.y ** 2);
        if (speed > MAX_SPEED * aggressiveness) {
          const factor = (MAX_SPEED * aggressiveness) / speed;
          newRobot.velocity.x *= factor;
          newRobot.velocity.y *= factor;
        }

        // Update position
        newRobot.position = {
          x: robot.position.x + newRobot.velocity.x * (deltaTime / 16),
          y: robot.position.y + newRobot.velocity.y * (deltaTime / 16)
        };

        // Clamp to screen bounds
        newRobot.position.x = Math.max(ROBOT_SIZE, Math.min(screenSize.x - ROBOT_SIZE, newRobot.position.x));
        newRobot.position.y = Math.max(ROBOT_SIZE, Math.min(screenSize.y - ROBOT_SIZE, newRobot.position.y));

        // Update rotation to face movement direction
        if (speed > 5) {
          const targetRotation = Math.atan2(newRobot.velocity.y, newRobot.velocity.x);
          const rotDiff = targetRotation - robot.rotation;
          
          // Normalize angle difference
          let normalizedDiff = rotDiff;
          while (normalizedDiff > Math.PI) normalizedDiff -= 2 * Math.PI;
          while (normalizedDiff < -Math.PI) normalizedDiff += 2 * Math.PI;
          
          newRobot.angularVelocity = normalizedDiff * 0.15;
          newRobot.rotation = robot.rotation + newRobot.angularVelocity;
        }

        // Update trail
        newRobot.trail = [robot.position, ...robot.trail.slice(0, TRAIL_LENGTH - 1)];

        // Update energy based on movement
        newRobot.energy = Math.min(1, robot.energy + 0.02);
        if (speed > MAX_SPEED * 0.8) {
          newRobot.energy = Math.max(0, robot.energy - 0.05);
        }

        // Check for target capture
        const distanceToMouse = Math.sqrt(
          (newRobot.position.x - mousePosition.x) ** 2 + 
          (newRobot.position.y - mousePosition.y) ** 2
        );

        if (distanceToMouse < CAPTURE_DISTANCE && onCaptureTarget) {
          onCaptureTarget();
        }

        return newRobot;
      });
    });

    // Update debug info
    if (debugMode) {
      setDebugInfo(prev => ({
        ...prev,
        robotStates,
        collisionMap,
        pursuitStats: pursuitBehavior.current?.getPursuitStats(),
        mousePosition,
        targetPrediction: mousePosition // This would be enhanced with actual prediction
      }));
    }

    // Continue the loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [disabled, robots, mousePosition, screenSize, aggressiveness, onCaptureTarget, debugMode]);

  // Initialize system on mount
  useEffect(() => {
    initializeSystem();
  }, [initializeSystem]);

  // Start/stop game loop
  useEffect(() => {
    if (!disabled) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop, disabled]);

  // Event listeners
  useEffect(() => {
    if (disabled) return;

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateMousePosition, handleResize, disabled]);

  if (disabled) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
      style={{ width: '100vw', height: '100vh' }}
    >
      {/* Robots */}
      <AnimatePresence>
        {robots.map((robot, index) => (
          <React.Fragment key={`robot-${index}`}>
            {/* Robot Trail */}
            {robot.trail.map((trailPoint, trailIndex) => (
              <motion.div
                key={`trail-${index}-${trailIndex}`}
                className="absolute pointer-events-none"
                style={{
                  left: trailPoint.x - 2,
                  top: trailPoint.y - 2,
                  width: 4,
                  height: 4,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: (1 - trailIndex / TRAIL_LENGTH) * 0.6,
                  scale: 1 - trailIndex / TRAIL_LENGTH,
                }}
                transition={{ duration: 0.1 }}
              >
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    background: `linear-gradient(135deg, 
                      rgba(239, 68, 68, ${1 - trailIndex / TRAIL_LENGTH}), 
                      rgba(147, 51, 234, ${1 - trailIndex / TRAIL_LENGTH}))`
                  }}
                />
              </motion.div>
            ))}

            {/* Main Robot */}
            <motion.div
              className="absolute robot pointer-events-none"
              style={{
                left: robot.position.x - ROBOT_SIZE / 2,
                top: robot.position.y - ROBOT_SIZE / 2,
                width: ROBOT_SIZE,
                height: ROBOT_SIZE,
              }}
              animate={{
                rotate: `${robot.rotation * 180 / Math.PI}deg`,
                scale: 0.8 + robot.energy * 0.4,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.1
              }}
            >
              {/* Robot Body */}
              <div
                className="w-full h-full rounded-lg shadow-lg"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(239, 68, 68, ${0.7 + robot.energy * 0.3}), 
                    rgba(147, 51, 234, ${0.7 + robot.energy * 0.3}))`,
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: `0 0 ${10 + robot.energy * 20}px rgba(239, 68, 68, 0.5)`
                }}
              >
                {/* Robot Eye/Direction Indicator */}
                <div
                  className="absolute w-2 h-2 bg-white rounded-full"
                  style={{
                    top: '30%',
                    right: '10%',
                    boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)'
                  }}
                />
                
                {/* Energy Bar */}
                <div className="absolute -top-1 left-0 right-0 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-500 to-purple-500"
                    animate={{ width: `${robot.energy * 100}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>
            </motion.div>
          </React.Fragment>
        ))}
      </AnimatePresence>

      {/* Debug Overlay */}
      {debugMode && (
        <div className="fixed top-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg font-mono text-xs max-w-sm pointer-events-auto z-50">
          <h3 className="text-lg font-bold mb-2 text-cyan-400">GTA Robots Debug</h3>
          
          <div className="space-y-2">
            <div>FPS: {debugInfo.fps.toFixed(1)}</div>
            <div>Robots: {robots.length}</div>
            <div>Mouse: ({debugInfo.mousePosition.x.toFixed(0)}, {debugInfo.mousePosition.y.toFixed(0)})</div>
            <div>Screen: {screenSize.x}x{screenSize.y}</div>
            
            {debugInfo.pursuitStats && (
              <div className="mt-2 pt-2 border-t border-gray-600">
                <div>Formations: {debugInfo.pursuitStats.formationCount}</div>
                <div>Intensity: {(debugInfo.pursuitStats.averageIntensity * 100).toFixed(0)}%</div>
                <div>Phases: {debugInfo.pursuitStats.currentPhases.join(', ')}</div>
              </div>
            )}
            
            <div className="mt-2 pt-2 border-t border-gray-600">
              <div>Robot States:</div>
              {debugInfo.robotStates.slice(0, 3).map((robot, i) => (
                <div key={i} className="ml-2 text-xs">
                  R{i}: {robot.pursuitMode} 
                  ({robot.position.x.toFixed(0)}, {robot.position.y.toFixed(0)})
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Collision Map Visualization (Debug) */}
      {debugMode && debugInfo.collisionMap && (
        <div className="absolute inset-0 pointer-events-none opacity-20">
          {debugInfo.collisionMap.grid.map((row, y) =>
            row.map((cell, x) => (
              cell && (
                <div
                  key={`obstacle-${x}-${y}`}
                  className="absolute bg-red-500"
                  style={{
                    left: x * debugInfo.collisionMap!.gridSize,
                    top: y * debugInfo.collisionMap!.gridSize,
                    width: debugInfo.collisionMap!.gridSize,
                    height: debugInfo.collisionMap!.gridSize,
                  }}
                />
              )
            ))
          )}
        </div>
      )}

      {/* Mouse Target Indicator (Debug) */}
      {debugMode && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: mousePosition.x - 10,
            top: mousePosition.y - 10,
            width: 20,
            height: 20,
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="w-full h-full border-2 border-cyan-400 rounded-full bg-cyan-400 bg-opacity-20" />
        </motion.div>
      )}
    </div>
  );
};

export default GTARobots;