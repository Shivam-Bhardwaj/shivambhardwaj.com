'use client';

import { useState, useEffect } from 'react';
import { Activity, Server, Database, Shield, Zap, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface MetricData {
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
}

interface InfrastructureMetrics {
  uptime: MetricData;
  responseTime: MetricData;
  throughput: MetricData;
  errorRate: MetricData;
  instanceCount: MetricData;
  cpuUsage: MetricData;
  memoryUsage: MetricData;
  diskUsage: MetricData;
  networkLatency: MetricData;
  activeConnections: MetricData;
  buildStatus: MetricData;
  securityScore: MetricData;
}

const MetricCard = ({ 
  icon: Icon, 
  data, 
  title, 
  className = '' 
}: { 
  icon: LucideIcon; 
  data: MetricData; 
  title: string;
  className?: string;
}) => {
  const statusColors = {
    healthy: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    warning: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
    critical: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '→'
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${statusColors[data.status]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
        </div>
        {data.trend && (
          <span className={`text-sm ${
            data.trend === 'up' ? 'text-green-500' : 
            data.trend === 'down' ? 'text-red-500' : 
            'text-gray-500'
          }`}>
            {trendIcons[data.trend]}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {data.value}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {data.label}
        </div>
      </div>
    </div>
  );
};

export default function InfrastructureMetrics() {
  const [metrics, setMetrics] = useState<InfrastructureMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/infrastructure-metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      
      const data = await response.json();
      
      // Extract metrics from the response (excluding timestamp and status)
      const { timestamp, status, ...metricsData } = data;
      
      setMetrics(metricsData as InfrastructureMetrics);
      setLastUpdated(new Date(timestamp));
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // Update metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">Loading metrics...</span>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-red-600 dark:text-red-400">
            <Activity className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Unable to load metrics
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              There was an error fetching the latest infrastructure metrics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with last updated */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Real-time Infrastructure Metrics
        </h2>
        {lastUpdated && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-2" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Activity}
          data={metrics.uptime}
          title="System Uptime"
        />
        <MetricCard
          icon={Zap}
          data={metrics.responseTime}
          title="Response Time"
        />
        <MetricCard
          icon={Activity}
          data={metrics.throughput}
          title="Throughput"
        />
        <MetricCard
          icon={Shield}
          data={metrics.errorRate}
          title="Error Rate"
        />
      </div>

      {/* Infrastructure Resources */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Resource Utilization
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon={Server}
            data={metrics.instanceCount}
            title="Active Instances"
          />
          <MetricCard
            icon={Activity}
            data={metrics.cpuUsage}
            title="CPU Usage"
          />
          <MetricCard
            icon={Database}
            data={metrics.memoryUsage}
            title="Memory Usage"
          />
          <MetricCard
            icon={Database}
            data={metrics.diskUsage}
            title="Disk Usage"
          />
        </div>
      </div>

      {/* Network & Security */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Network & Security
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon={Activity}
            data={metrics.networkLatency}
            title="Network Latency"
          />
          <MetricCard
            icon={Server}
            data={metrics.activeConnections}
            title="Active Connections"
          />
          <MetricCard
            icon={Activity}
            data={metrics.buildStatus}
            title="Build Status"
          />
          <MetricCard
            icon={Shield}
            data={metrics.securityScore}
            title="Security Score"
          />
        </div>
      </div>

      {/* Status Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100 dark:bg-green-900">
              <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              All Systems Operational
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Infrastructure is running smoothly with all metrics in healthy ranges.
              Performance is optimal and security measures are fully operational.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}