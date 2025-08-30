"use client";
import { useEffect, useState, useRef } from "react";
import { TelemetryCollector, TelemetrySnapshot, SystemMetrics, TelemetryData } from "@/lib/telemetry/TelemetryCollector";
interface DashboardProps {
  telemetryCollector: TelemetryCollector | null;
  className?: string;
}
interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}
function MetricCard({ title, value, unit, trend, color = 'blue' }: MetricCardProps) {
  const colorClasses = {
    blue: 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100',
    green: 'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100',
    red: 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100',
    yellow: 'border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100',
    purple: 'border-purple-500 bg-purple-50 text-purple-900 dark:bg-purple-950 dark:text-purple-100'
  };
  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '→'
  };
  return (
    <div className={`border-2 border-l-4 p-4 rounded-lg ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold">
            {typeof value === 'number' ? value.toFixed(1) : value}
            {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
          </p>
        </div>
        {trend && (
          <div className="text-2xl opacity-60">
            {trendIcons[trend]}
          </div>
        )}
      </div>
    </div>
  );
}
interface ChartProps {
  data: SystemMetrics[];
  metric: keyof SystemMetrics;
  title: string;
  color?: string;
  height?: number;
}
function MiniChart({ data, metric, title, color = '#3b82f6', height = 60 }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const width = rect.width;
    const chartHeight = rect.height;
    ctx.clearRect(0, 0, width, chartHeight);
    // Get values for the metric
    const values = data.map(d => {
      const val = d[metric];
      return typeof val === 'number' ? val : 0;
    });
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;
    // Draw line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    values.forEach((value, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = chartHeight - ((value - minVal) / range) * (chartHeight - 20) - 10;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    // Draw points
    ctx.fillStyle = color;
    values.forEach((value, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = chartHeight - ((value - minVal) / range) * (chartHeight - 20) - 10;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [data, metric, color]);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
      <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{title}</h4>
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: `${height}px` }}
        className="w-full"
      />
    </div>
  );
}
function RobotList({ robots }: { robots: TelemetryData[] }) {
  const robotsByType = robots.reduce((acc, robot) => {
    if (!acc[robot.robotType]) acc[robot.robotType] = [];
    acc[robot.robotType].push(robot);
    return acc;
  }, {} as Record<string, TelemetryData[]>);
  const typeColors = {
    scout: 'text-green-600 dark:text-green-400',
    defender: 'text-purple-600 dark:text-purple-400', 
    collector: 'text-blue-600 dark:text-blue-400',
    leader: 'text-yellow-600 dark:text-yellow-400',
    follower: 'text-gray-600 dark:text-gray-400'
  };
  const statusColors = {
    idle: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    moving: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    avoiding: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    attacking: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    collecting: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    patrolling: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  };
  return (
    <div className="space-y-4">
      {Object.entries(robotsByType).map(([type, typeRobots]) => (
        <div key={type} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <h4 className={`font-semibold mb-2 ${typeColors[type as keyof typeof typeColors] || 'text-gray-600'}`}>
            {type.toUpperCase()} ({typeRobots.length})
          </h4>
          <div className="grid gap-2 text-sm">
            {typeRobots.slice(0, 5).map((robot) => (
              <div key={robot.robotId} className="flex items-center justify-between py-1">
                <span className="font-mono">{robot.robotId}</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${statusColors[robot.status]}`}>
                    {robot.status}
                  </span>
                  <span className="text-gray-500">
                    {robot.speed.toFixed(1)} u/s
                  </span>
                  {robot.health && (
                    <span className={`text-xs ${robot.health > 75 ? 'text-green-600' : robot.health > 25 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {robot.health.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
            {typeRobots.length > 5 && (
              <div className="text-gray-500 text-xs">
                ... and {typeRobots.length - 5} more
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
export default function TelemetryDashboard({ telemetryCollector, className = "" }: DashboardProps) {
  const [currentSnapshot, setCurrentSnapshot] = useState<TelemetrySnapshot | null>(null);
  const [historicalMetrics, setHistoricalMetrics] = useState<SystemMetrics[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(30);
  useEffect(() => {
    if (!telemetryCollector) return;
    const updateInterval = setInterval(() => {
      const latest = telemetryCollector.getLatestSnapshot();
      if (latest) {
        setCurrentSnapshot(latest);
        // Update historical data
        const history = telemetryCollector.getHistory(selectedTimeRange);
        setHistoricalMetrics(history.map(h => h.system));
      }
    }, 250); // Update 4 times per second
    return () => clearInterval(updateInterval);
  }, [telemetryCollector, selectedTimeRange]);
  if (!telemetryCollector || !isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-4 right-4 bg-blue-600 text-white p-3 rounded-lg shadow-lg z-50 hover:bg-blue-700 transition-colors"
      >
         Show Telemetry
      </button>
    );
  }
  const handleExport = () => {
    const data = telemetryCollector.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `robot-telemetry-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const averageMetrics = telemetryCollector.getAverageMetrics(selectedTimeRange);
  return (
    <div className={`fixed top-4 right-4 w-96 max-h-[90vh] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-40 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            🤖 Robot Telemetry
          </h2>
          <div className="flex gap-2">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(Number(e.target.value))}
              className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>1m</option>
              <option value={300}>5m</option>
            </select>
            <button
              onClick={handleExport}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              Export
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
            >
              Hide
            </button>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
        {currentSnapshot ? (
          <div className="p-4 space-y-4">
            {/* System Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                title="Robots"
                value={currentSnapshot.system.totalRobots}
                color="blue"
              />
              <MetricCard
                title="Active"
                value={currentSnapshot.system.activeRobots}
                color="green"
              />
              <MetricCard
                title="Avg Speed"
                value={currentSnapshot.system.averageSpeed}
                unit="u/s"
                color="purple"
              />
              <MetricCard
                title="Frame Rate"
                value={currentSnapshot.system.frameRate}
                unit="fps"
                color="yellow"
              />
            </div>
            {/* Game State */}
            {currentSnapshot.gameState && (
              <div className="grid grid-cols-2 gap-3">
                <MetricCard
                  title="Score"
                  value={Math.floor(currentSnapshot.gameState.score)}
                  color="blue"
                />
                <MetricCard
                  title="Wave"
                  value={currentSnapshot.gameState.wave}
                  color="red"
                />
                <MetricCard
                  title="Resources"
                  value={currentSnapshot.gameState.resources}
                  color="yellow"
                />
                <MetricCard
                  title="Base Health"
                  value={currentSnapshot.gameState.baseHealth}
                  unit="%"
                  color={currentSnapshot.gameState.baseHealth > 75 ? "green" : currentSnapshot.gameState.baseHealth > 25 ? "yellow" : "red"}
                />
              </div>
            )}
            {/* Performance Metrics */}
            {averageMetrics && (
              <div className="grid grid-cols-2 gap-3">
                <MetricCard
                  title="Avg Health"
                  value={averageMetrics.averageHealth}
                  unit="%"
                  color="green"
                />
                <MetricCard
                  title="Collisions"
                  value={averageMetrics.collisionCount}
                  color="red"
                />
              </div>
            )}
            {/* Historical Charts */}
            {historicalMetrics.length > 1 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Trends</h3>
                <div className="grid gap-3">
                  <MiniChart
                    data={historicalMetrics}
                    metric="averageSpeed"
                    title="Average Speed"
                    color="#8b5cf6"
                  />
                  <MiniChart
                    data={historicalMetrics}
                    metric="frameRate"
                    title="Frame Rate"
                    color="#f59e0b"
                  />
                  <MiniChart
                    data={historicalMetrics}
                    metric="activeRobots"
                    title="Active Robots"
                    color="#10b981"
                  />
                </div>
              </div>
            )}
            {/* Robot Details */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Robots</h3>
              <RobotList robots={currentSnapshot.robots} />
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Waiting for telemetry data...</p>
          </div>
        )}
      </div>
    </div>
  );
}
