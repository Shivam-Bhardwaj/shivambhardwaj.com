#!/usr/bin/env node

/**
 * CLI Interface for Context Agent
 * Quick commands for context management
 */

const ContextAgent = require('./index');
const TerminalWrapper = require('./terminal-wrapper');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ContextCLI {
  constructor() {
    this.agent = new ContextAgent();
    this.command = process.argv[2];
    this.args = process.argv.slice(3);
  }

  async run() {
    switch (this.command) {
      case 'init':
        await this.initializeContext();
        break;
        
      case 'terminal':
      case 'shell':
      case 'start':
        await this.startTerminal();
        break;
        
      case 'export':
        await this.exportContext();
        break;
        
      case 'import':
        await this.importContext();
        break;
        
      case 'status':
      case 'summary':
        await this.showStatus();
        break;
        
      case 'sync':
        await this.syncContext();
        break;
        
      case 'sessions':
      case 'list':
        await this.listSessions();
        break;
        
      case 'restore':
        await this.restoreSession();
        break;
        
      case 'clean':
        await this.cleanSessions();
        break;
        
      case 'watch':
        await this.watchFiles();
        break;
        
      case 'claude':
        await this.prepareForClaude();
        break;
        
      case 'share':
        await this.shareContext();
        break;
        
      case 'get':
        await this.getShared();
        break;
        
      case 'install':
        await this.installGlobal();
        break;
        
      case 'help':
      default:
        this.showHelp();
    }
  }

  async initializeContext() {
    console.log('Initializing context agent...');
    
    // Create local context file
    const localContext = {
      project: path.basename(process.cwd()),
      initialized: new Date().toISOString(),
      description: this.args[0] || '',
      settings: {
        autoSave: true,
        trackCommands: true,
        trackFiles: true,
        trackErrors: true
      }
    };
    
    fs.writeFileSync('.context-agent.json', JSON.stringify(localContext, null, 2));
    console.log('✅ Context agent initialized for this project');
    console.log('📁 Created .context-agent.json');
    
    // Add to .gitignore
    if (fs.existsSync('.gitignore')) {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      if (!gitignore.includes('.context-agent')) {
        fs.appendFileSync('.gitignore', '\n# Context Agent\n.context-agent.json\n.context-agent/\n');
        console.log('📝 Added to .gitignore');
      }
    }
  }

  async startTerminal() {
    const terminal = new TerminalWrapper();
    terminal.start();
  }

  async exportContext() {
    const format = this.args[0] || 'markdown';
    const output = this.args[1] || `context-${Date.now()}.${format === 'markdown' ? 'md' : 'json'}`;
    
    const context = await this.agent.exportForClaude({ format });
    fs.writeFileSync(output, context);
    
    console.log(`✅ Context exported to: ${output}`);
    
    // Copy to clipboard if possible
    try {
      if (process.platform === 'darwin') {
        execSync(`pbcopy < ${output}`);
        console.log('📋 Copied to clipboard');
      } else if (process.platform === 'win32') {
        execSync(`type ${output} | clip`);
        console.log('📋 Copied to clipboard');
      }
    } catch {}
  }

  async importContext() {
    const file = this.args[0];
    if (!file) {
      console.error('Usage: ctx import <file>');
      process.exit(1);
    }
    
    const content = fs.readFileSync(file, 'utf8');
    const context = JSON.parse(content);
    
    // Merge with current context
    Object.assign(this.agent.context, context);
    await this.agent.saveContext();
    
    console.log('✅ Context imported');
  }

  async showStatus() {
    const summary = this.agent.getContextSummary();
    
    console.log('\n📊 Context Status\n');
    console.log(`Session ID: ${summary.session.id}`);
    console.log(`Duration: ${Math.round(summary.session.duration / 1000)}s`);
    console.log(`Commands: ${summary.session.commandCount}`);
    console.log(`Errors: ${summary.session.errorCount}`);
    console.log(`Files Modified: ${summary.session.filesModified}`);
    
    console.log('\n📁 Project');
    console.log(`Name: ${summary.project.name}`);
    console.log(`Path: ${summary.project.path}`);
    
    if (summary.recentCommands.length > 0) {
      console.log('\n🔄 Recent Commands');
      summary.recentCommands.forEach(cmd => {
        const time = new Date(cmd.timestamp).toLocaleTimeString();
        console.log(`  ${time} $ ${cmd.command}`);
      });
    }
    
    if (summary.recentErrors.length > 0) {
      console.log('\n❌ Recent Errors');
      summary.recentErrors.forEach(err => {
        const time = new Date(err.timestamp).toLocaleTimeString();
        console.log(`  ${time} ${err.content.substring(0, 80)}`);
      });
    }
  }

  async syncContext() {
    console.log('Syncing context...');
    await this.agent.saveContext();
    console.log('✅ Context synchronized');
  }

  async listSessions() {
    const sessions = await this.agent.listSessions();
    
    if (sessions.length === 0) {
      console.log('No sessions found');
      return;
    }
    
    console.log('\n📚 Available Sessions\n');
    sessions.forEach(session => {
      console.log(`${session.id}`);
      console.log(`  Started: ${session.startTime}`);
      console.log(`  Commands: ${session.commands}`);
      console.log(`  Files: ${session.files}`);
      console.log('');
    });
  }

  async restoreSession() {
    const sessionId = this.args[0];
    
    if (!sessionId) {
      console.error('Usage: ctx restore <session-id>');
      process.exit(1);
    }
    
    try {
      await this.agent.restoreSession(sessionId);
      console.log(`✅ Session restored: ${sessionId}`);
    } catch (error) {
      console.error(`❌ ${error.message}`);
    }
  }

  async cleanSessions() {
    const days = parseInt(this.args[0]) || 7;
    const count = await this.agent.cleanOldSessions(days);
    console.log(`🧹 Cleaned ${count} sessions older than ${days} days`);
  }

  async watchFiles() {
    console.log('Watching for file changes...');
    console.log('Press Ctrl+C to stop\n');
    
    const chokidar = require('chokidar');
    const watcher = chokidar.watch('.', {
      ignored: /(^|[\/\\])\../,
      persistent: true
    });
    
    watcher
      .on('add', path => {
        console.log(`+ ${path}`);
        this.agent.trackFileChange(path, 'create');
      })
      .on('change', path => {
        console.log(`~ ${path}`);
        this.agent.trackFileChange(path, 'modify');
      })
      .on('unlink', path => {
        console.log(`- ${path}`);
        this.agent.trackFileChange(path, 'delete');
      });
    
    process.on('SIGINT', async () => {
      await this.agent.saveContext();
      console.log('\n✅ Context saved');
      process.exit(0);
    });
  }

  async prepareForClaude() {
    console.log('Preparing context for Claude...\n');
    
    const format = this.args[0] || 'markdown';
    const context = await this.agent.exportForClaude({ 
      format, 
      includeGlobal: true 
    });
    
    // Save to temp file
    const tempFile = path.join(os.tmpdir(), `claude-context-${Date.now()}.${format === 'markdown' ? 'md' : 'json'}`);
    fs.writeFileSync(tempFile, context);
    
    console.log('📄 Context Summary:');
    const summary = this.agent.getContextSummary();
    console.log(`  - Session: ${summary.session.id}`);
    console.log(`  - Commands: ${summary.session.commandCount}`);
    console.log(`  - Files: ${summary.session.filesModified}`);
    console.log(`  - Duration: ${Math.round(summary.session.duration / 60000)} minutes`);
    
    console.log(`\n✅ Context prepared: ${tempFile}`);
    
    // Try to copy to clipboard
    try {
      if (process.platform === 'darwin') {
        execSync(`pbcopy < ${tempFile}`);
        console.log('📋 Copied to clipboard - ready to paste into Claude!');
      } else if (process.platform === 'win32') {
        execSync(`type ${tempFile} | clip`);
        console.log('📋 Copied to clipboard - ready to paste into Claude!');
      }
    } catch {
      console.log('💡 Copy the file contents manually to share with Claude');
    }
  }

  async shareContext() {
    const key = this.args[0];
    const value = this.args.slice(1).join(' ');
    
    if (!key || !value) {
      console.error('Usage: ctx share <key> <value>');
      process.exit(1);
    }
    
    await this.agent.shareContext(key, value);
    console.log(`✅ Shared: ${key} = ${value}`);
  }

  async getShared() {
    const key = this.args[0];
    const value = this.agent.getSharedContext(key);
    
    if (value !== undefined) {
      console.log(JSON.stringify(value, null, 2));
    } else {
      console.log('Not found');
    }
  }

  async installGlobal() {
    console.log('Installing context-agent globally...');
    
    try {
      execSync('npm install -g .', { 
        cwd: __dirname,
        stdio: 'inherit'
      });
      console.log('\n✅ Context agent installed globally!');
      console.log('You can now use these commands from anywhere:');
      console.log('  ctx          - Quick context commands');
      console.log('  context-agent - Full agent interface');
      console.log('  context-terminal - Context-aware terminal');
    } catch (error) {
      console.error('❌ Installation failed:', error.message);
    }
  }

  showHelp() {
    console.log(`
╔════════════════════════════════════════════════════╗
║           Context Agent CLI - v1.0.0              ║
╚════════════════════════════════════════════════════╝

Usage: ctx <command> [options]

QUICK START:
  ctx init             Initialize context agent in current project
  ctx terminal         Start context-aware terminal
  ctx claude           Prepare and copy context for Claude AI

CONTEXT COMMANDS:
  ctx export [format]  Export context (markdown|json)
  ctx import <file>    Import context from file
  ctx status           Show current context status
  ctx sync             Save context immediately

SESSION COMMANDS:
  ctx sessions         List all saved sessions
  ctx restore <id>     Restore a previous session
  ctx clean [days]     Clean old sessions (default: 7 days)

SHARING COMMANDS:
  ctx share <k> <v>    Share context across projects
  ctx get [key]        Get shared context value

MONITORING:
  ctx watch            Watch and track file changes

SETUP:
  ctx install          Install globally for system-wide use
  ctx help             Show this help message

EXAMPLES:
  # Initialize in a new project
  $ ctx init

  # Start working with context tracking
  $ ctx terminal

  # Before asking Claude for help
  $ ctx claude

  # Share API key across projects
  $ ctx share api_key sk-xxxxx

  # Export context for documentation
  $ ctx export markdown project-context.md

ENVIRONMENT:
  Context stored in: ~/.context-agent/
  Local config: .context-agent.json

For more information: https://github.com/yourusername/context-agent
    `);
  }
}

// Run CLI
if (require.main === module) {
  const cli = new ContextCLI();
  cli.run().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}

module.exports = ContextCLI;