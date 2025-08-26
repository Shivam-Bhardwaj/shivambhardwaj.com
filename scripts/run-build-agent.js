/**
 * Simple runner for Build Agent - JavaScript wrapper
 */

const { execSync } = require('child_process');
const { readdirSync, statSync, existsSync, readFileSync } = require('fs');
const { join } = require('path');

class SimpleBuildAgent {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.results = [];
    this.warnings = [];
    this.buildStartTime = 0;
  }

  async runBuildVerification() {
    console.log('🏗️ Starting Build Agent verification...\n');
    this.results = [];
    this.warnings = [];

    // Pre-build checks
    await this.checkPrerequisites();
    await this.cleanPreviousBuild();
    await this.runTypeChecking();
    
    // Build process
    await this.runProductionBuild();
    
    // Post-build validation
    await this.validateStaticExport();
    await this.checkBuildWarnings();
    await this.validatePages();
    await this.checkBundleSize();

    return this.generateReport();
  }

  async checkPrerequisites() {
    const startTime = Date.now();
    try {
      console.log('✅ Checking prerequisites...');
      
      // Check Node version
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      
      if (majorVersion < 18) {
        throw new Error(`Node.js version ${nodeVersion} is below required v18+`);
      }

      // Check package.json exists
      const packageJsonPath = join(this.projectRoot, 'package.json');
      if (!existsSync(packageJsonPath)) {
        throw new Error('package.json not found');
      }

      // Check dependencies are installed
      const nodeModulesPath = join(this.projectRoot, 'node_modules');
      if (!existsSync(nodeModulesPath)) {
        console.log('📦 Installing dependencies...');
        execSync('npm install', { 
          cwd: this.projectRoot,
          stdio: 'pipe'
        });
      }

      this.results.push({
        name: 'Prerequisites',
        passed: true,
        message: `Prerequisites validated (Node ${nodeVersion})`,
        duration: Date.now() - startTime,
        details: { nodeVersion, dependenciesInstalled: true }
      });
    } catch (error) {
      this.results.push({
        name: 'Prerequisites',
        passed: false,
        message: `Prerequisites check failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  async cleanPreviousBuild() {
    const startTime = Date.now();
    try {
      console.log('🧹 Cleaning previous build...');
      execSync('npm run clean', { 
        cwd: this.projectRoot,
        stdio: 'pipe'
      });
      
      this.results.push({
        name: 'Clean Build',
        passed: true,
        message: 'Previous build artifacts cleaned successfully',
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.results.push({
        name: 'Clean Build',
        passed: false,
        message: `Clean build failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  async runTypeChecking() {
    const startTime = Date.now();
    try {
      console.log('📝 Running type checking...');
      const output = execSync('npm run type-check', { 
        cwd: this.projectRoot,
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      // Check for type errors in output
      if (output.includes('error TS')) {
        throw new Error('TypeScript type errors found');
      }
      
      this.results.push({
        name: 'Type Checking',
        passed: true,
        message: 'All TypeScript types validated successfully',
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.results.push({
        name: 'Type Checking',
        passed: false,
        message: `Type checking failed: ${error.message}`,
        duration: Date.now() - startTime,
        details: error.stdout?.toString() || error.stderr?.toString()
      });
    }
  }

  async runProductionBuild() {
    this.buildStartTime = Date.now();
    try {
      console.log('🔨 Running production build...');
      const output = execSync('npm run build', { 
        cwd: this.projectRoot,
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      const buildTime = Date.now() - this.buildStartTime;
      
      // Parse build output for warnings
      const lines = output.split('\n');
      const warningLines = lines.filter(line => 
        line.includes('Warning:') || 
        line.includes('warn') || 
        line.includes('WARN')
      );
      
      this.warnings.push(...warningLines);
      
      this.results.push({
        name: 'Production Build',
        passed: true,
        message: `Build completed successfully in ${buildTime}ms`,
        duration: buildTime,
        details: { 
          warnings: warningLines.length,
          buildOutput: output.split('\n').slice(-10) // Last 10 lines
        }
      });
    } catch (error) {
      this.results.push({
        name: 'Production Build',
        passed: false,
        message: `Production build failed: ${error.message}`,
        duration: Date.now() - this.buildStartTime,
        details: error.stdout?.toString() || error.stderr?.toString()
      });
    }
  }

  async validateStaticExport() {
    const startTime = Date.now();
    try {
      console.log('📦 Validating static export...');
      
      const outDir = join(this.projectRoot, 'out');
      
      if (!existsSync(outDir)) {
        throw new Error('Output directory /out not found');
      }

      // Check for required files
      const requiredFiles = [
        'index.html',
        '_next/static',
        'favicon.ico'
      ];

      const missingFiles = requiredFiles.filter(file => 
        !existsSync(join(outDir, file))
      );

      if (missingFiles.length > 0) {
        throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
      }

      // Count generated pages
      const htmlFiles = this.getFilesRecursively(outDir, '.html');
      const jsFiles = this.getFilesRecursively(outDir, '.js');
      const cssFiles = this.getFilesRecursively(outDir, '.css');

      this.results.push({
        name: 'Static Export Validation',
        passed: true,
        message: `Static export validated successfully`,
        duration: Date.now() - startTime,
        details: {
          htmlFiles: htmlFiles.length,
          jsFiles: jsFiles.length,
          cssFiles: cssFiles.length,
          totalAssets: htmlFiles.length + jsFiles.length + cssFiles.length
        }
      });
    } catch (error) {
      this.results.push({
        name: 'Static Export Validation',
        passed: false,
        message: `Static export validation failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  async checkBuildWarnings() {
    const startTime = Date.now();
    try {
      console.log('⚠️ Checking build warnings...');
      
      const criticalWarnings = this.warnings.filter(warning =>
        warning.toLowerCase().includes('error') ||
        warning.toLowerCase().includes('failed') ||
        warning.toLowerCase().includes('critical')
      );

      const passed = criticalWarnings.length === 0;
      
      this.results.push({
        name: 'Build Warnings',
        passed,
        message: passed 
          ? `${this.warnings.length} warnings found (none critical)`
          : `${criticalWarnings.length} critical warnings found`,
        duration: Date.now() - startTime,
        details: {
          totalWarnings: this.warnings.length,
          criticalWarnings: criticalWarnings.length,
          warnings: this.warnings.slice(0, 5) // First 5 warnings
        }
      });
    } catch (error) {
      this.results.push({
        name: 'Build Warnings',
        passed: false,
        message: `Warning check failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  async validatePages() {
    const startTime = Date.now();
    try {
      console.log('📄 Validating pages...');
      
      const outDir = join(this.projectRoot, 'out');
      const expectedPages = [
        'index.html',
        'projects.html',
        'experience.html',
        'skills.html',
        'contact.html',
        'learning.html',
        'calculators.html',
        'swarm.html',
        'robot-test.html',
        'swarm-test.html',
        'styleguide.html',
        '404.html'
      ];

      const missingPages = expectedPages.filter(page => 
        !existsSync(join(outDir, page))
      );

      // Check page content is not empty
      const emptyPages = [];
      for (const page of expectedPages) {
        const pagePath = join(outDir, page);
        if (existsSync(pagePath)) {
          const content = readFileSync(pagePath, 'utf8');
          if (content.length < 100) { // Very basic check
            emptyPages.push(page);
          }
        }
      }

      const passed = missingPages.length === 0 && emptyPages.length === 0;
      
      this.results.push({
        name: 'Page Validation',
        passed,
        message: passed 
          ? `All ${expectedPages.length} pages generated successfully`
          : `Issues found: ${missingPages.length} missing, ${emptyPages.length} empty`,
        duration: Date.now() - startTime,
        details: {
          totalPages: expectedPages.length,
          missingPages,
          emptyPages,
          generatedPages: expectedPages.length - missingPages.length
        }
      });
    } catch (error) {
      this.results.push({
        name: 'Page Validation',
        passed: false,
        message: `Page validation failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  async checkBundleSize() {
    const startTime = Date.now();
    try {
      console.log('📊 Checking bundle size...');
      
      const outDir = join(this.projectRoot, 'out');
      const totalSize = this.getDirectorySize(outDir);
      const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

      // Check if size is reasonable (under 50MB for static site)
      const sizeWarningThreshold = 50 * 1024 * 1024; // 50MB
      const sizeCriticalThreshold = 100 * 1024 * 1024; // 100MB

      let passed = true;
      let message = `Total bundle size: ${totalSizeMB}MB`;

      if (totalSize > sizeCriticalThreshold) {
        passed = false;
        message += ' (CRITICAL: Over 100MB)';
      } else if (totalSize > sizeWarningThreshold) {
        this.warnings.push(`Bundle size ${totalSizeMB}MB exceeds recommended 50MB`);
        message += ' (WARNING: Over 50MB)';
      }

      this.results.push({
        name: 'Bundle Size Check',
        passed,
        message,
        duration: Date.now() - startTime,
        details: {
          totalSizeBytes: totalSize,
          totalSizeMB: parseFloat(totalSizeMB),
          warningThresholdMB: 50,
          criticalThresholdMB: 100
        }
      });
    } catch (error) {
      this.results.push({
        name: 'Bundle Size Check',
        passed: false,
        message: `Bundle size check failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  getFilesRecursively(dir, extension) {
    if (!existsSync(dir)) return [];
    
    let files = [];
    
    try {
      const items = readdirSync(dir);
      
      for (const item of items) {
        const itemPath = join(dir, item);
        const stat = statSync(itemPath);
        
        if (stat.isDirectory()) {
          files = files.concat(this.getFilesRecursively(itemPath, extension));
        } else if (!extension || item.endsWith(extension)) {
          files.push(itemPath);
        }
      }
    } catch (error) {
      // Ignore access errors
    }
    
    return files;
  }

  getDirectorySize(dir) {
    if (!existsSync(dir)) return 0;
    
    let size = 0;
    
    try {
      const items = readdirSync(dir);
      
      for (const item of items) {
        const itemPath = join(dir, item);
        const stat = statSync(itemPath);
        
        if (stat.isDirectory()) {
          size += this.getDirectorySize(itemPath);
        } else {
          size += stat.size;
        }
      }
    } catch (error) {
      // Ignore access errors
    }
    
    return size;
  }

  generateReport() {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.length - passed;
    const buildSuccess = failed === 0;

    // Calculate build stats
    const outDir = join(this.projectRoot, 'out');
    const outputSize = existsSync(outDir) ? this.getDirectorySize(outDir) : 0;
    const htmlFiles = existsSync(outDir) ? this.getFilesRecursively(outDir, '.html') : [];
    const allFiles = existsSync(outDir) ? this.getFilesRecursively(outDir) : [];

    const report = {
      timestamp: new Date().toISOString(),
      buildSuccess,
      totalChecks: this.results.length,
      passed,
      failed,
      warnings: this.warnings,
      results: this.results,
      buildStats: {
        buildTime: this.buildStartTime > 0 ? Date.now() - this.buildStartTime : 0,
        outputSize,
        pageCount: htmlFiles.length,
        assetCount: allFiles.length - htmlFiles.length
      },
      summary: buildSuccess 
        ? `🎉 Build verification passed! ${this.results.length} checks completed successfully.`
        : `❌ Build verification failed! ${failed} of ${this.results.length} checks failed.`
    };

    this.printReport(report);
    return report;
  }

  printReport(report) {
    console.log('\n' + '='.repeat(60));
    console.log('🏗️ BUILD AGENT REPORT');
    console.log('='.repeat(60));
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Build Status: ${report.buildSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Total Checks: ${report.totalChecks}`);
    console.log(`Passed: ${report.passed}`);
    console.log(`Failed: ${report.failed}`);
    console.log(`Warnings: ${report.warnings.length}`);
    console.log('');

    // Build stats
    console.log('📊 BUILD STATISTICS:');
    console.log(`Build Time: ${report.buildStats.buildTime}ms`);
    console.log(`Output Size: ${(report.buildStats.outputSize / (1024 * 1024)).toFixed(2)}MB`);
    console.log(`Pages Generated: ${report.buildStats.pageCount}`);
    console.log(`Total Assets: ${report.buildStats.assetCount}`);
    console.log('');

    // Print individual check results
    console.log('🔍 CHECK RESULTS:');
    report.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${status} ${result.name}${duration}`);
      console.log(`   ${result.message}`);
      
      if (!result.passed && result.details) {
        console.log(`   Details: ${typeof result.details === 'string' ? result.details.substring(0, 200) + '...' : JSON.stringify(result.details).substring(0, 200) + '...'}`);
      }
      console.log('');
    });

    // Print warnings if any
    if (report.warnings.length > 0) {
      console.log('⚠️ WARNINGS:');
      report.warnings.slice(0, 10).forEach((warning, i) => {
        console.log(`   ${i + 1}. ${warning}`);
      });
      if (report.warnings.length > 10) {
        console.log(`   ... and ${report.warnings.length - 10} more warnings`);
      }
      console.log('');
    }

    console.log('='.repeat(60));
    console.log(report.summary);
    console.log('='.repeat(60));
  }
}

// Run the Build agent
async function main() {
  const agent = new SimpleBuildAgent();
  const report = await agent.runBuildVerification();
  process.exit(report.buildSuccess ? 0 : 1);
}

main().catch(error => {
  console.error('Build Agent failed:', error);
  process.exit(1);
});