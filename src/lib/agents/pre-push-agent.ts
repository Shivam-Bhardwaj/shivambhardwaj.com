/**
 * Pre-Push Validation Agent
 * 
 * Comprehensive validation agent that ensures code quality, professionalism,
 * and completeness before any git push operation. This agent acts as a
 * gatekeeper to maintain high standards in the codebase.
 */
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { glob } from 'glob';
interface ValidationResult {
  passed: boolean;
  issues: string[];
  warnings: string[];
  summary: string;
}
interface FileInfo {
  path: string;
  size: number;
  lastModified: Date;
  type: 'source' | 'config' | 'documentation' | 'asset' | 'test' | 'redundant';
}
export class PrePushAgent {
  private projectRoot: string;
  private validationResults: ValidationResult[];
  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.validationResults = [];
  }
  async validateBeforePush(): Promise<ValidationResult> {
    console.log(' PRE-PUSH VALIDATION STARTING...\n');
    const checks = [
      this.validateCodeProfessionalism(),
      this.validateDocumentation(),
      this.validateFileStructure(),
      this.validateChangelog(),
      this.validateSecurity(),
      this.validateTesting()
    ];
    const results = await Promise.all(checks);
    const overallResult = this.consolidateResults(results);
    console.log(overallResult.summary);
    if (!overallResult.passed) {
      console.log('\n VALIDATION FAILED - PUSH BLOCKED');
      console.log('\nISSUES TO FIX:');
      overallResult.issues.forEach(issue => console.log(`  • ${issue}`));
    } else {
      console.log('\n ALL VALIDATIONS PASSED - READY TO PUSH');
    }
    if (overallResult.warnings.length > 0) {
      console.log('\n️ WARNINGS:');
      overallResult.warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    return overallResult;
  }
  private async validateCodeProfessionalism(): Promise<ValidationResult> {
    const issues: string[] = [];
    const warnings: string[] = [];
    console.log(' Checking code professionalism...');
    // Find all source files
    const sourceFiles = await glob('src/**/*.{ts,tsx,js,jsx}', { cwd: this.projectRoot });
    for (const file of sourceFiles) {
      const filePath = path.join(this.projectRoot, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      // Check for emojis in code
      const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
      if (emojiRegex.test(content)) {
        // Allow emojis only in comments, not in code
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (emojiRegex.test(line) && !line.trim().startsWith('//') && !line.includes('/*')) {
            issues.push(`${file}:${index + 1} - Emoji found in code (not comment)`);
          }
        });
      }
      // Check for unprofessional terms
      const unprofessionalTerms = [
        'workaround', 'alternative', 'unoptimized', 'interim solution', 'temporary', 'temporary',
        'TODO:', 'FIXME:', 'XXX:', 'workaround:', 'non-functional', 'unexpected', 'inefficient',
        'simplified', '', '', '', '', ''
      ];
      unprofessionalTerms.forEach(term => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        if (regex.test(content)) {
          const matches = content.match(regex);
          issues.push(`${file} - Contains unprofessional term: "${term}" (${matches?.length} occurrences)`);
        }
      });
      // Check for console.log statements (except in development files)
      if (!file.includes('test') && !file.includes('dev') && content.includes('console.log')) {
        warnings.push(`${file} - Contains console.log statements`);
      }
      // Check for proper TypeScript types
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        if (content.includes('any;') || content.includes('any,') || content.includes('any ')) {
          warnings.push(`${file} - Uses 'any' type - consider specific typing`);
        }
      }
    }
    return {
      passed: issues.length === 0,
      issues,
      warnings,
      summary: `Code Professionalism: ${issues.length === 0 ? ' PASS' : ' FAIL'} (${issues.length} issues, ${warnings.length} warnings)`
    };
  }
  private async validateDocumentation(): Promise<ValidationResult> {
    const issues: string[] = [];
    const warnings: string[] = [];
    console.log(' Validating documentation...');
    const requiredDocs = [
      'README.md',
      'CLAUDE.md',
      'docs/ARCHITECTURE.md',
      'docs/DEPLOYMENT.md',
      'docs/TESTING.md'
    ];
    // Check required documentation exists
    for (const doc of requiredDocs) {
      const docPath = path.join(this.projectRoot, doc);
      if (!fs.existsSync(docPath)) {
        issues.push(`Missing required documentation: ${doc}`);
      } else {
        const content = fs.readFileSync(docPath, 'utf-8');
        if (content.length < 100) {
          issues.push(`Documentation too short: ${doc} (${content.length} chars)`);
        }
      }
    }
    // Check if package.json has proper metadata
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const requiredFields = ['name', 'version', 'description', 'author'];
      requiredFields.forEach(field => {
        if (!packageJson[field]) {
          issues.push(`package.json missing required field: ${field}`);
        }
      });
    }
    // Check for outdated documentation
    const sourceFiles = await glob('src/**/*.{ts,tsx}', { cwd: this.projectRoot });
    const readmeStats = fs.existsSync(path.join(this.projectRoot, 'README.md')) 
      ? fs.statSync(path.join(this.projectRoot, 'README.md'))
      : null;
    if (readmeStats && sourceFiles.length > 0) {
      const newestSourceFile = sourceFiles
        .map(f => fs.statSync(path.join(this.projectRoot, f)).mtime)
        .sort((a, b) => b.getTime() - a.getTime())[0];
      if (newestSourceFile > readmeStats.mtime) {
        warnings.push('README.md may be outdated - source files modified after last README update');
      }
    }
    return {
      passed: issues.length === 0,
      issues,
      warnings,
      summary: `Documentation: ${issues.length === 0 ? ' PASS' : ' FAIL'} (${issues.length} issues, ${warnings.length} warnings)`
    };
  }
  private async validateFileStructure(): Promise<ValidationResult> {
    const issues: string[] = [];
    const warnings: string[] = [];
    console.log('️ Analyzing file structure...');
    // Get all files
    const allFiles = await glob('**/*', { 
      cwd: this.projectRoot,
      ignore: ['node_modules/**', '.git/**', 'out/**', '.next/**']
    });
    const fileInfos: FileInfo[] = allFiles.map(file => {
      const filePath = path.join(this.projectRoot, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) return null;
      return {
        path: file,
        size: stats.size,
        lastModified: stats.mtime,
        type: this.categorizeFile(file)
      };
    }).filter(Boolean) as FileInfo[];
    // Identify redundant files
    const redundantPatterns = [
      /\.DS_Store$/,
      /Thumbs\.db$/,
      /\.tmp$/,
      /\.temporary$/,
      /\.backup$/,
      /\.old$/,
      /\.orig$/,
      /~$/,
      /\.log$/,
      /\.cache$/
    ];
    const redundantFiles = fileInfos.filter(file => 
      redundantPatterns.some(pattern => pattern.test(file.path))
    );
    redundantFiles.forEach(file => {
      issues.push(`Redundant file detected: ${file.path}`);
    });
    // Check for duplicate files (same name in different locations)
    const fileNames = new Map<string, string[]>();
    fileInfos.forEach(file => {
      const basename = path.basename(file.path);
      if (!fileNames.has(basename)) {
        fileNames.set(basename, []);
      }
      fileNames.get(basename)!.push(file.path);
    });
    fileNames.forEach((paths, name) => {
      if (paths.length > 1 && !name.includes('index') && !name.includes('page')) {
        warnings.push(`Potential duplicate files: ${name} found in ${paths.join(', ')}`);
      }
    });
    // Check for large files that might not belong
    const largeSizeThreshold = 1024 * 1024; // 1MB
    const largeFiles = fileInfos.filter(file => file.size > largeSizeThreshold);
    largeFiles.forEach(file => {
      warnings.push(`Large file detected: ${file.path} (${Math.round(file.size / 1024)}KB)`);
    });
    // Check for empty files
    const emptyFiles = fileInfos.filter(file => file.size === 0);
    emptyFiles.forEach(file => {
      issues.push(`Empty file detected: ${file.path}`);
    });
    return {
      passed: issues.length === 0,
      issues,
      warnings,
      summary: `File Structure: ${issues.length === 0 ? ' PASS' : ' FAIL'} (${fileInfos.length} files analyzed, ${issues.length} issues, ${warnings.length} warnings)`
    };
  }
  private async validateChangelog(): Promise<ValidationResult> {
    const issues: string[] = [];
    const warnings: string[] = [];
    console.log(' Checking changelog...');
    const changelogPath = path.join(this.projectRoot, 'CHANGELOG.md');
    if (!fs.existsSync(changelogPath)) {
      issues.push('CHANGELOG.md does not exist');
      return {
        passed: false,
        issues,
        warnings,
        summary: 'Changelog:  FAIL (missing)'
      };
    }
    const changelogContent = fs.readFileSync(changelogPath, 'utf-8');
    // Check if changelog has recent entries
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    if (!changelogContent.includes(today) && !changelogContent.includes(yesterday)) {
      warnings.push('Changelog may need updating - no recent entries found');
    }
    // Check changelog format
    const hasVersionHeaders = /^## \[\d+\.\d+\.\d+\]/m.test(changelogContent);
    if (!hasVersionHeaders) {
      issues.push('Changelog missing proper version headers (## [x.x.x])');
    }
    const hasCategories = /### (Added|Changed|Fixed|Removed)/m.test(changelogContent);
    if (!hasCategories) {
      warnings.push('Changelog could use categories (Added/Changed/Fixed/Removed)');
    }
    return {
      passed: issues.length === 0,
      issues,
      warnings,
      summary: `Changelog: ${issues.length === 0 ? ' PASS' : ' FAIL'} (${issues.length} issues, ${warnings.length} warnings)`
    };
  }
  private async validateSecurity(): Promise<ValidationResult> {
    const issues: string[] = [];
    const warnings: string[] = [];
    console.log(' Running security checks...');
    try {
      // Run npm audit
      const auditResult = execSync('npm audit --audit-level=moderate --json', { 
        cwd: this.projectRoot,
        encoding: 'utf-8' 
      });
      const auditData = JSON.parse(auditResult);
      if (auditData.metadata && auditData.metadata.vulnerabilities) {
        const vulns = auditData.metadata.vulnerabilities;
        if (vulns.high > 0 || vulns.critical > 0) {
          issues.push(`High/Critical vulnerabilities found: ${vulns.critical} critical, ${vulns.high} high`);
        }
        if (vulns.moderate > 0) {
          warnings.push(`${vulns.moderate} moderate vulnerabilities found`);
        }
      }
    } catch (error) {
      // npm audit exits with non-zero if vulnerabilities found
      try {
        const auditOutput = execSync('npm audit --audit-level=high', { 
          cwd: this.projectRoot,
          encoding: 'utf-8' 
        });
        if (auditOutput.includes('vulnerabilities')) {
          issues.push('Security vulnerabilities detected by npm audit');
        }
      } catch (auditError) {
        issues.push('Security vulnerabilities detected by npm audit');
      }
    }
    // Check for hardcoded secrets
    const secretPatterns = [
      /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
      /secret[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
      /password\s*[:=]\s*['"][^'"]+['"]/gi,
      /token\s*[:=]\s*['"][^'"]+['"]/gi,
      /firebase[_-]?config\s*[:=]\s*{[^}]*apiKey/gi
    ];
    const sourceFiles = await glob('src/**/*.{ts,tsx,js,jsx}', { cwd: this.projectRoot });
    for (const file of sourceFiles) {
      const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf-8');
      secretPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          issues.push(`${file} - Potential hardcoded secret detected`);
        }
      });
    }
    // Check .env files are gitignored
    const envFiles = await glob('.env*', { cwd: this.projectRoot });
    const gitignorePath = path.join(this.projectRoot, '.gitignore');
    if (envFiles.length > 0) {
      if (!fs.existsSync(gitignorePath)) {
        issues.push('.env files present but no .gitignore found');
      } else {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
        if (!gitignoreContent.includes('.env')) {
          issues.push('.env files not properly gitignored');
        }
      }
    }
    return {
      passed: issues.length === 0,
      issues,
      warnings,
      summary: `Security: ${issues.length === 0 ? ' PASS' : ' FAIL'} (${issues.length} issues, ${warnings.length} warnings)`
    };
  }
  private async validateTesting(): Promise<ValidationResult> {
    const issues: string[] = [];
    const warnings: string[] = [];
    console.log('🧪 Validating testing...');
    // Check if tests exist
    const testFiles = await glob('tests/**/*.{test,spec}.{ts,tsx,js,jsx}', { cwd: this.projectRoot });
    if (testFiles.length === 0) {
      issues.push('No test files found in tests/ directory');
    }
    // Run type checking
    try {
      execSync('npm run type-check', { 
        cwd: this.projectRoot, 
        stdio: 'pipe' 
      });
    } catch (error) {
      issues.push('TypeScript type checking failed');
    }
    // Run linting
    try {
      execSync('npm run lint', { 
        cwd: this.projectRoot, 
        stdio: 'pipe' 
      });
    } catch (error) {
      issues.push('ESLint validation failed');
    }
    // Test build process
    try {
      execSync('npm run build', { 
        cwd: this.projectRoot, 
        stdio: 'pipe' 
      });
    } catch (error) {
      issues.push('Build process failed');
    }
    // Check test coverage if available
    try {
      const coverageResult = execSync('npm run test:coverage 2>/dev/null || echo "no coverage"', { 
        cwd: this.projectRoot,
        encoding: 'utf-8'
      });
      if (!coverageResult.includes('no coverage') && coverageResult.includes('%')) {
        const coverageMatch = coverageResult.match(/(\d+)%/);
        if (coverageMatch) {
          const coverage = parseInt(coverageMatch[1]);
          if (coverage < 70) {
            warnings.push(`Test coverage below 70% (${coverage}%)`);
          }
        }
      }
    } catch (error) {
      // Coverage check failed, but not critical
    }
    return {
      passed: issues.length === 0,
      issues,
      warnings,
      summary: `Testing: ${issues.length === 0 ? ' PASS' : ' FAIL'} (${issues.length} issues, ${warnings.length} warnings)`
    };
  }
  private categorizeFile(filePath: string): FileInfo['type'] {
    if (filePath.includes('test') || filePath.includes('spec')) return 'test';
    if (filePath.endsWith('.md') || filePath.startsWith('docs/')) return 'documentation';
    if (filePath.includes('config') || filePath.startsWith('.') || filePath.endsWith('.json')) return 'config';
    if (filePath.startsWith('public/') || filePath.includes('assets/')) return 'asset';
    if (filePath.startsWith('src/')) return 'source';
    return 'redundant';
  }
  private consolidateResults(results: ValidationResult[]): ValidationResult {
    const allIssues = results.flatMap(r => r.issues);
    const allWarnings = results.flatMap(r => r.warnings);
    const allPassed = results.every(r => r.passed);
    const summary = [
      '='.repeat(60),
      'PRE-PUSH VALIDATION SUMMARY',
      '=' .repeat(60),
      ...results.map(r => r.summary),
      '=' .repeat(60),
      `TOTAL: ${allIssues.length} issues, ${allWarnings.length} warnings`,
      `STATUS: ${allPassed ? ' READY TO PUSH' : ' PUSH BLOCKED'}`
    ].join('\n');
    return {
      passed: allPassed,
      issues: allIssues,
      warnings: allWarnings,
      summary
    };
  }
  // Auto-fix some issues
  async autoFix(): Promise<void> {
    console.log(' Attempting auto-fixes...');
    // Remove redundant files
    const redundantPatterns = ['.DS_Store', 'Thumbs.db', '*.tmp', '*.temporary', '*.log'];
    for (const pattern of redundantPatterns) {
      try {
        const files = await glob(pattern, { cwd: this.projectRoot });
        for (const file of files) {
          fs.unlinkSync(path.join(this.projectRoot, file));
          console.log(`  ️ Removed: ${file}`);
        }
      } catch (error) {
        // File doesn't exist or can't be removed
      }
    }
    // Update changelog if it exists
    const changelogPath = path.join(this.projectRoot, 'CHANGELOG.md');
    if (fs.existsSync(changelogPath)) {
      const changelog = fs.readFileSync(changelogPath, 'utf-8');
      const today = new Date().toISOString().split('T')[0];
      if (!changelog.includes(today)) {
        const newEntry = `\n## [${today}] - Auto-update\n### Changed\n- Pre-push validation improvements\n- Code quality checks\n\n`;
        const updatedChangelog = changelog.replace('# Changelog\n', `# Changelog\n${newEntry}`);
        fs.writeFileSync(changelogPath, updatedChangelog);
        console.log('   Updated CHANGELOG.md');
      }
    }
  }
}
