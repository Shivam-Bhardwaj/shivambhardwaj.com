# Portfolio Architecture Plan

## Overview
Transform shivambhardwaj.com into a comprehensive developer journey platform showcasing:
- Development philosophies and methodologies
- Learning journey with progress tracking
- Interactive tutorials and code examples
- Project deep dives with technical breakdowns
- Real-time metrics from GitHub and Docker

## New Sections to Add

### 1. Philosophy Hub (`/philosophy`)
- Docker-first development approach
- Test-driven mindset
- GitHub workflow mastery
- Visual testing strategies
- Continuous learning approach

### 2. Learning Journey (`/journey`)
- Daily logs (auto-generated from commits)
- Weekly reflections
- Monthly milestones
- Yearly evolution timeline

### 3. Interactive Playground (`/playground`)
- Live Docker examples
- GitHub Actions simulator
- Worktree visualizer
- Testing sandbox

### 4. Project Showcase 2.0 (`/projects`)
Enhanced project pages with:
- Technical stack visualization
- Development timeline
- Code deep dives
- Lessons learned

### 5. Metrics Dashboard (`/dashboard`)
Real-time display of:
- GitHub contribution graph
- CI/CD pipeline status
- Docker container stats
- Code quality trends
- Test coverage evolution

## Implementation Plan

### Phase 1: API Routes
Create Next.js API routes for:
- `/api/github` - GitHub API integration
- `/api/docker` - Docker metrics
- `/api/metrics` - Aggregated metrics
- `/api/learning` - Learning progress

### Phase 2: Components
Build reusable components:
- `GitHubStats` - Display GitHub metrics
- `DockerDashboard` - Show container status
- `LearningTimeline` - Visualize learning journey
- `ProjectCard` - Enhanced project display
- `CodePlayground` - Interactive code examples

### Phase 3: Data Layer
- GitHub API client
- Docker API integration
- Local data caching
- Real-time updates

### Phase 4: Content Management
- Markdown-based content system
- Automated content generation
- Tutorial templates
- Project documentation structure

## File Structure

```
shivambhardwaj.com/
├── src/
│   ├── app/
│   │   ├── philosophy/
│   │   ├── journey/
│   │   ├── playground/
│   │   ├── dashboard/
│   │   └── api/
│   │       ├── github/
│   │       ├── docker/
│   │       └── metrics/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── learning/
│   │   └── playground/
│   └── lib/
│       ├── github.ts
│       ├── docker.ts
│       └── metrics.ts
├── content/
│   ├── philosophy/
│   ├── tutorials/
│   └── projects/
└── public/
    └── data/
```

