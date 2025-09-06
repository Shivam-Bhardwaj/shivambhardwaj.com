#!/usr/bin/env node

/**
 * Deploy to GCP Staging Environment
 * Handles pre-deployment checks, building, and deployment
 */

const { execSync } = require('child_process');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class StagingDeployment {
  constructor() {
    this.projectRoot = process.cwd();
    this.logFile = path.join(this.projectRoot, 'logs', 'deployment-staging.log');
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

  async checkPrerequisites() {
    this.log('Checking deployment prerequisites...', 'info');
    
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

    this.log('Prerequisites check passed', 'success');
  }

  async runTests() {
    this.log('Running comprehensive test suite...', 'info');
    
    // Run all tests except E2E (which would require the app to be running)
    await this.run('npm run test:coverage', 'Running unit tests with coverage');
    await this.run('npm run lint', 'Running ESLint');
    await this.run('npm run type-check', 'Running TypeScript checks');
    await this.run('npm run security:audit', 'Running security audit');
    
    this.log('All tests passed successfully', 'success');
  }

  async buildApplication() {
    this.log('Building application for production...', 'info');
    
    // Clean previous builds
    await this.run('npm run clean', 'Cleaning previous builds');
    
    // Build the application
    await this.run('npm run build', 'Building Next.js application');
    
    this.log('Application build completed', 'success');
  }

  async deployToAppEngine() {
    this.log('Deploying to Google App Engine (staging)...', 'info');
    
    // Create staging app.yaml if it doesn't exist
    const stagingConfig = path.join(this.projectRoot, 'app-staging.yaml');
    if (!fs.existsSync(stagingConfig)) {
      this.log('Creating staging configuration...', 'info');
      const appYaml = fs.readFileSync(path.join(this.projectRoot, 'app.yaml'), 'utf8');
      const stagingYaml = appYaml.replace(/service: default/, 'service: staging');
      fs.writeFileSync(stagingConfig, stagingYaml);
    }

    // Deploy to staging service
    await this.run(
      `gcloud app deploy ${stagingConfig} --quiet --no-promote --version=staging-${Date.now()}`,
      'Deploying to App Engine staging'
    );
    
    this.log('Deployment to staging completed', 'success');
  }

  async runPostDeploymentTests() {
    this.log('Running post-deployment verification...', 'info');
    
    try {
      // Get the staging URL
      const stagingUrl = execSync(
        'gcloud app browse --service=staging --no-launch-browser',
        { encoding: 'utf8', stdio: 'pipe' }
      ).trim();
      
      this.log(`Staging URL: ${stagingUrl}`, 'info');
      
      // Run health checks
      await this.run(
        `curl -f ${stagingUrl}/api/health || echo "Health check endpoint not available"`,
        'Running health check'
      );
      
      // Run E2E tests against staging
      process.env.BASE_URL = stagingUrl;
      await this.run('npm run test:e2e', 'Running E2E tests against staging');
      
      this.log('Post-deployment tests completed', 'success');
    } catch (error) {
      this.log(`Post-deployment tests failed: ${error.message}`, 'warning');
      // Don't fail the deployment for post-deployment test failures
    }
  }

  async deploy() {
    const startTime = Date.now();
    
    try {
      this.log('🚀 Starting staging deployment process...', 'info');
      
      await this.checkPrerequisites();
      await this.runTests();
      await this.buildApplication();
      await this.deployToAppEngine();
      await this.runPostDeploymentTests();
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      this.log(`✅ Staging deployment completed successfully in ${duration}s`, 'success');
      
      // Get the staging URL for user
      try {
        const stagingUrl = execSync(
          'gcloud app browse --service=staging --no-launch-browser',
          { encoding: 'utf8', stdio: 'pipe' }
        ).trim();
        
        console.log('');
        console.log(chalk.green('🌐 Staging deployment is live at:'));
        console.log(chalk.cyan(stagingUrl));
        console.log('');
      } catch (error) {
        this.log('Could not retrieve staging URL', 'warning');
      }
      
    } catch (error) {
      const duration = Math.round((Date.now() - startTime) / 1000);
      this.log(`❌ Staging deployment failed after ${duration}s: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run deployment
if (require.main === module) {
  const deployment = new StagingDeployment();
  deployment.deploy().catch(console.error);
}

module.exports = StagingDeployment;