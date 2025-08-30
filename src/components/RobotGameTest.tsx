'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useThemeColors } from '@/lib/theme/theme-colors';

// Robot Game Test Environment
// Separate testing space for robot logic without affecting main website

interface TestRobot {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  trail: { x: number; y: number }[];
  energy: number;
  role: 'scout' | 'follower' | 'leader';
}

interface TestObstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'static' | 'dynamic';
}

interface ForceSystem {
  seekForce: { x: number; y: number };
  avoidForce: { x: number; y: number };
  wanderForce: { x: number; y: number };
  swarmForce: { x: number; y: number };
  totalForce: { x: number; y: number };
}

const RobotGameTest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const robotsRef = useRef<TestRobot[]>([]);
  const obstaclesRef = useRef<TestObstacle[]>([]);
  const mouseRef = useRef({ x: 400, y: 300 });
  const forcesRef = useRef<ForceSystem[]>([]);
  const themeColors = useThemeColors();

  // Test configuration
  const [config, setConfig] = useState({
    numRobots: 4,
    seekWeight: 1.0,
    avoidWeight: 1.5,
    wanderWeight: 0.5,
    swarmWeight: 0.8,
    maxSpeed: 3,
    showForces: false,
    showDebug: false
  });

  // Initialize test robots
  useEffect(() => {
    const robots: TestRobot[] = [];
    const colors = [themeColors.robot.trail.leader, themeColors.robot.trail.follower, themeColors.robot.trail.scout, '#96ceb4', '#ffeaa7'];
    const roles: ('scout' | 'follower' | 'leader')[] = ['scout', 'follower', 'leader'];

    for (let i = 0; i < config.numRobots; i++) {
      robots.push({
        id: i,
        x: Math.random() * 800,
        y: Math.random() * 600,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: colors[i % colors.length],
        trail: [],
        energy: 100,
        role: roles[i % roles.length]
      });
    }
    robotsRef.current = robots;
    forcesRef.current = robots.map(() => ({
      seekForce: { x: 0, y: 0 },
      avoidForce: { x: 0, y: 0 },
      wanderForce: { x: 0, y: 0 },
      swarmForce: { x: 0, y: 0 },
      totalForce: { x: 0, y: 0 }
    }));

    // Initialize obstacles
    obstaclesRef.current = [
      { x: 200, y: 200, width: 100, height: 50, type: 'static' },
      { x: 500, y: 400, width: 80, height: 80, type: 'static' },
      { x: 100, y: 450, width: 60, height: 40, type: 'static' }
    ];
  }, [config.numRobots]);

  // Force calculation functions
  const calculateSeekForce = (robot: TestRobot, target: { x: number; y: number }): { x: number; y: number } => {
    const dx = target.x - robot.x;
    const dy = target.y - robot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return { x: 0, y: 0 };

    const desiredX = (dx / distance) * config.maxSpeed;
    const desiredY = (dy / distance) * config.maxSpeed;

    return {
      x: (desiredX - robot.vx) * 0.1 * config.seekWeight,
      y: (desiredY - robot.vy) * 0.1 * config.seekWeight
    };
  };

  const calculateAvoidForce = (robot: TestRobot, obstacles: TestObstacle[]): { x: number; y: number } => {
    let totalForceX = 0;
    let totalForceY = 0;

    obstacles.forEach(obstacle => {
      const dx = robot.x - (obstacle.x + obstacle.width / 2);
      const dy = robot.y - (obstacle.y + obstacle.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = 60;

      if (distance < minDistance && distance > 0) {
        const force = (minDistance - distance) / minDistance;
        totalForceX += (dx / distance) * force * config.avoidWeight;
        totalForceY += (dy / distance) * force * config.avoidWeight;
      }
    });

    return { x: totalForceX, y: totalForceY };
  };

  const calculateWanderForce = (_robot: TestRobot): { x: number; y: number } => {
    const wanderAngle = Math.random() * Math.PI * 2;
    return {
      x: Math.cos(wanderAngle) * config.wanderWeight,
      y: Math.sin(wanderAngle) * config.wanderWeight
    };
  };

  const calculateSwarmForce = (robot: TestRobot, robots: TestRobot[]): { x: number; y: number } => {
    let sepX = 0, sepY = 0, alignX = 0, alignY = 0, cohX = 0, cohY = 0;
    let neighborCount = 0;

    robots.forEach(other => {
      if (other.id === robot.id) return;

      const dx = other.x - robot.x;
      const dy = other.y - robot.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) {
        neighborCount++;

        // Separation
        if (distance < 40) {
          sepX -= (dx / distance) * (40 - distance) / 40;
          sepY -= (dy / distance) * (40 - distance) / 40;
        }

        // Alignment
        alignX += other.vx;
        alignY += other.vy;

        // Cohesion
        cohX += dx;
        cohY += dy;
      }
    });

    if (neighborCount > 0) {
      alignX = (alignX / neighborCount - robot.vx) * 0.1;
      alignY = (alignY / neighborCount - robot.vy) * 0.1;
      cohX = (cohX / neighborCount) * 0.02;
      cohY = (cohY / neighborCount) * 0.02;
    }

    return {
      x: (sepX + alignX + cohX) * config.swarmWeight,
      y: (sepY + alignY + cohY) * config.swarmWeight
    };
  };

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update each robot
      robotsRef.current.forEach((robot, index) => {
        // Calculate forces
        const seekForce = calculateSeekForce(robot, mouseRef.current);
        const avoidForce = calculateAvoidForce(robot, obstaclesRef.current);
        const wanderForce = calculateWanderForce(robot);
        const swarmForce = calculateSwarmForce(robot, robotsRef.current);

        // Combine forces
        const totalForce = {
          x: seekForce.x + avoidForce.x + wanderForce.x + swarmForce.x,
          y: seekForce.y + avoidForce.y + wanderForce.y + swarmForce.y
        };

        // Store forces for debugging
        forcesRef.current[index] = {
          seekForce,
          avoidForce,
          wanderForce,
          swarmForce,
          totalForce
        };

        // Apply forces to velocity
        robot.vx += totalForce.x;
        robot.vy += totalForce.y;

        // Limit speed
        const speed = Math.sqrt(robot.vx * robot.vx + robot.vy * robot.vy);
        if (speed > config.maxSpeed) {
          robot.vx = (robot.vx / speed) * config.maxSpeed;
          robot.vy = (robot.vy / speed) * config.maxSpeed;
        }

        // Update position
        robot.x += robot.vx;
        robot.y += robot.vy;

        // Boundary constraints
        robot.x = Math.max(10, Math.min(canvas.width - 10, robot.x));
        robot.y = Math.max(10, Math.min(canvas.height - 10, robot.y));

        // Update trail
        robot.trail.push({ x: robot.x, y: robot.y });
        if (robot.trail.length > 20) robot.trail.shift();
      });

      // Draw obstacles
      ctx.fillStyle = themeColors.canvas.muted;
      obstaclesRef.current.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      });

      // Draw robots
      robotsRef.current.forEach((robot, index) => {
        // Draw trail
        if (robot.trail.length > 1) {
          ctx.strokeStyle = robot.color + '40';
          ctx.lineWidth = 2;
          ctx.beginPath();
          robot.trail.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }

        // Draw robot body
        ctx.save();
        ctx.translate(robot.x, robot.y);
        const angle = Math.atan2(robot.vy, robot.vx);
        ctx.rotate(angle);

        ctx.fillStyle = robot.color;
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(-6, -6);
        ctx.lineTo(-6, 6);
        ctx.closePath();
        ctx.fill();

        // Draw direction indicator
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(6, 0, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Draw force vectors if enabled
        if (config.showForces) {
          const forces = forcesRef.current[index];
          const scale = 10;

          // Seek force (green)
          ctx.strokeStyle = themeColors.robot.communication.strong;
          ctx.beginPath();
          ctx.moveTo(robot.x, robot.y);
          ctx.lineTo(robot.x + forces.seekForce.x * scale, robot.y + forces.seekForce.y * scale);
          ctx.stroke();

          // Avoid force (red)
          ctx.strokeStyle = themeColors.game.debug.ray;
          ctx.beginPath();
          ctx.moveTo(robot.x, robot.y);
          ctx.lineTo(robot.x + forces.avoidForce.x * scale, robot.y + forces.avoidForce.y * scale);
          ctx.stroke();

          // Total force (blue)
          ctx.strokeStyle = themeColors.robot.communication.connection;
          ctx.beginPath();
          ctx.moveTo(robot.x, robot.y);
          ctx.lineTo(robot.x + forces.totalForce.x * scale, robot.y + forces.totalForce.y * scale);
          ctx.stroke();
        }

        // Draw debug info
        if (config.showDebug && index === 0) {
          ctx.fillStyle = 'white';
          ctx.font = '12px monospace';
          const forces = forcesRef.current[index];
          ctx.fillText(`Seek: (${forces.seekForce.x.toFixed(2)}, ${forces.seekForce.y.toFixed(2)})`, 10, 20);
          ctx.fillText(`Avoid: (${forces.avoidForce.x.toFixed(2)}, ${forces.avoidForce.y.toFixed(2)})`, 10, 40);
          ctx.fillText(`Total: (${forces.totalForce.x.toFixed(2)}, ${forces.totalForce.y.toFixed(2)})`, 10, 60);
          ctx.fillText(`Velocity: (${robot.vx.toFixed(2)}, ${robot.vy.toFixed(2)})`, 10, 80);
        }
      });

      // Draw mouse target
      ctx.strokeStyle = themeColors.robot.indicators.target;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mouseRef.current.x, mouseRef.current.y, 10, 0, Math.PI * 2);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      return () => canvas.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Robot Game Test Environment</h2>

      {/* Configuration Panel */}
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h3 className="font-semibold mb-2">Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium">Robots</label>
            <input
              type="range"
              min="1"
              max="8"
              value={config.numRobots}
              onChange={(e) => setConfig(prev => ({ ...prev, numRobots: parseInt(e.target.value) }))}
              className="w-full"
            />
            <span className="text-xs">{config.numRobots}</span>
          </div>

          <div>
            <label className="block text-sm font-medium">Seek Weight</label>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={config.seekWeight}
              onChange={(e) => setConfig(prev => ({ ...prev, seekWeight: parseFloat(e.target.value) }))}
              className="w-full"
            />
            <span className="text-xs">{config.seekWeight.toFixed(1)}</span>
          </div>

          <div>
            <label className="block text-sm font-medium">Avoid Weight</label>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={config.avoidWeight}
              onChange={(e) => setConfig(prev => ({ ...prev, avoidWeight: parseFloat(e.target.value) }))}
              className="w-full"
            />
            <span className="text-xs">{config.avoidWeight.toFixed(1)}</span>
          </div>

          <div>
            <label className="block text-sm font-medium">Max Speed</label>
            <input
              type="range"
              min="1"
              max="6"
              step="0.1"
              value={config.maxSpeed}
              onChange={(e) => setConfig(prev => ({ ...prev, maxSpeed: parseFloat(e.target.value) }))}
              className="w-full"
            />
            <span className="text-xs">{config.maxSpeed.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.showForces}
              onChange={(e) => setConfig(prev => ({ ...prev, showForces: e.target.checked }))}
              className="mr-2"
            />
            Show Force Vectors
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.showDebug}
              onChange={(e) => setConfig(prev => ({ ...prev, showDebug: e.target.checked }))}
              className="mr-2"
            />
            Show Debug Info
          </label>
        </div>
      </div>

      {/* Canvas */}
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="block cursor-crosshair"
        />
      </div>

      <p className="text-sm text-gray-600 mt-2">
        Move your mouse over the canvas to attract robots. Use the configuration panel to adjust behavior parameters.
      </p>
    </div>
  );
};

export default RobotGameTest;
