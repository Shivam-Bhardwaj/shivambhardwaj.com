---
title: "Docker + Worktrees Integration"
description: "Automated Docker container management per Git worktree"
status: "active"
tags: ["Docker", "Git", "Automation"]
github: "https://github.com/Shivam-Bhardwaj/dev-setup"
date: "2025-11-09"
---

# Docker + Worktrees Integration

This experiment automates Docker container management for each Git worktree, allowing parallel development with isolated environments.

## Problem

When working with multiple worktrees, each needs its own Docker environment:
- Different ports for each worktree
- Isolated volumes and networks
- Independent service configurations

## Solution

Created a script that:
1. Detects the current worktree
2. Generates a unique Docker Compose override file
3. Assigns unique ports based on worktree name hash
4. Manages container lifecycle

## Implementation

```bash
# When entering a worktree
cd _worktrees/feature-auth
# Script automatically:
# - Detects worktree name
# - Generates docker-compose.override.yml
# - Assigns ports (e.g., 3001, 5433, 6380)
# - Starts containers
```

## Benefits

- **No Port Conflicts**: Each worktree gets unique ports
- **Isolated Environments**: Complete separation between features
- **Easy Cleanup**: Removing worktree also cleans up containers
- **Automated**: No manual port management needed

## Status

Currently active and being used in daily development. Planning to open-source the scripts.

