export default function InfrastructurePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold sm:text-5xl">
              Infrastructure & Architecture
            </h1>
            <p className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto">
              Comprehensive technical documentation of our Google Cloud platform, deployment pipelines, 
              monitoring systems, and development stack.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Google Cloud Infrastructure Overview */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 ">Google Cloud Platform Architecture</h2>
            <p className="mt-4 text-lg text-gray-600  max-w-3xl mx-auto">
              Enterprise-grade cloud infrastructure designed for scalability, security, and performance.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Infrastructure Specifications */}
            <div className="bg-white bg-white rounded-lg p-6 border border-gray-200 border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900  mb-4">
                Production Infrastructure
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 ">Platform:</span>
                  <span className="font-medium text-gray-900 ">Google App Engine</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 ">Runtime:</span>
                  <span className="font-medium text-gray-900 ">Node.js 20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 ">Instance Class:</span>
                  <span className="font-medium text-gray-900 ">F2 (0.6 GHz, 256 MB)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 ">Region:</span>
                  <span className="font-medium text-gray-900 ">us-central1 (Iowa)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 ">Auto Scaling:</span>
                  <span className="font-medium text-gray-900 ">0-10 instances</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 ">CPU Target:</span>
                  <span className="font-medium text-gray-900 ">60%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 ">Throughput Target:</span>
                  <span className="font-medium text-gray-900 ">60%</span>
                </div>
              </div>
            </div>

            {/* Resource Allocation */}
            <div className="bg-white bg-white rounded-lg p-6 border border-gray-200 border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900  mb-4">
                Resource Configuration
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 ">CPU:</span>
                  <span className="font-medium text-gray-900 ">1 vCPU</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 ">Memory:</span>
                  <span className="font-medium text-gray-900 ">512 MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 ">Disk Space:</span>
                  <span className="font-medium text-gray-900 ">10 GB SSD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 ">Network:</span>
                  <span className="font-medium text-gray-900 ">Premium Tier</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 ">SSL/TLS:</span>
                  <span className="font-medium text-gray-900 ">Managed Certificates</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 ">CDN:</span>
                  <span className="font-medium text-gray-900 ">Google Cloud CDN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 ">Load Balancer:</span>
                  <span className="font-medium text-gray-900 ">HTTP(S) Load Balancing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Architecture Diagram (Text-based) */}
          <div className="bg-gray-50 bg-white rounded-lg p-8 border border-gray-200 border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900  mb-6 text-center">
              Infrastructure Architecture
            </h3>
            <div className="font-mono text-sm space-y-2 overflow-x-auto">
              <div className="text-center text-gray-600 ">
                ┌─────────────────────────────────────────────────────────────┐
              </div>
              <div className="text-center text-gray-600 ">
                │                    Internet Traffic                          │
              </div>
              <div className="text-center text-gray-600 ">
                └─────────────────────┬───────────────────────────────────────┘
              </div>
              <div className="text-center text-gray-600 ">
                                      │
              </div>
              <div className="text-center text-gray-600 ">
                ┌─────────────────────▼───────────────────────────────────────┐
              </div>
              <div className="text-center text-gray-600 ">
                │              Google Cloud CDN                               │
              </div>
              <div className="text-center text-gray-600 ">
                │           (Global Edge Locations)                          │
              </div>
              <div className="text-center text-gray-600 ">
                └─────────────────────┬───────────────────────────────────────┘
              </div>
              <div className="text-center text-gray-600 ">
                                      │
              </div>
              <div className="text-center text-gray-600 ">
                ┌─────────────────────▼───────────────────────────────────────┐
              </div>
              <div className="text-center text-gray-600 ">
                │            HTTP(S) Load Balancer                           │
              </div>
              <div className="text-center text-gray-600 ">
                │         (SSL Termination, DDoS Protection)                 │
              </div>
              <div className="text-center text-gray-600 ">
                └─────────────────────┬───────────────────────────────────────┘
              </div>
              <div className="text-center text-gray-600 ">
                                      │
              </div>
              <div className="text-center text-gray-600 ">
                ┌─────────────────────▼───────────────────────────────────────┐
              </div>
              <div className="text-center text-gray-600 ">
                │                App Engine (us-central1)                    │
              </div>
              <div className="text-center text-gray-600 ">
                │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
              </div>
              <div className="text-center text-gray-600 ">
                │  │   F2 Inst   │ │   F2 Inst   │ │     ...     │          │
              </div>
              <div className="text-center text-gray-600 ">
                │  │  (Node.js)  │ │  (Node.js)  │ │  (0-10 Max) │          │
              </div>
              <div className="text-center text-gray-600 ">
                │  └─────────────┘ └─────────────┘ └─────────────┘          │
              </div>
              <div className="text-center text-gray-600 ">
                └─────┬───────────────────────────────────────────────┬─────┘
              </div>
              <div className="text-center text-gray-600 ">
                      │                                               │
              </div>
              <div className="text-center text-gray-600 ">
                ┌─────▼─────────────────┐                   ┌─────────▼─────┐
              </div>
              <div className="text-center text-gray-600 ">
                │   Cloud Logging       │                   │ Cloud Monitor │
              </div>
              <div className="text-center text-gray-600 ">
                │  (Centralized Logs)   │                   │  (Metrics &   │
              </div>
              <div className="text-center text-gray-600 ">
                │                       │                   │   Alerting)   │
              </div>
              <div className="text-center text-gray-600 ">
                └───────────────────────┘                   └───────────────┘
              </div>
            </div>
          </div>
        </section>

        {/* Deployment Pipeline */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 ">Deployment Pipeline</h2>
            <p className="mt-4 text-lg text-gray-600 ">
              Automated CI/CD pipeline with comprehensive testing and deployment strategies.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white bg-white rounded-lg p-6 border border-gray-200 border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 dark:text-blue-300 font-semibold">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 ">Build Stage</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 ">
                <li>• Code quality checks (ESLint)</li>
                <li>• Type checking (TypeScript)</li>
                <li>• Unit tests (Vitest)</li>
                <li>• Integration tests</li>
                <li>• Security scanning</li>
                <li>• Build optimization</li>
              </ul>
            </div>

            <div className="bg-white bg-white rounded-lg p-6 border border-gray-200 border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mr-3">
                  <span className="text-indigo-600 dark:text-indigo-300 font-semibold">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 ">Test Stage</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 ">
                <li>• End-to-end tests (Playwright)</li>
                <li>• Performance testing</li>
                <li>• Accessibility tests</li>
                <li>• Cross-browser validation</li>
                <li>• Mobile responsiveness</li>
                <li>• SEO optimization checks</li>
              </ul>
            </div>

            <div className="bg-white bg-white rounded-lg p-6 border border-gray-200 border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 dark:text-green-300 font-semibold">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 ">Deploy Stage</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 ">
                <li>• Staging deployment</li>
                <li>• Smoke tests</li>
                <li>• Production deployment</li>
                <li>• Health checks</li>
                <li>• Performance monitoring</li>
                <li>• Rollback capability</li>
              </ul>
            </div>
          </div>

          {/* Deployment Commands */}
          <div className="mt-8 bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Deployment Commands</h3>
            <div className="space-y-3 font-mono text-sm">
              <div className="text-gray-300">
                <span className="text-green-400"># Staging Deployment</span>
              </div>
              <div className="text-white bg-gray-800 p-2 rounded">
                npm run deploy:staging
              </div>
              
              <div className="text-gray-300 mt-4">
                <span className="text-green-400"># Production Deployment</span>
              </div>
              <div className="text-white bg-gray-800 p-2 rounded">
                npm run deploy:production
              </div>

              <div className="text-gray-300 mt-4">
                <span className="text-green-400"># Infrastructure Management</span>
              </div>
              <div className="text-white bg-gray-800 p-2 rounded">
                npm run infrastructure:plan<br />
                npm run infrastructure:apply
              </div>
            </div>
          </div>
        </section>

        {/* Monitoring & Observability */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 ">Monitoring & Observability</h2>
            <p className="mt-4 text-lg text-gray-600 ">
              Comprehensive monitoring, logging, and alerting systems for production reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Logging */}
            <div className="bg-white bg-white rounded-lg p-6 border border-gray-200 border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900  mb-4">Cloud Logging</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 ">Structured JSON logging</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 ">Real-time log streaming</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 ">Error tracking & grouping</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 ">Log-based metrics</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 ">Advanced search & filtering</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-100 bg-gray-100 rounded text-xs font-mono text-gray-700 ">
                gcloud logs tail &quot;resource.type=gae_app&quot;
              </div>
            </div>

            {/* Monitoring */}
            <div className="bg-white bg-white rounded-lg p-6 border border-gray-200 border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900  mb-4">Cloud Monitoring</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 ">Custom dashboards</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 ">Performance metrics</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 ">Alerting policies</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 ">SLA monitoring</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 ">Uptime checks</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-100 bg-gray-100 rounded text-xs font-mono text-gray-700 ">
                npm run monitoring:dashboard
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="mt-8 bg-white bg-white rounded-lg p-6 border border-gray-200 border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900  mb-4">Key Performance Metrics</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 bg-gray-100 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">99.9%</div>
                <div className="text-sm text-gray-600 ">Uptime SLA</div>
              </div>
              <div className="text-center p-4 bg-gray-50 bg-gray-100 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">&lt;200ms</div>
                <div className="text-sm text-gray-600 ">Avg Response</div>
              </div>
              <div className="text-center p-4 bg-gray-50 bg-gray-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">&lt;10s</div>
                <div className="text-sm text-gray-600 ">Cold Start</div>
              </div>
              <div className="text-center p-4 bg-gray-50 bg-gray-100 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">A+</div>
                <div className="text-sm text-gray-600 ">Security Grade</div>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Complete Technology Stack</h2>
            <p className="mt-4 text-lg text-gray-600">
              Detailed breakdown of all technologies, frameworks, and tools used in our infrastructure.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Frontend</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Next.js 15.5.2</li>
                <li>• React 18.3.1</li>
                <li>• TypeScript 5.7.2</li>
                <li>• Tailwind CSS 3.4.17</li>
                <li>• Three.js 0.170.0</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Backend</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Node.js 22.17.0</li>
                <li>• Google Cloud Platform</li>
                <li>• App Engine</li>
                <li>• Cloud Logging</li>
                <li>• Cloud Monitoring</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Tools</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Vercel (Deployment)</li>
                <li>• GitHub (Version Control)</li>
                <li>• ESLint (Code Quality)</li>
                <li>• Vitest (Testing)</li>
                <li>• Playwright (E2E Testing)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Security Configuration */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 ">Security Configuration</h2>
            <p className="mt-4 text-lg text-gray-600 ">
              Enterprise-grade security measures and compliance standards.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white bg-white rounded-lg p-6 border border-gray-200 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900  mb-4">Network Security</h3>
              <ul className="space-y-2 text-sm text-gray-600 ">
                <li>• HTTPS/TLS 1.3 encryption</li>
                <li>• DDoS protection</li>
                <li>• Web Application Firewall</li>
                <li>• IP-based access controls</li>
                <li>• VPC network isolation</li>
              </ul>
            </div>

            <div className="bg-white bg-white rounded-lg p-6 border border-gray-200 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900  mb-4">Application Security</h3>
              <ul className="space-y-2 text-sm text-gray-600 ">
                <li>• Content Security Policy</li>
                <li>• CORS configuration</li>
                <li>• Input validation & sanitization</li>
                <li>• Dependency scanning</li>
                <li>• Automated security updates</li>
              </ul>
            </div>

            <div className="bg-white bg-white rounded-lg p-6 border border-gray-200 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900  mb-4">Data Security</h3>
              <ul className="space-y-2 text-sm text-gray-600 ">
                <li>• Encryption at rest</li>
                <li>• Encryption in transit</li>
                <li>• Secure key management</li>
                <li>• Audit logging</li>
                <li>• Data retention policies</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Health Checks & Reliability */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 ">Health Checks & Reliability</h2>
            <p className="mt-4 text-lg text-gray-600 ">
              Comprehensive health monitoring and reliability engineering practices.
            </p>
          </div>

          <div className="bg-white bg-white rounded-lg p-6 border border-gray-200 border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900  mb-4">Readiness Checks</h3>
                <div className="space-y-2 text-sm text-gray-600 ">
                  <div className="flex justify-between">
                    <span>Endpoint:</span>
                    <code className="text-indigo-600 dark:text-indigo-400">/api/health</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Interval:</span>
                    <span>5 seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timeout:</span>
                    <span>4 seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failure Threshold:</span>
                    <span>2 failures</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Threshold:</span>
                    <span>2 successes</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900  mb-4">Liveness Checks</h3>
                <div className="space-y-2 text-sm text-gray-600 ">
                  <div className="flex justify-between">
                    <span>Endpoint:</span>
                    <code className="text-indigo-600 dark:text-indigo-400">/api/health</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Interval:</span>
                    <span>30 seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timeout:</span>
                    <span>4 seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failure Threshold:</span>
                    <span>4 failures</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Threshold:</span>
                    <span>2 successes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}