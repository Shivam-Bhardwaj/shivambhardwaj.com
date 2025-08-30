#!/usr/bin/env node

/**
 * Terminal Wrapper for Context Agent
 * Intercepts and tracks all terminal commands while maintaining full context
 */

const { spawn } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const os = require('os');
const ContextAgent = require('./index');

class TerminalWrapper {
  constructor() {
    this.agent = new ContextAgent();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: this.getPrompt(),
      completer: this.completer.bind(this)
    });
    
    this.history = [];
    this.cwd = process.cwd();
    this.aliases = this.loadAliases();
    this.lastExitCode = 0;
    
    this.setupInterface();
  }

  /**
   * Get custom prompt
   */
  getPrompt() {
    const cwd = process.cwd();
    const home = os.homedir();
    const displayPath = cwd.replace(home, '~');
    const gitBranch = this.getGitBranch();
    const contextIndicator = '[CA]'; // Context Agent active
    
    let prompt = `\x1b[36m${contextIndicator}\x1b[0m `;
    prompt += `\x1b[33m${displayPath}\x1b[0m`;
    
    if (gitBranch) {
      prompt += ` \x1b[35m(${gitBranch})\x1b[0m`;
    }
    
    if (this.lastExitCode !== 0) {
      prompt += ` \x1b[31m[${this.lastExitCode}]\x1b[0m`;
    }
    
    prompt += ' $ ';
    return prompt;
  }

  /**
   * Get current git branch
   */
  getGitBranch() {
    try {
      const branch = require('child_process')
        .execSync('git branch --show-current 2>/dev/null', { encoding: 'utf8' })
        .trim();
      return branch;
    } catch {
      return null;
    }
  }

  /**
   * Load shell aliases
   */
  loadAliases() {
    const aliases = {};
    
    // Load from .bashrc or .zshrc
    const rcFiles = [
      path.join(os.homedir(), '.bashrc'),
      path.join(os.homedir(), '.zshrc'),
      path.join(os.homedir(), '.aliases')
    ];
    
    for (const file of rcFiles) {
      if (fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const aliasRegex = /alias\s+(\w+)=['"]?([^'"]+)['"]?/g;
          let match;
          
          while ((match = aliasRegex.exec(content)) !== null) {
            aliases[match[1]] = match[2];
          }
        } catch {}
      }
    }
    
    return aliases;
  }

  /**
   * Setup readline interface
   */
  setupInterface() {
    this.rl.on('line', async (input) => {
      const trimmed = input.trim();
      
      if (!trimmed) {
        this.rl.prompt();
        return;
      }
      
      // Add to history
      this.history.push(trimmed);
      
      // Process command
      await this.processCommand(trimmed);
      
      // Update prompt
      this.rl.setPrompt(this.getPrompt());
      this.rl.prompt();
    });

    this.rl.on('close', () => {
      console.log('\nSaving context...');
      this.agent.saveContext().then(() => {
        console.log('Context saved. Goodbye!');
        process.exit(0);
      });
    });

    // Handle Ctrl+C gracefully
    process.on('SIGINT', () => {
      console.log('\n(To exit, type "exit" or press Ctrl+D)');
      this.rl.prompt();
    });
  }

  /**
   * Process command
   */
  async processCommand(input) {
    // Check for built-in commands
    if (this.handleBuiltin(input)) {
      return;
    }
    
    // Expand aliases
    const expanded = this.expandAliases(input);
    
    // Parse command
    const parsed = this.parseCommand(expanded);
    
    // Execute command
    await this.executeCommand(parsed);
  }

  /**
   * Handle built-in commands
   */
  handleBuiltin(input) {
    const [cmd, ...args] = input.split(' ');
    
    switch (cmd) {
      case 'cd':
        return this.changeDirectory(args[0] || os.homedir());
        
      case 'exit':
      case 'quit':
        this.rl.close();
        return true;
        
      case 'history':
        this.showHistory();
        return true;
        
      case 'context':
        return this.handleContextCommand(args);
        
      case 'clear':
        console.clear();
        return true;
        
      case 'export':
        if (args[0] === 'context') {
          this.exportContext(args[1]);
          return true;
        }
        break;
        
      case 'help':
        this.showHelp();
        return true;
    }
    
    return false;
  }

  /**
   * Change directory
   */
  changeDirectory(dir) {
    try {
      const newDir = path.resolve(dir);
      process.chdir(newDir);
      this.cwd = process.cwd();
      this.agent.context.terminal.cwd = this.cwd;
      console.log(`Changed to: ${this.cwd}`);
    } catch (error) {
      console.error(`cd: ${error.message}`);
      this.lastExitCode = 1;
    }
    return true;
  }

  /**
   * Show command history
   */
  showHistory() {
    this.history.forEach((cmd, index) => {
      console.log(`  ${index + 1}  ${cmd}`);
    });
  }

  /**
   * Handle context commands
   */
  handleContextCommand(args) {
    const subcommand = args[0];
    
    switch (subcommand) {
      case 'show':
      case 'summary':
        const summary = this.agent.getContextSummary();
        console.log(JSON.stringify(summary, null, 2));
        break;
        
      case 'export':
        this.agent.exportForClaude({ format: args[1] || 'json' })
          .then(content => console.log(content));
        break;
        
      case 'save':
        this.agent.saveContext()
          .then(() => console.log('Context saved'));
        break;
        
      case 'sessions':
        this.agent.listSessions()
          .then(sessions => {
            console.log('Sessions:');
            sessions.forEach(s => {
              console.log(`  ${s.id} - ${s.startTime}`);
            });
          });
        break;
        
      default:
        console.log('Usage: context <show|export|save|sessions>');
    }
    
    return true;
  }

  /**
   * Export context
   */
  async exportContext(format = 'markdown') {
    const content = await this.agent.exportForClaude({ format });
    const filename = `context-${Date.now()}.${format === 'markdown' ? 'md' : 'json'}`;
    
    fs.writeFileSync(filename, content);
    console.log(`Context exported to: ${filename}`);
  }

  /**
   * Show help
   */
  showHelp() {
    console.log(`
Context-Aware Terminal

Built-in Commands:
  cd <dir>           Change directory
  history            Show command history
  context <cmd>      Context operations
    show/summary     Show context summary
    export [format]  Export context (json|markdown)
    save            Save current context
    sessions        List sessions
  export context     Export context to file
  clear             Clear screen
  exit/quit         Exit terminal
  help              Show this help

Context Features:
  - All commands are tracked and recorded
  - File changes are monitored
  - Errors are captured for debugging
  - Context is auto-saved every 30 seconds
  - Sessions can be restored later

Special Keys:
  Tab               Auto-complete
  Ctrl+C            Cancel current command
  Ctrl+D            Exit terminal
  Up/Down           Navigate history
    `);
  }

  /**
   * Expand aliases
   */
  expandAliases(input) {
    const parts = input.split(' ');
    const cmd = parts[0];
    
    if (this.aliases[cmd]) {
      parts[0] = this.aliases[cmd];
      return parts.join(' ');
    }
    
    return input;
  }

  /**
   * Parse command
   */
  parseCommand(input) {
    // Handle pipes and redirects
    const pipes = input.split('|').map(s => s.trim());
    const commands = [];
    
    for (const pipe of pipes) {
      const redirectMatch = pipe.match(/(.*?)\s*(>+|<)\s*(.*)$/);
      
      if (redirectMatch) {
        commands.push({
          command: redirectMatch[1].trim(),
          redirect: redirectMatch[2],
          file: redirectMatch[3].trim()
        });
      } else {
        commands.push({ command: pipe });
      }
    }
    
    return commands;
  }

  /**
   * Execute command
   */
  async executeCommand(parsed) {
    let input = null;
    let output = '';
    
    for (const cmd of parsed) {
      const result = await this.runCommand(cmd.command, input);
      
      output = result.output;
      this.lastExitCode = result.exitCode;
      
      // Handle redirects
      if (cmd.redirect) {
        if (cmd.redirect === '>') {
          fs.writeFileSync(cmd.file, output);
          this.agent.trackFileChange(cmd.file, 'modify');
          console.log(`Output written to: ${cmd.file}`);
        } else if (cmd.redirect === '>>') {
          fs.appendFileSync(cmd.file, output);
          this.agent.trackFileChange(cmd.file, 'modify');
          console.log(`Output appended to: ${cmd.file}`);
        } else if (cmd.redirect === '<') {
          input = fs.readFileSync(cmd.file, 'utf8');
        }
      } else {
        // Use output as input for next command in pipe
        input = output;
      }
      
      // Record command in context
      this.agent.recordCommand(cmd.command, output, this.lastExitCode);
    }
  }

  /**
   * Run a single command
   */
  runCommand(command, input) {
    return new Promise((resolve) => {
      const shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/sh';
      const shellArgs = process.platform === 'win32' ? ['/c', command] : ['-c', command];
      
      const child = spawn(shell, shellArgs, {
        cwd: this.cwd,
        env: { ...process.env, CONTEXT_AGENT: 'active' },
        shell: false
      });
      
      let output = '';
      let errorOutput = '';
      
      if (input) {
        child.stdin.write(input);
        child.stdin.end();
      }
      
      child.stdout.on('data', (data) => {
        const str = data.toString();
        output += str;
        process.stdout.write(data);
      });
      
      child.stderr.on('data', (data) => {
        const str = data.toString();
        errorOutput += str;
        process.stderr.write(data);
        this.agent.captureOutput('error', [str]);
      });
      
      child.on('close', (code) => {
        resolve({
          output,
          errorOutput,
          exitCode: code || 0
        });
      });
      
      child.on('error', (error) => {
        console.error(`Failed to execute: ${error.message}`);
        resolve({
          output: '',
          errorOutput: error.message,
          exitCode: 1
        });
      });
    });
  }

  /**
   * Auto-completion
   */
  completer(line) {
    const completions = [
      ...Object.keys(this.aliases),
      'cd', 'history', 'context', 'clear', 'exit', 'help',
      'export', 'ls', 'pwd', 'echo', 'cat', 'grep', 'find'
    ];
    
    // Add files in current directory
    try {
      const files = fs.readdirSync(this.cwd);
      completions.push(...files);
    } catch {}
    
    const hits = completions.filter(c => c.startsWith(line));
    return [hits.length ? hits : completions, line];
  }

  /**
   * Start the terminal
   */
  start() {
    console.log('Context-Aware Terminal Started');
    console.log('Type "help" for available commands');
    console.log('All commands and context are being tracked\n');
    
    this.rl.prompt();
  }
}

// Start terminal if run directly
if (require.main === module) {
  const terminal = new TerminalWrapper();
  terminal.start();
}

module.exports = TerminalWrapper;