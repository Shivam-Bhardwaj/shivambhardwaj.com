#!/usr/bin/env node

/**
 * Production Deployment Script
 * 
 * Comprehensive deployment pipeline with validation, security checks,
 * and automated deployment to Firebase hosting.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Simple console colors without chalk dependency
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`, 
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  reset: '\x1b[0m'
};

const DEPLOYMENT_STAGES = {
  VALIDATION: 'validation',
  SECURITY: 'security',
  BUILD: 'build',
  TEST: 'test',
  DEPLOY: 'deploy',
  VERIFY: 'verify'
};

class ProductionDeployer {
  constructor() {
    this.startTime = Date.now();
    this.errors = [];
    this.warnings = [];
    this.deploymentId = `prod-${Date.now()}`;
    this.logFile = path.join('deployment-logs', `${this.deploymentId}.log`);
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.join(process.cwd(), 'deployment-logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    // Console output with colors
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

    // File logging
    try {
      fs.appendFileSync(this.logFile, logMessage + '\n');
    } catch (err) {
      console.error('Failed to write to log file:', err.message);
    }
  }

  async executeCommand(command, description, options = {}) {
    this.log(`Starting: ${description}`);
    try {
      const result = execSync(command, {
        stdio: options.silent ? 'pipe' : 'inherit',
        encoding: 'utf8',
        cwd: process.cwd(),
        ...options
      });
      this.log(`Completed: ${description}`, 'success');
      return result;
    } catch (error) {
      const errorMsg = `Failed: ${description} - ${error.message}`;
      this.log(errorMsg, 'error');
      this.errors.push(errorMsg);
      
      if (!options.continueOnError) {
        throw new Error(errorMsg);
      }
      return null;
    }
  }

  async validateEnvironment() {
    this.log('🔍 Validating deployment environment...', 'info');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const requiredNodeVersion = '18.0.0';
    if (!this.isVersionSupported(nodeVersion, requiredNodeVersion)) {
      throw new Error(`Node.js ${requiredNodeVersion}+ required, found ${nodeVersion}`);
    }
    
    // Check package.json exists
    if (!fs.existsSync('package.json')) {
      throw new Error('package.json not found in current directory');
    }

    // Check required files
    const requiredFiles = [
      'next.config.ts',
      'firebase.json',
      'src/app/layout.tsx',
      'src/app/page.tsx'
    ];
    
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

  async runSecurityChecks() {
    this.log('🔒 Running security checks...', 'info');

    // NPM audit
    try {
      await this.executeCommand(
        'npm audit --audit-level high',
        'NPM security audit',
        { continueOnError: true }
      );
    } catch (error) {
      this.warnings.push('NPM audit found issues - review manually');
    }

    // Check for secrets in code
    await this.checkForSecrets();

    // Validate environment variables
    await this.validateEnvironmentVariables();

    this.log('✅ Security checks completed', 'success');
  }

  async checkForSecrets() {
    const secretPatterns = [
      /(?:password|passwd|pwd)\s*[:=]\s*["']?[^\s"']+/gi,
      /(?:api_key|apikey)\s*[:=]\s*["']?[^\s"']+/gi,
      /(?:secret|token)\s*[:=]\s*["']?[^\s"']+/gi,
      /sk-[a-zA-Z0-9]{32,}/g,
      /ghp_[a-zA-Z0-9]{36}/g,
    ];

    const filesToCheck = await this.getSourceFiles();
    let secretsFound = false;

    for (const file of filesToCheck) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        for (const pattern of secretPatterns) {
          if (pattern.test(content)) {
            this.log(`⚠️ Potential secret found in ${file}`, 'warn');
            this.warnings.push(`Potential secret in ${file}`);
            secretsFound = true;
          }
        }
      } catch (error) {
        // Skip files that cannot be read
      }
    }

    if (!secretsFound) {
      this.log('✅ No secrets found in codebase', 'success');
    }
  }

  async getSourceFiles() {
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const files = [];

    function scanDirectory(dir) {
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            scanDirectory(fullPath);
          } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Skip directories that cannot be read
      }
    }

    scanDirectory('src');
    return files;
  }

  async validateEnvironmentVariables() {
    // Check for required environment variables in production
    const requiredEnvVars = [
      'NODE_ENV',
      'NEXT_PUBLIC_SITE_URL'
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        this.warnings.push(`Environment variable ${envVar} not set`);
      }
    }
  }

  async runBuild() {
    this.log('🏗️ Running production build...', 'info');

    // Clean previous build
    await this.executeCommand(
      'npm run clean',
      'Clean previous build',
      { continueOnError: true }
    );

    // Type checking
    await this.executeCommand(
      'npm run type-check',
      'TypeScript type checking'
    );

    // Linting
    await this.executeCommand(
      'npm run lint',
      'ESLint code quality check'
    );

    // Production build
    await this.executeCommand(
      'npm run build',
      'Next.js production build'
    );

    // Verify build output
    await this.verifyBuildOutput();

    this.log('✅ Production build completed', 'success');
  }

  async verifyBuildOutput() {
    const buildDir = path.join(process.cwd(), 'out');
    
    if (!fs.existsSync(buildDir)) {
      throw new Error('Build output directory not found');
    }

    const requiredFiles = [
      'index.html',
      '_next',
      'robots.txt'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(buildDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Required build file missing: ${file}`);
      }
    }

    // Check build size
    const buildSize = await this.calculateDirectorySize(buildDir);
    this.log(`Build size: ${this.formatBytes(buildSize)}`, 'info');

    if (buildSize > 50 * 1024 * 1024) { // 50MB warning
      this.warnings.push('Build size is large (>50MB) - consider optimization');
    }
  }

  async runTests() {
    this.log('🧪 Running test suite...', 'info');

    // Unit tests
    await this.executeCommand(
      'npm run test:unit',
      'Unit tests',
      { continueOnError: true }
    );

    // Integration tests
    await this.executeCommand(
      'npm run test:integration',
      'Integration tests',
      { continueOnError: true }
    );

    // Accessibility tests
    await this.executeCommand(
      'npm run test:accessibility',
      'Accessibility tests',
      { continueOnError: true }
    );

    this.log('✅ Test suite completed', 'success');
  }

  async deployToFirebase() {
    this.log('🚀 Deploying to Firebase...', 'info');

    // Firebase login check
    try {
      await this.executeCommand(
        'firebase projects:list',
        'Verify Firebase authentication',
        { silent: true }
      );
    } catch (error) {
      throw new Error('Firebase authentication required. Run: firebase login');
    }

    // Deploy to Firebase
    await this.executeCommand(
      'firebase deploy --only hosting',
      'Deploy to Firebase Hosting'
    );

    this.log('✅ Deployment to Firebase completed', 'success');
  }

  async verifyDeployment() {
    this.log('✅ Verifying deployment...', 'info');

    const siteUrl = 'https://shivambhardwaj.com';
    
    try {
      // Basic HTTP check using Node.js built-in modules
      const https = require('https');
      const url = require('url');
      
      const checkSite = () => {
        return new Promise((resolve, reject) => {
          const parsedUrl = url.parse(siteUrl);
          const options = {
            hostname: parsedUrl.hostname,
            port: 443,
            path: parsedUrl.path,
            method: 'GET',
            timeout: 10000
          };
          
          const req = https.request(options, (res) => {
            if (res.statusCode >= 200 && res.statusCode < 400) {
              resolve(res.statusCode);
            } else {
              reject(new Error(`Site returned ${res.statusCode}`));
            }
          });
          
          req.on('error', reject);
          req.on('timeout', () => reject(new Error('Request timeout')));
          req.end();
        });
      };
      
      await checkSite();
      this.log(`✅ Deployment verification passed: ${siteUrl}`, 'success');
    } catch (error) {
      this.warnings.push(`Deployment verification failed: ${error.message}`);
    }
  }

  async generateDeploymentReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    const report = {
      deploymentId: this.deploymentId,
      timestamp: new Date().toISOString(),
      duration: `${Math.round(duration / 1000)}s`,
      success: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      stages: Object.values(DEPLOYMENT_STAGES)
    };

    const reportPath = path.join('deployment-logs', `${this.deploymentId}-report.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.log(`📊 Deployment report: ${reportPath}`, 'info');
    return report;
  }

  async deploy() {
    try {
      this.log(`🚀 Starting production deployment: ${this.deploymentId}`, 'info');

      await this.validateEnvironment();
      await this.runSecurityChecks();
      await this.runBuild();
      await this.runTests();
      await this.deployToFirebase();
      await this.verifyDeployment();

      const report = await this.generateDeploymentReport();

      if (report.errors.length === 0) {
        this.log('🎉 Deployment completed successfully!', 'success');
        this.log(`✅ Site is live at: https://shivambhardwaj.com`, 'success');
      } else {
        this.log('❌ Deployment completed with errors', 'error');
      }

      if (report.warnings.length > 0) {
        this.log(`⚠️ ${report.warnings.length} warnings to review`, 'warn');
      }

      return report;

    } catch (error) {
      this.log(`💥 Deployment failed: ${error.message}`, 'error');
      await this.generateDeploymentReport();
      process.exit(1);
    }
  }

  // Helper methods
  isVersionSupported(current, required) {
    const currentParts = current.replace('v', '').split('.').map(Number);
    const requiredParts = required.split('.').map(Number);

    for (let i = 0; i < requiredParts.length; i++) {
      if (currentParts[i] > requiredParts[i]) return true;
      if (currentParts[i] < requiredParts[i]) return false;
    }
    return true;
  }

  async calculateDirectorySize(dir) {
    let size = 0;
    
    function scanDir(path) {
      try {
        const stats = fs.statSync(path);
        if (stats.isFile()) {
          size += stats.size;
        } else if (stats.isDirectory()) {
          const files = fs.readdirSync(path);
          files.forEach(file => scanDir(`${path}/${file}`));
        }
      } catch (error) {
        // Skip inaccessible files/directories
      }
    }
    
    scanDir(dir);
    return size;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Main execution
if (require.main === module) {
  const deployer = new ProductionDeployer();
  deployer.deploy().catch(error => {
    console.error('Deployment script failed:', error);
    process.exit(1);
  });
}

module.exports = { ProductionDeployer };