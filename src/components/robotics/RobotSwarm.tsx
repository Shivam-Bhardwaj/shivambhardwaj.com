'use client';

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Vector3 } from 'three';
import { RobotConfig, CollisionZone } from '../../lib/components/types';
import { AvoidanceBehavior } from './behaviors/avoidance';
import { FlockingBehavior } from './behaviors/flocking';
import { InteractionBehavior, InteractionMode } from './behaviors/interaction';
import CollisionSystem from './CollisionSystem';
import MouseTracker from './MouseTracker';

// Dynamically import RoboticsCanvas to avoid SSR issues
const RoboticsCanvas = dynamic(() => import('./RoboticsCanvas'), {
  ssr: false,
  loading: () => null
});

interface RobotSwarmProps {
  robotCount?: number;
  enableCollisionAvoidance?: boolean;
  enableFlocking?: boolean;
  enableMouseInteraction?: boolean;
  enable3DVisualization?: boolean;
  performanceMode?: boolean;
  swarmBehavior?: 'autonomous' | 'interactive' | 'chaotic' | 'playful';
  className?: string;
}

const ROBOT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#F97316', '#06B6D4', '#84CC16',
  '#EC4899', '#6366F1', '#14B8A6', '#F43F5E',
];

const INTERACTION_MODES = {
  autonomous: InteractionMode.CURIOUS,
  interactive: InteractionMode.FOLLOW,
  chaotic: InteractionMode.PLAYFUL,
  playful: InteractionMode.PLAYFUL,
};

export default function RobotSwarm({
  robotCount = 12,
  enableCollisionAvoidance = true,
  enableFlocking = true,
  enableMouseInteraction = true,
  enable3DVisualization = true,
  performanceMode = false,
  swarmBehavior = 'autonomous',
  className = '',
}: RobotSwarmProps) {
  const [robots, setRobots] = useState<RobotConfig[]>([]);
  const [collisionZones, setCollisionZones] = useState<CollisionZone[]>([]);
  const [mouseState, setMouseState] = useState<any>(null);
  const [isActive, setIsActive] = useState(true);

  // Behavior instances
  const avoidanceBehavior = useMemo(() => new AvoidanceBehavior(), []);
  const flockingBehavior = useMemo(() => {
    switch (swarmBehavior) {
      case 'chaotic':
        return FlockingBehavior.createChaotic();
      case 'playful':
        return FlockingBehavior.createLooseFlock();
      default:
        return new FlockingBehavior();
    }
  }, [swarmBehavior]);
  
  const interactionBehavior = useMemo(() => {
    const mode = INTERACTION_MODES[swarmBehavior];
    const behavior = new InteractionBehavior({ mode });
    
    switch (swarmBehavior) {
      case 'playful':
        return InteractionBehavior.createPlayful();
      case 'interactive':
        return InteractionBehavior.createFriendly();
      case 'chaotic':
        return InteractionBehavior.createCurious();
      default:
        return behavior;
    }
  }, [swarmBehavior]);

  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef(Date.now());
  const robotTrails = useRef(new Map<string, Vector3[]>());

  // Initialize robots
  useEffect(() => {
    const newRobots: RobotConfig[] = [];
    
    for (let i = 0; i < robotCount; i++) {
      const robot: RobotConfig = {
        id: `robot-${i}`,
        position: {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          z: Math.random() * 0.5,
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 0,
        },
        behaviors: [
          { type: 'avoid', intensity: 1, radius: 100, enabled: enableCollisionAvoidance },
          { type: 'flock', intensity: 0.8, radius: 80, enabled: enableFlocking },
          { type: 'follow', intensity: 1.2, radius: 150, enabled: enableMouseInteraction },
        ],
        size: 8 + Math.random() * 4,
        color: ROBOT_COLORS[i % ROBOT_COLORS.length],
        interactive: enableMouseInteraction,
      };
      
      newRobots.push(robot);
      robotTrails.current.set(robot.id, []);
    }
    
    setRobots(newRobots);
  }, [robotCount, enableCollisionAvoidance, enableFlocking, enableMouseInteraction]);

  // Update mouse interaction
  const handleMouseUpdate = useCallback((state: any) => {
    setMouseState(state);
    if (enableMouseInteraction) {
      interactionBehavior.updateMouseInteraction(state.position, state.isPressed);
    }
  }, [enableMouseInteraction, interactionBehavior]);

  // Main simulation loop
  const updateRobots = useCallback(() => {
    if (!isActive || robots.length === 0) return;

    const now = Date.now();
    const deltaTime = (now - lastUpdateRef.current) / 1000;
    lastUpdateRef.current = now;

    // Throttle updates for performance
    if (performanceMode && deltaTime < 1/30) return; // 30fps cap in performance mode

    setRobots(prevRobots => {
      return prevRobots.map(robot => {
        const totalForce = { x: 0, y: 0 };

        // Collision avoidance
        if (enableCollisionAvoidance && collisionZones.length > 0) {
          const avoidanceForce = avoidanceBehavior.calculateObstacleAvoidance(robot, collisionZones);
          totalForce.x += avoidanceForce.x * 2.0;
          totalForce.y += avoidanceForce.y * 2.0;

          // Robot-to-robot avoidance
          const robotAvoidance = avoidanceBehavior.calculateRobotAvoidance(robot, prevRobots);
          totalForce.x += robotAvoidance.x * 1.5;
          totalForce.y += robotAvoidance.y * 1.5;

          // Wall avoidance
          const wallAvoidance = avoidanceBehavior.calculateWallAvoidance(robot, {
            width: window.innerWidth,
            height: window.innerHeight,
          });
          totalForce.x += wallAvoidance.x * 1.8;
          totalForce.y += wallAvoidance.y * 1.8;
        }

        // Flocking behavior
        if (enableFlocking) {
          const flockingForce = flockingBehavior.calculateFlockingForce(robot, prevRobots);
          totalForce.x += flockingForce.x * 0.8;
          totalForce.y += flockingForce.y * 0.8;
        }

        // Mouse interaction
        if (enableMouseInteraction && mouseState) {
          const interactionForce = interactionBehavior.calculateInteractionForce(robot);
          totalForce.x += interactionForce.x * 1.5;
          totalForce.y += interactionForce.y * 1.5;

          // Group interaction influence
          const groupInfluence = interactionBehavior.calculateGroupInteractionInfluence(robot, prevRobots);
          totalForce.x += groupInfluence.x;
          totalForce.y += groupInfluence.y;
        }

        // Add some random wandering to prevent stagnation
        if (Math.random() < 0.02) {
          totalForce.x += (Math.random() - 0.5) * 0.1;
          totalForce.y += (Math.random() - 0.5) * 0.1;
        }

        // Apply forces to velocity
        const maxForce = performanceMode ? 0.1 : 0.15;
        const forceLength = Math.sqrt(totalForce.x * totalForce.x + totalForce.y * totalForce.y);
        if (forceLength > maxForce) {
          totalForce.x = (totalForce.x / forceLength) * maxForce;
          totalForce.y = (totalForce.y / forceLength) * maxForce;
        }

        const newVelocity = {
          x: robot.velocity.x + totalForce.x,
          y: robot.velocity.y + totalForce.y,
          z: robot.velocity.z,
        };

        // Apply velocity damping
        const damping = 0.98;
        newVelocity.x *= damping;
        newVelocity.y *= damping;

        // Limit maximum speed
        const maxSpeed = performanceMode ? 1.5 : 2.5;
        const speed = Math.sqrt(newVelocity.x * newVelocity.x + newVelocity.y * newVelocity.y);
        if (speed > maxSpeed) {
          newVelocity.x = (newVelocity.x / speed) * maxSpeed;
          newVelocity.y = (newVelocity.y / speed) * maxSpeed;
        }

        // Update position
        const newPosition = {
          x: robot.position.x + newVelocity.x,
          y: robot.position.y + newVelocity.y,
          z: robot.position.z,
        };

        // Update trail
        if (enable3DVisualization) {
          const trail = robotTrails.current.get(robot.id) || [];
          trail.push(new Vector3(newPosition.x, newPosition.y, newPosition.z));
          if (trail.length > (performanceMode ? 5 : 15)) {
            trail.shift();
          }
          robotTrails.current.set(robot.id, trail);
        }

        return {
          ...robot,
          position: newPosition,
          velocity: newVelocity,
        };
      });
    });
  }, [
    isActive,
    robots.length,
    performanceMode,
    collisionZones,
    enableCollisionAvoidance,
    enableFlocking,
    enableMouseInteraction,
    enable3DVisualization,
    mouseState,
    avoidanceBehavior,
    flockingBehavior,
    interactionBehavior,
  ]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      updateRobots();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (isActive) {
      animate();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateRobots, isActive]);

  // Handle visibility change to pause/resume when tab is not active
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsActive(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <div className={`robot-swarm ${className}`}>
      {/* Collision detection system */}
      {enableCollisionAvoidance && (
        <CollisionSystem
          onZonesUpdate={setCollisionZones}
          scanInterval={performanceMode ? 1000 : 500}
          defaultPadding={20}
        />
      )}

      {/* Mouse tracking system */}
      {enableMouseInteraction && (
        <MouseTracker
          onMouseUpdate={handleMouseUpdate}
          trackVelocity
          trackTrail
          trailLength={performanceMode ? 5 : 10}
          throttleMs={performanceMode ? 32 : 16}
        />
      )}

      {/* 3D visualization - wrapped in Suspense for lazy loading */}
      {enable3DVisualization && typeof window !== 'undefined' && (
        <Suspense fallback={null}>
          <RoboticsCanvas
            robots={robots}
            trails={robotTrails.current}
            backgroundOpacity={0.1}
            performanceMode={performanceMode}
          />
        </Suspense>
      )}

      {/* Development controls */}
      {process.env.NODE_ENV === 'development' && (
        <RobotSwarmControls
          isActive={isActive}
          onToggle={setIsActive}
          robotCount={robots.length}
          collisionZones={collisionZones.length}
          performanceMode={performanceMode}
          swarmBehavior={swarmBehavior}
        />
      )}
    </div>
  );
}

// Development controls component
function RobotSwarmControls({
  isActive,
  onToggle,
  robotCount,
  collisionZones,
  performanceMode,
  swarmBehavior,
}: {
  isActive: boolean;
  onToggle: (active: boolean) => void;
  robotCount: number;
  collisionZones: number;
  performanceMode: boolean;
  swarmBehavior: string;
}) {
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'r' && e.ctrlKey && e.shiftKey) {
        setShowControls(prev => !prev);
      } else if (e.key === ' ' && e.ctrlKey) {
        onToggle(!isActive);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive, onToggle]);

  if (!showControls) {
    return (
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-50 text-white text-xs p-2 rounded z-50">
        <div>Ctrl+Shift+R: Toggle robot controls</div>
        <div>Ctrl+Space: {isActive ? 'Pause' : 'Resume'} swarm</div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-3 rounded z-50 space-y-2">
      <div className="font-bold">Robot Swarm Controls</div>
      <div>Status: {isActive ? '🟢 Active' : '🔴 Paused'}</div>
      <div>Robots: {robotCount}</div>
      <div>Collision Zones: {collisionZones}</div>
      <div>Mode: {performanceMode ? 'Performance' : 'Quality'}</div>
      <div>Behavior: {swarmBehavior}</div>
      <button
        onClick={() => onToggle(!isActive)}
        className="mt-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
      >
        {isActive ? 'Pause' : 'Resume'}
      </button>
    </div>
  );
}