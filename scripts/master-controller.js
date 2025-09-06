#!/usr/bin/env node

/**
 * Master Controller Script - Google Cloud Version
 * Enhanced version of the original master.bat with GCP integration
 * Provides comprehensive automation for development, testing, deployment, and monitoring
 */

import { execSync, spawn } from 'child_process';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
const chalk = {
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`
};

class MasterController {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.projectRoot = process.cwd();
    this.scriptsDir = path.join(this.projectRoot, 'scripts');
    this.logsDir = path.join(this.projectRoot, 'logs');
    
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
      debug: chalk.gray
    };
    
    const coloredMessage = colors[type] ? colors[type](message) : message;
    console.log(`[${timestamp}] ${coloredMessage}`);
    
    // Also log to file
    const logFile = path.join(this.logsDir, 'master-controller.log');
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
    fs.appendFileSync(logFile, logEntry);
  }

  async run(command, description, options = {}) {
    this.log(`🔧 ${description}...`, 'info');
    const result = execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      cwd: this.projectRoot,
      encoding: 'utf8',
      ...options
    });
    this.log(`✅ ${description} completed successfully`, 'success');
    return result;
  }

  async showMenu() {
    console.clear();
    console.log(chalk.cyan('===================================================='));
    console.log(chalk.cyan('         MASTER PROJECT CONTROLLER - GC'));
    console.log(chalk.cyan('        Shivam Bhardwaj Portfolio v1.0'));
    console.log(chalk.cyan('===================================================='));
    console.log('');
    console.log('Select an option:');
    console.log('');
    console.log('[1] Development       [D] Quick Dev Start');
    console.log('[2] Testing           [T] Quick Test Run');
    console.log('[3] Build and Deploy  [B] Quick Build      [G] GCP Deploy');
    console.log('[4] Code Quality      [L] Quick Lint       [P] Production Deploy');
    console.log('[5] Security          [S] Security Check   [R] Quick Deploy');
    console.log('[6] Monitoring        [M] View Logs        [I] Infrastructure');
    console.log('[7] Git Operations    [F] Git Status');
    console.log('[8] Help              [C] Claude Helper');
    console.log('[0] Exit              [Q] Quick Exit');
    console.log('');
    console.log('Quick Commands: D/T/B/L/S/M/F/C/Q/G/P/R/I (no Enter needed)');
    console.log('Menu Options: 0-8 (press Enter)');
    console.log('');
    
    return new Promise((resolve) => {
      this.rl.question('Select option: ', resolve);
    });
  }

  async developmentMenu() {
    console.clear();
    console.log(chalk.green('====== DEVELOPMENT MENU ======'));
    console.log('');
    console.log('[1] Start Dev Server (npm run dev)');
    console.log('[2] Start Production Server (npm run start)');
    console.log('[3] Open in Browser');
    console.log('[4] View Logs');
    console.log('[5] Type Check');
    console.log('[0] Back to Main Menu');
    console.log('');
    
    const choice = await new Promise((resolve) => {
      this.rl.question('Enter your choice: ', resolve);
    });

    switch (choice) {
      case '1':
        this.log('Starting development server...', 'info');
        await this.run('npm run dev', 'Start development server', { detached: true });
        setTimeout(() => {
          this.log('Opening browser...', 'info');
          this.openBrowser('http://localhost:3000');
        }, 3000);
        break;
      case '2':
        await this.run('npm run start', 'Start production server');
        break;
      case '3':
        this.openBrowser('http://localhost:3000');
        break;
      case '4':
        await this.viewLogs();
        break;
      case '5':
        await this.run('npm run type-check', 'TypeScript type checking');
        break;
      case '0':
        return;
      default:
        this.log('Invalid choice', 'warning');
    }
    
    await this.pause();
    return this.developmentMenu();
  }

  async testingMenu() {
    console.clear();
    console.log(chalk.green('====== TESTING MENU ======'));
    console.log('');
    console.log('[1] Run All Tests (npm run test:all)');
    console.log('[2] Unit Tests (npm run test)');
    console.log('[3] Watch Mode Tests (npm run test:watch)');
    console.log('[4] Coverage Report (npm run test:coverage)');
    console.log('[5] E2E Tests (npm run test:e2e)');
    console.log('[6] E2E UI Mode (npm run test:e2e:ui)');
    console.log('[7] Accessibility Tests (npm run test:accessibility)');
    console.log('[8] Performance Tests (npm run test:performance)');
    console.log('[9] Security Tests (npm run test:security)');
    console.log('[0] Back to Main Menu');
    console.log('');
    
    const choice = await new Promise((resolve) => {
      this.rl.question('Enter your choice: ', resolve);
    });

    const testCommands = {
      '1': ['npm run test:all', 'Running all tests'],
      '2': ['npm run test', 'Running unit tests'],
      '3': ['npm run test:watch', 'Starting test watch mode'],
      '4': ['npm run test:coverage', 'Generating coverage report'],
      '5': ['npm run test:e2e', 'Running E2E tests'],
      '6': ['npm run test:e2e:ui', 'Opening Playwright UI'],
      '7': ['npm run test:accessibility', 'Running accessibility tests'],
      '8': ['npm run test:performance', 'Running performance tests'],
      '9': ['npm run test:security', 'Running security tests'],
    };

    if (testCommands[choice]) {
      const [command, description] = testCommands[choice];
      await this.run(command, description);
    } else if (choice === '0') {
      return;
    } else {
      this.log('Invalid choice', 'warning');
    }
    
    await this.pause();
    return this.testingMenu();
  }

  async buildDeployMenu() {
    console.clear();
    console.log(chalk.green('====== BUILD & DEPLOY MENU ======'));
    console.log('');
    console.log('[1] Build for Production (npm run build)');
    console.log('[2] Clean Build Directories (npm run clean)');
    console.log('[3] Full Build Process (Clean + Build)');
    console.log('[4] Deploy to GCP Staging');
    console.log('[5] Deploy to GCP Production');
    console.log('[6] Serve Built Files Locally');
    console.log('[7] Infrastructure Plan');
    console.log('[8] Infrastructure Apply');
    console.log('[0] Back to Main Menu');
    console.log('');
    
    const choice = await new Promise((resolve) => {
      this.rl.question('Enter your choice: ', resolve);
    });

    switch (choice) {
      case '1':
        await this.run('npm run build', 'Building for production');
        break;
      case '2':
        await this.run('npm run clean', 'Cleaning build directories');
        break;
      case '3':
        await this.run('npm run clean', 'Cleaning directories');
        await this.run('npm run build', 'Building for production');
        break;
      case '4':
        await this.run('npm run deploy:staging', 'Deploying to GCP staging');
        break;
      case '5':
        await this.run('npm run deploy:production', 'Deploying to GCP production');
        break;
      case '6':
        await this.serveLocally();
        break;
      case '7':
        await this.run('npm run infrastructure:plan', 'Planning infrastructure changes');
        break;
      case '8':
        await this.run('npm run infrastructure:apply', 'Applying infrastructure changes');
        break;
      case '0':
        return;
      default:
        this.log('Invalid choice', 'warning');
    }
    
    await this.pause();
    return this.buildDeployMenu();
  }

  async qualityMenu() {
    console.clear();
    console.log(chalk.green('====== CODE QUALITY MENU ======'));
    console.log('');
    console.log('[1] Lint Code (npm run lint)');
    console.log('[2] Auto-fix Lint Issues (npm run lint:fix)');
    console.log('[3] Type Check (npm run type-check)');
    console.log('[4] Full Quality Check (Lint + Type Check)');
    console.log('[5] Security Audit');
    console.log('[0] Back to Main Menu');
    console.log('');
    
    const choice = await new Promise((resolve) => {
      this.rl.question('Enter your choice: ', resolve);
    });

    switch (choice) {
      case '1':
        await this.run('npm run lint', 'Running ESLint');
        break;
      case '2':
        await this.run('npm run lint:fix', 'Auto-fixing lint issues');
        break;
      case '3':
        await this.run('npm run type-check', 'Running TypeScript type check');
        break;
      case '4':
        await this.run('npm run lint', 'Running ESLint');
        await this.run('npm run type-check', 'Running TypeScript check');
        this.log('Quality check completed', 'success');
        break;
      case '5':
        await this.run('npm run security:audit', 'Running security audit');
        break;
      case '0':
        return;
      default:
        this.log('Invalid choice', 'warning');
    }
    
    await this.pause();
    return this.qualityMenu();
  }

  async securityMenu() {
    console.clear();
    console.log(chalk.green('====== SECURITY MENU ======'));
    console.log('');
    console.log('[1] Security Audit (npm run security:audit)');
    console.log('[2] Security Scan (npm run security:scan)');
    console.log('[3] Security Tests (npm run test:security)');
    console.log('[4] Full Security Check');
    console.log('[0] Back to Main Menu');
    console.log('');
    
    const choice = await new Promise((resolve) => {
      this.rl.question('Enter your choice: ', resolve);
    });

    switch (choice) {
      case '1':
        await this.run('npm audit --audit-level high', 'Running security audit');
        break;
      case '2':
        await this.run('npm run security:scan', 'Running security scan');
        break;
      case '3':
        await this.run('npm run test:security', 'Running security tests');
        break;
      case '4':
        await this.run('npm audit --audit-level high', 'Running security audit');
        await this.run('npm run security:scan', 'Running security scan');
        await this.run('npm run test:security', 'Running security tests');
        this.log('Security check completed', 'success');
        break;
      case '0':
        return;
      default:
        this.log('Invalid choice', 'warning');
    }
    
    await this.pause();
    return this.securityMenu();
  }

  async monitoringMenu() {
    console.clear();
    console.log(chalk.green('====== MONITORING MENU ======'));
    console.log('');
    console.log('[1] View Application Logs (GCP)');
    console.log('[2] Tail Live Logs');
    console.log('[3] View Local Logs');
    console.log('[4] Setup Dashboard');
    console.log('[5] Check Application Status');
    console.log('[0] Back to Main Menu');
    console.log('');
    
    const choice = await new Promise((resolve) => {
      this.rl.question('Enter your choice: ', resolve);
    });

    switch (choice) {
      case '1':
        await this.run('npm run logs:view', 'Viewing GCP application logs');
        break;
      case '2':
        await this.run('npm run logs:tail', 'Tailing live logs');
        break;
      case '3':
        await this.viewLogs();
        break;
      case '4':
        await this.run('npm run monitoring:dashboard', 'Setting up monitoring dashboard');
        break;
      case '5':
        await this.checkStatus();
        break;
      case '0':
        return;
      default:
        this.log('Invalid choice', 'warning');
    }
    
    await this.pause();
    return this.monitoringMenu();
  }

  async gitMenu() {
    console.clear();
    console.log(chalk.green('====== GIT OPERATIONS MENU ======'));
    console.log('');
    console.log('[1] Git Status');
    console.log('[2] Git Add All');
    console.log('[3] Git Commit');
    console.log('[4] Git Push');
    console.log('[5] Git Pull');
    console.log('[6] Git Log (last 5)');
    console.log('[7] Git Branch Info');
    console.log('[8] Quick Commit & Push');
    console.log('[0] Back to Main Menu');
    console.log('');
    
    const choice = await new Promise((resolve) => {
      this.rl.question('Enter your choice: ', resolve);
    });

    switch (choice) {
      case '1':
        await this.run('git status', 'Git Status');
        break;
      case '2':
        await this.run('git add .', 'Adding all changes');
        break;
      case '3':
        const commitMsg = await new Promise((resolve) => {
          this.rl.question('Enter commit message: ', resolve);
        });
        if (commitMsg.trim()) {
          await this.run(`git commit -m "${commitMsg}"`, 'Committing changes');
        } else {
          this.log('Commit message cannot be empty', 'warning');
        }
        break;
      case '4':
        await this.run('git push', 'Pushing to remote');
        break;
      case '5':
        await this.run('git pull', 'Pulling from remote');
        break;
      case '6':
        await this.run('git log --oneline -5', 'Last 5 commits');
        break;
      case '7':
        await this.run('git branch --show-current', 'Current branch');
        await this.run('git branch -a', 'All branches');
        break;
      case '8':
        const quickMsg = await new Promise((resolve) => {
          this.rl.question('Enter commit message: ', resolve);
        });
        if (quickMsg.trim()) {
          await this.run('git add .', 'Adding all changes');
          await this.run(`git commit -m "${quickMsg}"`, 'Committing changes');
          await this.run('git push', 'Pushing to remote');
          this.log('Quick commit and push completed', 'success');
        } else {
          this.log('Commit message cannot be empty', 'warning');
        }
        break;
      case '0':
        return;
      default:
        this.log('Invalid choice', 'warning');
    }
    
    await this.pause();
    return this.gitMenu();
  }

  async helpMenu() {
    console.clear();
    console.log(chalk.cyan('====== HELP & INFORMATION ======'));
    console.log('');
    console.log('This master controller provides access to all project operations:');
    console.log('');
    console.log('DEVELOPMENT: Start/stop dev servers, view in browser, type checking');
    console.log('TESTING: Comprehensive test suites (unit, e2e, a11y, performance, security)');
    console.log('BUILD & DEPLOY: Production builds, GCP deployment, infrastructure management');
    console.log('CODE QUALITY: Linting, type checking, automated fixes');
    console.log('SECURITY: Audits, scans, security tests');
    console.log('MONITORING: GCP logs, dashboards, application status');
    console.log('GIT OPERATIONS: Standard git workflow commands');
    console.log('');
    console.log('Project Structure:');
    console.log('- Next.js 15.4.5 with App Router and TypeScript');
    console.log('- Google Cloud Platform integration');
    console.log('- Comprehensive testing with Vitest and Playwright');
    console.log('- Structured logging with GCP Cloud Logging');
    console.log('- Infrastructure as Code with Terraform');
    console.log('');
    console.log('Key Features:');
    console.log('- Google Cloud deployment with auto-scaling');
    console.log('- 90% test coverage requirement');
    console.log('- WCAG accessibility compliance');
    console.log('- Performance monitoring with Core Web Vitals');
    console.log('- Comprehensive security scanning');
    console.log('- Real-time logging and monitoring');
    console.log('');
    console.log('For additional help: npm run master');
    console.log('');
    await this.pause();
  }

  // Utility methods
  openBrowser(url) {
    const platform = process.platform;
    const command = platform === 'darwin' ? 'open' :
                   platform === 'win32' ? 'start' : 'xdg-open';
    
    execSync(`${command} ${url}`, { stdio: 'ignore' });
    this.log(`Opening ${url} in browser`, 'info');
  }

  async viewLogs() {
    const logFiles = fs.readdirSync(this.logsDir).filter(f => f.endsWith('.log'));
    
    console.log('\nAvailable log files:');
    logFiles.forEach((file, index) => {
      console.log(`[${index + 1}] ${file}`);
    });

    const choice = await new Promise((resolve) => {
      this.rl.question('Select log file (or Enter for most recent): ', resolve);
    });

    const selectedFile = choice ? logFiles[parseInt(choice) - 1] : logFiles[logFiles.length - 1];
    
    const logPath = path.join(this.logsDir, selectedFile);
    const content = fs.readFileSync(logPath, 'utf8');
    console.log(content);
  }

  async serveLocally() {
    this.log('Starting local server...', 'info');
    await this.run('npm run start', 'Serving built files locally');
  }

  async checkStatus() {
    this.log('Project Status:', 'info');
    console.log('');
    
    await this.run('git status --porcelain', 'Git status', { silent: true });
    await this.run('node --version', 'Node.js version', { silent: true });
    await this.run('npm --version', 'NPM version', { silent: true });
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`Project: ${packageJson.name} v${packageJson.version}`);
    
    this.log('Status check completed', 'success');
  }

  async pause() {
    return new Promise((resolve) => {
      this.rl.question('\nPress Enter to continue...', resolve);
    });
  }

  // Quick commands
  async quickDev() {
    this.log('Starting development server...', 'info');
    spawn('npm', ['run', 'dev'], { stdio: 'inherit', detached: true });
    setTimeout(() => this.openBrowser('http://localhost:3000'), 3000);
  }

  async quickTest() {
    await this.run('npm run test:all', 'Running all tests');
  }

  async quickBuild() {
    await this.run('npm run build', 'Building for production');
  }

  async quickLint() {
    await this.run('npm run lint', 'Running lint check');
  }

  async quickSecurity() {
    await this.run('npm run security:audit', 'Running security audit');
  }

  async quickGcp() {
    await this.run('npm run deploy:staging', 'Deploying to GCP staging');
  }

  async quickProduction() {
    await this.run('npm run deploy:production', 'Deploying to GCP production');
  }

  async quickDeploy() {
    await this.run('npm run build', 'Building for production');
    await this.run('npm run deploy:staging', 'Quick deploying to GCP');
  }

  async quickInfrastructure() {
    await this.run('npm run infrastructure:plan', 'Planning infrastructure');
  }

  // Main execution loop
  async start() {
    this.log('Master Controller started', 'info');
    
    try {
      while (true) {
        const choice = await this.showMenu();

        switch (choice.toLowerCase()) {
          case '1': await this.developmentMenu(); break;
          case '2': await this.testingMenu(); break;
          case '3': await this.buildDeployMenu(); break;
          case '4': await this.qualityMenu(); break;
          case '5': await this.securityMenu(); break;
          case '6': await this.monitoringMenu(); break;
          case '7': await this.gitMenu(); break;
          case '8': await this.helpMenu(); break;
          case '0': case 'q': return this.exit();
          
          // Quick commands
          case 'd': await this.quickDev(); break;
          case 't': await this.quickTest(); break;
          case 'b': await this.quickBuild(); break;
          case 'l': await this.quickLint(); break;
          case 's': await this.quickSecurity(); break;
          case 'g': await this.quickGcp(); break;
          case 'p': await this.quickProduction(); break;
          case 'r': await this.quickDeploy(); break;
          case 'i': await this.quickInfrastructure(); break;
          case 'm': await this.run('npm run logs:tail', 'Viewing live logs'); break;
          case 'f': await this.run('git status', 'Git status'); break;
          case 'c': this.log('Claude helper would be integrated here', 'info'); break;
          
          default:
            this.log('Invalid choice! Please select a valid option.', 'warning');
        }
        
        if (!['d', 't', 'b', 'l', 's', 'g', 'p', 'r', 'i', 'm', 'f', 'c'].includes(choice.toLowerCase())) {
          await this.pause();
        }
      }
    } catch (error) {
      this.log(`Master Controller error: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  exit() {
    console.clear();
    console.log('');
    console.log(chalk.cyan('Thank you for using Master Controller!'));
    console.log(chalk.cyan('Shivam Bhardwaj Portfolio - GC Version'));
    console.log('');
    this.log('Master Controller stopped', 'info');
    this.rl.close();
    process.exit(0);
  }
}

// Run the master controller
const controller = new MasterController();
controller.start().catch(console.error);

export default MasterController;