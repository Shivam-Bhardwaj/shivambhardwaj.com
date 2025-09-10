#!/usr/bin/env node
/**
 * Deployment Rollback System
 * Handles rollback scenarios and recovery procedures
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
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class RollbackManager {
  constructor(options = {}) {
    this.projectRoot = projectRoot;
    this.options = {
      rollbackType: 'git', // 'git' | 'vercel' | 'both'
      targetCommit: null,
      targetDeployment: null,
      createBackup: true,
      ...options
    };
    this.rollbackId = `rollback-${Date.now()}`;
    this.logFile = path.join(this.projectRoot, 'logs', `rollback-${this.rollbackId}.log`);
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
    
    const coloredMessage = `${colorMap[level] || colors.reset}[${timestamp}] ${level.toUpperCase()}: ${message}${colors.reset}`;
    console.log(coloredMessage);
    
    // Ensure logs directory exists
    await fs.mkdir(path.dirname(this.logFile), { recursive: true });
    await fs.appendFile(this.logFile, `[${timestamp}] ${level.toUpperCase()}: ${message}\n`);
  }

  async runCommand(command, description, options = {}) {
    await this.log(`Executing: ${description}`);
    await this.log(`Command: ${command}`, 'debug');
    
    return new Promise((resolve, reject) => {
      const child = exec(command, {
        cwd: this.projectRoot,
        maxBuffer: 10 * 1024 * 1024,
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
        if (code === 0) {
          await this.log(`Completed: ${description}`, 'success');
          resolve({ stdout, stderr, code });
        } else {
          await this.log(`Failed: ${description} - Exit code: ${code}`, 'error');
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

  async createBackup() {
    if (!this.options.createBackup) {
      await this.log('Skipping backup creation', 'warn');
      return null;
    }

    await this.log('Creating backup before rollback...', 'info');
    
    try {
      const backupBranch = `backup-before-rollback-${Date.now()}`;
      await this.runCommand(`git branch ${backupBranch}`, `Create backup branch: ${backupBranch}`);
      await this.log(`Backup created: ${backupBranch}`, 'success');
      return backupBranch;
    } catch (error) {
      await this.log(`Failed to create backup: ${error.message}`, 'warn');
      return null;
    }
  }

  async getLastKnownGoodCommit() {
    try {
      // Look for commits with deployment success markers
      const { stdout } = await this.runCommand(
        'git log --oneline --grep="deployment.*success\\|deploy.*success" -n 5',
        'Find recent successful deployments'
      );
      
      if (stdout.trim()) {
        const commits = stdout.trim().split('\n');
        const lastGoodCommit = commits[0].split(' ')[0];
        await this.log(`Found last known good commit: ${lastGoodCommit}`, 'info');
        return lastGoodCommit;
      }
      
      // Fallback: get commit from 1 hour ago
      const { stdout: fallbackCommit } = await this.runCommand(
        'git log --since="1 hour ago" --pretty=format:"%H" -n 1',
        'Find commit from 1 hour ago'
      );
      
      if (fallbackCommit.trim()) {
        await this.log(`Using fallback commit from 1 hour ago: ${fallbackCommit.trim()}`, 'warn');
        return fallbackCommit.trim();
      }
      
      throw new Error('No suitable rollback target found');
    } catch (error) {
      await this.log(`Failed to find rollback target: ${error.message}`, 'error');
      throw error;
    }
  }

  async rollbackGit(targetCommit) {
    await this.log(`Rolling back git to commit: ${targetCommit}`, 'info');
    
    try {
      // Stash any uncommitted changes
      try {
        await this.runCommand('git stash push -m "Pre-rollback stash"', 'Stash current changes');
      } catch (error) {
        await this.log('No changes to stash', 'debug');
      }
      
      // Reset to target commit
      await this.runCommand(`git reset --hard ${targetCommit}`, `Reset to commit ${targetCommit}`);
      
      // Verify the reset
      const { stdout } = await this.runCommand('git rev-parse HEAD', 'Verify current commit');
      const currentCommit = stdout.trim();
      
      if (currentCommit === targetCommit) {
        await this.log('Git rollback completed successfully', 'success');
        return true;
      } else {
        throw new Error(`Rollback verification failed. Expected ${targetCommit}, got ${currentCommit}`);
      }
    } catch (error) {
      await this.log(`Git rollback failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async getVercelDeployments() {
    try {
      const { stdout } = await this.runCommand('vercel ls --format=json', 'List Vercel deployments');
      const deployments = JSON.parse(stdout);
      
      // Filter for successful deployments
      const successfulDeployments = deployments.filter(d => d.state === 'READY');
      await this.log(`Found ${successfulDeployments.length} successful deployments`, 'info');
      
      return successfulDeployments;
    } catch (error) {
      await this.log(`Failed to get Vercel deployments: ${error.message}`, 'error');
      return [];
    }
  }

  async rollbackVercel(targetDeployment) {
    await this.log(`Rolling back Vercel to deployment: ${targetDeployment}`, 'info');
    
    try {
      // Promote the target deployment
      await this.runCommand(
        `vercel promote ${targetDeployment} --yes`,
        `Promote deployment ${targetDeployment}`
      );
      
      await this.log('Vercel rollback completed successfully', 'success');
      return true;
    } catch (error) {
      await this.log(`Vercel rollback failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async verifyRollback() {
    await this.log('Verifying rollback...', 'info');
    
    try {
      // Run quick tests to verify system health
      await this.runCommand('npm run test -- --run', 'Quick test verification');
      
      // Check build
      await this.runCommand('npm run build', 'Verify build after rollback');
      
      // Health check if URL is available
      try {
        const { stdout } = await this.runCommand('vercel ls --format=json', 'Get current deployment URL');
        const deployments = JSON.parse(stdout);
        const currentDeployment = deployments.find(d => d.state === 'READY');
        
        if (currentDeployment && currentDeployment.url) {
          await this.runCommand(
            `curl -f -s -o /dev/null -w "%{http_code}" https://${currentDeployment.url}`,
            'Health check rolled back deployment'
          );
        }
      } catch (error) {
        await this.log('Health check failed but continuing', 'warn');
      }
      
      await this.log('Rollback verification completed', 'success');
      return true;
    } catch (error) {
      await this.log(`Rollback verification failed: ${error.message}`, 'error');
      return false;
    }
  }

  async execute() {
    try {
      await this.log(`Starting rollback procedure ${this.rollbackId}`, 'info');
      await this.log('='.repeat(60), 'info');
      
      // Create backup
      const backupBranch = await this.createBackup();
      
      let gitRollbackSuccess = false;
      let vercelRollbackSuccess = false;
      
      // Git rollback
      if (this.options.rollbackType === 'git' || this.options.rollbackType === 'both') {
        const targetCommit = this.options.targetCommit || await this.getLastKnownGoodCommit();
        gitRollbackSuccess = await this.rollbackGit(targetCommit);
      }
      
      // Vercel rollback
      if (this.options.rollbackType === 'vercel' || this.options.rollbackType === 'both') {
        const deployments = await this.getVercelDeployments();
        const targetDeployment = this.options.targetDeployment || 
          (deployments.length > 1 ? deployments[1].uid : deployments[0]?.uid);
        
        if (targetDeployment) {
          vercelRollbackSuccess = await this.rollbackVercel(targetDeployment);
        } else {
          await this.log('No suitable Vercel deployment found for rollback', 'warn');
        }
      }
      
      // Verify rollback
      const verificationSuccess = await this.verifyRollback();
      
      const report = {
        rollbackId: this.rollbackId,
        timestamp: new Date().toISOString(),
        success: gitRollbackSuccess || vercelRollbackSuccess,
        gitRollback: gitRollbackSuccess,
        vercelRollback: vercelRollbackSuccess,
        verificationSuccess,
        backupBranch,
        options: this.options
      };
      
      // Save rollback report
      const reportsDir = path.join(this.projectRoot, 'logs', 'rollback-reports');
      await fs.mkdir(reportsDir, { recursive: true });
      const reportFile = path.join(reportsDir, `rollback-report-${this.rollbackId}.json`);
      await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
      
      await this.log('='.repeat(60), 'info');
      if (report.success) {
        await this.log('Rollback completed successfully', 'success');
      } else {
        await this.log('Rollback completed with issues', 'warn');
      }
      
      return report;
      
    } catch (error) {
      await this.log(`Rollback failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  const options = {
    rollbackType: args.includes('--git-only') ? 'git' : 
                  args.includes('--vercel-only') ? 'vercel' : 'both',
    targetCommit: args.find(arg => arg.startsWith('--commit='))?.split('=')[1],
    targetDeployment: args.find(arg => arg.startsWith('--deployment='))?.split('=')[1],
    createBackup: !args.includes('--no-backup'),
  };
  
  const rollback = new RollbackManager(options);
  
  rollback.execute()
    .then((report) => {
      console.log('\n' + colors.green + ' ROLLBACK COMPLETED ' + colors.reset);
      console.log(JSON.stringify(report, null, 2));
      process.exit(report.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n' + colors.red + ' ROLLBACK FAILED ' + colors.reset);
      console.error(error.message);
      process.exit(1);
    });
}

export default RollbackManager;