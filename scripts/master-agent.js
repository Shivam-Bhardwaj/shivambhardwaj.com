#!/usr/bin/env node

/**
 * Master Agent Script - Central hub for running LLM agents on the codebase
 * Supports custom prompts and predefined agent tasks
 * 
 * Usage:
 * - npm run agent -- --list                    (List all available agents)
 * - npm run agent -- --prompt "custom prompt"  (Run custom prompt)
 * - npm run agent -- --agent non-ascii         (Run predefined agent)
 * - npm run agent -- --interactive             (Interactive mode)
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class MasterAgent {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.projectRoot = process.cwd();
    this.scriptsDir = path.join(this.projectRoot, 'scripts');
    
    // Predefined agent prompts
    this.predefinedAgents = {
      'non-ascii': {
        name: 'Non-ASCII Character Detector',
        description: 'Scans the entire codebase for non-ASCII characters that might cause encoding issues',
        prompt: `Please scan the entire codebase for any non-ASCII characters. 
        
        Focus on:
        1. Source code files (.js, .jsx, .ts, .tsx, .json, .md, .css)
        2. Configuration files
        3. Documentation files
        
        For each file with non-ASCII characters:
        - Show the file path
        - Show the line number and character
        - Suggest if it should be replaced with ASCII equivalent or is intentional (like emojis in UI)
        - Flag any that might cause encoding/deployment issues
        
        Ignore:
        - node_modules/
        - .git/
        - out/ and build directories
        - Binary files
        
        Use the Grep and Read tools to systematically check files.`
      },
      
      'code-quality': {
        name: 'Code Quality Analyzer',
        description: 'Analyzes code quality, identifies technical debt, and suggests improvements',
        prompt: `Perform a comprehensive code quality analysis of this codebase.
        
        Analyze:
        1. Code complexity and maintainability
        2. Duplicate code patterns
        3. Unused imports/variables
        4. Performance anti-patterns
        5. Security vulnerabilities
        6. TypeScript/JavaScript best practices
        7. React patterns and hooks usage
        8. File organization and architecture
        
        Provide:
        - Priority ranking (Critical, High, Medium, Low)
        - Specific file locations
        - Actionable recommendations
        - Quick wins vs. long-term improvements
        
        Use Glob, Grep, and Read tools to analyze the codebase systematically.`
      },
      
      'dependency-audit': {
        name: 'Dependency Security Auditor',
        description: 'Audits dependencies for security issues, updates, and unused packages',
        prompt: `Audit the project dependencies for security and maintenance issues.
        
        Check:
        1. package.json and package-lock.json
        2. Outdated packages (run npm outdated)
        3. Security vulnerabilities (npm audit)
        4. Unused dependencies
        5. Duplicate dependencies
        6. License compatibility issues
        7. Bundle size impact
        
        Provide:
        - Security risk assessment
        - Update recommendations with breaking change warnings
        - Unused dependency cleanup suggestions
        - Bundle optimization opportunities
        
        Use the Bash tool to run npm commands and Read tool for package files.`
      },
      
      'accessibility-audit': {
        name: 'Accessibility (A11y) Auditor',
        description: 'Scans components and pages for accessibility issues',
        prompt: `Perform a comprehensive accessibility audit of the React components and pages.
        
        Check for:
        1. Missing alt attributes on images
        2. Missing ARIA labels and roles
        3. Color contrast issues
        4. Keyboard navigation support
        5. Screen reader compatibility
        6. Focus management
        7. Semantic HTML usage
        8. Form accessibility
        
        Analyze:
        - All React components in src/components/
        - Pages in src/app/
        - CSS for color contrast
        - Interactive elements
        
        Provide specific file locations and WCAG compliance recommendations.`
      },
      
      'performance-audit': {
        name: 'Performance Analyzer',
        description: 'Identifies performance bottlenecks and optimization opportunities',
        prompt: `Analyze the codebase for performance issues and optimization opportunities.
        
        Focus on:
        1. Bundle size analysis
        2. Code splitting opportunities
        3. Image optimization
        4. Unused CSS/JS
        5. Memory leaks in React components
        6. Expensive re-renders
        7. Network request optimization
        8. Caching strategies
        
        Review:
        - Next.js configuration
        - React component patterns
        - Asset usage and optimization
        - Build output analysis
        
        Provide specific recommendations with measurable impact estimates.`
      },
      
      'test-coverage': {
        name: 'Test Coverage Analyzer',
        description: 'Reviews test coverage and identifies untested critical paths',
        prompt: `Analyze the test coverage and quality of the test suite.
        
        Review:
        1. Current test coverage gaps
        2. Critical untested components/functions
        3. Test quality and effectiveness
        4. Integration test opportunities
        5. E2E test coverage
        6. Edge cases missing from tests
        7. Test performance and flakiness
        
        Check:
        - tests/ directory structure
        - Component test completeness
        - Utility function coverage
        - API/integration testing
        
        Recommend priority areas for additional testing.`
      },
      
      'documentation-audit': {
        name: 'Documentation Quality Checker',
        description: 'Reviews and improves code documentation and README files',
        prompt: `Audit the quality and completeness of project documentation.
        
        Review:
        1. README.md completeness and accuracy
        2. Code comments quality
        3. API documentation
        4. Setup instructions
        5. Contributing guidelines
        6. JSDoc/TSDoc coverage
        7. Architecture documentation
        8. Deployment documentation
        
        Check for:
        - Outdated information
        - Missing setup steps
        - Unclear explanations
        - Missing examples
        
        Suggest improvements for developer onboarding and maintainability.`
      },
      
      'security-scan': {
        name: 'Security Vulnerability Scanner',
        description: 'Scans for security vulnerabilities and unsafe patterns',
        prompt: `Perform a comprehensive security analysis of the codebase.
        
        Check for:
        1. Hardcoded secrets/API keys
        2. Unsafe eval() usage
        3. XSS vulnerabilities
        4. Insecure dependencies
        5. Input validation issues
        6. Authentication/authorization flaws
        7. CORS misconfigurations
        8. File upload vulnerabilities
        9. SQL injection risks
        10. Insecure random number generation
        
        Review all source files, configuration, and environment files.
        Prioritize findings by risk level and provide remediation steps.`
      }
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m',
      bold: '\x1b[1m',
      dim: '\x1b[2m'
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  listAvailableAgents() {
    this.log('\n🤖 Available Predefined Agents:', 'bold');
    this.log(''.padEnd(50, '='), 'dim');
    
    Object.entries(this.predefinedAgents).forEach(([key, agent]) => {
      this.log(`\n📋 ${key}`, 'success');
      this.log(`   ${agent.name}`, 'info');
      this.log(`   ${agent.description}`, 'dim');
    });
    
    this.log('\n🔧 Usage Examples:', 'bold');
    this.log(''.padEnd(50, '='), 'dim');
    this.log('npm run agent -- --agent non-ascii', 'info');
    this.log('npm run agent -- --prompt "Find all TODO comments"', 'info');
    this.log('npm run agent -- --interactive', 'info');
    this.log('npm run agent -- --list', 'dim');
  }

  generateContextPrompt() {
    // Read project structure and key files for context
    const contextFiles = [
      'package.json',
      'README.md', 
      'CLAUDE.md',
      'tsconfig.json',
      'next.config.ts'
    ];
    
    let context = `Project Context:\n`;
    context += `Root Directory: ${this.projectRoot}\n\n`;
    
    contextFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        context += `=== ${file} ===\n${content}\n\n`;
      }
    });
    
    // Add directory structure
    try {
      const tree = execSync('dir /s /b', { 
        cwd: this.projectRoot, 
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore']
      });
      context += `=== Directory Structure ===\n${tree}\n`;
    } catch (e) {
      // Fallback for non-Windows or if dir command fails
      try {
        const tree = execSync('find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | head -50', {
          cwd: this.projectRoot,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore']
        });
        context += `=== Key Files ===\n${tree}\n`;
      } catch (e2) {
        context += `Directory structure unavailable\n`;
      }
    }
    
    return context;
  }

  async runCustomPrompt(userPrompt) {
    this.log('🚀 Preparing custom prompt for Claude...', 'info');
    
    const context = this.generateContextPrompt();
    const fullPrompt = `${context}\n\nUser Request:\n${userPrompt}\n\nPlease analyze the codebase and provide detailed insights based on the user's request.`;
    
    this.log('\n📋 Generated Prompt:', 'success');
    this.log(''.padEnd(80, '-'), 'dim');
    this.log(fullPrompt, 'dim');
    this.log(''.padEnd(80, '-'), 'dim');
    
    this.log('\n💡 Copy the above prompt to Claude Code and run it.', 'warning');
    this.log('   The prompt includes full project context and your specific request.', 'dim');
  }

  async runPredefinedAgent(agentKey) {
    const agent = this.predefinedAgents[agentKey];
    if (!agent) {
      this.log(`❌ Agent '${agentKey}' not found.`, 'error');
      this.log('Run --list to see available agents.', 'dim');
      return;
    }
    
    this.log(`🤖 Running Agent: ${agent.name}`, 'success');
    this.log(`📝 Description: ${agent.description}\n`, 'dim');
    
    const context = this.generateContextPrompt();
    const fullPrompt = `${context}\n\nAgent Task: ${agent.name}\n${agent.prompt}`;
    
    this.log('📋 Generated Agent Prompt:', 'success');
    this.log(''.padEnd(80, '='), 'dim');
    this.log(fullPrompt, 'dim');
    this.log(''.padEnd(80, '='), 'dim');
    
    this.log('\n💡 Copy the above prompt to Claude Code and run it.', 'warning');
    this.log('   The agent will systematically analyze your codebase.', 'dim');
  }

  async interactiveMode() {
    this.log('\n🤖 Interactive Agent Mode', 'bold');
    this.log(''.padEnd(40, '='), 'dim');
    
    while (true) {
      this.log('\nOptions:', 'info');
      this.log('1. List available agents', 'dim');
      this.log('2. Run predefined agent', 'dim');
      this.log('3. Run custom prompt', 'dim');
      this.log('4. Exit', 'dim');
      
      const choice = await this.prompt('\nSelect option (1-4): ');
      
      switch (choice) {
        case '1':
          this.listAvailableAgents();
          break;
          
        case '2':
          this.log('\nAvailable agents:', 'info');
          Object.keys(this.predefinedAgents).forEach((key, index) => {
            this.log(`${index + 1}. ${key}`, 'dim');
          });
          
          const agentChoice = await this.prompt('\nEnter agent name: ');
          if (this.predefinedAgents[agentChoice]) {
            await this.runPredefinedAgent(agentChoice);
          } else {
            this.log('Invalid agent name.', 'error');
          }
          break;
          
        case '3':
          const customPrompt = await this.prompt('\nEnter your custom prompt: ');
          if (customPrompt) {
            await this.runCustomPrompt(customPrompt);
          }
          break;
          
        case '4':
          this.log('👋 Goodbye!', 'success');
          this.rl.close();
          return;
          
        default:
          this.log('Invalid option.', 'error');
      }
      
      await this.prompt('\nPress Enter to continue...');
    }
  }

  async run() {
    const args = process.argv.slice(2);
    
    // Parse command line arguments
    if (args.includes('--list')) {
      this.listAvailableAgents();
      this.rl.close();
      return;
    }
    
    const promptIndex = args.indexOf('--prompt');
    if (promptIndex !== -1 && args[promptIndex + 1]) {
      await this.runCustomPrompt(args[promptIndex + 1]);
      this.rl.close();
      return;
    }
    
    const agentIndex = args.indexOf('--agent');
    if (agentIndex !== -1 && args[agentIndex + 1]) {
      await this.runPredefinedAgent(args[agentIndex + 1]);
      this.rl.close();
      return;
    }
    
    if (args.includes('--interactive')) {
      await this.interactiveMode();
      return;
    }
    
    // Default: show help
    this.log('\n🤖 Master Agent Script', 'bold');
    this.log('Central hub for running LLM agents on your codebase\n', 'dim');
    
    this.log('Usage:', 'info');
    this.log('  npm run agent -- --list                    List all agents', 'dim');
    this.log('  npm run agent -- --agent <name>           Run predefined agent', 'dim');
    this.log('  npm run agent -- --prompt "text"          Run custom prompt', 'dim');
    this.log('  npm run agent -- --interactive            Interactive mode', 'dim');
    
    this.log('\nExamples:', 'info');
    this.log('  npm run agent -- --agent non-ascii', 'success');
    this.log('  npm run agent -- --prompt "Find all TODO comments"', 'success');
    
    this.rl.close();
  }
}

// Run the master agent
if (require.main === module) {
  const agent = new MasterAgent();
  agent.run().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = MasterAgent;