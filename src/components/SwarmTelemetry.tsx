/**
 * Telemetry Display Component
 * 
 * Displays real-time robot telemetry including:
 * - Battery life per robot
 * - Signal strength
 * - Communication status
 * - Exploration progress
 */

"use client";
import { Robot } from '@/lib/robotics/robot';

interface TelemetryProps {
  robots: Robot[];
  explorationProgress: number;
  discoveredLandmarks: number;
  totalLandmarks: number;
  activeConnections: number;
}

export default function TelemetryDisplay({
  robots,
  explorationProgress,
  discoveredLandmarks,
  totalLandmarks,
  activeConnections
}: TelemetryProps) {
  const activeRobots = robots.filter(r => r.isOperational()).length;
  const avgBattery = robots.length > 0
    ? robots.reduce((sum, r) => sum + r.getBatteryPercentage(), 0) / robots.length
    : 0;
  const avgSignal = robots.length > 0
    ? robots.reduce((sum, r) => sum + r.state.signalStrength, 0) / robots.length
    : 0;

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg">
      <h3 className="text-lg font-bold mb-3 text-gray-800">Swarm Telemetry</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {/* Exploration Progress */}
        <div className="bg-gray-50 rounded p-2">
          <div className="text-xs text-gray-600 mb-1">Exploration</div>
          <div className="text-xl font-bold text-brand-primary">{explorationProgress.toFixed(1)}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div
              className="bg-brand-primary h-2 rounded-full transition-all"
              style={{ width: `${explorationProgress}%` }}
            />
          </div>
        </div>

        {/* Active Robots */}
        <div className="bg-gray-50 rounded p-2">
          <div className="text-xs text-gray-600 mb-1">Active Robots</div>
          <div className="text-xl font-bold text-electric">{activeRobots}/{robots.length}</div>
        </div>

        {/* Average Battery */}
        <div className="bg-gray-50 rounded p-2">
          <div className="text-xs text-gray-600 mb-1">Avg Battery</div>
          <div className="text-xl font-bold text-circuit">{avgBattery.toFixed(0)}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div
              className={`h-2 rounded-full transition-all ${
                avgBattery > 50 ? 'bg-green-500' : avgBattery > 20 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${avgBattery}%` }}
            />
          </div>
        </div>

        {/* Connections */}
        <div className="bg-gray-50 rounded p-2">
          <div className="text-xs text-gray-600 mb-1">Connections</div>
          <div className="text-xl font-bold text-neon">{activeConnections}</div>
        </div>
      </div>

      {/* Landmarks Discovered */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">Landmarks Discovered</span>
          <span className="text-sm font-semibold text-gray-800">
            {discoveredLandmarks}/{totalLandmarks}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${(discoveredLandmarks / totalLandmarks) * 100}%` }}
          />
        </div>
      </div>

      {/* Robot Type Breakdown */}
      <div className="text-xs text-gray-600">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {Array.from(new Set(robots.map(r => r.state.type.name))).map(typeName => {
            const count = robots.filter(r => r.state.type.name === typeName).length;
            const robot = robots.find(r => r.state.type.name === typeName);
            return (
              <div key={typeName} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: robot?.state.type.color }}
                />
                <span>{typeName}: {count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

