'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { logger } from '@/lib/logging';
import { BoidsAlgorithm, SwarmUtils, type Agent, type SwarmParameters, type SwarmEnvironment } from '@/lib/robotics/swarmAlgorithms';
import { config } from '@/config';

interface SimulationControls {
  isRunning: boolean;
  agentCount: number;
  algorithm: 'boids' | 'pso' | 'flocking';
  preset: 'tight' | 'loose' | 'chaotic' | 'custom';
  showTrails: boolean;
  showMetrics: boolean;
  showNeighbors: boolean;
}

interface SimulationMetrics {
  fps: number;
  averageSpeed: number;
  cohesion: number;
  alignment: number;
  separation: number;
  centerOfMass: { x: number; y: number };
}

export default function SwarmSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const fpsCounterRef = useRef({ frames: 0, lastTime: 0, fps: 0 });

  const [agents, setAgents] = useState<Agent[]>([]);
  const [algorithm, setAlgorithm] = useState<BoidsAlgorithm | null>(null);
  const [controls, setControls] = useState<SimulationControls>({
    isRunning: false,
    agentCount: 50,
    algorithm: 'boids',
    preset: 'loose',
    showTrails: true,
    showMetrics: true,
    showNeighbors: false
  });
  const [metrics, setMetrics] = useState<SimulationMetrics>({
    fps: 0,
    averageSpeed: 0,
    cohesion: 0,
    alignment: 0,
    separation: 0,
    centerOfMass: { x: 0, y: 0 }
  });
  const [customParameters, setCustomParameters] = useState<SwarmParameters>(
    SwarmUtils.presetParameters.loose()
  );

  const canvasSize = config.robotics.simulation.canvasSize;

  // Initialize simulation
  const initializeSimulation = useCallback(() => {
    logger.info('Initializing swarm simulation', { controls });

    const environment: SwarmEnvironment = {
      width: canvasSize.width,
      height: canvasSize.height,
      boundaries: 'wrap',
      obstacles: [
        {
          position: { x: canvasSize.width * 0.3, y: canvasSize.height * 0.3 },
          radius: 40,
          type: 'circle',
          avoidanceRadius: 60
        },
        {
          position: { x: canvasSize.width * 0.7, y: canvasSize.height * 0.7 },
          radius: 30,
          type: 'circle',
          avoidanceRadius: 50
        }
      ],
      targets: []
    };

    let parameters: SwarmParameters;
    switch (controls.preset) {
      case 'tight':
        parameters = SwarmUtils.presetParameters.tight();
        break;
      case 'loose':
        parameters = SwarmUtils.presetParameters.loose();
        break;
      case 'chaotic':
        parameters = SwarmUtils.presetParameters.chaotic();
        break;
      case 'custom':
        parameters = customParameters;
        break;
      default:
        parameters = SwarmUtils.presetParameters.loose();
    }

    const newAlgorithm = new BoidsAlgorithm(parameters, environment);
    const newAgents = SwarmUtils.createFlock(controls.agentCount, canvasSize);

    setAlgorithm(newAlgorithm);
    setAgents(newAgents);

    logger.info('Swarm simulation initialized', {
      agentCount: newAgents.length,
      parameters,
      environment: { width: environment.width, height: environment.height }
    });
  }, [controls, customParameters, canvasSize]);

  // Animation loop
  const animate = useCallback((currentTime: number) => {
    if (!algorithm || agents.length === 0) return;

    const deltaTime = (currentTime - lastTimeRef.current) / 1000;
    lastTimeRef.current = currentTime;

    // Limit delta time to prevent large jumps
    const clampedDeltaTime = Math.min(deltaTime, 1/30); // Max 30 FPS minimum

    // Update FPS counter
    const fpsCounter = fpsCounterRef.current;
    fpsCounter.frames++;
    if (currentTime - fpsCounter.lastTime >= 1000) {
      fpsCounter.fps = Math.round((fpsCounter.frames * 1000) / (currentTime - fpsCounter.lastTime));
      fpsCounter.frames = 0;
      fpsCounter.lastTime = currentTime;
    }

    // Update simulation
    const updatedAgents = algorithm.updateSwarm(agents, clampedDeltaTime);
    
    // Calculate metrics
    const simulationMetrics = SwarmUtils.calculateMetrics(updatedAgents);
    setMetrics({
      fps: fpsCounter.fps,
      ...simulationMetrics
    });

    setAgents(updatedAgents);

    if (controls.isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [algorithm, agents, controls.isRunning]);

  // Drawing function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || agents.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw environment boundaries
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw obstacles
    if (algorithm) {
      // Access private environment via bracket (typed) to avoid any cast
      const environment = (algorithm as unknown as { environment: SwarmEnvironment }).environment;
      ctx.fillStyle = '#ef4444';
      ctx.globalAlpha = 0.3;
      
      for (const obstacle of environment.obstacles) {
        ctx.beginPath();
        ctx.arc(obstacle.position.x, obstacle.position.y, obstacle.radius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw avoidance radius
        ctx.strokeStyle = '#ef4444';
        ctx.globalAlpha = 0.1;
        ctx.beginPath();
        ctx.arc(obstacle.position.x, obstacle.position.y, obstacle.avoidanceRadius, 0, 2 * Math.PI);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // Draw trails
    if (controls.showTrails) {
      for (const agent of agents) {
        if (agent.trail && agent.trail.length > 1) {
          ctx.strokeStyle = agent.color || '#3b82f6';
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = 1;
          ctx.beginPath();
          if (agent.trail[0]) {
            ctx.moveTo(agent.trail[0].x, agent.trail[0].y);
              for (let i = 1; i < agent.trail.length; i++) {
                const pt = agent.trail[i];
                if (pt) ctx.lineTo(pt.x, pt.y);
              }
          }
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    // Draw neighbor connections
    if (controls.showNeighbors) {
      ctx.strokeStyle = '#6b7280';
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 1;
      
      for (const agent of agents) {
        for (const neighbor of agent.neighbors) {
          ctx.beginPath();
          ctx.moveTo(agent.position.x, agent.position.y);
          ctx.lineTo(neighbor.position.x, neighbor.position.y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    // Draw agents
    for (const agent of agents) {
      const { x, y } = agent.position;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(agent.orientation);
      
      // Draw agent body
      ctx.fillStyle = agent.color || '#3b82f6';
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(agent.radius, 0);
      ctx.lineTo(-agent.radius * 0.6, agent.radius * 0.4);
      ctx.lineTo(-agent.radius * 0.6, -agent.radius * 0.4);
      ctx.closePath();
      ctx.fill();
      
      // Draw agent center
      ctx.fillStyle = '#1f2937';
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 1, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.restore();
    }

    // Draw center of mass
    if (controls.showMetrics && metrics.centerOfMass) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(metrics.centerOfMass.x, metrics.centerOfMass.y, 8, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Draw cross at center
      ctx.beginPath();
      ctx.moveTo(metrics.centerOfMass.x - 5, metrics.centerOfMass.y);
      ctx.lineTo(metrics.centerOfMass.x + 5, metrics.centerOfMass.y);
      ctx.moveTo(metrics.centerOfMass.x, metrics.centerOfMass.y - 5);
      ctx.lineTo(metrics.centerOfMass.x, metrics.centerOfMass.y + 5);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }, [agents, algorithm, controls, metrics]);

  // Start/stop simulation
  const toggleSimulation = () => {
    setControls(prev => {
      const newRunning = !prev.isRunning;
      logger.info(`Simulation ${newRunning ? 'started' : 'stopped'}`);
      return { ...prev, isRunning: newRunning };
    });
  };

  // Reset simulation
  const resetSimulation = () => {
    setControls(prev => ({ ...prev, isRunning: false }));
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    logger.info('Simulation reset');
    initializeSimulation();
  };

  // Initialize on mount and when controls change
  useEffect(() => {
    initializeSimulation();
  }, [initializeSimulation]);

  // Start animation loop when running
  useEffect(() => {
    if (controls.isRunning && algorithm && agents.length > 0) {
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [controls.isRunning, algorithm, animate, agents.length]);

  // Draw when agents update
  useEffect(() => {
    draw();
  }, [agents, draw]);

  return (
    <div className="w-full space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-6"
      >
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Canvas */}
          <div className="flex-1">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              
              {!controls.isRunning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleSimulation}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    Start Simulation
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="w-full lg:w-80 space-y-4">
            <h3 className="text-lg font-semibold">Simulation Controls</h3>
            
            {/* Basic Controls */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={toggleSimulation}
                  className={`flex-1 px-4 py-2 rounded font-medium ${
                    controls.isRunning
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {controls.isRunning ? 'Stop' : 'Start'}
                </button>
                <button
                  onClick={resetSimulation}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium"
                >
                  Reset
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Agent Count: {controls.agentCount}
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="10"
                  value={controls.agentCount}
                  onChange={(e) => setControls(prev => ({
                    ...prev,
                    agentCount: parseInt(e.target.value)
                  }))}
                  className="w-full"
                  disabled={controls.isRunning}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Behavior Preset</label>
                <select
                  value={controls.preset}
                  onChange={(e) => setControls(prev => ({
                    ...prev,
                    preset: e.target.value as SimulationControls['preset']
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white dark:bg-gray-700 dark:border-gray-600"
                  disabled={controls.isRunning}
                >
                  <option value="tight">Tight Formation</option>
                  <option value="loose">Loose Flocking</option>
                  <option value="chaotic">Chaotic Swarm</option>
                  <option value="custom">Custom Parameters</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={controls.showTrails}
                    onChange={(e) => setControls(prev => ({
                      ...prev,
                      showTrails: e.target.checked
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Show Trails</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={controls.showMetrics}
                    onChange={(e) => setControls(prev => ({
                      ...prev,
                      showMetrics: e.target.checked
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Show Center of Mass</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={controls.showNeighbors}
                    onChange={(e) => setControls(prev => ({
                      ...prev,
                      showNeighbors: e.target.checked
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Show Neighbor Connections</span>
                </label>
              </div>
            </div>

            {/* Metrics */}
            {controls.showMetrics && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Simulation Metrics</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">FPS:</span>
                    <span className="ml-2 font-mono">{metrics.fps}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Avg Speed:</span>
                    <span className="ml-2 font-mono">{metrics.averageSpeed.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Cohesion:</span>
                    <span className="ml-2 font-mono">{metrics.cohesion.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Alignment:</span>
                    <span className="ml-2 font-mono">{metrics.alignment.toFixed(3)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600 dark:text-gray-400">Separation:</span>
                    <span className="ml-2 font-mono">{metrics.separation.toFixed(1)}px</span>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Parameters */}
            {controls.preset === 'custom' && (
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-medium">Custom Parameters</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs">Separation Weight: {customParameters.separationWeight}</label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.1"
                      value={customParameters.separationWeight}
                      onChange={(e) => setCustomParameters(prev => ({
                        ...prev,
                        separationWeight: parseFloat(e.target.value)
                      }))}
                      className="w-full"
                      disabled={controls.isRunning}
                    />
                  </div>
                  <div>
                    <label className="block text-xs">Alignment Weight: {customParameters.alignmentWeight}</label>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.1"
                      value={customParameters.alignmentWeight}
                      onChange={(e) => setCustomParameters(prev => ({
                        ...prev,
                        alignmentWeight: parseFloat(e.target.value)
                      }))}
                      className="w-full"
                      disabled={controls.isRunning}
                    />
                  </div>
                  <div>
                    <label className="block text-xs">Cohesion Weight: {customParameters.cohesionWeight}</label>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.1"
                      value={customParameters.cohesionWeight}
                      onChange={(e) => setCustomParameters(prev => ({
                        ...prev,
                        cohesionWeight: parseFloat(e.target.value)
                      }))}
                      className="w-full"
                      disabled={controls.isRunning}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}