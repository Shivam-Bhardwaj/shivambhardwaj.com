#!/usr/bin/env node

/**
 * Dark Mode Validation Agent Runner
 * 
 * Automatically detects and fixes dark mode contrast issues throughout the codebase.
 * Ensures proper visibility and accessibility in both light and dark themes.
 */

const fs = require('fs');
const path = require('path');

class DarkModeRunner {
  constructor() {
    this.projectRoot = process.cwd();
    this.issues = [];
    this.fixes = [];
  }

  async run() {
    console.log('🌙 DARK MODE VALIDATION AGENT STARTING...\n');

    await this.scanForContrastIssues();
    const fixedCount = await this.applyFixes();
    await this.updateGlobalStyles();
    
    this.printSummary(fixedCount);

    if (fixedCount > 0) {
      console.log('\n📝 Committing dark mode fixes...');
      try {
        const { execSync } = require('child_process');
        execSync('git add .', { cwd: this.projectRoot });
        execSync('git commit -m "Fix dark mode contrast issues\n\n- Improved text contrast in dark mode\n- Added missing dark mode variants\n- Fixed white-on-white visibility issues\n- Enhanced accessibility across themes\n\nGenerated with Claude Code"', { 
          cwd: this.projectRoot 
        });
        console.log('✅ Dark mode fixes committed');
      } catch (error) {
        console.log('⚠️ Could not auto-commit. Please commit manually.');
      }
    }
  }

  async scanForContrastIssues() {
    console.log('🔍 Scanning for contrast issues...');
    
    const sourceFiles = this.getSourceFiles();
    
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        this.checkLineForIssues(file, index + 1, line);
      });
    }

    console.log(`   Found ${this.issues.length} potential issues`);
  }

  checkLineForIssues(file, lineNumber, line) {
    const relativePath = path.relative(this.projectRoot, file);
    
    // Critical issues - white on white or very low contrast
    const criticalPatterns = [
      {
        regex: /className="[^"]*text-white[^"]*"/,
        darkModeCheck: /dark:text-/,
        issue: 'White text without dark mode variant',
        fix: 'text-white dark:text-gray-100'
      },
      {
        regex: /className="[^"]*bg-white[^"]*"/,
        darkModeCheck: /dark:bg-/,
        issue: 'White background without dark mode variant', 
        fix: 'bg-white dark:bg-gray-800'
      },
      {
        regex: /className="[^"]*text-gray-900[^"]*"/,
        darkModeCheck: /dark:text-/,
        issue: 'Very dark text without dark mode variant',
        fix: 'text-gray-900 dark:text-gray-100'
      },
      {
        regex: /className="[^"]*text-black[^"]*"/,
        darkModeCheck: /dark:text-/,
        issue: 'Black text without dark mode variant',
        fix: 'text-black dark:text-white'
      }
    ];

    criticalPatterns.forEach(pattern => {
      if (pattern.regex.test(line) && !pattern.darkModeCheck.test(line)) {
        this.issues.push({
          file: relativePath,
          line: lineNumber,
          issue: pattern.issue,
          suggestion: `Replace with: ${pattern.fix}`,
          severity: 'critical'
        });
      }
    });

    // Warning patterns
    const warningPatterns = [
      {
        regex: /style=\{\{[^}]*color:\s*['"]white['"][^}]*\}\}/,
        issue: 'Inline white color style',
        suggestion: 'Convert to Tailwind classes with dark mode support'
      },
      {
        regex: /style=\{\{[^}]*background:\s*['"]white['"][^}]*\}\}/,
        issue: 'Inline white background style',
        suggestion: 'Convert to Tailwind classes with dark mode support'
      }
    ];

    warningPatterns.forEach(pattern => {
      if (pattern.regex.test(line)) {
        this.issues.push({
          file: relativePath,
          line: lineNumber,
          issue: pattern.issue,
          suggestion: pattern.suggestion,
          severity: 'warning'
        });
      }
    });
  }

  async applyFixes() {
    console.log('🔧 Applying automatic fixes...');
    
    const sourceFiles = this.getSourceFiles();
    let fixedCount = 0;

    for (const file of sourceFiles) {
      let content = fs.readFileSync(file, 'utf-8');
      let modified = false;

      // Auto-fix patterns
      const autoFixes = [
        {
          from: /className="([^"]*\b)text-white(\b[^"]*)" (?!.*dark:text-)/g,
          to: 'className="$1text-white dark:text-gray-100$2"',
          description: 'Added dark mode text color'
        },
        {
          from: /className="([^"]*\b)bg-white(\b[^"]*)" (?!.*dark:bg-)/g,
          to: 'className="$1bg-white dark:bg-gray-800$2"',
          description: 'Added dark mode background'
        },
        {
          from: /className="([^"]*\b)text-gray-900(\b[^"]*)" (?!.*dark:text-)/g,
          to: 'className="$1text-gray-900 dark:text-gray-100$2"',
          description: 'Added dark mode for very dark text'
        },
        {
          from: /className="([^"]*\b)text-black(\b[^"]*)" (?!.*dark:text-)/g,
          to: 'className="$1text-black dark:text-white$2"',
          description: 'Added dark mode for black text'
        },
        {
          from: /className="([^"]*\b)border-gray-200(\b[^"]*)" (?!.*dark:border-)/g,
          to: 'className="$1border-gray-200 dark:border-gray-700$2"',
          description: 'Added dark mode border'
        },
        {
          from: /className="([^"]*\b)bg-gray-50(\b[^"]*)" (?!.*dark:bg-)/g,
          to: 'className="$1bg-gray-50 dark:bg-gray-900$2"',
          description: 'Added dark mode for light background'
        }
      ];

      autoFixes.forEach(fix => {
        const newContent = content.replace(fix.from, fix.to);
        if (newContent !== content) {
          content = newContent;
          modified = true;
          this.fixes.push(`${path.relative(this.projectRoot, file)} - ${fix.description}`);
        }
      });

      if (modified) {
        fs.writeFileSync(file, content);
        fixedCount++;
      }
    }

    console.log(`   ✅ ${fixedCount} files updated with dark mode fixes`);
    return fixedCount;
  }

  async updateGlobalStyles() {
    console.log('🎨 Updating global styles...');
    
    const globalCssPath = path.join(this.projectRoot, 'src/app/globals.css');
    
    if (fs.existsSync(globalCssPath)) {
      let content = fs.readFileSync(globalCssPath, 'utf-8');
      
      // Ensure proper CSS variables exist
      const improvedCssVariables = `
/* Enhanced Dark Mode Support */
@layer base {
  :root {
    --text-primary: 31 41 55;        /* gray-800 */
    --text-secondary: 107 114 128;   /* gray-500 */  
    --text-muted: 156 163 175;       /* gray-400 */
    --bg-primary: 255 255 255;       /* white */
    --bg-secondary: 249 250 251;     /* gray-50 */
    --bg-card: 255 255 255;          /* white */
    --border-primary: 229 231 235;   /* gray-200 */
    --border-secondary: 243 244 246; /* gray-100 */
  }
  
  .dark {
    --text-primary: 243 244 246;     /* gray-100 */
    --text-secondary: 156 163 175;   /* gray-400 */
    --text-muted: 107 114 128;       /* gray-500 */
    --bg-primary: 17 24 39;          /* gray-900 */
    --bg-secondary: 31 41 55;        /* gray-800 */
    --bg-card: 31 41 55;             /* gray-800 */
    --border-primary: 75 85 99;      /* gray-600 */
    --border-secondary: 55 65 81;    /* gray-700 */
  }
}

/* Utility classes */
.text-primary { color: rgb(var(--text-primary)); }
.text-secondary { color: rgb(var(--text-secondary)); }
.text-muted { color: rgb(var(--text-muted)); }
.bg-primary { background-color: rgb(var(--bg-primary)); }
.bg-secondary { background-color: rgb(var(--bg-secondary)); }
.bg-card { background-color: rgb(var(--bg-card)); }
.border-primary { border-color: rgb(var(--border-primary)); }
`;

      if (!content.includes('Enhanced Dark Mode Support')) {
        content = content + '\n' + improvedCssVariables;
        fs.writeFileSync(globalCssPath, content);
        this.fixes.push('Added enhanced CSS variables for better dark mode support');
        console.log('   ✅ Enhanced global CSS with dark mode variables');
      }
    }
  }

  getSourceFiles() {
    const { glob } = require('glob');
    try {
      const files = glob.sync('src/**/*.{tsx,jsx}', { cwd: this.projectRoot });
      return files.map(f => path.join(this.projectRoot, f));
    } catch (error) {
      console.error('Error getting source files:', error);
      return [];
    }
  }

  printSummary(fixedCount) {
    const criticalCount = this.issues.filter(i => i.severity === 'critical').length;
    const warningCount = this.issues.filter(i => i.severity === 'warning').length;

    console.log('\n' + '='.repeat(60));
    console.log('🌙 DARK MODE AGENT SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`ISSUES FOUND: ${this.issues.length} (${criticalCount} critical, ${warningCount} warnings)`);
    console.log(`FIXES APPLIED: ${fixedCount}`);
    
    if (this.issues.length > 0) {
      console.log('\n❌ ISSUES DETECTED:');
      this.issues.slice(0, 10).forEach(issue => {
        console.log(`  ${issue.severity === 'critical' ? '🔴' : '⚠️'} ${issue.file}:${issue.line} - ${issue.issue}`);
      });
      if (this.issues.length > 10) {
        console.log(`  ... and ${this.issues.length - 10} more issues`);
      }
    }

    if (this.fixes.length > 0) {
      console.log('\n✅ FIXES APPLIED:');
      this.fixes.slice(0, 8).forEach(fix => console.log(`  • ${fix}`));
      if (this.fixes.length > 8) {
        console.log(`  • ... and ${this.fixes.length - 8} more fixes`);
      }
    }

    console.log(`\n${criticalCount === 0 ? '✅' : '❌'} DARK MODE STATUS: ${criticalCount === 0 ? 'READY' : 'NEEDS FIXES'}`);
  }
}

// Run the agent
if (require.main === module) {
  const runner = new DarkModeRunner();
  runner.run().catch(error => {
    console.error('💥 Dark mode agent failed:', error);
    process.exit(1);
  });
}

module.exports = { DarkModeRunner };