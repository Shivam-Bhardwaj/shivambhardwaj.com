#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class ClaudeHelper {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }

  generateClaudePrompt(task, context = {}) {
    const prompts = {
      'add-feature': `Add ${context.feature} to ${context.file || 'the appropriate file'} following the patterns in CLAUDE.md. Include tests and ensure TypeScript types are correct.`,
      
      'fix-errors': `Run npm run lint and npm run type-check, then fix all errors. Focus on ${context.file || 'modified files in git status'}.`,
      
      'test-changes': `Run npm run test:coverage for ${context.file || 'modified components'} and add tests to reach 70% coverage.`,
      
      'refactor': `Refactor ${context.file} following the architecture patterns in CLAUDE.md. Maintain all functionality and update tests.`,
      
      'debug': `Debug the issue: ${context.issue}. Check logs/, run relevant tests with npm run test:e2e:ui, and provide a fix.`,
      
      'review': `Review the changes in git status, run npm run test:quality, and fix any high-severity issues.`,
      
      'deploy-ready': `Run npm run validate:pre-push, fix any issues, then prepare for deployment with npm run build.`,
      
      'optimize': `Analyze ${context.file || 'the application'} with npm run build:analyze and npm run test:performance. Optimize bundle size and performance.`,
      
      'update-deps': `Check for outdated dependencies, update them safely, run npm run test:all to ensure nothing breaks.`,
      
      'cleanup': `Remove unused components and dead code from ${context.directory || 'src/components'}. Update imports and tests accordingly.`
    };

    return prompts[task] || `Complete the task: ${task}`;
  }

  showQuickCommands() {
    console.log('\n📋 QUICK CLAUDE COMMANDS\n');
    
    const commands = [
      { cmd: 'lint fix and type-check', desc: 'Fix all linting and type errors' },
      { cmd: 'test the [component] changes', desc: 'Run tests for specific component' },
      { cmd: 'validate before push', desc: 'Run all pre-push validations' },
      { cmd: 'run npm run test:quality', desc: 'Check for broken links, a11y, performance' },
      { cmd: 'follow CLAUDE.md patterns', desc: 'Ensure consistency with project standards' },
      { cmd: 'check git status and test modified files', desc: 'Test only changed files' },
      { cmd: 'add to [file]::[line]', desc: 'Add code at specific location' },
      { cmd: 'create similar to [existing component]', desc: 'Use existing patterns' }
    ];

    commands.forEach(({ cmd, desc }) => {
      console.log(`  "${cmd}"`);
      console.log(`   ${desc}\n`);
    });
  }

  generateContextPrompt() {
    const gitStatus = execSync('git status --short', { encoding: 'utf8' });
    const modifiedFiles = gitStatus
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.substring(3).trim());

    let prompt = 'Current context:\n';
    
    if (modifiedFiles.length > 0) {
      prompt += `Modified files: ${modifiedFiles.join(', ')}\n`;
      prompt += 'Run tests and validations on these modified files.\n';
    }

    // Check if dev server is running
    try {
      execSync('curl -s http://localhost:3000', { timeout: 1000 });
      prompt += 'Dev server is running on port 3000.\n';
    } catch {
      prompt += 'Dev server is not running. Use npm run dev to start.\n';
    }

    // Check last test run
    if (fs.existsSync('coverage/coverage-summary.json')) {
      const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
      const total = coverage.total;
      prompt += `Test coverage: ${total.lines.pct}% lines, ${total.functions.pct}% functions\n`;
    }

    return prompt;
  }

  async interactiveMode() {
    console.clear();
    this.log('🤖 CLAUDE DEVELOPMENT HELPER', 'info');
    console.log('═'.repeat(50));

    const options = [
      '1. Add new feature',
      '2. Fix errors and issues', 
      '3. Test changes',
      '4. Refactor code',
      '5. Debug issue',
      '6. Review & quality check',
      '7. Prepare for deployment',
      '8. Optimize performance',
      '9. Show quick commands',
      '10. Generate context prompt',
      '0. Exit'
    ];

    console.log('\nSelect a workflow:\n');
    options.forEach(opt => console.log(`  ${opt}`));

    const choice = await this.prompt('\nEnter choice: ');

    switch(choice) {
      case '1': {
        const feature = await this.prompt('Feature name: ');
        const file = await this.prompt('Target file (optional): ');
        console.log('\n📝 Copy this to Claude:\n');
        this.log(this.generateClaudePrompt('add-feature', { feature, file }), 'success');
        break;
      }
      case '2': {
        const file = await this.prompt('Specific file (optional): ');
        console.log('\n📝 Copy this to Claude:\n');
        this.log(this.generateClaudePrompt('fix-errors', { file }), 'success');
        break;
      }
      case '3': {
        const file = await this.prompt('Component to test (optional): ');
        console.log('\n📝 Copy this to Claude:\n');
        this.log(this.generateClaudePrompt('test-changes', { file }), 'success');
        break;
      }
      case '4': {
        const file = await this.prompt('File to refactor: ');
        console.log('\n📝 Copy this to Claude:\n');
        this.log(this.generateClaudePrompt('refactor', { file }), 'success');
        break;
      }
      case '5': {
        const issue = await this.prompt('Describe the issue: ');
        console.log('\n📝 Copy this to Claude:\n');
        this.log(this.generateClaudePrompt('debug', { issue }), 'success');
        break;
      }
      case '6': {
        console.log('\n📝 Copy this to Claude:\n');
        this.log(this.generateClaudePrompt('review'), 'success');
        break;
      }
      case '7': {
        console.log('\n📝 Copy this to Claude:\n');
        this.log(this.generateClaudePrompt('deploy-ready'), 'success');
        break;
      }
      case '8': {
        const file = await this.prompt('File/area to optimize (optional): ');
        console.log('\n📝 Copy this to Claude:\n');
        this.log(this.generateClaudePrompt('optimize', { file }), 'success');
        break;
      }
      case '9': {
        this.showQuickCommands();
        await this.prompt('\nPress Enter to continue...');
        return this.interactiveMode();
      }
      case '10': {
        console.log('\n📝 Current context for Claude:\n');
        this.log(this.generateContextPrompt(), 'success');
        break;
      }
      case '0': {
        console.log('Goodbye! 👋');
        this.rl.close();
        return;
      }
      default: {
        console.log('Invalid choice');
      }
    }

    const again = await this.prompt('\nGenerate another prompt? (y/n): ');
    if (again.toLowerCase() === 'y') {
      return this.interactiveMode();
    }
    
    this.rl.close();
  }

  async run() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      return this.interactiveMode();
    }

    const command = args[0];
    
    switch(command) {
      case 'quick':
        this.showQuickCommands();
        break;
      case 'context':
        console.log(this.generateContextPrompt());
        break;
      case 'help':
        console.log(`
Claude Helper - Optimize your Claude workflow

Usage:
  npm run claude           Interactive mode
  npm run claude quick     Show quick commands
  npm run claude context   Generate context prompt
  npm run claude help      Show this help

Examples:
  npm run claude
  npm run claude quick | clipboard
        `);
        break;
      default:
        console.log('Unknown command. Use "npm run claude help"');
    }
    
    this.rl.close();
  }
}

if (require.main === module) {
  const helper = new ClaudeHelper();
  helper.run();
}

module.exports = ClaudeHelper;