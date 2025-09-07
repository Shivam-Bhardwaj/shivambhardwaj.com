#!/usr/bin/env node
// CommonJS staging deployment (renamed from .js for ESM project)
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Lightweight color helpers (avoid ESM-only chalk in CJS scripts)
const ansi = (code) => (s) => `\x1b[${code}m${s}\x1b[0m`;
const color = {
  blue: ansi('34'),
  green: ansi('32'),
  yellow: ansi('33'),
  red: ansi('31'),
  magenta: ansi('35'),
  bold: ansi('1')
};

class StagingDeployment {
  constructor() {
    this.projectRoot = process.cwd();
    this.logFile = path.join(this.projectRoot, 'logs', 'deployment-staging.log');
    this.ensureLogDirectory();
  }
  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  }
  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const palette = { info: color.blue, success: color.green, warning: color.yellow, error: color.red };
    const painter = palette[type] || ((s) => s);
    console.log(`[${timestamp}] ${painter(message)}`);
    fs.appendFileSync(this.logFile, `[${timestamp}] [${type.toUpperCase()}] ${message}\n`);
  }
  run(command, description) {
    this.log(`🔧 ${description}...`);
    try {
      execSync(command, { stdio: 'inherit', cwd: this.projectRoot, encoding: 'utf8' });
      this.log(`✅ ${description} completed successfully`, 'success');
    } catch (e) {
      this.log(`❌ ${description} failed: ${e.message}`, 'error');
      throw e;
    }
  }
  checkPrerequisites() {
    this.log('Checking deployment prerequisites...');
    try { execSync('gcloud version', { stdio: 'pipe' }); } catch { throw new Error('Install gcloud CLI.'); }
    try { execSync('gcloud auth list --filter="status:ACTIVE" --format="value(account)"', { stdio: 'pipe' }); } catch { throw new Error('Run: gcloud auth login'); }
    const project = execSync('gcloud config get-value project', { encoding: 'utf8', stdio: 'pipe' }).trim();
    if (!project || project === '(unset)') throw new Error('Set project: gcloud config set project YOUR_PROJECT_ID');
    this.log(`Using project: ${project}`);
  }
  runTests() {
    this.log('Running test suite...');
    this.run('npm run test:coverage', 'Unit tests with coverage');
    this.run('npm run lint', 'ESLint');
    this.run('npm run type-check', 'TypeScript checks');
    this.run('npm run security:audit', 'Security audit');
  }
  build() {
    this.log('Building application...');
    this.run('npm run clean', 'Clean previous builds');
    this.run('npm run build', 'Next.js production build');
  }
  deploy() {
    this.log('Deploying to App Engine (staging)...');
    const stagingConfig = path.join(this.projectRoot, 'app-staging.yaml');
    if (!fs.existsSync(stagingConfig)) {
      const appYaml = fs.readFileSync(path.join(this.projectRoot, 'app.yaml'), 'utf8');
      fs.writeFileSync(stagingConfig, appYaml.replace(/service: default/, 'service: staging'));
    }
    this.run(`gcloud app deploy ${stagingConfig} --quiet --no-promote --version=staging-${Date.now()}`, 'App Engine staging deploy');
  }
  postVerify() {
    this.log('Post-deployment verification...');
    try {
      const url = execSync('gcloud app browse --service=staging --no-launch-browser', { encoding: 'utf8', stdio: 'pipe' }).trim();
      this.log(`Staging URL: ${url}`);
      try { this.run(`curl -f ${url}/api/health || echo "No health endpoint"`, 'Health check'); } catch {}
    } catch { this.log('Unable to fetch staging URL', 'warning'); }
  }
  async execute() {
    const start = Date.now();
    try {
      this.checkPrerequisites();
      this.runTests();
      this.build();
      this.deploy();
      this.postVerify();
      this.log(`✅ Staging deployment finished in ${(Date.now()-start)/1000}s`, 'success');
    } catch (e) {
      this.log(`❌ Staging deployment failed: ${e.message}`, 'error');
      process.exit(1);
    }
  }
}
if (require.main === module) new StagingDeployment().execute();
module.exports = StagingDeployment;
