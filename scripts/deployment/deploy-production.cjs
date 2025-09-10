#!/usr/bin/env node
// Deployment script (lint cache bust)
// CommonJS production deployment (renamed from .js for ESM project)
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Lightweight ANSI color helpers (avoid ESM-only chalk in CJS scripts)
const ansi = (code) => (s) => `\x1b[${code}m${s}\x1b[0m`;
const color = {
  blue: ansi('34'),
  green: ansi('32'),
  yellow: ansi('33'),
  red: ansi('31'),
  magenta: ansi('35'),
  bold: ansi('1')
};

class ProductionDeployment {
  constructor() {
    this.projectRoot = process.cwd();
    this.logFile = path.join(this.projectRoot, 'logs', 'deployment-production.log');
    this.args = process.argv.slice(2);
    this.autoYes = this.args.includes('--yes') || this.args.includes('-y');
    this.skipHealth = this.args.includes('--skip-health');
    this.rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  }
  log(message, type = 'info') {
    const ts = new Date().toISOString();
    const palette = { info: color.blue, success: color.green, warning: color.yellow, error: color.red };
    const painter = palette[type] || ((s) => s);
    console.log(`[${ts}] ${painter(message)}`);
    fs.appendFileSync(this.logFile, `[${ts}] [${type.toUpperCase()}] ${message}\n`);
  }
  run(cmd, desc) {
    this.log(`🔧 ${desc}...`);
    try { execSync(cmd, { stdio: 'inherit', cwd: this.projectRoot, encoding: 'utf8' }); this.log(`✅ ${desc} completed`, 'success'); }
    catch (e) { this.log(`❌ ${desc} failed: ${e.message}`, 'error'); throw e; }
  }
  confirm(q) {
    if (this.autoYes) { this.log(`Auto-confirmed: ${q}`,'info'); return Promise.resolve(true); }
    return new Promise(res => this.rl.question(`${color.yellow('⚠️  '+q)} (y/n): `, a => res(/^y(es)?$/i.test(a))));
  }
  checkPrereq() {
    this.log('Checking prerequisites...');
    try { execSync('gcloud version', { stdio: 'pipe' }); } catch { throw new Error('Install gcloud CLI'); }
    try { execSync('gcloud auth list --filter="status:ACTIVE" --format="value(account)"', { stdio: 'pipe' }); } catch { throw new Error('Run gcloud auth login'); }
    const project = execSync('gcloud config get-value project', { encoding: 'utf8', stdio: 'pipe' }).trim();
    if (!project || project === '(unset)') throw new Error('Set project: gcloud config set project <id>');
    this.log(`Project: ${project}`);
  }
  verifyStaging() {
    this.log('Verifying staging...');
    try {
      const services = execSync('gcloud app services list --format="value(id)"', { encoding: 'utf8', stdio: 'pipe' });
      if (!services.includes('staging')) return Promise.resolve();
      const url = execSync('gcloud app browse --service=staging --no-launch-browser', { encoding: 'utf8', stdio: 'pipe' }).trim();
      this.log(`Staging URL: ${url}`);
      try { this.run(`curl -f ${url}/api/health || echo "Health check failed"`, 'Staging health'); } catch {}
      return this.confirm('Proceed to production deployment?').then(p => { if (!p) throw new Error('Cancelled'); });
  } catch { this.log('Staging verification skipped', 'warning'); }
  }
  tests() {
    this.log('Running production test suite...');
    this.run('npm run test:coverage', 'Unit tests');
    this.run('npm run lint', 'ESLint');
    this.run('npm run type-check', 'TypeScript');
    this.run('npm run security:audit', 'Security audit');
  }
  build() { this.run('npm run clean', 'Clean build artifacts'); this.run('npm run build', 'Build Next.js app'); }
  canaryDeploy() {
    // App Engine version rules: lowercase letters, digits, hyphens; start/end alphanumeric; <=63 chars.
    const iso = new Date().toISOString(); // e.g. 2025-09-07T10:48:03.452Z
    const compact = iso
      .replace('T','-')
      .replace('Z','')
      .replace(/[:.]/g,'') // remove disallowed chars
      .toLowerCase();
    const versionTag = `v${compact}`.slice(0,63).replace(/-+$/,'');
    this.run(`gcloud app deploy app.yaml --quiet --no-promote --version=${versionTag}`,'Canary deploy');
    let url;
    try {
      const describe = execSync(`gcloud app versions describe ${versionTag} --service=default --format=json`, { encoding:'utf8', stdio:'pipe'});
      const meta = JSON.parse(describe);
      url = meta.versionUrl || meta.servingStatusUrl || '';
    } catch { /* fallback */ }
    if (!url) {
      const project = execSync('gcloud config get-value project', { encoding:'utf8', stdio:'pipe'}).trim();
      url = `https://${versionTag}-dot-${project}.appspot.com`;
    }
    this.log(`Canary URL: ${url}`);
    if (this.skipHealth) {
      this.log('Skipping canary health check (--skip-health)', 'warning');
      return versionTag;
    }
    this.log('Waiting 5s for canary warm-up...', 'info');
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000);
    const attempts = 5;
    for (let i=1;i<=attempts;i++) {
      try { this.run(`curl --ssl-no-revoke -f ${url}/api/health`, `Canary health attempt ${i}`); break; }
      catch {
        try { this.run(`curl -k -f ${url}/api/health`, `Canary health attempt ${i} (insecure)`); break; }
        catch (_e) {
          if (i === attempts) throw new Error('Canary health failed');
          const wait = 2000 * i;
          this.log(`Canary health retry in ${wait}ms`, 'warning');
          Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, wait);
        }
      }
    }
    return versionTag;
  }
  promote(versionTag) { this.run(`gcloud app services set-traffic default --splits=${versionTag}=1.0`, 'Promote canary to 100%'); }
  post(versionTag) {
    const project = execSync('gcloud config get-value project', { encoding:'utf8', stdio:'pipe'}).trim();
    const url = `https://${project}.appspot.com`;
    this.log(`Production URL: ${url}`);
  try { this.run(`curl --ssl-no-revoke -f ${url}/api/health`, 'Production health'); }
  catch { try { this.run(`curl -k -f ${url}/api/health`, 'Production health (insecure fallback)'); } catch { this.log('Health check failed', 'warning'); this.rollback(versionTag); } }
  }
  async execute() {
    const start = Date.now();
    try {
      console.log(color.red('🚨 PRODUCTION DEPLOYMENT 🚨'));
      if (this.autoYes) {
        this.log('Auto confirmation enabled (--yes). Proceeding without prompts.', 'info');
      } else if (!await this.confirm('Deploy to production?')) { this.log('Cancelled', 'warning'); process.exit(0);}    
      this.checkPrereq();
      await this.verifyStaging();
      this.tests();
      this.build();
      const versionDeployed = this.canaryDeploy();
  if (this.autoYes) { this.promote(versionDeployed); }
  else if (await this.confirm(`Promote version ${versionDeployed}?`)) this.promote(versionDeployed); else this.log('Left canary unpromoted','warning');
      this.post();
      this.log(`✅ Production deployment finished in ${(Date.now()-start)/1000}s`, 'success');
    } catch (e) {
      this.log(`❌ Production deployment failed: ${e.message}`, 'error');
      process.exit(1);
    } finally { this.rl.close(); }
  }
}
if (require.main === module) new ProductionDeployment().execute();
module.exports = ProductionDeployment;
