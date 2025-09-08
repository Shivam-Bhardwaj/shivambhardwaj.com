import { NextResponse } from 'next/server';

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

// Simulate realistic metrics with some variance
function generateRealisticMetrics(): InfrastructureMetrics {
  const baseTime = Date.now();
  const randomVariance = (base: number, variance: number) => 
    base + (Math.random() - 0.5) * variance;

  // Simulate some realistic values with small random variations
  const uptime = 99.95 + randomVariance(0, 0.1);
  const responseTime = Math.floor(randomVariance(145, 30));
  const throughputValue = Math.floor(randomVariance(2400, 400));
  const errorRateValue = randomVariance(0.03, 0.02);
  const instanceCount = Math.max(1, Math.floor(randomVariance(3, 2)));
  const cpuUsage = Math.floor(randomVariance(25, 15));
  const memoryUsage = Math.floor(randomVariance(160, 40));
  const diskUsage = 2.4 + randomVariance(0, 0.3);
  const networkLatency = Math.floor(randomVariance(18, 8));
  const activeConnections = Math.floor(randomVariance(47, 20));

  // Determine status based on values
  const getStatus = (value: number, thresholds: { warning: number; critical: number }): 'healthy' | 'warning' | 'critical' => {
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.warning) return 'warning';
    return 'healthy';
  };

  const getTrend = (): 'up' | 'down' | 'stable' => {
    const trends = ['up', 'down', 'stable'] as const;
    return trends[Math.floor(Math.random() * trends.length)]!;
  };

  return {
    uptime: {
      value: `${uptime.toFixed(2)}%`,
      label: 'Last 30 days',
      trend: uptime > 99.9 ? 'stable' : 'down',
      status: getStatus(100 - uptime, { warning: 0.5, critical: 1.0 })
    },
    responseTime: {
      value: `${responseTime}ms`,
      label: 'P95 response time',
      trend: getTrend(),
      status: getStatus(responseTime, { warning: 200, critical: 500 })
    },
    throughput: {
      value: `${(throughputValue / 1000).toFixed(1)}K`,
      label: 'Requests per minute',
      trend: getTrend(),
      status: 'healthy'
    },
    errorRate: {
      value: `${Math.max(0, errorRateValue).toFixed(2)}%`,
      label: 'Error rate',
      trend: errorRateValue < 0.05 ? 'down' : 'up',
      status: getStatus(errorRateValue, { warning: 0.1, critical: 1.0 })
    },
    instanceCount: {
      value: instanceCount,
      label: 'Active instances',
      trend: 'stable',
      status: 'healthy'
    },
    cpuUsage: {
      value: `${Math.max(0, Math.min(100, cpuUsage))}%`,
      label: 'Average CPU usage',
      trend: getTrend(),
      status: getStatus(cpuUsage, { warning: 70, critical: 90 })
    },
    memoryUsage: {
      value: `${Math.max(0, memoryUsage)}MB`,
      label: 'Memory usage (512MB total)',
      trend: getTrend(),
      status: getStatus((memoryUsage / 512) * 100, { warning: 80, critical: 95 })
    },
    diskUsage: {
      value: `${Math.max(0, diskUsage).toFixed(1)}GB`,
      label: 'Disk usage (10GB total)',
      trend: 'up',
      status: getStatus((diskUsage / 10) * 100, { warning: 80, critical: 95 })
    },
    networkLatency: {
      value: `${Math.max(0, networkLatency)}ms`,
      label: 'Network latency',
      trend: getTrend(),
      status: getStatus(networkLatency, { warning: 50, critical: 100 })
    },
    activeConnections: {
      value: Math.max(0, activeConnections),
      label: 'Active connections',
      trend: getTrend(),
      status: 'healthy'
    },
    buildStatus: {
      value: Math.random() > 0.1 ? 'Passing' : 'Failed',
      label: 'Latest build',
      trend: 'stable',
      status: Math.random() > 0.1 ? 'healthy' : 'critical'
    },
    securityScore: {
      value: 'A+',
      label: 'Security grade',
      trend: 'stable',
      status: 'healthy'
    }
  };
}

export async function GET() {
  try {
    const metrics = generateRealisticMetrics();
    
    return NextResponse.json({
      ...metrics,
      timestamp: new Date().toISOString(),
      status: 'operational'
    });
  } catch (error) {
    console.error('Error generating infrastructure metrics:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch infrastructure metrics' },
      { status: 500 }
    );
  }
}

// Add metadata for the API endpoint
export const dynamic = 'force-dynamic';
export const revalidate = 0;