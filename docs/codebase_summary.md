# Codebase Summary

## Project Overview
**Shivam Bhardwaj's Robotics Portfolio** - An interactive Next.js portfolio showcasing robotics engineering expertise, autonomous systems, and project management experience.

## Technology Stack
- **Framework**: Next.js 15.4.5 with App Router
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v4 with PostCSS
- **Animation**: Framer Motion 12.23.12
- **Testing**: Vitest (unit), Playwright (E2E), Jest-axe (a11y)
- **Deployment**: Firebase Hosting (static export)

## File Structure & Components

### Core Application Files

| File | Purpose | Key Features |
|------|---------|--------------|
| `src/app/layout.tsx` | Root layout with navigation and footer | RoombaSimulation background, theme provider |
| `src/app/page.tsx` | Homepage with hero section | Interactive swarm robots, typewriter effect |
| `src/app/globals.css` | Global styles and Tailwind configuration | Brand colors, typography, responsive design |

### Component Architecture

#### Navigation & Layout
- **`src/components/Navbar.tsx`**: Main navigation with active page highlighting
- **`src/components/MinimalNavbar.tsx`**: Simplified navigation for specific pages  
- **`src/components/Footer.tsx`**: Full footer with social links and version info
- **`src/components/MinimalFooter.tsx`**: Clean footer for focused pages

#### Interactive Robotics Components
- **`src/components/GTARobots.tsx`**: Advanced swarm simulation with flocking behaviors
- **`src/components/SmartAvoidanceRobots.tsx`**: Obstacle avoidance algorithms
- **`src/components/SwarmDefenderCanvas.tsx`**: Game-like swarm defense simulation
- **`src/components/RobotGameTest.tsx`**: Testing environment for robot behaviors
- **`src/components/ROSRobots.tsx`**: ROS-based robot system simulation

#### Calculators & Tools
- **`src/components/RoboticsCalculator.tsx`**: Hub for interactive robotics calculators
- **`src/components/calculators/`**: Individual calculator components:
  - `KinematicsCalculator.tsx` - Forward/inverse kinematics
  - `PIDCalculator.tsx` - PID controller tuning
  - `TrajectoryCalculator.tsx` - Path planning
  - `SensorCalculator.tsx` - Sensor fusion
  - `TransformCalculator.tsx` - 3D transformations

#### Utility Components  
- **`src/components/Typewriter.tsx`**: Animated typing effect
- **`src/components/ThemeToggle.tsx`**: Dark/light mode switcher
- **`src/components/VersionInfo.tsx`**: Build version display
- **`src/components/TelemetryDashboard.tsx`**: Real-time system monitoring

### Library & Core Logic

#### Robotics Systems
- **`src/lib/robotics/`**: Core robotics algorithms
  - `math.ts` - Vector operations, quaternions, transformations
  - `algorithms.ts` - Pathfinding, SLAM, control theory
  - `sensors.ts` - IMU, GPS, lidar sensor simulation

#### ROS System Implementation
- **`src/lib/robotics/ros-system/`**: Robot Operating System simulation
  - `core/Master.ts` - ROS master node coordination
  - `core/Node.ts` - Individual ROS node implementation
  - `navigation.ts` - Path planning and navigation
  - `sensors.ts` - Sensor data processing
  - `messages/` - ROS message definitions

#### Swarm Intelligence
- **`src/lib/swarm/`**: Multi-agent system implementation
  - `SwarmManager.ts` - Coordinate multiple robots
  - `Robot.ts` - Individual robot behavior
  - `SwarmDefender.ts` - Defense game logic
  - `communication/CommunicationSystem.ts` - Inter-robot messaging

#### AI & Behavior
- **`src/lib/robotAI/`**: Advanced robot behaviors
  - `RobotNavigationAgent.ts` - Intelligent navigation
  - `PursuitBehavior.ts` - Target following algorithms
  - `OcclusionDetector.ts` - Vision-based obstacle detection

### Data & Configuration

#### Static Data
- **`src/data/site.ts`**: Site metadata, navigation, contact info
- **`src/data/projects.ts`**: Portfolio projects with descriptions
- **`src/data/experience.ts`**: Professional experience timeline

#### Configuration
- **`src/config/`**: Application configuration
  - `central-config.ts` - Main app settings
  - `build-config.ts` - Build and deployment config
  - `environment-config.ts` - Environment variables

### Testing Framework

#### Unit Tests
- **`tests/unit/components/`**: Component testing
  - React Testing Library setup
  - Accessibility testing with jest-axe
  - Component behavior validation

#### Integration Tests  
- **`tests/integration/`**: User flow testing
  - Navigation testing
  - Swarm simulation testing
  - Cross-component interaction

#### E2E Tests
- **`tests/e2e/`**: Full application testing with Playwright
  - Cross-browser compatibility
  - Performance testing with Lighthouse
  - Accessibility compliance (WCAG)

### Build & Deployment

#### Scripts
- **`scripts/`**: Automation and helper scripts
  - `claude-helper.js` - AI development assistant
  - `deploy.js` - Deployment automation
  - `generate-version.js` - Version management
  - `run-comprehensive-tests.js` - Full test suite

#### Configuration Files
- **`next.config.ts`**: Next.js configuration with static export
- **`firebase.json`**: Firebase hosting configuration  
- **`tailwind.config.js`**: Tailwind CSS customization
- **`vitest.config.ts`**: Test framework configuration

## Key Architecture Patterns

### Component Composition
- **Layout Wrapping**: All pages wrapped with consistent navigation/footer
- **Prop Drilling Avoidance**: Configuration passed via props, not context
- **Client-Side Interactivity**: "use client" for interactive components

### State Management
- **Local State**: useState for component-specific data
- **Refs for Animation**: useRef for canvas and animation loops
- **No Global State**: Avoiding complexity with local state approach

### Animation Strategy
- **Framer Motion**: Smooth page transitions and component animations
- **Canvas Animations**: RequestAnimationFrame for robotics simulations
- **CSS Transitions**: Tailwind classes for hover/focus states

### Code Organization
- **Feature-Based**: Components grouped by functionality
- **Utility Libraries**: Shared logic in `/lib` directory
- **Type Safety**: Comprehensive TypeScript interfaces
- **Modular Design**: Small, focused, reusable components

## Dependencies & External Integrations

### Core Dependencies
- `next` - Framework foundation
- `react` & `react-dom` - UI library
- `framer-motion` - Animation library
- `tailwindcss` - Styling framework

### Development Tools
- `typescript` - Type checking
- `eslint` - Code linting
- `vitest` - Unit testing
- `playwright` - E2E testing
- `@testing-library/react` - Component testing

### Build Tools
- `@tailwindcss/postcss` - CSS processing
- `@vitejs/plugin-react` - Vite React plugin
- `tsx` - TypeScript execution

## Performance Considerations

### Static Generation
- **Static Export**: No server-side rendering needed
- **Pre-built Pages**: All routes generated at build time
- **Asset Optimization**: Next.js automatic optimization

### Code Splitting
- **Dynamic Imports**: Heavy components loaded on demand
- **Route-Based**: Automatic code splitting by route
- **Component Level**: Large libraries loaded conditionally

### Animation Performance
- **RAF Optimization**: Efficient animation loops
- **Canvas Performance**: Direct drawing for complex simulations
- **CSS Transforms**: Hardware-accelerated animations

This codebase represents a sophisticated portfolio application with advanced robotics simulations, comprehensive testing, and production-ready deployment configuration.