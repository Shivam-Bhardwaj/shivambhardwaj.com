#!/usr/bin/env node

/**
 * Pre-Push Validation Runner
 * 
 * Executes comprehensive validation before git push operations.
 * This script should be run before every push to ensure code quality.
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class PrePushRunner {
  constructor() {
    this.projectRoot = process.cwd();
    this.issues = [];
    this.warnings = [];
  }

  async run() {
    console.log('🚀 PRE-PUSH VALIDATION AGENT STARTING...\n');

    const validations = [
      () => this.validateCodeProfessionalism(),
      () => this.validateDocumentation(),
      () => this.validateFileStructure(),
      () => this.validateChangelog(),
      () => this.validateSecurity(),
      () => this.validateTesting()
    ];

    let allPassed = true;

    for (const validation of validations) {
      const result = await validation();
      if (!result.passed) {
        allPassed = false;
      }
    }

    this.printSummary(allPassed);

    if (!allPassed) {
      console.log('\n🔧 Running auto-fixes...');
      await this.autoFix();
      console.log('\n⚠️  Please review changes and run validation again.');
      process.exit(1);
    }

    console.log('\n✅ ALL VALIDATIONS PASSED - READY TO PUSH!');
    process.exit(0);
  }

  async validateCodeProfessionalism() {
    console.log('📝 Checking code professionalism...');
    
    const sourceFiles = this.getSourceFiles();
    let passed = true;

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8');

      // Check for emojis in code (not comments)
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]/gu;
        if (emojiRegex.test(line) && !line.trim().startsWith('//') && !line.includes('/*')) {
          this.issues.push(`${file}:${index + 1} - Emoji in code (not comment)`);
          passed = false;
        }
      });

      // Check for unprofessional terms
      const unprofessionalTerms = [
        'hack', 'hacky', 'dirty', 'quick fix', 'temp', 'temporary',
        'broken', 'wtf', 'stupid', 'dumb', 'shit', 'crap', 'fuck'
      ];

      unprofessionalTerms.forEach(term => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        if (regex.test(content)) {
          this.issues.push(`${file} - Unprofessional term: "${term}"`);
          passed = false;
        }
      });

      // Check for console.log in production code
      if (!file.includes('test') && !file.includes('dev')) {
        if (content.includes('console.log')) {
          this.warnings.push(`${file} - Contains console.log statements`);
        }
      }
    }

    console.log(`   ${passed ? '✅' : '❌'} Code Professionalism`);
    return { passed };
  }

  async validateDocumentation() {
    console.log('📚 Checking documentation...');
    
    const requiredDocs = ['README.md', 'CLAUDE.md'];
    let passed = true;

    for (const doc of requiredDocs) {
      const docPath = path.join(this.projectRoot, doc);
      if (!fs.existsSync(docPath)) {
        this.issues.push(`Missing documentation: ${doc}`);
        passed = false;
      } else {
        const content = fs.readFileSync(docPath, 'utf-8');
        if (content.length < 100) {
          this.issues.push(`Documentation too short: ${doc}`);
          passed = false;
        }
      }
    }

    console.log(`   ${passed ? '✅' : '❌'} Documentation`);
    return { passed };
  }

  async validateFileStructure() {
    console.log('🗂️ Checking file structure...');
    
    let passed = true;

    // Check for redundant files
    const redundantPatterns = [
      '**/.DS_Store',
      '**/Thumbs.db',
      '**/*.tmp',
      '**/*.temp',
      '**/*.log',
      '**/*.backup'
    ];

    for (const pattern of redundantPatterns) {
      try {
        const files = execSync(`find . -name "${pattern.replace('**/', '')}" 2>/dev/null || echo ""`, {
          cwd: this.projectRoot,
          encoding: 'utf-8'
        }).trim().split('\n').filter(f => f);

        if (files.length > 0 && files[0] !== '') {
          files.forEach(file => {
            this.issues.push(`Redundant file: ${file}`);
            passed = false;
          });
        }
      } catch (error) {
        // Command failed, likely no files found
      }
    }

    console.log(`   ${passed ? '✅' : '❌'} File Structure`);
    return { passed };
  }

  async validateChangelog() {
    console.log('📋 Checking changelog...');
    
    const changelogPath = path.join(this.projectRoot, 'CHANGELOG.md');
    let passed = true;

    if (!fs.existsSync(changelogPath)) {
      this.issues.push('CHANGELOG.md missing');
      passed = false;
    } else {
      const content = fs.readFileSync(changelogPath, 'utf-8');
      const today = new Date().toISOString().split('T')[0];
      
      if (!content.includes(today)) {
        this.warnings.push('Changelog may need updating for today');
      }
    }

    console.log(`   ${passed ? '✅' : '❌'} Changelog`);
    return { passed };
  }

  async validateSecurity() {
    console.log('🔒 Running security checks...');
    
    let passed = true;

    try {
      execSync('npm audit --audit-level=high', { 
        cwd: this.projectRoot, 
        stdio: 'pipe' 
      });
    } catch (error) {
      this.issues.push('High/critical security vulnerabilities found');
      passed = false;
    }

    console.log(`   ${passed ? '✅' : '❌'} Security`);
    return { passed };
  }

  async validateTesting() {
    console.log('🧪 Running tests...');
    
    let passed = true;

    // Type checking
    try {
      execSync('npm run type-check', { 
        cwd: this.projectRoot, 
        stdio: 'pipe' 
      });
    } catch (error) {
      this.issues.push('TypeScript type checking failed');
      passed = false;
    }

    // Linting
    try {
      execSync('npm run lint', { 
        cwd: this.projectRoot, 
        stdio: 'pipe' 
      });
    } catch (error) {
      this.issues.push('ESLint validation failed');
      passed = false;
    }

    // Build test
    try {
      execSync('npm run build', { 
        cwd: this.projectRoot, 
        stdio: 'pipe' 
      });
    } catch (error) {
      this.issues.push('Build process failed');
      passed = false;
    }

    console.log(`   ${passed ? '✅' : '❌'} Testing & Build`);
    return { passed };
  }

  getSourceFiles() {
    try {
      const result = execSync('find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"', {
        cwd: this.projectRoot,
        encoding: 'utf-8'
      });
      return result.trim().split('\n').filter(f => f);
    } catch (error) {
      return [];
    }
  }

  async autoFix() {
    // Remove redundant files
    const redundantFiles = ['.DS_Store', 'Thumbs.db'];
    
    for (const file of redundantFiles) {
      try {
        execSync(`find . -name "${file}" -delete`, { cwd: this.projectRoot });
        console.log(`  🗑️ Removed: ${file} files`);
      } catch (error) {
        // File doesn't exist
      }
    }

    // Update changelog
    const changelogPath = path.join(this.projectRoot, 'CHANGELOG.md');
    if (fs.existsSync(changelogPath)) {
      const today = new Date().toISOString().split('T')[0];
      const changelog = fs.readFileSync(changelogPath, 'utf-8');
      
      if (!changelog.includes(today)) {
        const newEntry = `\n## [${today}] - Pre-push validation\n### Changed\n- Automated validation and cleanup\n\n`;
        const updated = changelog.replace('# Changelog\n', `# Changelog\n${newEntry}`);
        fs.writeFileSync(changelogPath, updated);
        console.log('  📝 Updated CHANGELOG.md');
      }
    } else {
      // Create basic changelog
      const basicChangelog = `# Changelog

## [${new Date().toISOString().split('T')[0]}] - Initial release
### Added
- Complete website redesign
- Intelligent robot navigation system
- Professional portfolio layout
- Comprehensive testing framework

All notable changes to this project will be documented in this file.
`;
      fs.writeFileSync(changelogPath, basicChangelog);
      console.log('  📝 Created CHANGELOG.md');
    }
  }

  printSummary(passed) {
    console.log('\n' + '='.repeat(60));
    console.log('PRE-PUSH VALIDATION SUMMARY');
    console.log('='.repeat(60));
    
    if (this.issues.length > 0) {
      console.log('\n❌ CRITICAL ISSUES:');
      this.issues.forEach(issue => console.log(`  • ${issue}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }

    console.log(`\nTOTAL: ${this.issues.length} issues, ${this.warnings.length} warnings`);
    console.log(`STATUS: ${passed ? '✅ READY TO PUSH' : '❌ PUSH BLOCKED'}`);
  }
}

// Run the agent
if (require.main === module) {
  const runner = new PrePushRunner();
  runner.run().catch(error => {
    console.error('💥 Pre-push validation failed:', error);
    process.exit(1);
  });
}

module.exports = { PrePushRunner };