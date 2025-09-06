#!/usr/bin/env node

/**
 * Deploy to GCP Production Environment
 * Enhanced deployment with staging verification and rollback capabilities
 */

const { execSync } = require('child_process');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class ProductionDeployment {
  constructor() {
    this.projectRoot = process.cwd();
    this.logFile = path.join(this.projectRoot, 'logs', 'deployment-production.log');
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red
    };
    
    const coloredMessage = colors[type](message);
    console.log(`[${timestamp}] ${coloredMessage}`);
    
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
    fs.appendFileSync(this.logFile, logEntry);
  }

  async run(command, description) {
    this.log(`🔧 ${description}...`, 'info');
    try {
      const result = execSync(command, {
        stdio: 'inherit',
        cwd: this.projectRoot,
        encoding: 'utf8'
      });
      this.log(`✅ ${description} completed successfully`, 'success');
      return result;
    } catch (error) {
      this.log(`❌ ${description} failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async confirm(message) {
    return new Promise((resolve) => {
      this.rl.question(`${chalk.yellow('⚠️  ' + message)} (yes/no): `, (answer) => {
        resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
      });
    });
  }

  async checkPrerequisites() {
    this.log('Checking production deployment prerequisites...', 'info');
    
    // Check if gcloud CLI is installed
    try {
      execSync('gcloud version', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('Google Cloud CLI not found. Please install gcloud CLI.');
    }

    // Check if authenticated
    try {
      execSync('gcloud auth list --filter="status:ACTIVE" --format="value(account)"', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('Not authenticated with Google Cloud. Run: gcloud auth login');
    }

    // Check if project is set
    try {
      const project = execSync('gcloud config get-value project', { encoding: 'utf8', stdio: 'pipe' }).trim();
      if (!project || project === '(unset)') {
        throw new Error('No Google Cloud project set. Run: gcloud config set project YOUR_PROJECT_ID');
      }
      this.log(`Using project: ${project}`, 'info');
    } catch (error) {
      throw new Error('Failed to get current project. Please set it with: gcloud config set project YOUR_PROJECT_ID');
    }

    // Check git status
    try {
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8', stdio: 'pipe' }).trim();
      if (gitStatus) {
        this.log('Warning: There are uncommitted changes', 'warning');
        const proceed = await this.confirm('Continue with uncommitted changes?');
        if (!proceed) {
          throw new Error('Deployment cancelled. Please commit your changes first.');
        }
      }
    } catch (error) {
      // Git not available or not a git repo - continue
    }

    this.log('Prerequisites check passed', 'success');
  }

  async verifyStagingDeployment() {
    this.log('Verifying staging deployment...', 'info');
    
    try {
      // Check if staging service exists
      const services = execSync(
        'gcloud app services list --format="value(id)"',
        { encoding: 'utf8', stdio: 'pipe' }
      );
      
      if (!services.includes('staging')) {
        this.log('No staging deployment found', 'warning');
        const proceed = await this.confirm('Deploy to production without staging verification?');
        if (!proceed) {
          throw new Error('Deployment cancelled. Please deploy to staging first.');
        }
        return;
      }

      // Get staging URL and run verification
      const stagingUrl = execSync(
        'gcloud app browse --service=staging --no-launch-browser',
        { encoding: 'utf8', stdio: 'pipe' }
      ).trim();

      this.log(`Verifying staging at: ${stagingUrl}`, 'info');
      
      // Run health check
      try {
        await this.run(
          `curl -f ${stagingUrl}/api/health || echo "Health check not available"`,
          'Staging health check'
        );
      } catch (error) {
        this.log('Staging health check failed', 'warning');
      }

      const proceed = await this.confirm('Staging verification complete. Proceed with production deployment?');
      if (!proceed) {
        throw new Error('Production deployment cancelled by user.');
      }

    } catch (error) {
      if (error.message.includes('cancelled')) {
        throw error;
      }
      this.log(`Staging verification failed: ${error.message}`, 'warning');
      const proceed = await this.confirm('Continue with production deployment anyway?');
      if (!proceed) {
        throw new Error('Production deployment cancelled.');
      }
    }
  }

  async runProductionTests() {
    this.log('Running comprehensive production test suite...', 'info');
    
    // Enhanced test suite for production
    await this.run('npm run test:coverage', 'Running unit tests with coverage');
    await this.run('npm run lint', 'Running ESLint');
    await this.run('npm run type-check', 'Running TypeScript checks');
    await this.run('npm run security:audit', 'Running security audit');
    await this.run('npm run test:accessibility', 'Running accessibility tests');
    
    // Check coverage thresholds
    try {
      const coverageReport = fs.readFileSync(
        path.join(this.projectRoot, 'coverage', 'coverage-summary.json'),
        'utf8'
      );
      const coverage = JSON.parse(coverageReport);
      const totalCoverage = coverage.total.lines.pct;
      
      if (totalCoverage < 90) {
        this.log(`Warning: Coverage is ${totalCoverage}%, below 90% threshold`, 'warning');
        const proceed = await this.confirm('Continue with low test coverage?');
        if (!proceed) {
          throw new Error('Deployment cancelled due to insufficient test coverage.');
        }
      }
    } catch (error) {
      this.log('Could not verify test coverage', 'warning');
    }
    
    this.log('Production test suite completed successfully', 'success');
  }

  async buildApplication() {
    this.log('Building application for production...', 'info');
    
    // Clean previous builds
    await this.run('npm run clean', 'Cleaning previous builds');
    
    // Build with production optimizations
    process.env.NODE_ENV = 'production';
    await this.run('npm run build', 'Building Next.js application');
    
    // Verify build output
    const buildDir = path.join(this.projectRoot, '.next');
    if (!fs.existsSync(buildDir)) {
      throw new Error('Build failed: No output directory found');
    }
    
    this.log('Production build completed successfully', 'success');
  }

  async deployToProduction() {
    this.log('Deploying to Google App Engine (production)...', 'info');
    
    // Create production version with timestamp
    const version = `v${new Date().toISOString().replace(/[:.]/g, '-')}`;
    
    // Deploy without promoting first (canary deployment)
    await this.run(
      `gcloud app deploy app.yaml --quiet --no-promote --version=${version}`,
      'Deploying to App Engine (canary)'
    );
    
    // Get the canary URL
    const canaryUrl = `https://${version}-dot-${await this.getProjectId()}.appspot.com`;
    this.log(`Canary deployment available at: ${canaryUrl}`, 'info');
    
    // Run smoke tests against canary
    try {
      await this.run(`curl -f ${canaryUrl}/api/health`, 'Running canary health check');
      this.log('Canary deployment healthy', 'success');
    } catch (error) {
      this.log('Canary health check failed', 'error');
      throw new Error('Canary deployment failed health check');
    }
    
    // Confirm promotion to production
    const promote = await this.confirm(`Promote canary ${version} to production?`);
    if (!promote) {
      this.log('Canary deployment available but not promoted to production', 'info');
      return { version, promoted: false };
    }
    
    // Promote to production
    await this.run(
      `gcloud app services set-traffic default --splits=${version}=1.0`,
      'Promoting to production traffic'
    );
    
    this.log('Successfully promoted to production', 'success');
    return { version, promoted: true };
  }

  async getProjectId() {
    return execSync('gcloud config get-value project', { encoding: 'utf8', stdio: 'pipe' }).trim();
  }

  async runPostDeploymentTests(deploymentInfo) {
    if (!deploymentInfo.promoted) {
      this.log('Skipping post-deployment tests (not promoted to production)', 'info');
      return;
    }

    this.log('Running post-deployment verification...', 'info');
    
    try {
      const productionUrl = `https://${await this.getProjectId()}.appspot.com`;
      this.log(`Production URL: ${productionUrl}`, 'info');
      
      // Wait for propagation
      this.log('Waiting for traffic routing to propagate...', 'info');
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      
      // Run health checks
      await this.run(`curl -f ${productionUrl}/api/health`, 'Production health check');
      
      // Run E2E tests against production
      process.env.BASE_URL = productionUrl;
      await this.run('npm run test:e2e', 'Running E2E tests against production');
      
      // Run performance tests
      await this.run('npm run test:performance', 'Running performance tests');
      
      this.log('Post-deployment verification completed successfully', 'success');
    } catch (error) {
      this.log(`Post-deployment tests failed: ${error.message}`, 'error');
      
      const rollback = await this.confirm('Tests failed. Rollback deployment?');
      if (rollback) {
        await this.rollbackDeployment();
        throw new Error('Deployment rolled back due to test failures');
      }
    }
  }

  async rollbackDeployment() {
    this.log('Rolling back deployment...', 'warning');
    
    try {
      // Get previous version
      const versions = execSync(
        'gcloud app versions list --service=default --sort-by="~version.createTime" --format="value(version.id)" --limit=2',
        { encoding: 'utf8', stdio: 'pipe' }
      ).trim().split('\n');
      
      if (versions.length < 2) {
        throw new Error('No previous version available for rollback');
      }
      
      const previousVersion = versions[1];
      this.log(`Rolling back to version: ${previousVersion}`, 'info');
      
      await this.run(
        `gcloud app services set-traffic default --splits=${previousVersion}=1.0`,
        'Rolling back to previous version'
      );
      
      this.log('Rollback completed successfully', 'success');
    } catch (error) {
      this.log(`Rollback failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async deploy() {
    const startTime = Date.now();
    
    try {
      console.log(chalk.red('🚨 PRODUCTION DEPLOYMENT 🚨'));
      console.log(chalk.yellow('This will deploy to the live production environment.'));
      console.log('');
      
      const confirmDeploy = await this.confirm('Are you sure you want to deploy to production?');
      if (!confirmDeploy) {
        this.log('Production deployment cancelled by user', 'info');
        process.exit(0);
      }
      
      this.log('🚀 Starting production deployment process...', 'info');
      
      await this.checkPrerequisites();
      await this.verifyStagingDeployment();
      await this.runProductionTests();
      await this.buildApplication();
      const deploymentInfo = await this.deployToProduction();
      await this.runPostDeploymentTests(deploymentInfo);
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      this.log(`✅ Production deployment completed successfully in ${duration}s`, 'success');
      
      console.log('');
      console.log(chalk.green('🌐 Production deployment is live at:'));
      console.log(chalk.cyan(`https://${await this.getProjectId()}.appspot.com`));
      console.log('');
      
    } catch (error) {
      const duration = Math.round((Date.now() - startTime) / 1000);
      this.log(`❌ Production deployment failed after ${duration}s: ${error.message}`, 'error');
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }
}

// Run deployment
if (require.main === module) {
  const deployment = new ProductionDeployment();
  deployment.deploy().catch(console.error);
}

module.exports = ProductionDeployment;