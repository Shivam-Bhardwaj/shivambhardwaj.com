/**
 * Simple runner for QA Agent - JavaScript wrapper
 */

const { execSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

class SimpleQAAgent {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.results = [];
  }

  async runAllTests() {
    console.log('🔍 Starting QA Agent tests...\n');
    this.results = [];

    // Run tests in sequence
    await this.testTypeScript();
    await this.testLinting();
    await this.testUnitTests();
    await this.testBuildProcess();
    await this.testStaticExport();
    await this.testSecurityScanning();

    return this.generateReport();
  }

  async testTypeScript() {
    const startTime = Date.now();
    try {
      console.log('📝 Testing TypeScript compilation...');
      execSync('npm run type-check', { 
        cwd: this.projectRoot,
        stdio: 'pipe'
      });
      
      this.results.push({
        name: 'TypeScript Compilation',
        passed: true,
        message: 'All TypeScript files compile without errors',
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.results.push({
        name: 'TypeScript Compilation',
        passed: false,
        message: `TypeScript compilation failed: ${error.message}`,
        duration: Date.now() - startTime,
        details: error.stdout?.toString() || error.stderr?.toString()
      });
    }
  }

  async testLinting() {
    const startTime = Date.now();
    try {
      console.log('🔧 Testing ESLint rules...');
      execSync('npm run lint', { 
        cwd: this.projectRoot,
        stdio: 'pipe'
      });
      
      this.results.push({
        name: 'ESLint Rules',
        passed: true,
        message: 'All linting rules passed',
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.results.push({
        name: 'ESLint Rules',
        passed: false,
        message: `Linting failed: ${error.message}`,
        duration: Date.now() - startTime,
        details: error.stdout?.toString() || error.stderr?.toString()
      });
    }
  }

  async testUnitTests() {
    const startTime = Date.now();
    try {
      console.log('🧪 Running unit tests...');
      const output = execSync('npm run test:coverage', { 
        cwd: this.projectRoot,
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      // Parse coverage from output
      const coverageMatch = output.match(/All files[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*(\d+\.?\d*)/);
      const coverage = coverageMatch ? parseFloat(coverageMatch[1]) : 0;
      
      const passed = coverage >= 70; // Based on your threshold
      
      this.results.push({
        name: 'Unit Tests',
        passed,
        message: `Tests completed with ${coverage}% coverage${!passed ? ' (below 70% threshold)' : ''}`,
        duration: Date.now() - startTime,
        details: { coverage, threshold: 70 }
      });
    } catch (error) {
      this.results.push({
        name: 'Unit Tests',
        passed: false,
        message: `Unit tests failed: ${error.message}`,
        duration: Date.now() - startTime,
        details: error.stdout?.toString() || error.stderr?.toString()
      });
    }
  }

  async testBuildProcess() {
    const startTime = Date.now();
    try {
      console.log('🏗️ Testing build process...');
      execSync('npm run build', { 
        cwd: this.projectRoot,
        stdio: 'pipe'
      });
      
      this.results.push({
        name: 'Build Process',
        passed: true,
        message: 'Build completed successfully',
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.results.push({
        name: 'Build Process',
        passed: false,
        message: `Build failed: ${error.message}`,
        duration: Date.now() - startTime,
        details: error.stdout?.toString() || error.stderr?.toString()
      });
    }
  }

  async testStaticExport() {
    const startTime = Date.now();
    try {
      console.log('📦 Testing static export...');
      
      const outDir = join(this.projectRoot, 'out');
      const requiredFiles = [
        'index.html',
        'projects.html',
        'experience.html',
        'skills.html',
        'contact.html',
        'learning.html',
        'calculators.html',
        'swarm.html',
        'robot-test.html',
        'swarm-test.html',
        'styleguide.html'
      ];

      const missingFiles = requiredFiles.filter(file => !existsSync(join(outDir, file)));
      
      if (missingFiles.length === 0) {
        this.results.push({
          name: 'Static Export',
          passed: true,
          message: 'All required static files generated successfully',
          duration: Date.now() - startTime,
          details: { generatedFiles: requiredFiles.length }
        });
      } else {
        this.results.push({
          name: 'Static Export',
          passed: false,
          message: `Missing static files: ${missingFiles.join(', ')}`,
          duration: Date.now() - startTime,
          details: { missingFiles }
        });
      }
    } catch (error) {
      this.results.push({
        name: 'Static Export',
        passed: false,
        message: `Static export validation failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  async testSecurityScanning() {
    const startTime = Date.now();
    try {
      console.log('🔒 Running security scan...');
      execSync('npm run security:audit', { 
        cwd: this.projectRoot,
        stdio: 'pipe'
      });
      
      this.results.push({
        name: 'Security Scan',
        passed: true,
        message: 'Security audit passed',
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.results.push({
        name: 'Security Scan',
        passed: false,
        message: `Security vulnerabilities found: ${error.message}`,
        duration: Date.now() - startTime,
        details: error.stdout?.toString() || error.stderr?.toString()
      });
    }
  }

  generateReport() {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.length - passed;
    const overallPassed = failed === 0;

    const report = {
      timestamp: new Date().toISOString(),
      totalTests: this.results.length,
      passed,
      failed,
      results: this.results,
      overallPassed,
      summary: overallPassed 
        ? `🎉 All ${this.results.length} QA tests passed!`
        : `❌ ${failed} of ${this.results.length} tests failed`
    };

    this.printReport(report);
    return report;
  }

  printReport(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 QA AGENT REPORT');
    console.log('='.repeat(60));
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Total Tests: ${report.totalTests}`);
    console.log(`Passed: ${report.passed}`);
    console.log(`Failed: ${report.failed}`);
    console.log(`Status: ${report.overallPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('');

    // Print individual test results
    report.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${status} ${result.name}${duration}`);
      console.log(`   ${result.message}`);
      
      if (!result.passed && result.details) {
        console.log(`   Details: ${typeof result.details === 'string' ? result.details.substring(0, 200) + '...' : JSON.stringify(result.details)}`);
      }
      console.log('');
    });

    console.log('='.repeat(60));
    console.log(report.summary);
    console.log('='.repeat(60));
  }
}

// Run the QA agent
async function main() {
  const agent = new SimpleQAAgent();
  const report = await agent.runAllTests();
  process.exit(report.overallPassed ? 0 : 1);
}

main().catch(error => {
  console.error('QA Agent failed:', error);
  process.exit(1);
});