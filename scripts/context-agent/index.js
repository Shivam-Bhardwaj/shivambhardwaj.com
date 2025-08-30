#!/usr/bin/env node

/**
 * Context Retention Agent
 * A powerful system for maintaining context across terminal sessions and Claude conversations
 * Can be used across all projects to maintain continuity
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawn } = require('child_process');
const readline = require('readline');
const crypto = require('crypto');

class ContextAgent {
  constructor() {
    // Global context storage location
    this.globalContextDir = path.join(os.homedir(), '.context-agent');
    this.globalContextFile = path.join(this.globalContextDir, 'global-context.json');
    this.sessionsDir = path.join(this.globalContextDir, 'sessions');
    this.projectsDir = path.join(this.globalContextDir, 'projects');
    
    // Local project context
    this.localContextFile = path.join(process.cwd(), '.context-agent.json');
    
    // Session info
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    
    // Context data structure
    this.context = {
      global: {},
      project: {},
      session: {
        id: this.sessionId,
        startTime: this.startTime,
        commands: [],
        outputs: [],
        errors: [],
        files: [],
        changes: []
      },
      terminal: {
        cwd: process.cwd(),
        env: this.getRelevantEnv(),
        shell: process.env.SHELL || 'bash',
        user: process.env.USER || process.env.USERNAME
      }
    };
    
    // Initialize
    this.initialize();
  }

  /**
   * Initialize the context agent
   */
  async initialize() {
    // Create directories if they don't exist
    const dirs = [this.globalContextDir, this.sessionsDir, this.projectsDir];
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    
    // Load existing contexts
    await this.loadGlobalContext();
    await this.loadProjectContext();
    
    // Set up terminal hooks
    this.setupTerminalHooks();
    
    // Set up auto-save
    this.setupAutoSave();
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Get relevant environment variables
   */
  getRelevantEnv() {
    const relevant = [
      'NODE_ENV', 'PATH', 'HOME', 'USER', 'SHELL',
      'EDITOR', 'VISUAL', 'LANG', 'PWD', 'TERM'
    ];
    
    const env = {};
    for (const key of relevant) {
      if (process.env[key]) {
        env[key] = process.env[key];
      }
    }
    return env;
  }

  /**
   * Load global context
   */
  async loadGlobalContext() {
    if (fs.existsSync(this.globalContextFile)) {
      try {
        const data = await fs.promises.readFile(this.globalContextFile, 'utf8');
        this.context.global = JSON.parse(data);
      } catch (error) {
        console.error('Failed to load global context:', error.message);
      }
    }
  }

  /**
   * Load project-specific context
   */
  async loadProjectContext() {
    const projectId = this.getProjectId();
    const projectFile = path.join(this.projectsDir, `${projectId}.json`);
    
    if (fs.existsSync(projectFile)) {
      try {
        const data = await fs.promises.readFile(projectFile, 'utf8');
        this.context.project = JSON.parse(data);
      } catch (error) {
        console.error('Failed to load project context:', error.message);
      }
    }
    
    // Also load local project context
    if (fs.existsSync(this.localContextFile)) {
      try {
        const data = await fs.promises.readFile(this.localContextFile, 'utf8');
        const localContext = JSON.parse(data);
        this.context.project = { ...this.context.project, ...localContext };
      } catch (error) {
        console.error('Failed to load local context:', error.message);
      }
    }
  }

  /**
   * Get project identifier
   */
  getProjectId() {
    const cwd = process.cwd();
    const hash = crypto.createHash('md5').update(cwd).digest('hex');
    return `project-${path.basename(cwd)}-${hash.substring(0, 8)}`;
  }

  /**
   * Setup terminal hooks to capture commands
   */
  setupTerminalHooks() {
    // Override console methods to capture output
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      this.captureOutput('log', args);
      originalLog.apply(console, args);
    };
    
    console.error = (...args) => {
      this.captureOutput('error', args);
      originalError.apply(console, args);
    };
    
    // Capture process events
    process.on('beforeExit', () => this.saveContext());
    process.on('SIGINT', () => {
      this.saveContext();
      process.exit(0);
    });
  }

  /**
   * Setup auto-save interval
   */
  setupAutoSave() {
    setInterval(() => {
      this.saveContext();
    }, 30000); // Save every 30 seconds
  }

  /**
   * Capture terminal output
   */
  captureOutput(type, args) {
    const output = {
      type,
      content: args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' '),
      timestamp: Date.now()
    };
    
    if (type === 'error') {
      this.context.session.errors.push(output);
    } else {
      this.context.session.outputs.push(output);
    }
    
    // Keep only last 100 outputs to prevent memory bloat
    if (this.context.session.outputs.length > 100) {
      this.context.session.outputs = this.context.session.outputs.slice(-100);
    }
    if (this.context.session.errors.length > 50) {
      this.context.session.errors = this.context.session.errors.slice(-50);
    }
  }

  /**
   * Record a command execution
   */
  recordCommand(command, output, exitCode) {
    const record = {
      command,
      output: output ? output.substring(0, 1000) : '', // Limit output size
      exitCode,
      timestamp: Date.now(),
      cwd: process.cwd()
    };
    
    this.context.session.commands.push(record);
    
    // Keep only last 50 commands
    if (this.context.session.commands.length > 50) {
      this.context.session.commands = this.context.session.commands.slice(-50);
    }
  }

  /**
   * Track file changes
   */
  trackFileChange(filepath, action) {
    const change = {
      file: filepath,
      action, // 'create', 'modify', 'delete'
      timestamp: Date.now()
    };
    
    this.context.session.changes.push(change);
    
    // Update files list
    if (action !== 'delete' && !this.context.session.files.includes(filepath)) {
      this.context.session.files.push(filepath);
    }
  }

  /**
   * Save all context
   */
  async saveContext() {
    try {
      // Save global context
      await fs.promises.writeFile(
        this.globalContextFile,
        JSON.stringify(this.context.global, null, 2)
      );
      
      // Save project context
      const projectId = this.getProjectId();
      const projectFile = path.join(this.projectsDir, `${projectId}.json`);
      await fs.promises.writeFile(
        projectFile,
        JSON.stringify(this.context.project, null, 2)
      );
      
      // Save session
      const sessionFile = path.join(this.sessionsDir, `${this.sessionId}.json`);
      await fs.promises.writeFile(
        sessionFile,
        JSON.stringify(this.context.session, null, 2)
      );
      
      // Save local context
      const localContext = {
        lastSession: this.sessionId,
        lastUpdate: Date.now(),
        project: this.context.project
      };
      await fs.promises.writeFile(
        this.localContextFile,
        JSON.stringify(localContext, null, 2)
      );
    } catch (error) {
      console.error('Failed to save context:', error.message);
    }
  }

  /**
   * Get context summary
   */
  getContextSummary() {
    const summary = {
      session: {
        id: this.sessionId,
        duration: Date.now() - this.startTime,
        commandCount: this.context.session.commands.length,
        errorCount: this.context.session.errors.length,
        filesModified: this.context.session.files.length
      },
      project: {
        name: path.basename(process.cwd()),
        path: process.cwd(),
        ...this.context.project
      },
      recentCommands: this.context.session.commands.slice(-5),
      recentErrors: this.context.session.errors.slice(-3),
      recentChanges: this.context.session.changes.slice(-10)
    };
    
    return summary;
  }

  /**
   * Export context for Claude
   */
  async exportForClaude(options = {}) {
    const context = {
      metadata: {
        exported: new Date().toISOString(),
        session: this.sessionId,
        project: path.basename(process.cwd()),
        cwd: process.cwd()
      },
      environment: this.context.terminal,
      session: {
        duration: Date.now() - this.startTime,
        commands: this.context.session.commands.slice(-20),
        errors: this.context.session.errors.slice(-10),
        filesModified: this.context.session.files,
        changes: this.context.session.changes.slice(-20)
      },
      project: this.context.project,
      summary: this.generateSummary()
    };
    
    if (options.includeGlobal) {
      context.global = this.context.global;
    }
    
    if (options.format === 'markdown') {
      return this.contextToMarkdown(context);
    }
    
    return JSON.stringify(context, null, 2);
  }

  /**
   * Generate human-readable summary
   */
  generateSummary() {
    const commands = this.context.session.commands;
    const errors = this.context.session.errors;
    
    const summary = [];
    
    // Analyze command patterns
    const commandTypes = {};
    commands.forEach(cmd => {
      const type = cmd.command.split(' ')[0];
      commandTypes[type] = (commandTypes[type] || 0) + 1;
    });
    
    summary.push(`Session started ${new Date(this.startTime).toLocaleString()}`);
    summary.push(`${commands.length} commands executed`);
    
    if (errors.length > 0) {
      summary.push(`${errors.length} errors encountered`);
    }
    
    if (this.context.session.files.length > 0) {
      summary.push(`${this.context.session.files.length} files modified`);
    }
    
    // Most used commands
    const topCommands = Object.entries(commandTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (topCommands.length > 0) {
      summary.push(`Most used: ${topCommands.map(([cmd, count]) => `${cmd} (${count})`).join(', ')}`);
    }
    
    return summary.join('\n');
  }

  /**
   * Convert context to markdown
   */
  contextToMarkdown(context) {
    let markdown = '# Terminal Context\n\n';
    
    markdown += '## Session Information\n';
    markdown += `- **Session ID**: ${context.metadata.session}\n`;
    markdown += `- **Project**: ${context.metadata.project}\n`;
    markdown += `- **Path**: ${context.metadata.cwd}\n`;
    markdown += `- **Exported**: ${context.metadata.exported}\n\n`;
    
    markdown += '## Summary\n';
    markdown += '```\n' + context.summary + '\n```\n\n';
    
    if (context.session.commands.length > 0) {
      markdown += '## Recent Commands\n';
      context.session.commands.forEach(cmd => {
        markdown += `\n### ${new Date(cmd.timestamp).toLocaleTimeString()}\n`;
        markdown += '```bash\n';
        markdown += `$ ${cmd.command}\n`;
        if (cmd.output) {
          markdown += cmd.output + '\n';
        }
        if (cmd.exitCode !== 0) {
          markdown += `# Exit code: ${cmd.exitCode}\n`;
        }
        markdown += '```\n';
      });
    }
    
    if (context.session.errors.length > 0) {
      markdown += '\n## Recent Errors\n';
      context.session.errors.forEach(err => {
        markdown += `- ${new Date(err.timestamp).toLocaleTimeString()}: ${err.content}\n`;
      });
    }
    
    if (context.session.filesModified.length > 0) {
      markdown += '\n## Files Modified\n';
      context.session.filesModified.forEach(file => {
        markdown += `- ${file}\n`;
      });
    }
    
    if (context.session.changes.length > 0) {
      markdown += '\n## Recent Changes\n';
      context.session.changes.forEach(change => {
        markdown += `- ${change.action}: ${change.file} at ${new Date(change.timestamp).toLocaleTimeString()}\n`;
      });
    }
    
    return markdown;
  }

  /**
   * Restore context from a previous session
   */
  async restoreSession(sessionId) {
    const sessionFile = path.join(this.sessionsDir, `${sessionId}.json`);
    
    if (!fs.existsSync(sessionFile)) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    const data = await fs.promises.readFile(sessionFile, 'utf8');
    const previousSession = JSON.parse(data);
    
    // Merge with current context
    this.context.session.commands = [
      ...previousSession.commands,
      ...this.context.session.commands
    ];
    
    this.context.session.files = [
      ...new Set([...previousSession.files, ...this.context.session.files])
    ];
    
    return previousSession;
  }

  /**
   * List available sessions
   */
  async listSessions() {
    const files = await fs.promises.readdir(this.sessionsDir);
    const sessions = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filepath = path.join(this.sessionsDir, file);
        const data = await fs.promises.readFile(filepath, 'utf8');
        const session = JSON.parse(data);
        
        sessions.push({
          id: session.id,
          startTime: new Date(session.startTime).toLocaleString(),
          commands: session.commands.length,
          files: session.files.length
        });
      }
    }
    
    return sessions.sort((a, b) => b.startTime - a.startTime);
  }

  /**
   * Clean old sessions
   */
  async cleanOldSessions(daysToKeep = 7) {
    const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const files = await fs.promises.readdir(this.sessionsDir);
    let cleaned = 0;
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filepath = path.join(this.sessionsDir, file);
        const stats = await fs.promises.stat(filepath);
        
        if (stats.mtime.getTime() < cutoff) {
          await fs.promises.unlink(filepath);
          cleaned++;
        }
      }
    }
    
    return cleaned;
  }

  /**
   * Share context across projects
   */
  async shareContext(key, value) {
    this.context.global[key] = value;
    await this.saveContext();
  }

  /**
   * Get shared context
   */
  getSharedContext(key) {
    return key ? this.context.global[key] : this.context.global;
  }

  /**
   * Interactive shell wrapper
   */
  wrapShell(shellCommand = process.env.SHELL || 'bash') {
    const shell = spawn(shellCommand, [], {
      stdio: ['inherit', 'pipe', 'pipe'],
      env: { ...process.env, CONTEXT_AGENT: 'active' }
    });
    
    shell.stdout.on('data', (data) => {
      process.stdout.write(data);
      this.captureOutput('log', [data.toString()]);
    });
    
    shell.stderr.on('data', (data) => {
      process.stderr.write(data);
      this.captureOutput('error', [data.toString()]);
    });
    
    shell.on('exit', (code) => {
      this.saveContext();
      process.exit(code);
    });
    
    return shell;
  }
}

// CLI Interface
if (require.main === module) {
  const agent = new ContextAgent();
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'start':
    case 'shell':
      // Start an interactive shell with context tracking
      console.log('Starting context-aware shell...');
      agent.wrapShell(args[1]);
      break;
      
    case 'export':
      // Export context for Claude
      agent.exportForClaude({
        format: args[1] || 'json',
        includeGlobal: args.includes('--global')
      }).then(context => {
        console.log(context);
      });
      break;
      
    case 'summary':
      // Show context summary
      const summary = agent.getContextSummary();
      console.log(JSON.stringify(summary, null, 2));
      break;
      
    case 'sessions':
      // List sessions
      agent.listSessions().then(sessions => {
        console.log('Available sessions:');
        sessions.forEach(s => {
          console.log(`  ${s.id} - ${s.startTime} (${s.commands} commands, ${s.files} files)`);
        });
      });
      break;
      
    case 'restore':
      // Restore a session
      if (!args[1]) {
        console.error('Usage: context-agent restore <session-id>');
        process.exit(1);
      }
      agent.restoreSession(args[1]).then(() => {
        console.log(`Session ${args[1]} restored`);
      }).catch(error => {
        console.error(error.message);
      });
      break;
      
    case 'clean':
      // Clean old sessions
      const days = parseInt(args[1]) || 7;
      agent.cleanOldSessions(days).then(count => {
        console.log(`Cleaned ${count} old sessions`);
      });
      break;
      
    case 'share':
      // Share context
      if (!args[1] || !args[2]) {
        console.error('Usage: context-agent share <key> <value>');
        process.exit(1);
      }
      agent.shareContext(args[1], args[2]).then(() => {
        console.log(`Shared: ${args[1]} = ${args[2]}`);
      });
      break;
      
    case 'get':
      // Get shared context
      const value = agent.getSharedContext(args[1]);
      console.log(value ? JSON.stringify(value, null, 2) : 'Not found');
      break;
      
    case 'help':
    default:
      console.log(`
Context Agent - Terminal Context Retention System

Usage: context-agent <command> [options]

Commands:
  start [shell]         Start context-aware shell (default: $SHELL)
  export [format]       Export context for Claude (json|markdown)
  summary              Show current context summary
  sessions             List available sessions
  restore <id>         Restore a previous session
  clean [days]         Clean sessions older than N days (default: 7)
  share <key> <value>  Share context across projects
  get [key]            Get shared context
  help                 Show this help

Examples:
  context-agent start              # Start context-aware shell
  context-agent export markdown    # Export context as markdown
  context-agent sessions           # List all sessions
  context-agent restore session-123 # Restore specific session
  context-agent share api_key xxx  # Share API key across projects

Environment:
  CONTEXT_AGENT=active  Set when running in context-aware shell
      `);
  }
}

module.exports = ContextAgent;