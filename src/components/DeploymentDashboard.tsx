'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Rocket,
  GitBranch,
  Server,
  Monitor,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface DeploymentMetrics {
  deploymentId: string;
  timestamp: string;
  status: 'success' | 'failed' | 'in_progress' | 'pending';
  metrics: {
    startTime: number;
    testDuration: number;
    buildDuration: number;
    deployDuration: number;
    totalDuration: number;
    errors: Array<{ timestamp: string; message: string }>;
    warnings: Array<{ timestamp: string; message: string }>;
    fixes: Array<{ timestamp: string; message: string }>;
  };
  summary: {
    testsRun: boolean;
    buildCompleted: boolean;
    deployed: boolean;
    totalDuration: string;
    testDuration: string;
    buildDuration: string;
    deployDuration: string;
  };
  deploymentUrl?: string;
}

interface BuildHealth {
  overall: 'healthy' | 'warning' | 'critical';
  tests: { status: 'pass' | 'fail' | 'skip'; count: number };
  lint: { status: 'pass' | 'fail' | 'skip'; issues: number };
  typeCheck: { status: 'pass' | 'fail' | 'skip'; errors: number };
  security: { status: 'pass' | 'fail' | 'skip'; vulnerabilities: number };
  build: { status: 'pass' | 'fail' | 'skip'; size: string };
}

export function DeploymentDashboard() {
  const [deployments, setDeployments] = useState<DeploymentMetrics[]>([]);
  const [buildHealth, setBuildHealth] = useState<BuildHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Mock data for demonstration - in real app, this would come from API
  useEffect(() => {
    const mockDeployments: DeploymentMetrics[] = [
      {
        deploymentId: 'deploy-1733582445000',
        timestamp: new Date().toISOString(),
        status: 'success',
        metrics: {
          startTime: Date.now() - 300000,
          testDuration: 15000,
          buildDuration: 45000,
          deployDuration: 30000,
          totalDuration: 90000,
          errors: [],
          warnings: [
            { timestamp: new Date().toISOString(), message: 'Unused variable detected and fixed' }
          ],
          fixes: [
            { timestamp: new Date().toISOString(), message: 'Applied automatic lint fixes' }
          ]
        },
        summary: {
          testsRun: true,
          buildCompleted: true,
          deployed: true,
          totalDuration: '90.00s',
          testDuration: '15.00s',
          buildDuration: '45.00s',
          deployDuration: '30.00s'
        },
        deploymentUrl: 'https://antimony-labs.vercel.app'
      },
      {
        deploymentId: 'deploy-1733582300000',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'failed',
        metrics: {
          startTime: Date.now() - 3600000,
          testDuration: 12000,
          buildDuration: 0,
          deployDuration: 0,
          totalDuration: 15000,
          errors: [
            { timestamp: new Date().toISOString(), message: 'TypeScript compilation failed' }
          ],
          warnings: [],
          fixes: []
        },
        summary: {
          testsRun: true,
          buildCompleted: false,
          deployed: false,
          totalDuration: '15.00s',
          testDuration: '12.00s',
          buildDuration: '0.00s',
          deployDuration: '0.00s'
        }
      }
    ];

    const mockBuildHealth: BuildHealth = {
      overall: 'healthy',
      tests: { status: 'pass', count: 23 },
      lint: { status: 'pass', issues: 0 },
      typeCheck: { status: 'fail', errors: 5 },
      security: { status: 'pass', vulnerabilities: 0 },
      build: { status: 'pass', size: '2.3 MB' }
    };

    setTimeout(() => {
      setDeployments(mockDeployments);
      setBuildHealth(mockBuildHealth);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'in_progress': return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      case 'warning': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'fail': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Rocket className="w-7 h-7 text-primary-600" />
            Deployment Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Monitor build health, deployment status, and system metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={() => setLastRefresh(new Date())}
            className="p-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Build Health Overview */}
      {buildHealth && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary-600" />
              Build Health Status
            </h3>
          </div>

          {/* Overall Health */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Overall Health</h4>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                buildHealth.overall === 'healthy' 
                  ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
                  : buildHealth.overall === 'warning'
                  ? 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
                  : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
              }`}>
                {buildHealth.overall.toUpperCase()}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Tests</span>
                <div className={`px-2 py-1 rounded text-xs ${getHealthColor(buildHealth.tests.status)}`}>
                  {buildHealth.tests.count} passed
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Lint</span>
                <div className={`px-2 py-1 rounded text-xs ${getHealthColor(buildHealth.lint.status)}`}>
                  {buildHealth.lint.issues} issues
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">TypeScript</span>
                <div className={`px-2 py-1 rounded text-xs ${getHealthColor(buildHealth.typeCheck.status)}`}>
                  {buildHealth.typeCheck.errors} errors
                </div>
              </div>
            </div>
          </div>

          {/* Security Status */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Security</h4>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getHealthColor(buildHealth.security.status)}`}>
                {buildHealth.security.status.toUpperCase()}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {buildHealth.security.vulnerabilities}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Vulnerabilities found</p>
          </div>

          {/* Build Performance */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Build Size</h4>
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {buildHealth.build.size}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Optimized bundle</p>
          </div>
        </div>
      )}

      {/* Recent Deployments */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary-600" />
            Recent Deployments
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {deployments.map((deployment) => (
            <div key={deployment.deploymentId} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(deployment.status)}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Deployment {deployment.deploymentId.split('-').pop()}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(deployment.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    deployment.status === 'success' 
                      ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
                      : deployment.status === 'failed'
                      ? 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                      : 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
                  }`}>
                    {deployment.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Deployment Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {deployment.summary.testDuration}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Tests</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {deployment.summary.buildDuration}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Build</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {deployment.summary.deployDuration}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Deploy</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {deployment.summary.totalDuration}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Total</div>
                </div>
              </div>

              {/* Issues and Fixes */}
              {(deployment.metrics.errors.length > 0 || deployment.metrics.warnings.length > 0 || deployment.metrics.fixes.length > 0) && (
                <div className="space-y-2">
                  {deployment.metrics.errors.map((error, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                      <XCircle className="w-4 h-4" />
                      {error.message}
                    </div>
                  ))}
                  {deployment.metrics.warnings.map((warning, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                      <AlertTriangle className="w-4 h-4" />
                      {warning.message}
                    </div>
                  ))}
                  {deployment.metrics.fixes.map((fix, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                      <CheckCircle className="w-4 h-4" />
                      {fix.message}
                    </div>
                  ))}
                </div>
              )}

              {/* Deployment URL */}
              {deployment.deploymentUrl && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <a 
                    href={deployment.deploymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                  >
                    <Server className="w-4 h-4" />
                    View Deployment
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}