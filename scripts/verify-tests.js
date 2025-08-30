#!/usr/bin/env node

/**
 * Test Verification Script
 * Verifies that all automated tests are working correctly
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

class TestVerifier {
  constructor() {
    this.logger = require('./test-logger.js')
    this.passedTests = 0
    this.failedTests = 0
    this.totalTests = 0
  }

  log(message, level = 'INFO') {
    console.log(`[${new Date().toISOString()}] ${level}: ${message}`)
    this.logger.log(message, level)
  }

  runCommand(command, description) {
    this.log(`Running: ${description}`, 'INFO')

    try {
      const result = execSync(command, {
        encoding: 'utf8',
        timeout: 60000,
        stdio: 'pipe'
      })

      this.log(`✅ PASSED: ${description}`, 'SUCCESS')
      this.passedTests++
      return { success: true, output: result }
    } catch (error) {
      this.log(`❌ FAILED: ${description}`, 'ERROR')
      this.log(`Error: ${error.message}`, 'ERROR')
      this.failedTests++
      return { success: false, error: error.message }
    }
  }

  async verifyTests() {
    this.log('🧪 Starting Automated Test Verification...', 'INFO')

    const testSuites = [
      { cmd: 'npm run test:unit', desc: 'Unit Tests' },
      { cmd: 'npm run test:integration', desc: 'Integration Tests' },
      { cmd: 'npm run test:accessibility', desc: 'Accessibility Tests' },
      { cmd: 'npm run type-check', desc: 'TypeScript Compilation' },
      { cmd: 'npm run lint', desc: 'Code Linting' }
    ]

    for (const { cmd, desc } of testSuites) {
      this.totalTests++
      await this.runCommand(cmd, desc)
    }

    this.generateReport()
  }

  generateReport() {
    const successRate = this.totalTests > 0 ? ((this.passedTests / this.totalTests) * 100).toFixed(1) : '0'

    this.log('\n' + '='.repeat(60), 'INFO')
    this.log('📊 TEST VERIFICATION REPORT', 'INFO')
    this.log('='.repeat(60), 'INFO')
    this.log(`Total Tests: ${this.totalTests}`, 'INFO')
    this.log(`Passed: ${this.passedTests}`, 'SUCCESS')
    this.log(`Failed: ${this.failedTests}`, this.failedTests > 0 ? 'ERROR' : 'INFO')
    this.log(`Success Rate: ${successRate}%`, this.failedTests > 0 ? 'ERROR' : 'SUCCESS')
    this.log('='.repeat(60), 'INFO')

    if (this.failedTests === 0) {
      this.log('🎉 ALL TESTS PASSED! The testing system is working correctly.', 'SUCCESS')
    } else {
      this.log('⚠️  Some tests failed. Check the logs for details.', 'ERROR')
    }

    this.logger.generateSummary()
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new TestVerifier()
  verifier.verifyTests().catch(error => {
    console.error('Verification failed:', error)
    process.exit(1)
  })
}

module.exports = TestVerifier
