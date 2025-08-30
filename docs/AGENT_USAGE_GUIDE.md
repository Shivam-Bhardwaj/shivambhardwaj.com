# 🤖 Master Agent Usage Guide

The Master Agent script provides a unified interface for running LLM agents and custom prompts on your codebase. It generates comprehensive prompts that can be directly used with Claude Code.

## 🚀 Quick Start

### List Available Agents
```bash
npm run agent:list
# or
npm run agent -- --list
```

### Run Predefined Agents
```bash
# Non-ASCII character detection
npm run agent:non-ascii

# Code quality analysis
npm run agent:quality

# Security vulnerability scan
npm run agent:security

# Dependency audit
npm run agent:deps

# Accessibility audit
npm run agent:a11y

# Performance analysis
npm run agent:performance

# Test coverage analysis
npm run agent:tests

# Documentation quality check
npm run agent:docs
```

### Run Custom Prompts
```bash
npm run agent -- --prompt "Find all TODO comments in the codebase"
npm run agent -- --prompt "Analyze React component patterns and suggest improvements"
npm run agent -- --prompt "Check for unused imports across all TypeScript files"
```

### Interactive Mode
```bash
npm run agent:interactive
# or
npm run agent -- --interactive
```

## 📋 Available Agents

### 🔍 **non-ascii** - Non-ASCII Character Detector
**Purpose**: Scans for non-ASCII characters that might cause encoding issues  
**Command**: `npm run agent:non-ascii`  
**Use Cases**:
- Pre-deployment encoding validation
- Finding hidden Unicode characters
- Ensuring compatibility across platforms

### 🏗️ **code-quality** - Code Quality Analyzer  
**Purpose**: Analyzes code quality and technical debt  
**Command**: `npm run agent:quality`  
**Use Cases**:
- Code review preparation
- Refactoring planning
- Architecture assessment

### 🔒 **security-scan** - Security Vulnerability Scanner
**Purpose**: Identifies security vulnerabilities and unsafe patterns  
**Command**: `npm run agent:security`  
**Use Cases**:
- Security audits
- Pre-deployment security checks
- Vulnerability assessment

### 📦 **dependency-audit** - Dependency Security Auditor
**Purpose**: Audits dependencies for security and maintenance issues  
**Command**: `npm run agent:deps`  
**Use Cases**:
- Package update planning
- Security vulnerability tracking
- Bundle size optimization

### ♿ **accessibility-audit** - Accessibility Auditor
**Purpose**: Scans for accessibility issues and WCAG compliance  
**Command**: `npm run agent:a11y`  
**Use Cases**:
- WCAG compliance verification
- Accessibility improvement planning
- Screen reader compatibility

### ⚡ **performance-audit** - Performance Analyzer
**Purpose**: Identifies performance bottlenecks and optimization opportunities  
**Command**: `npm run agent:performance`  
**Use Cases**:
- Performance optimization
- Bundle size analysis
- Loading speed improvements

### 🧪 **test-coverage** - Test Coverage Analyzer
**Purpose**: Reviews test coverage and identifies untested critical paths  
**Command**: `npm run agent:tests`  
**Use Cases**:
- Test coverage improvement
- Critical path identification
- Test quality assessment

### 📚 **documentation-audit** - Documentation Quality Checker
**Purpose**: Reviews and improves code documentation  
**Command**: `npm run agent:docs`  
**Use Cases**:
- Documentation completeness
- Code comment quality
- Developer onboarding improvement

## 🎯 Usage Patterns

### Daily Development Workflow
```bash
# Morning code quality check
npm run agent:quality

# Before committing
npm run agent:security
npm run agent:non-ascii

# Weekly maintenance
npm run agent:deps
npm run agent:tests
```

### Pre-Release Checklist
```bash
npm run agent:security      # Security scan
npm run agent:performance   # Performance check  
npm run agent:a11y         # Accessibility audit
npm run agent:docs         # Documentation review
```

### Custom Analysis Examples

#### Find TODOs and FIXMEs
```bash
npm run agent -- --prompt "Find all TODO, FIXME, HACK, and XXX comments in the codebase. Categorize by priority and suggest which ones should be addressed before the next release."
```

#### Analyze Component Architecture
```bash
npm run agent -- --prompt "Analyze the React component architecture. Identify components that violate single responsibility principle, have too many props, or should be split into smaller components."
```

#### Check TypeScript Usage
```bash
npm run agent -- --prompt "Review TypeScript usage across the codebase. Find areas where 'any' types are used, missing interface definitions, or where stricter typing could be applied."
```

#### API Consistency Check
```bash
npm run agent -- --prompt "Analyze API consistency across components. Check for naming conventions, prop patterns, and suggest standardizations."
```

## 🔧 Advanced Usage

### Combining Multiple Agents
You can run multiple agents in sequence by creating custom scripts:

```json
{
  "scripts": {
    "agent:pre-deploy": "npm run agent:security && npm run agent:performance && npm run agent:a11y",
    "agent:code-review": "npm run agent:quality && npm run agent:tests && npm run agent:docs"
  }
}
```

### Custom Agent Creation
To add a new predefined agent, edit `scripts/master-agent.js`:

```javascript
'my-custom-agent': {
  name: 'My Custom Agent',
  description: 'Description of what this agent does',
  prompt: `Your detailed prompt here...`
}
```

Then add to package.json:
```json
{
  "scripts": {
    "agent:custom": "node scripts/master-agent.js --agent my-custom-agent"
  }
}
```

## 📊 Output Format

The master agent generates prompts with:

1. **Project Context**: 
   - package.json contents
   - README.md
   - CLAUDE.md (Claude Code instructions)
   - Configuration files
   - Directory structure

2. **Specific Agent Task**:
   - Clear instructions
   - Tool usage guidance
   - Expected output format

3. **Ready-to-Use Prompt**:
   - Copy-paste ready for Claude Code
   - Full context included
   - Systematic analysis approach

## 💡 Best Practices

### When to Use Each Agent

| Scenario | Recommended Agent | Frequency |
|----------|------------------|-----------|
| Before committing | `security`, `non-ascii` | Every commit |
| Code review prep | `quality`, `tests` | Before PRs |
| Release preparation | `performance`, `a11y`, `docs` | Before releases |
| Weekly maintenance | `deps`, `quality` | Weekly |
| New feature complete | `tests`, `docs`, `a11y` | After features |

### Prompt Writing Tips

1. **Be Specific**: Include exact file patterns, frameworks, or areas to focus on
2. **Provide Context**: Mention the project type, constraints, or specific requirements
3. **Request Actionable Output**: Ask for specific recommendations, not just analysis
4. **Prioritize Results**: Request results categorized by importance or urgency

### Integration with CI/CD

You can integrate agents into your CI/CD pipeline:

```yaml
# .github/workflows/quality-check.yml
- name: Security Scan
  run: npm run agent:security > security-report.txt

- name: Performance Check  
  run: npm run agent:performance > performance-report.txt
```

## 🚨 Troubleshooting

### Common Issues

**Script not found**: Ensure you're running from project root
```bash
cd path/to/your/project
npm run agent:list
```

**Permission errors**: On Windows, you might need to run as administrator for some file operations

**Large output**: For large codebases, the generated prompts might be very long. Consider using more specific custom prompts

### Getting Help

```bash
# Show help
npm run agent

# List available agents
npm run agent:list

# Interactive mode for guided usage
npm run agent:interactive
```

## 🔄 Updates and Maintenance

The master agent script is designed to be easily extensible. You can:

1. Add new predefined agents by editing the `predefinedAgents` object
2. Modify existing prompts to better suit your needs
3. Add new command aliases in package.json
4. Integrate with your existing development workflow

## 📈 Measuring Impact

Track the effectiveness of agent usage:

- **Security Issues Found**: Monitor trends in security vulnerabilities
- **Code Quality Metrics**: Track improvements in code quality scores  
- **Test Coverage**: Monitor coverage improvements over time
- **Performance Gains**: Track bundle size and performance improvements
- **Documentation Quality**: Measure completeness and accuracy improvements

---

**Remember**: The master agent generates prompts for use with Claude Code. The actual analysis is performed by Claude based on the generated prompts.