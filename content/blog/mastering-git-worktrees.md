---
title: "Mastering Git Worktrees: A Game Changer"
date: "2025-11-08"
excerpt: "How worktrees revolutionized my development workflow and why you should use them"
tags: ["Git", "Workflow", "Tutorial"]
readTime: "8 min"
---

# Mastering Git Worktrees: A Game Changer

Git worktrees allow you to check out multiple branches simultaneously in different directories. This simple feature has completely transformed how I work.

## The Problem Worktrees Solve

Before worktrees, switching branches meant:
- Stashing or committing incomplete work
- Losing context
- Difficulty reviewing multiple PRs
- Can't work on hotfixes while features are in progress

## How Worktrees Work

```bash
# Main repository
/root/repos/my-project/

# Create a worktree for a feature
git worktree add ../my-project-feature feature-branch

# Now you have:
# - /root/repos/my-project/ (main branch)
# - /root/repos/my-project-feature/ (feature branch)
```

Both directories share the same `.git` folder, so commits, branches, and remotes are synchronized.

## My Workflow

### Starting Work on an Issue
```bash
# Using my custom script
dev new 123

# Which runs:
wt-new issue-123 123
```

This creates a new worktree, checks out a branch, and links it to the GitHub issue.

### Reviewing PRs
```bash
wt-pr 456  # Check out PR #456 for review
```

I can review multiple PRs simultaneously, each in its own directory.

### Cleanup
```bash
wt-cleanup  # Remove merged worktrees automatically
```

## Real-World Benefits

1. **Parallel Development**: Work on multiple features without context switching
2. **Easy PR Reviews**: Check out PRs without affecting your current work
3. **Hotfixes**: Fix production issues while preserving feature work
4. **Testing**: Test different implementations side-by-side

## Best Practices

- Keep worktrees organized in a `_worktrees/` directory
- Clean up merged branches regularly
- Use descriptive branch names
- Link worktrees to GitHub issues

## Conclusion

Git worktrees are one of those features that seem simple but have a huge impact on productivity. Once you start using them, you'll wonder how you worked without them.

