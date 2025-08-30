#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Robotics Portfolio
 * Enhanced with detailed logging and monitoring
 */

const { execSync, spawn } = require('child_process')
const path = require('path')
const logger = require('./test-logger.js')

class TestRunner {
  constructor() {
    this.results = {
      jest: null,
      playwright: null,
      accessibility: null,
      security: null,
      overall: false
    }
    this.startTime = Date.now()

    // Initialize logging
    logger.logSystemInfo()
    logger.cleanupOldLogs()
  }

  log(message, type = 'info') {
    const level = type.toUpperCase()
    logger.log(message, level)
  }

  async runCommand(command, description, options = {}) {
    const startTime = Date.now();
    logger.logTestStart(description, 'command');
    this.log(`Starting: ${description}`, 'info');

    return new Promise((resolve) => {
      const [cmd, ...args] = command.split(' ');
      const child = spawn(cmd, args, {
        shell: true, // Use shell to handle npm commands correctly
        ...options,
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        if (code === 0) {
          if (!options.silent) {
            console.log(stdout);
          }
          logger.logTestResult(description, true, duration);
          this.log(`✅ Completed: ${description}`, 'success');
          resolve({ success: true, output: stdout });
        } else {
          const error = new Error(`Command failed with code ${code}: ${command}`);
          error.stdout = stdout;
          error.stderr = stderr;

          if (!options.silent) {
            console.error('--- STDERR ---');
            console.error(stderr);
            console.log('----------------');
          }

          logger.logTestResult(description, false, duration, error);
          this.log(`❌ Failed: ${description}`, 'error');
          resolve({ success: false, error });
        }
      });

      child.on('error', (err) => {
        const duration = Date.now() - startTime;
        if (!options.silent) {
          console.error(`Failed to start command: ${command}`, err);
        }
        logger.logTestResult(description, false, duration, err);
        this.log(`❌ Failed to start: ${description}`, 'error');
        resolve({ success: false, error: err });
      });
    });
  }

  async runJestTests() {
    this.log('Running Jest unit and integration tests...', 'info')

    const testCommands = [
      { cmd: 'npm run test:unit', desc: 'Unit Tests' },
      { cmd: 'npm run test:integration', desc: 'Integration Tests' },
      { cmd: 'npm run test:accessibility', desc: 'Accessibility Tests' }
    ]

    const results = [];
    for (const { cmd, desc } of testCommands) {
      const result = await this.runCommand(cmd, desc); // Now async
      results.push({ ...result, name: desc });
    }

    const allPassed = results.every(r => r.success)
    this.results.jest = { success: allPassed, details: results }

    return allPassed
  }

  async runPlaywrightTests() {
    this.log('Running Playwright E2E tests...', 'info')

    const playwrightCommands = [
      { cmd: 'npm run test:e2e', desc: 'End-to-End Tests' },
      { cmd: 'npm run test:security', desc: 'Security Tests' },
      { cmd: 'npm run test:performance', desc: 'Performance Tests' }
    ]

    const results = [];
    for (const { cmd, desc } of playwrightCommands) {
      const result = await this.runCommand(cmd, desc); // Now async
      results.push({ ...result, name: desc });
    }

    const allPassed = results.every(r => r.success)
    this.results.playwright = { success: allPassed, details: results }

    return allPassed
  }

  async runAccessibilityTests() {
    this.log('Running accessibility tests...', 'info')

    // Run axe-core accessibility tests
    const result = await this.runCommand('npm run test:a11y', 'Accessibility Tests');
    this.results.accessibility = result

    return result.success
  }

  async runSecurityAudit() {
    this.log('Running security audit...', 'info')

    const result = await this.runCommand('npm run security:audit', 'Security Audit');
    this.results.security = result

    return result.success
  }

  generateReport() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2)
    logger.logPerformance('total_test_duration', duration, 's')

    console.log('\n' + '='.repeat(60))
    console.log('📊 TEST EXECUTION REPORT')
    console.log('='.repeat(60))

    const sections = [
      { name: 'Jest Tests', data: this.results.jest },
      { name: 'Playwright Tests', data: this.results.playwright },
      { name: 'Accessibility Tests', data: this.results.accessibility },
      { name: 'Security Audit', data: this.results.security }
    ]

    sections.forEach(({ name, data }) => {
      if (!data) {
        console.log(`❓ ${name}: Not executed`)
        return
      }

      const status = data.success ? '✅ PASSED' : '❌ FAILED'
      console.log(`${status} ${name}`)

      if (data.details && Array.isArray(data.details)) {
        data.details.forEach(detail => {
          const detailStatus = detail.success ? '✅' : '❌'
          console.log(`   ${detailStatus} ${detail.name}`)
        })
      }
    })

    console.log('\n📊 SUMMARY:')
    console.log(`⏱️  Total Duration: ${duration}s`)

    const allTestsPassed = Object.values(this.results).every(result =>
      result === null || result.success
    )

    this.results.overall = allTestsPassed

    if (allTestsPassed) {
      console.log('🎉 ALL TESTS PASSED!')
    } else {
      console.log('⚠️  SOME TESTS FAILED - Check logs for details')
    }

    console.log('='.repeat(60))

    // Generate detailed summary with logger
    logger.generateSummary()

    return this.results.overall
  }

  async runAllTests() {
    this.log('🚀 Starting comprehensive test suite...', 'info')

    try {
      // Run tests sequentially to avoid race conditions and resource contention
      await this.runJestTests();
      await this.runPlaywrightTests();
      await this.runAccessibilityTests();
      await this.runSecurityAudit();

      // Generate final report
      this.generateReport()

      // Exit with appropriate code
      const exitCode = this.results.overall ? 0 : 1
      process.exit(exitCode)

    } catch (error) {
      this.log(`💥 Test execution failed: ${error.message}`, 'error')
      process.exit(1)
    }
  }

  async runQuickTests() {
    this.log('⚡ Running quick test suite...', 'info')

    const quickTests = [
      { cmd: 'npm run test:unit', desc: 'Unit Tests' },
      { cmd: 'npm run type-check', desc: 'TypeScript Check' },
      { cmd: 'npm run lint', desc: 'Lint Check' }
    ]

    let allPassed = true;
    for (const { cmd, desc } of quickTests) {
      const result = await this.runCommand(cmd, desc); // Now async
      if (!result.success) {
        allPassed = false;
      }
    }

    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2)
    console.log(`\n⏱️  Quick tests completed in ${duration}s`)

    if (allPassed) {
      console.log('✅ All quick tests passed!')
    } else {
      console.log('❌ Some quick tests failed')
    }

    process.exit(allPassed ? 0 : 1)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const testRunner = new TestRunner()

if (args.includes('--quick') || args.includes('-q')) {
  testRunner.runQuickTests()
} else {
  testRunner.runAllTests()
}
