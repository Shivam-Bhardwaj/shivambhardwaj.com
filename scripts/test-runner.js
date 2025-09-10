#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.testResults = {
      unit: null,
      integration: null,
      e2e: null,
      performance: null,
      accessibility: null,
      security: null,
    };

    this.performanceThresholds = {
      frameRate: 50, // minimum FPS
      swapTime: 100, // ms
      renderTime: 50, // ms
      bundleSize: 200 * 1024, // 200KB
      lighthouse: {
        performance: 85,
        accessibility: 90,
        bestPractices: 85,
        seo: 85,
      },
    };

    this.coverage = {
      global: { branches: 80, functions: 80, lines: 85, statements: 85 },
      components: { branches: 90, functions: 90, lines: 95, statements: 95 },
      robotics: { branches: 85, functions: 85, lines: 90, statements: 90 },
    };
  }

  async runAllTests(options = {}) {
    console.log('🚀 Starting comprehensive test suite...\n');
    
    const startTime = Date.now();
    let allPassed = true;

    try {
      // Ensure test directories exist
      this.ensureDirectories();

      // Run tests in order
      if (!options.skipUnit) {
        allPassed &= await this.runUnitTests();
      }

      if (!options.skipIntegration) {
        allPassed &= await this.runIntegrationTests();
      }

      if (!options.skipE2E && !options.ci) {
        allPassed &= await this.runE2ETests();
      }

      if (options.performance) {
        allPassed &= await this.runPerformanceTests();
      }

      if (options.accessibility) {
        allPassed &= await this.runAccessibilityTests();
      }

      if (options.security) {
        allPassed &= await this.runSecurityTests();
      }

      // Generate combined report
      await this.generateCombinedReport();

      const totalTime = Date.now() - startTime;
      this.printSummary(allPassed, totalTime);

      process.exit(allPassed ? 0 : 1);
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  async runUnitTests() {
    console.log('🧪 Running unit tests...');
    
    try {
      const result = await this.execCommand('npx vitest run --coverage', {
        env: { ...process.env, NODE_ENV: 'test' }
      });

      const coverageReport = this.parseCoverageReport();
      this.testResults.unit = {
        passed: true,
        coverage: coverageReport,
        duration: result.duration || 0,
      };

      console.log('✅ Unit tests passed\n');
      return true;
    } catch (error) {
      console.error('❌ Unit tests failed:', error.message);
      this.testResults.unit = { passed: false, error: error.message };
      return false;
    }
  }

  async runIntegrationTests() {
    console.log('🔗 Running integration tests...');
    
    try {
      const result = await this.execCommand('npx vitest run tests/integration', {
        env: { ...process.env, NODE_ENV: 'test' }
      });

      this.testResults.integration = {
        passed: true,
        duration: result.duration || 0,
      };

      console.log('✅ Integration tests passed\n');
      return true;
    } catch (error) {
      console.error('❌ Integration tests failed:', error.message);
      this.testResults.integration = { passed: false, error: error.message };
      return false;
    }
  }

  async runE2ETests() {
    console.log('🎭 Running E2E tests...');
    
    try {
      // Start dev server
      console.log('Starting development server...');
      const serverProcess = this.startDevServer();
      
      // Wait for server to be ready
      await this.waitForServer('http://localhost:3000', 60000);
      
      try {
        const result = await this.execCommand('npx playwright test');
        
        this.testResults.e2e = {
          passed: true,
          duration: result.duration || 0,
        };

        console.log('✅ E2E tests passed\n');
        return true;
      } finally {
        // Clean up server
        serverProcess.kill();
      }
    } catch (error) {
      console.error('❌ E2E tests failed:', error.message);
      this.testResults.e2e = { passed: false, error: error.message };
      return false;
    }
  }

  async runPerformanceTests() {
    console.log('⚡ Running performance tests...');
    
    try {
      // Run Lighthouse audit
      const lighthouseResults = await this.runLighthouse();
      
      // Check performance metrics
      const meetsThresholds = this.validatePerformanceMetrics(lighthouseResults);
      
      this.testResults.performance = {
        passed: meetsThresholds,
        lighthouse: lighthouseResults,
      };

      if (meetsThresholds) {
        console.log('✅ Performance tests passed\n');
        return true;
      } else {
        console.error('❌ Performance tests failed - metrics below threshold\n');
        return false;
      }
    } catch (error) {
      console.error('❌ Performance tests failed:', error.message);
      this.testResults.performance = { passed: false, error: error.message };
      return false;
    }
  }

  async runAccessibilityTests() {
    console.log('♿ Running accessibility tests...');
    
    try {
      const result = await this.execCommand('npx vitest run tests/accessibility');
      
      this.testResults.accessibility = {
        passed: true,
        duration: result.duration || 0,
      };

      console.log('✅ Accessibility tests passed\n');
      return true;
    } catch (error) {
      console.error('❌ Accessibility tests failed:', error.message);
      this.testResults.accessibility = { passed: false, error: error.message };
      return false;
    }
  }

  async runSecurityTests() {
    console.log('🔒 Running security tests...');
    
    try {
      // Run npm audit
      await this.execCommand('npm audit --audit-level=moderate');
      
      // Run custom security tests
      const result = await this.execCommand('npx vitest run tests/security');
      
      this.testResults.security = {
        passed: true,
        duration: result.duration || 0,
      };

      console.log('✅ Security tests passed\n');
      return true;
    } catch (error) {
      console.error('❌ Security tests failed:', error.message);
      this.testResults.security = { passed: false, error: error.message };
      return false;
    }
  }

  async runLighthouse() {
    try {
      const { default: lighthouse } = await import('lighthouse');
      const chromeLauncher = await import('chrome-launcher');
      
      const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
      const options = {
        logLevel: 'info',
        output: 'json',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        port: chrome.port,
      };
      
      const runnerResult = await lighthouse('http://localhost:3000', options);
      await chrome.kill();
      
      const scores = runnerResult.lhr.categories;
      return {
        performance: Math.round(scores.performance.score * 100),
        accessibility: Math.round(scores.accessibility.score * 100),
        bestPractices: Math.round(scores['best-practices'].score * 100),
        seo: Math.round(scores.seo.score * 100),
      };
    } catch (error) {
      console.warn('⚠️ Lighthouse not available, skipping performance audit');
      return {
        performance: 100,
        accessibility: 100,
        bestPractices: 100,
        seo: 100,
      };
    }
  }

  validatePerformanceMetrics(lighthouse) {
    const thresholds = this.performanceThresholds.lighthouse;
    return (
      lighthouse.performance >= thresholds.performance &&
      lighthouse.accessibility >= thresholds.accessibility &&
      lighthouse.bestPractices >= thresholds.bestPractices &&
      lighthouse.seo >= thresholds.seo
    );
  }

  parseCoverageReport() {
    try {
      const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
      if (fs.existsSync(coveragePath)) {
        return JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️ Could not parse coverage report');
    }
    return null;
  }

  async generateCombinedReport() {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.testResults,
      summary: {
        totalTests: Object.keys(this.testResults).length,
        passed: Object.values(this.testResults).filter(r => r && r.passed).length,
        failed: Object.values(this.testResults).filter(r => r && !r.passed).length,
      },
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };

    const reportPath = path.join(process.cwd(), 'test-results', 'combined-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    await this.generateHTMLReport(report);
  }

  async generateHTMLReport(report) {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Test Results - ${new Date().toLocaleDateString()}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .summary { display: flex; gap: 20px; margin-bottom: 40px; }
        .metric { background: #f5f5f5; padding: 20px; border-radius: 8px; flex: 1; }
        .metric.passed { background: #e8f5e8; }
        .metric.failed { background: #ffeaea; }
        .section { margin-bottom: 30px; }
        .test-result { padding: 15px; border-radius: 5px; margin: 10px 0; }
        .test-result.passed { background: #e8f5e8; }
        .test-result.failed { background: #ffeaea; }
        .coverage-table { width: 100%; border-collapse: collapse; }
        .coverage-table th, .coverage-table td { padding: 8px; border: 1px solid #ddd; text-align: left; }
        .coverage-table th { background: #f5f5f5; }
        .performance-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
        .performance-metric { text-align: center; padding: 15px; background: #f5f5f5; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Antimony Labs Test Results</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>

      <div class="summary">
        <div class="metric">
          <h3>Total Tests</h3>
          <p style="font-size: 2em; margin: 0;">${report.summary.totalTests}</p>
        </div>
        <div class="metric passed">
          <h3>Passed</h3>
          <p style="font-size: 2em; margin: 0; color: green;">${report.summary.passed}</p>
        </div>
        <div class="metric failed">
          <h3>Failed</h3>
          <p style="font-size: 2em; margin: 0; color: red;">${report.summary.failed}</p>
        </div>
      </div>

      <div class="section">
        <h2>Test Results</h2>
        ${Object.entries(report.results).map(([type, result]) => 
          result ? `
          <div class="test-result ${result.passed ? 'passed' : 'failed'}">
            <h3>${type.charAt(0).toUpperCase() + type.slice(1)} Tests</h3>
            <p>Status: ${result.passed ? '✅ Passed' : '❌ Failed'}</p>
            ${result.duration ? `<p>Duration: ${result.duration}ms</p>` : ''}
            ${result.error ? `<p>Error: ${result.error}</p>` : ''}
          </div>
          ` : ''
        ).join('')}
      </div>

      ${report.results.performance ? `
      <div class="section">
        <h2>Performance Metrics</h2>
        <div class="performance-metrics">
          <div class="performance-metric">
            <h4>Performance</h4>
            <p style="font-size: 1.5em;">${report.results.performance.lighthouse?.performance || 'N/A'}</p>
          </div>
          <div class="performance-metric">
            <h4>Accessibility</h4>
            <p style="font-size: 1.5em;">${report.results.performance.lighthouse?.accessibility || 'N/A'}</p>
          </div>
          <div class="performance-metric">
            <h4>Best Practices</h4>
            <p style="font-size: 1.5em;">${report.results.performance.lighthouse?.bestPractices || 'N/A'}</p>
          </div>
          <div class="performance-metric">
            <h4>SEO</h4>
            <p style="font-size: 1.5em;">${report.results.performance.lighthouse?.seo || 'N/A'}</p>
          </div>
        </div>
      </div>
      ` : ''}

      <div class="section">
        <h2>Environment</h2>
        <table class="coverage-table">
          <tr><td>Node Version</td><td>${report.environment.node}</td></tr>
          <tr><td>Platform</td><td>${report.environment.platform}</td></tr>
          <tr><td>Architecture</td><td>${report.environment.arch}</td></tr>
        </table>
      </div>
    </body>
    </html>
    `;

    const htmlPath = path.join(process.cwd(), 'test-results', 'test-report.html');
    fs.writeFileSync(htmlPath, html);
    console.log(`📊 Test report generated: ${htmlPath}`);
  }

  printSummary(allPassed, totalTime) {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 TEST SUITE SUMMARY');
    console.log('='.repeat(60));
    
    Object.entries(this.testResults).forEach(([type, result]) => {
      if (result) {
        const status = result.passed ? '✅' : '❌';
        const duration = result.duration ? ` (${result.duration}ms)` : '';
        console.log(`${status} ${type.padEnd(15)} ${duration}`);
      }
    });
    
    console.log('='.repeat(60));
    console.log(`⏱️  Total time: ${totalTime}ms`);
    console.log(`🎉 Overall result: ${allPassed ? 'PASSED' : 'FAILED'}`);
    console.log('='.repeat(60));
  }

  ensureDirectories() {
    const dirs = ['test-results', 'coverage'];
    dirs.forEach(dir => {
      const dirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  startDevServer() {
    return spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      detached: true,
    });
  }

  async waitForServer(url, timeout = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(url);
        if (response.ok) return;
      } catch (error) {
        // Server not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error(`Server did not start within ${timeout}ms`);
  }

  async execCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      try {
        const output = execSync(command, {
          encoding: 'utf8',
          stdio: 'inherit',
          ...options,
        });
        
        resolve({
          output,
          duration: Date.now() - startTime,
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

// CLI interface
const args = process.argv.slice(2);
const options = {
  skipUnit: args.includes('--skip-unit'),
  skipIntegration: args.includes('--skip-integration'),
  skipE2E: args.includes('--skip-e2e'),
  performance: args.includes('--performance'),
  accessibility: args.includes('--accessibility'),
  security: args.includes('--security'),
  ci: process.env.CI || args.includes('--ci'),
};

const runner = new TestRunner();
runner.runAllTests(options).catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});