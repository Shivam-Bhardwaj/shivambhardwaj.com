/**
 * Test Logging and Monitoring System
 * Provides comprehensive logging, error tracking, and debugging for automated tests
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class TestLogger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'test-logs')
    this.currentSession = new Date().toISOString().replace(/[:.]/g, '-')
    this.sessionDir = path.join(this.logDir, this.currentSession)
    this.ensureDirectories()
  }

  ensureDirectories() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true })
    }
  }

  log(message, level = 'INFO', context = {}) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      context,
      stack: level === 'ERROR' ? new Error().stack : undefined
    }

    // Console output with colors
    const colors = {
      INFO: '\x1b[36m',
      SUCCESS: '\x1b[32m',
      WARNING: '\x1b[33m',
      ERROR: '\x1b[31m',
      DEBUG: '\x1b[35m',
      reset: '\x1b[0m'
    }

    console.log(`${colors[level]}[${timestamp}] ${level}: ${message}${colors.reset}`)

    // File logging
    this.writeToFile('test-session.log', JSON.stringify(logEntry) + '\n')
  }

  writeToFile(filename, content) {
    const filePath = path.join(this.sessionDir, filename)
    fs.appendFileSync(filePath, content)
  }

  logTestStart(testName, testType) {
    this.log(`Starting ${testType} test: ${testName}`, 'INFO', { testName, testType })
  }

  logTestResult(testName, result, duration, error = null) {
    const level = result ? 'SUCCESS' : 'ERROR';
    const message = `${result ? 'PASSED' : 'FAILED'}: ${testName} (${duration}ms)`;

    const errorDetails = error ? {
      message: error.message,
      stack: error.stack,
      stdout: error.stdout?.toString(),
      stderr: error.stderr?.toString(),
    } : null;

    this.log(message, level, {
      testName,
      result,
      duration,
      error: errorDetails,
    });

    // Write detailed result to separate file
    const resultFile = `test-results-${testName.replace(/[^a-zA-Z0-9]/g, '-')}.json`;
    this.writeToFile(resultFile, JSON.stringify({
      testName,
      result,
      duration,
      timestamp: new Date().toISOString(),
      error: errorDetails,
    }, null, 2));
  }

  logSystemInfo() {
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd(),
      env: {
        CI: process.env.CI || 'false',
        NODE_ENV: process.env.NODE_ENV || 'development'
      },
      dependencies: this.getPackageInfo()
    }

    this.writeToFile('system-info.json', JSON.stringify(systemInfo, null, 2))
    this.log('System information logged', 'INFO', systemInfo)
  }

  getPackageInfo() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
      return {
        name: packageJson.name,
        version: packageJson.version,
        jest: packageJson.devDependencies?.jest,
        playwright: packageJson.devDependencies?.['@playwright/test'],
        react: packageJson.dependencies?.react
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  logCommand(command, description) {
    this.log(`Executing command: ${description}`, 'DEBUG', { command })
    return command
  }

  logPerformance(metric, value, unit = 'ms') {
    this.log(`Performance: ${metric} = ${value}${unit}`, 'INFO', { metric, value, unit })
  }

  generateSummary() {
    const summary = {
      sessionId: this.currentSession,
      timestamp: new Date().toISOString(),
      logFiles: fs.readdirSync(this.sessionDir),
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      duration: 0
    }

    // Parse log files to generate summary
    const logFile = path.join(this.sessionDir, 'test-session.log')
    if (fs.existsSync(logFile)) {
      const logs = fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean)
      logs.forEach(logLine => {
        try {
          const entry = JSON.parse(logLine)
          if (entry.message?.includes('PASSED') || entry.message?.includes('FAILED')) {
            summary.totalTests++
            if (entry.message?.includes('PASSED')) {
              summary.passedTests++
            } else {
              summary.failedTests++
            }
          }
        } catch (e) {
          // Skip malformed lines
        }
      })
    }

    this.writeToFile('test-summary.json', JSON.stringify(summary, null, 2))

    // Print summary to console
    console.log('\n' + '='.repeat(60))
    console.log('📊 TEST EXECUTION SUMMARY')
    console.log('='.repeat(60))
    console.log(`Session ID: ${summary.sessionId}`)
    console.log(`Total Tests: ${summary.totalTests}`)
    console.log(`Passed: ${summary.passedTests}`)
    console.log(`Failed: ${summary.failedTests}`)
    console.log(`Success Rate: ${summary.totalTests > 0 ? ((summary.passedTests / summary.totalTests) * 100).toFixed(1) : 0}%`)
    console.log('='.repeat(60))

    return summary
  }

  cleanupOldLogs(daysToKeep = 7) {
    try {
      const files = fs.readdirSync(this.logDir)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      files.forEach(file => {
        const filePath = path.join(this.logDir, file)
        const stats = fs.statSync(filePath)

        if (stats.isDirectory() && stats.mtime < cutoffDate) {
          fs.rmSync(filePath, { recursive: true, force: true })
          this.log(`Cleaned up old log directory: ${file}`, 'INFO')
        }
      })
    } catch (error) {
      this.log(`Failed to cleanup old logs: ${error.message}`, 'WARNING')
    }
  }
}

// Export singleton instance
module.exports = new TestLogger()
