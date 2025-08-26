/**
 * Build Agent - Build verification and validation
 * Ensures clean builds, validates static export, and checks for warnings
 */
import { execSync } from 'child_process';
import { readdirSync, statSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
interface BuildTestResult {
  name: string;
  passed: boolean;
  message: string;
  duration?: number;
  details?: any;
}
interface BuildReport {
  timestamp: string;
  buildSuccess: boolean;
  totalChecks: number;
  passed: number;
  failed: number;
  warnings: string[];
  results: BuildTestResult[];
  buildStats: {
    buildTime: number;
    outputSize: number;
    pageCount: number;
    assetCount: number;
  };
  summary: string;
}
class BuildAgent {
  private projectRoot: string;
  private results: BuildTestResult[] = [];
  private warnings: string[] = [];
  private buildStartTime: number = 0;
  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }
  /**
   * Run comprehensive build verification
   */
  async runBuildVerification(): Promise<BuildReport> {
    console.log('️ Starting Build Agent verification...\n');
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
    await this.validateAssets();
    await this.validatePages();
    await this.checkBundleSize();
    await this.validateManifests();
    return this.generateReport();
  }
  /**
   * Check prerequisites before building
   */
  private async checkPrerequisites(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log(' Checking prerequisites...');
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
        console.log(' Installing dependencies...');
        execSync('npm install', { 
          cwd: this.projectRoot,
          stdio: 'pipe'
        });
      }
      // Check Next.js config
      const nextConfigPath = join(this.projectRoot, 'next.config.ts');
      if (!existsSync(nextConfigPath)) {
        this.warnings.push('next.config.ts not found - using default configuration');
      }
      this.results.push({
        name: 'Prerequisites',
        passed: true,
        message: `Prerequisites validated (Node ${nodeVersion})`,
        duration: Date.now() - startTime,
        details: { nodeVersion, dependenciesInstalled: true }
      });
    } catch (error: any) {
      this.results.push({
        name: 'Prerequisites',
        passed: false,
        message: `Prerequisites check failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }
  /**
   * Clean previous build artifacts
   */
  private async cleanPreviousBuild(): Promise<void> {
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
    } catch (error: any) {
      this.results.push({
        name: 'Clean Build',
        passed: false,
        message: `Clean build failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }
  /**
   * Run TypeScript type checking
   */
  private async runTypeChecking(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log(' Running type checking...');
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
    } catch (error: any) {
      this.results.push({
        name: 'Type Checking',
        passed: false,
        message: `Type checking failed: ${error.message}`,
        duration: Date.now() - startTime,
        details: error.stdout?.toString() || error.stderr?.toString()
      });
    }
  }
  /**
   * Run production build
   */
  private async runProductionBuild(): Promise<void> {
    this.buildStartTime = Date.now();
    try {
      console.log(' Running production build...');
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
    } catch (error: any) {
      this.results.push({
        name: 'Production Build',
        passed: false,
        message: `Production build failed: ${error.message}`,
        duration: Date.now() - this.buildStartTime,
        details: error.stdout?.toString() || error.stderr?.toString()
      });
    }
  }
  /**
   * Validate static export output
   */
  private async validateStaticExport(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log(' Validating static export...');
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
    } catch (error: any) {
      this.results.push({
        name: 'Static Export Validation',
        passed: false,
        message: `Static export validation failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }
  /**
   * Check for build warnings
   */
  private async checkBuildWarnings(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log('️ Checking build warnings...');
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
    } catch (error: any) {
      this.results.push({
        name: 'Build Warnings',
        passed: false,
        message: `Warning check failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }
  /**
   * Validate assets are properly generated
   */
  private async validateAssets(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log('️ Validating assets...');
      const outDir = join(this.projectRoot, 'out');
      const nextStaticDir = join(outDir, '_next', 'static');
      if (!existsSync(nextStaticDir)) {
        throw new Error('Next.js static assets directory not found');
      }
      // Check for CSS assets
      const cssFiles = this.getFilesRecursively(nextStaticDir, '.css');
      if (cssFiles.length === 0) {
        this.warnings.push('No CSS files found in static assets');
      }
      // Check for JS chunks
      const jsFiles = this.getFilesRecursively(nextStaticDir, '.js');
      if (jsFiles.length === 0) {
        throw new Error('No JavaScript files found in static assets');
      }
      // Check for media assets if they exist
      const mediaDir = join(nextStaticDir, 'media');
      const mediaFiles = existsSync(mediaDir) ? this.getFilesRecursively(mediaDir) : [];
      this.results.push({
        name: 'Asset Validation',
        passed: true,
        message: 'Assets validated successfully',
        duration: Date.now() - startTime,
        details: {
          cssFiles: cssFiles.length,
          jsFiles: jsFiles.length,
          mediaFiles: mediaFiles.length
        }
      });
    } catch (error: any) {
      this.results.push({
        name: 'Asset Validation',
        passed: false,
        message: `Asset validation failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }
  /**
   * Validate all expected pages are generated
   */
  private async validatePages(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log(' Validating pages...');
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
    } catch (error: any) {
      this.results.push({
        name: 'Page Validation',
        passed: false,
        message: `Page validation failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }
  /**
   * Check bundle size
   */
  private async checkBundleSize(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log(' Checking bundle size...');
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
    } catch (error: any) {
      this.results.push({
        name: 'Bundle Size Check',
        passed: false,
        message: `Bundle size check failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }
  /**
   * Validate build manifests
   */
  private async validateManifests(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log(' Validating manifests...');
      const outDir = join(this.projectRoot, 'out');
      const buildManifestPath = join(outDir, '_next/static/**/_buildManifest.js');
      const ssgManifestPath = join(outDir, '_next/static/**/_ssgManifest.js');
      // Check for build manifest (pattern matching)
      const staticDirs = readdirSync(join(outDir, '_next/static')).filter(dir => 
        statSync(join(outDir, '_next/static', dir)).isDirectory()
      );
      let buildManifestFound = false;
      let ssgManifestFound = false;
      for (const dir of staticDirs) {
        const dirPath = join(outDir, '_next/static', dir);
        if (existsSync(join(dirPath, '_buildManifest.js'))) {
          buildManifestFound = true;
        }
        if (existsSync(join(dirPath, '_ssgManifest.js'))) {
          ssgManifestFound = true;
        }
      }
      const passed = buildManifestFound && ssgManifestFound;
      this.results.push({
        name: 'Manifest Validation',
        passed,
        message: passed 
          ? 'All build manifests validated successfully'
          : `Missing manifests: ${!buildManifestFound ? 'build' : ''}${!buildManifestFound && !ssgManifestFound ? ', ' : ''}${!ssgManifestFound ? 'SSG' : ''}`,
        duration: Date.now() - startTime,
        details: {
          buildManifest: buildManifestFound,
          ssgManifest: ssgManifestFound,
          staticDirectories: staticDirs.length
        }
      });
    } catch (error: any) {
      this.results.push({
        name: 'Manifest Validation',
        passed: false,
        message: `Manifest validation failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }
  /**
   * Get all files recursively with optional extension filter
   */
  private getFilesRecursively(dir: string, extension?: string): string[] {
    if (!existsSync(dir)) return [];
    let files: string[] = [];
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
  /**
   * Get directory size recursively
   */
  private getDirectorySize(dir: string): number {
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
  /**
   * Generate comprehensive build report
   */
  private generateReport(): BuildReport {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.length - passed;
    const buildSuccess = failed === 0;
    // Calculate build stats
    const outDir = join(this.projectRoot, 'out');
    const outputSize = existsSync(outDir) ? this.getDirectorySize(outDir) : 0;
    const htmlFiles = existsSync(outDir) ? this.getFilesRecursively(outDir, '.html') : [];
    const allFiles = existsSync(outDir) ? this.getFilesRecursively(outDir) : [];
    const report: BuildReport = {
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
        ? ` Build verification passed! ${this.results.length} checks completed successfully.`
        : ` Build verification failed! ${failed} of ${this.results.length} checks failed.`
    };
    this.printReport(report);
    return report;
  }
  /**
   * Print formatted report to console
   */
  private printReport(report: BuildReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('️ BUILD AGENT REPORT');
    console.log('='.repeat(60));
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Build Status: ${report.buildSuccess ? ' SUCCESS' : ' FAILED'}`);
    console.log(`Total Checks: ${report.totalChecks}`);
    console.log(`Passed: ${report.passed}`);
    console.log(`Failed: ${report.failed}`);
    console.log(`Warnings: ${report.warnings.length}`);
    console.log('');
    // Build stats
    console.log(' BUILD STATISTICS:');
    console.log(`Build Time: ${report.buildStats.buildTime}ms`);
    console.log(`Output Size: ${(report.buildStats.outputSize / (1024 * 1024)).toFixed(2)}MB`);
    console.log(`Pages Generated: ${report.buildStats.pageCount}`);
    console.log(`Total Assets: ${report.buildStats.assetCount}`);
    console.log('');
    // Print individual check results
    console.log(' CHECK RESULTS:');
    report.results.forEach(result => {
      const status = result.passed ? '' : '';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${status} ${result.name}${duration}`);
      console.log(`   ${result.message}`);
      if (!result.passed && result.details) {
        console.log(`   Details: ${typeof result.details === 'string' ? result.details.substring(0, 200) + '...' : JSON.stringify(result.details)}`);
      }
      console.log('');
    });
    // Print warnings if any
    if (report.warnings.length > 0) {
      console.log('️ WARNINGS:');
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
// Export both the class and a runner function
export { BuildAgent };
export async function runBuildVerification(projectRoot?: string): Promise<BuildReport> {
  const agent = new BuildAgent(projectRoot);
  return await agent.runBuildVerification();
}
// CLI usage
if (require.main === module) {
  runBuildVerification()
    .then(report => {
      process.exit(report.buildSuccess ? 0 : 1);
    })
    .catch(error => {
      console.error('Build Agent failed:', error);
      process.exit(1);
    });
}
