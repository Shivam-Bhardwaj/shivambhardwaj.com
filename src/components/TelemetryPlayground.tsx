"use client";
import { useState, useEffect, useRef } from "react";
import { TelemetryCollector } from "@/lib/telemetry/TelemetryCollector";
import TelemetryDashboard from "@/components/TelemetryDashboard";
import SmartAvoidanceRobots from "@/components/SmartAvoidanceRobots";
import { useThemeColors } from "@/lib/theme/theme-colors";
interface DemoRobot {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  role: 'scout' | 'follower' | 'leader';
  color: string;
  health: number;
  energy: number;
  target: { x: number; y: number } | null;
  trail: { x: number; y: number }[];
  wanderAngle: number;
}
export function TelemetryPlayground() {
  const [selectedDemo, setSelectedDemo] = useState<'swarm' | 'simulation'>('swarm');
  const [telemetryCollector] = useState(() => new TelemetryCollector());
  const [simulationRunning, setSimulationRunning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const robotsRef = useRef<DemoRobot[]>([]);
  const mouseRef = useRef({ x: 300, y: 200 });
  const themeColors = useThemeColors();
  // Initialize demo robots
  useEffect(() => {
    const colors = [themeColors.robot.trail.leader, themeColors.robot.trail.follower, themeColors.robot.trail.scout, '#f59e0b', '#8b5cf6', '#06b6d4'];
    const roles: ('scout' | 'follower' | 'leader')[] = ['scout', 'follower', 'leader'];
    robotsRef.current = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 100 + Math.random() * 400,
      y: 100 + Math.random() * 300,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      role: roles[i % roles.length],
      color: colors[i % colors.length],
      health: 80 + Math.random() * 20,
      energy: 60 + Math.random() * 40,
      target: null,
      trail: [],
      wanderAngle: Math.random() * Math.PI * 2
    }));
  }, []);
  // Simulation animation loop
  useEffect(() => {
    if (!simulationRunning || selectedDemo !== 'simulation') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 600;
    canvas.height = 400;
    const animate = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Update robots
      robotsRef.current.forEach(robot => {
        // Simple flocking behavior
        const neighbors = robotsRef.current.filter(other => 
          other.id !== robot.id && 
          Math.sqrt((other.x - robot.x) ** 2 + (other.y - robot.y) ** 2) < 80
        );
        // Seek mouse
        const mouseForce = {
          x: (mouseRef.current.x - robot.x) * 0.001,
          y: (mouseRef.current.y - robot.y) * 0.001
        };
        // Separation
        const separationForce = { x: 0, y: 0 };
        neighbors.forEach(neighbor => {
          const dx = robot.x - neighbor.x;
          const dy = robot.y - neighbor.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 50 && dist > 0) {
            separationForce.x += (dx / dist) * 0.02;
            separationForce.y += (dy / dist) * 0.02;
          }
        });
        // Wander
        robot.wanderAngle += (Math.random() - 0.5) * 0.3;
        const wanderForce = {
          x: Math.cos(robot.wanderAngle) * 0.005,
          y: Math.sin(robot.wanderAngle) * 0.005
        };
        // Apply forces
        robot.vx += mouseForce.x + separationForce.x + wanderForce.x;
        robot.vy += mouseForce.y + separationForce.y + wanderForce.y;
        // Limit speed
        const speed = Math.sqrt(robot.vx * robot.vx + robot.vy * robot.vy);
        const maxSpeed = robot.role === 'scout' ? 3 : robot.role === 'leader' ? 2.5 : 2;
        if (speed > maxSpeed) {
          robot.vx = (robot.vx / speed) * maxSpeed;
          robot.vy = (robot.vy / speed) * maxSpeed;
        }
        // Update position
        robot.x += robot.vx;
        robot.y += robot.vy;
        // Boundary wrapping
        if (robot.x < 0) robot.x = canvas.width;
        if (robot.x > canvas.width) robot.x = 0;
        if (robot.y < 0) robot.y = canvas.height;
        if (robot.y > canvas.height) robot.y = 0;
        // Update trail
        robot.trail.push({ x: robot.x, y: robot.y });
        if (robot.trail.length > 20) robot.trail.shift();
        // Simulate health/energy changes
        robot.health = Math.max(20, robot.health + (Math.random() - 0.5) * 0.2);
        robot.energy = Math.max(10, robot.energy + (Math.random() - 0.5) * 0.5);
        // Draw trail
        if (robot.trail.length > 1) {
          ctx.strokeStyle = robot.color + '44';
          ctx.lineWidth = 2;
          ctx.beginPath();
          robot.trail.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
        // Draw robot
        ctx.fillStyle = robot.color;
        ctx.beginPath();
        if (robot.role === 'leader') {
          // Diamond for leader
          ctx.moveTo(robot.x + 8, robot.y);
          ctx.lineTo(robot.x, robot.y - 6);
          ctx.lineTo(robot.x - 8, robot.y);
          ctx.lineTo(robot.x, robot.y + 6);
        } else if (robot.role === 'scout') {
          // Circle for scout
          ctx.arc(robot.x, robot.y, 6, 0, Math.PI * 2);
        } else {
          // Triangle for follower
          ctx.moveTo(robot.x + 6, robot.y);
          ctx.lineTo(robot.x - 4, robot.y - 4);
          ctx.lineTo(robot.x - 4, robot.y + 4);
        }
        ctx.closePath();
        ctx.fill();
        // Role indicator
        ctx.strokeStyle = robot.role === 'leader' ? themeColors.robot.indicators.leader : robot.role === 'scout' ? themeColors.robot.indicators.scout : themeColors.ui.text.primary;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      // Draw mouse target
      ctx.strokeStyle = themeColors.robot.indicators.target;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mouseRef.current.x, mouseRef.current.y, 10, 0, Math.PI * 2);
      ctx.stroke();
      // Collect telemetry data
      telemetryCollector.collectSnapshot(robotsRef.current);
      telemetryCollector.updateFrameRate();
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [simulationRunning, selectedDemo, telemetryCollector]);
  // Handle mouse movement on canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };
  return (
    <div className="space-y-6 w-full">
      {/* Demo Selection */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setSelectedDemo('swarm')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            selectedDemo === 'swarm'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          🤖 Live Swarm Demo
        </button>
        <button
          onClick={() => setSelectedDemo('simulation')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            selectedDemo === 'simulation'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
           Simulation Demo
        </button>
      </div>
      {selectedDemo === 'swarm' ? (
        /* Live Swarm Background */
        <div className="relative">
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Live Robot Swarm with Telemetry
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Interactive swarm simulation with real-time telemetry data collection. 
                Move your mouse to guide the robots.
              </p>
            </div>
            <div className="relative h-[600px] overflow-hidden">
              <SmartAvoidanceRobots telemetryCollector={telemetryCollector} />
              <TelemetryDashboard 
                telemetryCollector={telemetryCollector}
                className="absolute top-4 right-4 w-80"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Simulation Demo */
        <div className="relative">
          <div className="bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-950 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-3">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Controlled Simulation
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Simplified robot simulation for telemetry demonstration. Click to start/stop.
                </p>
              </div>
              <button
                onClick={() => setSimulationRunning(!simulationRunning)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  simulationRunning
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {simulationRunning ? '⏸ Pause' : '▶ Start'}
              </button>
            </div>
            <div className="flex">
              <div className="flex-1">
                <canvas
                  ref={canvasRef}
                  onMouseMove={handleMouseMove}
                  className="w-full h-96 cursor-crosshair bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900"
                  width={600}
                  height={400}
                />
              </div>
              <div className="w-80 border-l border-gray-200 dark:border-gray-700">
                <TelemetryDashboard 
                  telemetryCollector={telemetryCollector}
                  className="relative w-full h-96 border-0 rounded-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Technical Information */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
          Telemetry System Overview
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Data Collection</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 text-left inline-block">
              <li>• Real-time position tracking</li>
              <li>• Velocity and acceleration metrics</li>
              <li>• Health and energy monitoring</li>
              <li>• Behavioral state detection</li>
            </ul>
          </div>
          <div className="text-center">
            <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">Performance Analytics</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 text-left inline-block">
              <li>• Frame rate monitoring</li>
              <li>• Collision detection stats</li>
              <li>• System resource usage</li>
              <li>• Historical trend analysis</li>
            </ul>
          </div>
          <div className="text-center">
            <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Export & Integration</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 text-left inline-block">
              <li>• JSON data export</li>
              <li>• Real-time dashboard updates</li>
              <li>• Configurable time ranges</li>
              <li>• Scalable architecture</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
