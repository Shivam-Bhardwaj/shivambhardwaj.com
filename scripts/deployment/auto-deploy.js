#!/usr/bin/env node
/**
 * Comprehensive Deployment Automation System
 * Handles all aspects of deployment from testing to production release
 */
import { execSync, exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// ANSI Color Codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bg_red: '\x1b[41m',
  bg_green: '\x1b[42m',
  bg_yellow: '\x1b[43m',
  bg_blue: '\x1b[44m',
};

class DeploymentAutomator {
  constructor(options = {}) {
    this.projectRoot = projectRoot;
    this.options = {
      environment: 'production',
      skipTests: false,
      skipBuild: false,
      autoFix: true,
      createBranch: true,
      deployToVercel: true,
      rollbackOnFailure: true,
      ...options
    };
    this.deploymentId = `deploy-${Date.now()}`;
    this.logFile = path.join(this.projectRoot, 'logs', `deployment-${this.deploymentId}.log`);
    this.metrics = {
      startTime: Date.now(),
      testDuration: 0,
      buildDuration: 0,
      deployDuration: 0,
      totalDuration: 0,
      errors: [],
      warnings: [],
      fixes: []
    };
    this.dashboardData = {};
  }

  async log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const colorMap = {
      error: colors.red,
      warn: colors.yellow,
      info: colors.blue,
      success: colors.green,
      debug: colors.cyan
    };
    
    const coloredMessage = `${colorMap[level] || colors.white}[${timestamp}] ${level.toUpperCase()}: ${message}${colors.reset}`;
    console.log(coloredMessage);
    
    // Ensure logs directory exists
    await fs.mkdir(path.dirname(this.logFile), { recursive: true });
    await fs.appendFile(this.logFile, `[${timestamp}] ${level.toUpperCase()}: ${message}\n`);
    
    // Update dashboard data
    if (level === 'error') this.metrics.errors.push({ timestamp, message });
    if (level === 'warn') this.metrics.warnings.push({ timestamp, message });
  }

  async runCommand(command, description, options = {}) {
    const startTime = Date.now();
    await this.log(`Starting: ${description}`);
    await this.log(`Command: ${command}`, 'debug');
    
    return new Promise((resolve, reject) => {
      const child = exec(command, {
        cwd: this.projectRoot,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        ...options
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data;
        if (options.showOutput) process.stdout.write(data);
      });

      child.stderr?.on('data', (data) => {
        stderr += data;
        if (options.showOutput) process.stderr.write(data);
      });

      child.on('close', async (code) => {
        const duration = Date.now() - startTime;
        
        if (code === 0) {
          await this.log(`Completed: ${description} (${duration}ms)`, 'success');
          resolve({ stdout, stderr, code, duration });
        } else {
          await this.log(`Failed: ${description} (${duration}ms) - Exit code: ${code}`, 'error');
          if (stderr) await this.log(`Error output: ${stderr}`, 'error');
          reject(new Error(`Command failed: ${command}\nError: ${stderr}`));
        }
      });

      child.on('error', async (error) => {
        await this.log(`Command error: ${error.message}`, 'error');
        reject(error);
      });
    });
  }

  async checkPrerequisites() {
    await this.log('Checking prerequisites...', 'info');
    
    // Check Node.js version
    const nodeVersion = process.version;
    await this.log(`Node.js version: ${nodeVersion}`);
    
    // Check npm availability
    try {
      const { stdout } = await this.runCommand('npm --version', 'Check npm version');
      await this.log(`npm version: ${stdout.trim()}`);
    } catch (error) {
      throw new Error('npm is not available');
    }

    // Check package.json exists
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    try {
      await fs.access(packageJsonPath);
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      await this.log(`Project: ${packageJson.name} v${packageJson.version}`);
    } catch (error) {
      throw new Error('package.json not found or invalid');
    }

    // Check git status
    try {
      const { stdout } = await this.runCommand('git status --porcelain', 'Check git status');
      if (stdout.trim()) {
        await this.log('Working directory has uncommitted changes', 'warn');
        this.metrics.warnings.push({ 
          timestamp: new Date().toISOString(), 
          message: 'Uncommitted changes detected' 
        });
      }
    } catch (error) {
      await this.log('Git not available or not in a git repository', 'warn');
    }
  }

  async runTests() {
    if (this.options.skipTests) {
      await this.log('Skipping tests as requested', 'warn');
      return;
    }

    const testStartTime = Date.now();
    await this.log('Running comprehensive test suite...', 'info');

    try {
      // Run unit tests
      await this.runCommand('npm run test', 'Unit tests', { showOutput: true });
      
      // Run linting with auto-fix if enabled
      if (this.options.autoFix) {
        try {
          await this.runCommand('npm run lint:fix', 'Auto-fix linting issues');
          this.metrics.fixes.push({ 
            timestamp: new Date().toISOString(), 
            message: 'Applied automatic lint fixes' 
          });
        } catch (error) {
          await this.log('Auto-fix failed, running standard lint check', 'warn');
          await this.runCommand('npm run lint', 'Linting check', { showOutput: true });
        }
      } else {
        await this.runCommand('npm run lint', 'Linting check', { showOutput: true });
      }

      // Run type checking
      await this.runCommand('npm run type-check', 'TypeScript type checking', { showOutput: true });

      // Run security audit
      try {
        await this.runCommand('npm run security:audit', 'Security audit');
      } catch (error) {
        await this.log('Security audit failed, but continuing deployment', 'warn');
        this.metrics.warnings.push({ 
          timestamp: new Date().toISOString(), 
          message: 'Security audit failed' 
        });
      }

    } catch (error) {
      if (this.options.autoFix) {
        await this.log('Attempting automatic fixes...', 'warn');
        await this.attemptAutoFix();
        // Retry tests after auto-fix
        await this.runTests();
      } else {
        throw error;
      }
    } finally {
      this.metrics.testDuration = Date.now() - testStartTime;
    }
  }

  async attemptAutoFix() {
    await this.log('Attempting to automatically fix common issues...', 'info');
    
    try {
      // Fix unused variable warnings by adding underscore prefix
      await this.runCommand('npm run lint:fix', 'Apply ESLint auto-fixes');
      
      // Install missing dependencies
      await this.runCommand('npm install', 'Install/update dependencies');
      
      this.metrics.fixes.push({ 
        timestamp: new Date().toISOString(), 
        message: 'Applied automatic project fixes' 
      });
      
    } catch (error) {
      await this.log(`Auto-fix attempt failed: ${error.message}`, 'warn');
    }
  }

  async buildApplication() {
    if (this.options.skipBuild) {
      await this.log('Skipping build as requested', 'warn');
      return;
    }

    const buildStartTime = Date.now();
    await this.log('Building application...', 'info');

    try {
      // Clean previous build
      await this.runCommand('npm run clean', 'Clean previous build artifacts');
      
      // Build application
      await this.runCommand('npm run build', 'Build Next.js application', { showOutput: true });
      
      // Verify build output
      const buildDir = path.join(this.projectRoot, '.next');
      try {
        await fs.access(buildDir);
        await this.log('Build artifacts verified successfully', 'success');
      } catch (error) {
        throw new Error('Build artifacts not found after build completion');
      }

    } finally {
      this.metrics.buildDuration = Date.now() - buildStartTime;
    }
  }

  async createFeatureBranch() {
    if (!this.options.createBranch) {
      await this.log('Skipping branch creation as requested', 'warn');
      return null;
    }

    try {
      const branchName = `feature/auto-deploy-${Date.now()}`;
      await this.runCommand(`git checkout -b ${branchName}`, `Create feature branch: ${branchName}`);
      await this.log(`Created and switched to branch: ${branchName}`, 'success');
      return branchName;
    } catch (error) {
      await this.log('Failed to create feature branch, continuing with current branch', 'warn');
      return null;
    }
  }

  async commitAndPush(branchName) {
    try {
      // Stage all changes
      await this.runCommand('git add .', 'Stage all changes');
      
      // Create commit
      const commitMessage = `feat: Automated deployment ${this.deploymentId}

- Completed comprehensive test suite
- Built application successfully
- Applied automatic fixes where possible
- Ready for deployment

Generated with automated deployment system
Co-Authored-By: Deployment Bot <deploy@antimony-labs.com>`;

      await this.runCommand(`git commit -m "${commitMessage}"`, 'Commit changes');
      
      if (branchName) {
        await this.runCommand(`git push origin ${branchName}`, 'Push to remote repository');
        await this.log(`Pushed branch ${branchName} to remote`, 'success');
      }
    } catch (error) {
      await this.log(`Git operations failed: ${error.message}`, 'warn');
    }
  }

  async deployToVercel() {
    if (!this.options.deployToVercel) {
      await this.log('Skipping Vercel deployment as requested', 'warn');
      return null;
    }

    const deployStartTime = Date.now();
    await this.log('Deploying to Vercel...', 'info');

    try {
      // Check if vercel CLI is available
      try {
        await this.runCommand('vercel --version', 'Check Vercel CLI');
      } catch (error) {
        throw new Error('Vercel CLI not found. Please install: npm install -g vercel');
      }

      // Deploy to production
      const { stdout } = await this.runCommand('vercel --prod --yes', 'Deploy to Vercel production', { showOutput: true });
      
      // Extract deployment URL from output
      const urlMatch = stdout.match(/(https:\/\/[^\s]+)/);
      const deploymentUrl = urlMatch ? urlMatch[1] : null;
      
      if (deploymentUrl) {
        await this.log(`Deployment successful: ${deploymentUrl}`, 'success');
        
        // Verify deployment
        await this.verifyDeployment(deploymentUrl);
        
        return deploymentUrl;
      } else {
        throw new Error('Could not extract deployment URL from Vercel output');
      }

    } finally {
      this.metrics.deployDuration = Date.now() - deployStartTime;
    }
  }

  async verifyDeployment(url) {
    await this.log(`Verifying deployment health: ${url}`, 'info');
    
    try {
      // Wait a moment for deployment to be ready
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check if deployment is accessible
      const { stdout } = await this.runCommand(`curl -f -s -o /dev/null -w "%{http_code}" ${url}`, 'Health check');
      const statusCode = parseInt(stdout.trim());
      
      if (statusCode >= 200 && statusCode < 400) {
        await this.log('Deployment health check passed', 'success');
      } else {
        throw new Error(`Health check failed with status code: ${statusCode}`);
      }
      
    } catch (error) {
      await this.log(`Deployment verification failed: ${error.message}`, 'error');
      if (this.options.rollbackOnFailure) {
        await this.rollback();
      }
      throw error;
    }
  }

  async rollback() {
    await this.log('Initiating rollback procedure...', 'warn');
    
    try {
      // Get previous successful deployment
      const { stdout } = await this.runCommand('vercel ls --scope=team', 'List previous deployments');
      await this.log('Rollback would be initiated here (implementation depends on specific requirements)', 'warn');
      
    } catch (error) {
      await this.log(`Rollback failed: ${error.message}`, 'error');
    }
  }

  async generateReport() {
    this.metrics.totalDuration = Date.now() - this.metrics.startTime;
    
    const report = {
      deploymentId: this.deploymentId,
      timestamp: new Date().toISOString(),
      status: this.metrics.errors.length === 0 ? 'success' : 'failed',
      metrics: this.metrics,
      summary: {
        testsRun: !this.options.skipTests,
        buildCompleted: !this.options.skipBuild,
        deployed: this.options.deployToVercel,
        totalDuration: `${(this.metrics.totalDuration / 1000).toFixed(2)}s`,
        testDuration: `${(this.metrics.testDuration / 1000).toFixed(2)}s`,
        buildDuration: `${(this.metrics.buildDuration / 1000).toFixed(2)}s`,
        deployDuration: `${(this.metrics.deployDuration / 1000).toFixed(2)}s`
      }
    };

    // Save report
    const reportsDir = path.join(this.projectRoot, 'logs', 'reports');
    await fs.mkdir(reportsDir, { recursive: true });
    const reportFile = path.join(reportsDir, `deployment-report-${this.deploymentId}.json`);
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    
    await this.log(`Deployment report saved: ${reportFile}`, 'info');
    return report;
  }

  async execute() {
    try {
      await this.log(`Starting automated deployment ${this.deploymentId}`, 'info');
      await this.log('='.repeat(60), 'info');
      
      // Prerequisites
      await this.checkPrerequisites();
      
      // Create feature branch
      const branchName = await this.createFeatureBranch();
      
      // Run tests
      await this.runTests();
      
      // Build application
      await this.buildApplication();
      
      // Commit and push changes
      await this.commitAndPush(branchName);
      
      // Deploy to production
      const deploymentUrl = await this.deployToVercel();
      
      // Generate final report
      const report = await this.generateReport();
      
      await this.log('='.repeat(60), 'info');
      await this.log(`Deployment completed successfully! ${deploymentUrl || ''}`, 'success');
      await this.log(`Total duration: ${report.summary.totalDuration}`, 'info');
      
      return report;
      
    } catch (error) {
      await this.log(`Deployment failed: ${error.message}`, 'error');
      
      // Generate failure report
      const report = await this.generateReport();
      
      if (this.options.rollbackOnFailure) {
        await this.rollback();
      }
      
      throw error;
    }
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  const options = {
    environment: args.includes('--staging') ? 'staging' : 'production',
    skipTests: args.includes('--skip-tests'),
    skipBuild: args.includes('--skip-build'),
    autoFix: !args.includes('--no-auto-fix'),
    createBranch: !args.includes('--no-branch'),
    deployToVercel: !args.includes('--no-deploy'),
    rollbackOnFailure: !args.includes('--no-rollback'),
  };
  
  const deployer = new DeploymentAutomator(options);
  
  deployer.execute()
    .then((report) => {
      console.log('\n' + colors.bg_green + colors.bright + ' DEPLOYMENT SUCCESSFUL ' + colors.reset);
      console.log(JSON.stringify(report.summary, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n' + colors.bg_red + colors.bright + ' DEPLOYMENT FAILED ' + colors.reset);
      console.error(error.message);
      process.exit(1);
    });
}

export default DeploymentAutomator;