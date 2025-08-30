#!/usr/bin/env node

/**
 * Simplified Firebase Deployment Script
 * 
 * Focuses on successful deployment with practical checks
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Simple console colors
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`, 
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  reset: '\x1b[0m'
};

class SimpleDeployer {
  constructor() {
    this.startTime = Date.now();
    this.deploymentId = `deploy-${Date.now()}`;
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    
    switch (level) {
      case 'error':
        console.error(colors.red(logMessage));
        break;
      case 'warn':
        console.warn(colors.yellow(logMessage));
        break;
      case 'success':
        console.log(colors.green(logMessage));
        break;
      case 'info':
      default:
        console.log(colors.blue(logMessage));
        break;
    }
  }

  async executeCommand(command, description, options = {}) {
    this.log(`🔄 ${description}...`);
    try {
      const result = execSync(command, {
        stdio: options.silent ? 'pipe' : 'inherit',
        encoding: 'utf8',
        cwd: process.cwd(),
        ...options
      });
      this.log(`✅ ${description} completed`, 'success');
      return result;
    } catch (error) {
      this.log(`❌ ${description} failed: ${error.message}`, 'error');
      if (!options.continueOnError) {
        throw new Error(`${description} failed`);
      }
      return null;
    }
  }

  async validateEnvironment() {
    this.log('🔍 Validating environment', 'info');
    
    // Check required files
    const requiredFiles = ['package.json', 'next.config.ts', 'firebase.json'];
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }

    // Check Firebase CLI
    try {
      await this.executeCommand('firebase --version', 'Check Firebase CLI', { silent: true });
    } catch (error) {
      throw new Error('Firebase CLI not installed. Run: npm install -g firebase-tools');
    }

    this.log('✅ Environment validation passed', 'success');
  }

  async runBuild() {
    this.log('🏗️ Building for production', 'info');

    // Clean previous build
    await this.executeCommand('npm run clean', 'Clean previous build', { continueOnError: true });

    // Run ESLint (allow warnings)
    await this.executeCommand('npm run lint', 'ESLint check', { continueOnError: true });

    // Production build (this is the critical step)
    await this.executeCommand('npm run build', 'Next.js production build');

    // Verify build output
    const buildDir = path.join(process.cwd(), 'out');
    if (!fs.existsSync(buildDir)) {
      throw new Error('Build output directory not found');
    }

    const indexFile = path.join(buildDir, 'index.html');
    if (!fs.existsSync(indexFile)) {
      throw new Error('index.html not generated');
    }

    this.log('✅ Production build completed', 'success');
  }

  async deployToFirebase() {
    this.log('🚀 Deploying to Firebase', 'info');

    // Check Firebase authentication
    try {
      await this.executeCommand('firebase projects:list', 'Verify Firebase auth', { silent: true });
    } catch (error) {
      throw new Error('Firebase authentication required. Run: firebase login');
    }

    // Deploy to Firebase
    await this.executeCommand('firebase deploy --only hosting', 'Deploy to Firebase Hosting');

    this.log('🎉 Deployment completed successfully!', 'success');
    this.log('🌐 Your site is live at: https://shivambhardwaj.com', 'success');
  }

  async runSecurityCheck() {
    this.log('🔒 Running security check', 'info');
    
    try {
      // Run basic npm audit (continue on issues)
      await this.executeCommand('npm audit --audit-level high', 'Security audit', { 
        continueOnError: true, 
        silent: true 
      });
      this.log('✅ Security check completed', 'success');
    } catch (error) {
      this.log('⚠️ Security audit found issues - review manually', 'warn');
    }
  }

  async deploy() {
    try {
      this.log(`🚀 Starting deployment: ${this.deploymentId}`, 'info');
      
      await this.validateEnvironment();
      await this.runSecurityCheck();
      await this.runBuild();
      await this.deployToFirebase();

      const duration = Math.round((Date.now() - this.startTime) / 1000);
      this.log(`🎯 Total deployment time: ${duration}s`, 'success');
      
      return {
        success: true,
        deploymentId: this.deploymentId,
        duration,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.log(`💥 Deployment failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Main execution
if (require.main === module) {
  const deployer = new SimpleDeployer();
  deployer.deploy().catch(error => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
}

module.exports = { SimpleDeployer };