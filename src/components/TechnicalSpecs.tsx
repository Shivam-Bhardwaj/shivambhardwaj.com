'use client';

import { Server, Database, Shield, Zap, Monitor, Globe, Code, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SpecificationSection {
  title: string;
  icon: LucideIcon;
  specs: { label: string; value: string }[];
}

export default function TechnicalSpecs() {
  const specifications: SpecificationSection[] = [
    {
      title: 'Application Runtime',
      icon: Code,
      specs: [
        { label: 'Runtime Environment', value: 'Node.js 20.x' },
        { label: 'Framework', value: 'Next.js 15.5.2' },
        { label: 'TypeScript', value: '5.x (Strict Mode)' },
        { label: 'Module System', value: 'ES Modules' },
        { label: 'Build Target', value: 'ES2022' },
        { label: 'JSX Runtime', value: 'React 18.3.1' }
      ]
    },
    {
      title: 'Cloud Infrastructure',
      icon: Server,
      specs: [
        { label: 'Platform', value: 'Google App Engine' },
        { label: 'Instance Type', value: 'F2 (0.6 GHz, 256 MB)' },
        { label: 'Auto Scaling', value: '0-10 instances' },
        { label: 'Region', value: 'us-central1 (Iowa)' },
        { label: 'Network Tier', value: 'Premium' },
        { label: 'Load Balancer', value: 'HTTP(S) Global' }
      ]
    },
    {
      title: 'Performance & Storage',
      icon: Zap,
      specs: [
        { label: 'CPU Allocation', value: '1 vCPU' },
        { label: 'Memory', value: '512 MB RAM' },
        { label: 'Disk Storage', value: '10 GB SSD' },
        { label: 'CDN', value: 'Google Cloud CDN' },
        { label: 'Caching', value: 'Edge & Browser Cache' },
        { label: 'Static Assets', value: 'Optimized & Compressed' }
      ]
    },
    {
      title: 'Security Configuration',
      icon: Shield,
      specs: [
        { label: 'SSL/TLS', value: 'TLS 1.3 Managed Certificates' },
        { label: 'Firewall', value: 'Cloud Armor WAF' },
        { label: 'DDoS Protection', value: 'Google Cloud Shield' },
        { label: 'CSP', value: 'Content Security Policy' },
        { label: 'HSTS', value: 'HTTP Strict Transport Security' },
        { label: 'Security Headers', value: 'X-Frame-Options, X-XSS-Protection' }
      ]
    },
    {
      title: 'Monitoring & Logging',
      icon: Monitor,
      specs: [
        { label: 'Application Logs', value: 'Google Cloud Logging' },
        { label: 'Error Tracking', value: 'Cloud Error Reporting' },
        { label: 'Performance', value: 'Cloud Monitoring' },
        { label: 'Alerting', value: 'Custom Alert Policies' },
        { label: 'Health Checks', value: '/api/health endpoint' },
        { label: 'Uptime Monitoring', value: 'Global Uptime Checks' }
      ]
    },
    {
      title: 'Development Tools',
      icon: Settings,
      specs: [
        { label: 'Testing Framework', value: 'Vitest + Playwright' },
        { label: 'Code Quality', value: 'ESLint + TypeScript' },
        { label: 'Build Tool', value: 'Vite + Next.js' },
        { label: 'Package Manager', value: 'npm 8+' },
        { label: 'Version Control', value: 'Git' },
        { label: 'CI/CD', value: 'Google Cloud Build' }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Technical Specifications</h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Detailed technical specifications and configuration details for our infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {specifications.map((section, index) => {
          const Icon = section.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center mb-6">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-4">
                  <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {section.title}
                </h3>
              </div>

              <div className="space-y-3">
                {section.specs.map((spec, specIndex) => (
                  <div key={specIndex} className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {spec.label}
                    </span>
                    <span className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-8 border border-blue-200 dark:border-blue-700">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Global Infrastructure
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Our application is deployed across Google Cloud&apos;s global infrastructure, providing low latency 
              and high availability to users worldwide. The CDN ensures fast content delivery, while our 
              monitoring systems provide real-time insights into performance and reliability.
            </p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">15+</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Global Regions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">99.9%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">SLA Uptime</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">&lt;200ms</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Response Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24/7</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}