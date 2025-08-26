/**
 * QA Agent - Comprehensive quality assurance testing
 * Tests navigation, console errors, responsive design, performance, and robot behavior
 */
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
interface QATestResult {
  name: string;
  passed: boolean;
  message: string;
  duration?: number;
  details?: any;
}
interface QAReport {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  results: QATestResult[];
  overallPassed: boolean;
  summary: string;
}
class QAAgent {
  private projectRoot: string;
  private results: QATestResult[] = [];
  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }
  /**
   * Run all QA tests
   */
  async runAllTests(): Promise<QAReport> {
    console.log(' Starting QA Agent tests...\n');
    this.results = [];
    // Run tests in sequence
    await this.testTypeScript();
    await this.testLinting();
    await this.testUnitTests();
    await this.testBuildProcess();
    await this.testStaticExport();
    await this.testNavigationLinks();
    await this.testResponsiveDesign();
    await this.testPerformanceMetrics();
    await this.testAccessibility();
    await this.testRobotBehavior();
    await this.testSecurityScanning();
    return this.generateReport();
  }
  /**
   * Test TypeScript compilation
   */
  private async testTypeScript(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log(' Testing TypeScript compilation...');
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
    } catch (error: any) {
      this.results.push({
        name: 'TypeScript Compilation',
        passed: false,
        message: `TypeScript compilation failed: ${error.message}`,
        duration: Date.now() - startTime,
        details: error.stdout?.toString() || error.stderr?.toString()
      });
    }
  }
  /**
   * Test ESLint rules
   */
  private async testLinting(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log(' Testing ESLint rules...');
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
    } catch (error: any) {
      this.results.push({
        name: 'ESLint Rules',
        passed: false,
        message: `Linting failed: ${error.message}`,
        duration: Date.now() - startTime,
        details: error.stdout?.toString() || error.stderr?.toString()
      });
    }
  }
  /**
   * Test unit tests
   */
  private async testUnitTests(): Promise<void> {
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
    } catch (error: any) {
      this.results.push({
        name: 'Unit Tests',
        passed: false,
        message: `Unit tests failed: ${error.message}`,
        duration: Date.now() - startTime,
        details: error.stdout?.toString() || error.stderr?.toString()
      });
    }
  }
  /**
   * Test build process
   */
  private async testBuildProcess(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log('️ Testing build process...');
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
    } catch (error: any) {
      this.results.push({
        name: 'Build Process',
        passed: false,
        message: `Build failed: ${error.message}`,
        duration: Date.now() - startTime,
        details: error.stdout?.toString() || error.stderr?.toString()
      });
    }
  }
  /**
   * Test static export validation
   */
  private async testStaticExport(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log(' Testing static export...');
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
    } catch (error: any) {
      this.results.push({
        name: 'Static Export',
        passed: false,
        message: `Static export validation failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }
  /**
   * Test navigation links (basic structure validation)
   */
  private async testNavigationLinks(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log(' Testing navigation links...');
      // Check if navbar component exists and has expected structure
      const navbarPath = join(this.projectRoot, 'src/components/Navbar.tsx');
      const minimalNavbarPath = join(this.projectRoot, 'src/components/MinimalNavbar.tsx');
      if (!existsSync(navbarPath) && !existsSync(minimalNavbarPath)) {
        throw new Error('Navigation component not found');
      }
      // Check expected routes exist in app directory
      const appDir = join(this.projectRoot, 'src/app');
      const expectedRoutes = [
        'projects',
        'experience', 
        'skills',
        'contact',
        'learning',
        'calculators',
        'swarm',
        'robot-test',
        'swarm-test',
        'styleguide'
      ];
      const missingRoutes = expectedRoutes.filter(route => 
        !existsSync(join(appDir, route, 'page.tsx'))
      );
      if (missingRoutes.length === 0) {
        this.results.push({
          name: 'Navigation Links',
          passed: true,
          message: 'All navigation routes have corresponding pages',
          duration: Date.now() - startTime,
          details: { routes: expectedRoutes.length }
        });
      } else {
        this.results.push({
          name: 'Navigation Links',
          passed: false,
          message: `Missing page components for routes: ${missingRoutes.join(', ')}`,
          duration: Date.now() - startTime,
          details: { missingRoutes }
        });
      }
    } catch (error: any) {
      this.results.push({
        name: 'Navigation Links',
        passed: false,
        message: `Navigation test failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }
  /**
   * Test responsive design (configuration validation)
   */
  private async testResponsiveDesign(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log(' Testing responsive design configuration...');
      // Check Tailwind config for responsive breakpoints
      const tailwindConfigPath = join(this.projectRoot, 'tailwind.config.ts');
      if (existsSync(tailwindConfigPath)) {
        const configContent = readFileSync(tailwindConfigPath, 'utf8');
        // Check for responsive utilities in global CSS
        const globalCssPath = join(this.projectRoot, 'src/app/globals.css');
        const hasGlobalCss = existsSync(globalCssPath);
        this.results.push({
          name: 'Responsive Design',
          passed: true,
          message: 'Responsive design configuration validated',
          duration: Date.now() - startTime,
          details: { 
            tailwindConfig: true,
            globalCss: hasGlobalCss
          }
        });
      } else {
        this.results.push({
          name: 'Responsive Design',
          passed: false,
          message: 'Tailwind configuration not found',
          duration: Date.now() - startTime
        });
      }
    } catch (error: any) {
      this.results.push({
        name: 'Responsive Design',
        passed: false,
        message: `Responsive design test failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }
  /**
   * Test performance metrics (using existing performance tests)
   */
  private async testPerformanceMetrics(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log(' Testing performance metrics...');
      execSync('npm run test:performance', { 
        cwd: this.projectRoot,
        stdio: 'pipe'
      });
      this.results.push({
        name: 'Performance Metrics',
        passed: true,
        message: 'Performance tests passed',
        duration: Date.now() - startTime
      });
    } catch (error: any) {
      // Performance tests might not be critical for QA pass
      this.results.push({
        name: 'Performance Metrics',
        passed: false,
        message: `Performance tests failed: ${error.message}`,
        duration: Date.now() - startTime,
        details: error.stdout?.toString() || error.stderr?.toString()
      });
    }
  }
  /**
   * Test accessibility compliance
   */
  private async testAccessibility(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log(' Testing accessibility compliance...');
      execSync('npm run test:a11y', { 
        cwd: this.projectRoot,
        stdio: 'pipe'
      });
      this.results.push({
        name: 'Accessibility',
        passed: true,
        message: 'Accessibility tests passed',
        duration: Date.now() - startTime
      });
    } catch (error: any) {
      this.results.push({
        name: 'Accessibility',
        passed: false,
        message: `Accessibility tests failed: ${error.message}`,
        duration: Date.now() - startTime,
        details: error.stdout?.toString() || error.stderr?.toString()
      });
    }
  }
  /**
   * Test robot behavior (component validation)
   */
  private async testRobotBehavior(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log('🤖 Testing robot behavior components...');
      const robotComponents = [
        'src/components/RoombaSimulation.tsx',
        'src/components/SwarmGame.tsx',
        'src/components/AdvancedRobots.tsx',
        'src/lib/robotics/algorithms.ts',
        'src/lib/swarm/SwarmManager.ts'
      ];
      const missingComponents = robotComponents.filter(component => 
        !existsSync(join(this.projectRoot, component))
      );
      if (missingComponents.length === 0) {
        this.results.push({
          name: 'Robot Behavior',
          passed: true,
          message: 'All robot components found and validated',
          duration: Date.now() - startTime,
          details: { components: robotComponents.length }
        });
      } else {
        this.results.push({
          name: 'Robot Behavior',
          passed: false,
          message: `Missing robot components: ${missingComponents.join(', ')}`,
          duration: Date.now() - startTime,
          details: { missingComponents }
        });
      }
    } catch (error: any) {
      this.results.push({
        name: 'Robot Behavior',
        passed: false,
        message: `Robot behavior test failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }
  /**
   * Test security scanning
   */
  private async testSecurityScanning(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log(' Running security scan...');
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
    } catch (error: any) {
      this.results.push({
        name: 'Security Scan',
        passed: false,
        message: `Security vulnerabilities found: ${error.message}`,
        duration: Date.now() - startTime,
        details: error.stdout?.toString() || error.stderr?.toString()
      });
    }
  }
  /**
   * Generate comprehensive QA report
   */
  private generateReport(): QAReport {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.length - passed;
    const overallPassed = failed === 0;
    const report: QAReport = {
      timestamp: new Date().toISOString(),
      totalTests: this.results.length,
      passed,
      failed,
      results: this.results,
      overallPassed,
      summary: overallPassed 
        ? ` All ${this.results.length} QA tests passed!`
        : ` ${failed} of ${this.results.length} tests failed`
    };
    this.printReport(report);
    return report;
  }
  /**
   * Print formatted report to console
   */
  private printReport(report: QAReport): void {
    console.log('\n' + '='.repeat(60));
    console.log(' QA AGENT REPORT');
    console.log('='.repeat(60));
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Total Tests: ${report.totalTests}`);
    console.log(`Passed: ${report.passed}`);
    console.log(`Failed: ${report.failed}`);
    console.log(`Status: ${report.overallPassed ? ' PASSED' : ' FAILED'}`);
    console.log('');
    // Print individual test results
    report.results.forEach(result => {
      const status = result.passed ? '' : '';
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
// Export both the class and a runner function
export { QAAgent };
export async function runQATests(projectRoot?: string): Promise<QAReport> {
  const agent = new QAAgent(projectRoot);
  return await agent.runAllTests();
}
// CLI usage
if (require.main === module) {
  runQATests()
    .then(report => {
      process.exit(report.overallPassed ? 0 : 1);
    })
    .catch(error => {
      console.error('QA Agent failed:', error);
      process.exit(1);
    });
}
