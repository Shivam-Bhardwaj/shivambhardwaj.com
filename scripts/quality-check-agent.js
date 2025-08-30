#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const net = require('net');

class QualityCheckAgent {
  constructor() {
    this.issues = [];
    this.port = null;
    this.baseUrl = null;
    this.sitemap = [];
    this.checkedUrls = new Set();
    this.devServerProcess = null;
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[level]}[${timestamp}] ${message}${colors.reset}`);
  }

  addIssue(type, severity, message, url = null, details = null) {
    this.issues.push({
      type,
      severity,
      message,
      url,
      details,
      timestamp: new Date().toISOString()
    });
    
    const severityColor = severity === 'high' ? 'error' : severity === 'medium' ? 'warning' : 'info';
    this.log(`${severity.toUpperCase()}: ${message}${url ? ` (${url})` : ''}`, severityColor);
  }

  async checkUrl(url) {
    return new Promise((resolve) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const req = client.request(url, { method: 'HEAD', timeout: 10000 }, (res) => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          url
        });
      });
      
      req.on('error', (error) => {
        resolve({
          status: 0,
          error: error.message,
          url
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({
          status: 0,
          error: 'Request timeout',
          url
        });
      });
      
      req.end();
    });
  }

  async discoverUrls() {
    this.log('Discovering URLs from built site...');
    
    const outDir = path.join(process.cwd(), 'out');
    if (!fs.existsSync(outDir)) {
      this.addIssue('build', 'high', 'Build output directory not found. Run npm run build first.');
      return [];
    }

    const urls = [];
    
    const scanDirectory = (dir, basePath = '') => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.join(basePath, item);
        
        if (fs.statSync(fullPath).isDirectory()) {
          scanDirectory(fullPath, relativePath);
        } else if (item === 'index.html') {
          const url = basePath ? `${this.baseUrl}/${basePath.replace(/\\/g, '/')}` : this.baseUrl;
          urls.push(url);
        } else if (item.endsWith('.html')) {
          const urlPath = relativePath.replace(/\\/g, '/').replace('.html', '');
          urls.push(`${this.baseUrl}/${urlPath}`);
        }
      }
    };
    
    scanDirectory(outDir);
    this.log(`Discovered ${urls.length} URLs`);
    return urls;
  }

  async extractLinksFromPage(url) {
    try {
      const response = await this.checkUrl(url);
      if (response.status !== 200) {
        return [];
      }

      const urlObj = new URL(url);
      const htmlPath = path.join(process.cwd(), 'out', 
        urlObj.pathname === '/' ? 'index.html' : `${urlObj.pathname.slice(1)}/index.html`);
      
      if (!fs.existsSync(htmlPath)) {
        return [];
      }

      const html = fs.readFileSync(htmlPath, 'utf8');
      const links = [];
      
      const linkRegex = /href\s*=\s*["']([^"']+)["']/gi;
      const srcRegex = /src\s*=\s*["']([^"']+)["']/gi;
      
      let match;
      
      while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1];
        if (!href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          links.push(href);
        }
      }
      
      while ((match = srcRegex.exec(html)) !== null) {
        const src = match[1];
        if (src.startsWith('http') || src.startsWith('/')) {
          links.push(src);
        }
      }
      
      return links;
    } catch (error) {
      this.addIssue('link-extraction', 'medium', `Failed to extract links from ${url}: ${error.message}`, url);
      return [];
    }
  }

  async checkBrokenLinks() {
    this.log('Starting broken link check...');
    
    const urls = await this.discoverUrls();
    const allLinks = new Set();
    
    for (const url of urls) {
      const links = await this.extractLinksFromPage(url);
      for (const link of links) {
        let fullUrl;
        try {
          if (link.startsWith('http')) {
            fullUrl = link;
          } else if (link.startsWith('/')) {
            fullUrl = `${this.baseUrl}${link}`;
          } else {
            const baseUrlObj = new URL(url);
            fullUrl = new URL(link, baseUrlObj).href;
          }
          allLinks.add({ url: fullUrl, source: url });
        } catch (error) {
          this.addIssue('link', 'medium', `Invalid URL format: ${link}`, url);
        }
      }
    }
    
    this.log(`Checking ${allLinks.size} unique links...`);
    
    const linkArray = Array.from(allLinks);
    const batchSize = 10;
    
    for (let i = 0; i < linkArray.length; i += batchSize) {
      const batch = linkArray.slice(i, i + batchSize);
      const promises = batch.map(({ url, source }) => 
        this.checkUrl(url).then(result => ({ ...result, source }))
      );
      
      const results = await Promise.all(promises);
      
      for (const result of results) {
        if (result.status === 0) {
          this.addIssue('link', 'high', `Broken link: ${result.error}`, result.url, { source: result.source });
        } else if (result.status >= 400) {
          this.addIssue('link', 'high', `HTTP ${result.status}`, result.url, { source: result.source });
        } else if (result.status >= 300 && result.status < 400) {
          this.addIssue('link', 'low', `Redirect ${result.status}`, result.url, { source: result.source });
        }
      }
    }
  }

  async runAccessibilityCheck() {
    this.log('Running accessibility checks...');
    try {
      execSync('npm run test:a11y', { stdio: 'inherit' });
      this.log('Accessibility checks passed', 'success');
    } catch (error) {
      this.addIssue('accessibility', 'high', 'Accessibility tests failed', null, { error: error.message });
    }
  }

  async runPerformanceCheck() {
    this.log('Running performance checks...');
    try {
      execSync('npm run test:performance', { stdio: 'inherit' });
      this.log('Performance checks passed', 'success');
    } catch (error) {
      this.addIssue('performance', 'medium', 'Performance tests failed', null, { error: error.message });
    }
  }

  async runSecurityCheck() {
    this.log('Running security checks...');
    try {
      execSync('npm run test:security', { stdio: 'inherit' });
      this.log('Security checks passed', 'success');
    } catch (error) {
      this.addIssue('security', 'high', 'Security tests failed', null, { error: error.message });
    }
  }

  async checkBuildHealth() {
    this.log('Checking build health...');
    
    const outDir = path.join(process.cwd(), 'out');
    if (!fs.existsSync(outDir)) {
      this.addIssue('build', 'high', 'Build output directory missing');
      return;
    }
    
    const requiredFiles = ['index.html', '_next'];
    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(outDir, file))) {
        this.addIssue('build', 'high', `Missing required build file: ${file}`);
      }
    }
    
    try {
      const stats = fs.statSync(path.join(outDir, 'index.html'));
      if (stats.size === 0) {
        this.addIssue('build', 'high', 'index.html is empty');
      }
    } catch (error) {
      this.addIssue('build', 'high', 'Cannot read index.html');
    }
  }

  async findAvailablePort(startPort = 3000) {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(startPort, () => {
        const port = server.address().port;
        server.close(() => resolve(port));
      });
      server.on('error', () => {
        resolve(this.findAvailablePort(startPort + 1));
      });
    });
  }

  async waitForServer(url, timeout = 30000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const result = await this.checkUrl(url);
        if (result.status === 200) {
          return true;
        }
      } catch (error) {
        // Server not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return false;
  }

  async startDevServer() {
    this.log('Finding available port...');
    this.port = await this.findAvailablePort(3000);
    this.baseUrl = `http://localhost:${this.port}`;
    this.log(`Using port ${this.port}`);
    
    return new Promise((resolve, reject) => {
      this.log('Starting development server...');
      
      const isWindows = process.platform === 'win32';
      const command = isWindows ? 'npm.cmd' : 'npm';
      
      this.devServerProcess = spawn(command, ['run', 'dev'], {
        env: { ...process.env, PORT: this.port.toString() },
        stdio: 'pipe',
        shell: isWindows
      });
      
      let serverOutput = '';
      
      this.devServerProcess.stdout.on('data', (data) => {
        serverOutput += data.toString();
        if (serverOutput.includes('Ready in') || serverOutput.includes('Local:')) {
          this.log('Development server started');
          this.waitForServer(this.baseUrl).then(ready => {
            if (ready) {
              this.log('Server is responding');
              resolve();
            } else {
              reject(new Error('Server failed to respond'));
            }
          });
        }
      });
      
      this.devServerProcess.stderr.on('data', (data) => {
        const error = data.toString();
        if (error.includes('EADDRINUSE') || error.includes('already in use')) {
          this.log(`Port ${this.port} in use, trying next port...`, 'warning');
          this.devServerProcess.kill();
          this.findAvailablePort(this.port + 1).then(newPort => {
            this.port = newPort;
            this.baseUrl = `http://localhost:${this.port}`;
            this.startDevServer().then(resolve).catch(reject);
          });
        }
      });
      
      this.devServerProcess.on('error', (error) => {
        reject(new Error(`Failed to start server: ${error.message}`));
      });
      
      setTimeout(() => {
        reject(new Error('Server startup timeout'));
      }, 30000);
    });
  }

  stopDevServer() {
    if (this.devServerProcess) {
      this.log('Stopping development server...');
      this.devServerProcess.kill('SIGTERM');
      this.devServerProcess = null;
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.issues.length,
        high: this.issues.filter(i => i.severity === 'high').length,
        medium: this.issues.filter(i => i.severity === 'medium').length,
        low: this.issues.filter(i => i.severity === 'low').length
      },
      issues: this.issues
    };
    
    const reportPath = path.join(process.cwd(), 'quality-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`Report saved to ${reportPath}`);
    return report;
  }

  printSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('QUALITY CHECK SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Issues: ${report.summary.total}`);
    console.log(`High Severity: ${report.summary.high}`);
    console.log(`Medium Severity: ${report.summary.medium}`);
    console.log(`Low Severity: ${report.summary.low}`);
    
    if (report.summary.high > 0) {
      console.log('\n🔴 HIGH PRIORITY ISSUES:');
      report.issues.filter(i => i.severity === 'high').forEach(issue => {
        console.log(`  • ${issue.message}${issue.url ? ` (${issue.url})` : ''}`);
      });
    }
    
    if (report.summary.medium > 0) {
      console.log('\n🟡 MEDIUM PRIORITY ISSUES:');
      report.issues.filter(i => i.severity === 'medium').forEach(issue => {
        console.log(`  • ${issue.message}${issue.url ? ` (${issue.url})` : ''}`);
      });
    }
    
    console.log('='.repeat(60));
    
    if (report.summary.high === 0) {
      console.log('✅ No critical issues found!');
    } else {
      console.log('❌ Critical issues found. Please review and fix.');
    }
  }

  async run() {
    this.log('Starting Quality Check Agent...');
    
    try {
      await this.checkBuildHealth();
      
      if (this.issues.filter(i => i.severity === 'high' && i.type === 'build').length === 0) {
        await this.startDevServer();
        
        await this.checkBrokenLinks();
        await this.runAccessibilityCheck();
        await this.runPerformanceCheck();
        await this.runSecurityCheck();
      }
      
      const report = this.generateReport();
      this.printSummary(report);
      
      process.exit(report.summary.high > 0 ? 1 : 0);
      
    } catch (error) {
      this.addIssue('system', 'high', `Agent error: ${error.message}`);
      const report = this.generateReport();
      this.printSummary(report);
      process.exit(1);
    } finally {
      this.stopDevServer();
    }
  }
}

if (require.main === module) {
  const agent = new QualityCheckAgent();
  agent.run();
}

module.exports = QualityCheckAgent;