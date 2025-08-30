# Context Agent 🧠

A powerful terminal context retention system that maintains context across sessions and seamlessly shares it with Claude AI. Perfect for developers who want to maintain continuity in their work and provide rich context to AI assistants.

## Features

### 🔄 Context Retention
- **Automatic Command Tracking**: Every command you run is recorded with output and exit codes
- **File Change Monitoring**: Tracks all file modifications, creations, and deletions
- **Error Capture**: Automatically captures and indexes errors for debugging
- **Session Management**: Save and restore complete terminal sessions
- **Auto-Save**: Context is automatically saved every 30 seconds

### 🌍 Cross-Project Support
- **Global Context Storage**: Share context across all your projects
- **Project-Specific Context**: Maintain separate context for each project
- **Shared Variables**: Share API keys, configurations across projects
- **Session Portability**: Export and import sessions between machines

### 🤖 Claude AI Integration
- **One-Command Export**: Prepare context for Claude with `ctx claude`
- **Automatic Clipboard**: Context is copied to clipboard, ready to paste
- **Markdown Formatting**: Beautiful, readable context for Claude
- **Smart Summarization**: Automatically generates context summaries

### 🖥️ Context-Aware Terminal
- **Full Shell Replacement**: Works as a complete terminal with context tracking
- **Command History**: Persistent history across sessions
- **Auto-Completion**: Smart tab completion for commands and files
- **Visual Indicators**: Shows git branch, exit codes, and context status

## Installation

### Option 1: Global Installation (Recommended)
```bash
# Clone or copy the context-agent directory
cd context-agent
npm install

# Install globally
npm run install-global
# or
npm install -g .

# Now use from anywhere
ctx help
context-terminal
```

### Option 2: Project-Specific
```bash
# Copy context-agent to your project
cp -r context-agent your-project/scripts/

# Initialize in your project
cd your-project
node scripts/context-agent/cli.js init
```

### Option 3: NPM Scripts
Add to your `package.json`:
```json
{
  "scripts": {
    "ctx": "node scripts/context-agent/cli.js",
    "terminal": "node scripts/context-agent/terminal-wrapper.js"
  }
}
```

## Quick Start

### 1. Initialize Context Agent
```bash
# In your project directory
ctx init
```

### 2. Start Context-Aware Terminal
```bash
ctx terminal
# or
context-terminal
```

### 3. Work Normally
All your commands, file changes, and errors are automatically tracked!

### 4. Share with Claude
```bash
# Prepare context for Claude (automatically copied to clipboard)
ctx claude

# Or export to file
ctx export markdown context.md
```

## Usage

### Basic Commands

```bash
# Initialize context agent in current project
ctx init [description]

# Start context-aware terminal
ctx terminal

# Show current context status
ctx status

# Export context for Claude (auto-copies to clipboard)
ctx claude

# Export context to file
ctx export [markdown|json] [filename]
```

### Session Management

```bash
# List all sessions
ctx sessions

# Restore a previous session
ctx restore <session-id>

# Clean old sessions (older than 7 days)
ctx clean [days]

# Save context immediately
ctx sync
```

### Cross-Project Sharing

```bash
# Share a value across all projects
ctx share api_key "sk-xxxxx"
ctx share github_token "ghp_xxxxx"

# Get shared value in any project
ctx get api_key
ctx get github_token
```

### File Monitoring

```bash
# Watch and track file changes
ctx watch
```

## Context-Aware Terminal

The context-aware terminal is a full shell replacement with extra features:

### Built-in Commands
- `context show` - Display context summary
- `context export [format]` - Export current context
- `context save` - Force save context
- `context sessions` - List available sessions
- `export context` - Export to file
- `history` - Show command history
- `help` - Show available commands

### Features
- Tab completion for commands and files
- Visual git branch indicator
- Exit code display for failed commands
- Automatic context tracking
- Real-time file change monitoring

## How It Works

### Storage Structure
```
~/.context-agent/
├── global-context.json      # Shared across all projects
├── sessions/                # All terminal sessions
│   └── session-*.json       # Individual session data
└── projects/                # Project-specific contexts
    └── project-*.json       # Project context
```

### Local Project File
```
.context-agent.json          # Project-specific configuration
```

### Context Data Structure
- **Global**: Shared data across all projects
- **Project**: Project-specific context and settings
- **Session**: Current terminal session data
  - Commands with outputs and exit codes
  - File modifications
  - Errors and debugging info
  - Working directory changes
- **Terminal**: Environment information

## Integration with Claude

### Automatic Context Preparation
```bash
ctx claude
```
This command:
1. Gathers all relevant context
2. Formats it as markdown
3. Includes recent commands, errors, and changes
4. Copies to clipboard automatically
5. Ready to paste into Claude!

### What's Included in Context
- Session metadata (ID, duration, project info)
- Last 20 commands with outputs
- Recent errors for debugging
- Modified files list
- Recent file changes
- Environment information
- Project structure

### Example Context Output
```markdown
# Terminal Context

## Session Information
- Session ID: session-1234567890-abcd
- Project: my-project
- Path: /Users/john/projects/my-project
- Duration: 45 minutes

## Recent Commands
$ npm install express
✓ added 57 packages

$ npm test
✓ All tests passed

## Files Modified
- src/index.js
- package.json
- README.md

## Recent Errors
- Error: Cannot find module 'express'
```

## Use Cases

### 1. Debugging with Claude
```bash
# Work on your project, encounter an error
npm run build
# Error occurs...

# Share context with Claude
ctx claude
# Paste into Claude: "Help me fix this build error"
```

### 2. Project Handoff
```bash
# Export complete project context
ctx export json project-context.json

# On another machine
ctx import project-context.json
```

### 3. Daily Development
```bash
# Start your day
ctx terminal

# Work normally - everything is tracked
git pull
npm install
npm run dev
# Make changes, test, debug...

# End of day - context is saved
exit

# Next day - restore where you left off
ctx terminal
ctx sessions  # See yesterday's session
ctx restore session-xxx
```

### 4. Multi-Project Work
```bash
# Project A
cd project-a
ctx share api_endpoint "https://api.example.com"

# Project B
cd project-b
ctx get api_endpoint  # Returns: https://api.example.com
```

## Configuration

### Project Configuration (.context-agent.json)
```json
{
  "project": "my-project",
  "description": "E-commerce platform",
  "settings": {
    "autoSave": true,
    "trackCommands": true,
    "trackFiles": true,
    "trackErrors": true
  }
}
```

### Global Configuration (~/.context-agent/config.json)
```json
{
  "autoSaveInterval": 30000,
  "maxSessionAge": 7,
  "maxCommandHistory": 100,
  "maxErrorHistory": 50
}
```

## Tips & Best Practices

1. **Initialize Early**: Run `ctx init` when starting new projects
2. **Use Context Terminal**: Replace your normal terminal with `ctx terminal`
3. **Share with Claude**: Always run `ctx claude` before asking for help
4. **Clean Regularly**: Run `ctx clean` weekly to remove old sessions
5. **Share Wisely**: Use `ctx share` for API keys and common configs

## Troubleshooting

### Context not saving
```bash
# Force save
ctx sync

# Check status
ctx status
```

### Sessions too large
```bash
# Clean old sessions
ctx clean 3  # Keep only last 3 days

# Reset current session
ctx init
```

### Permission errors
```bash
# Fix permissions
chmod -R 755 ~/.context-agent
```

## Security

- Context files are stored locally in your home directory
- Sensitive data (passwords, tokens) should use environment variables
- Add `.context-agent.json` to `.gitignore`
- Use `ctx share` carefully - it persists across projects

## Contributing

This tool is designed to be extensible. Feel free to:
- Add new tracking capabilities
- Enhance Claude integration
- Improve terminal features
- Add new export formats

## License

MIT

## Author

Shivam Bhardwaj

---

**Note**: This context agent can be used with any project, not just JavaScript/Node.js projects. It tracks terminal commands regardless of the technology stack.