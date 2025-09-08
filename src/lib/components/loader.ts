import { componentRegistry } from './registry';

// UI Components
export const loadAnimatedText = () =>
  import('../../components/ui/AnimatedText').then(m => ({ default: m.default }));

export const loadGlitchEffect = () =>
  Promise.resolve({ default: () => null }); // Placeholder for now

export const loadParticleBackground = () =>
  import('../../components/ui/ParticleBackground').then(m => ({ default: m.default }));

export const loadMagneticButton = () =>
  import('../../components/ui/MagneticButton').then(m => ({ default: m.default }));

export const loadFluidGrid = () =>
  Promise.resolve({ default: () => null }); // Placeholder for now

export const loadScrollReveal = () =>
  Promise.resolve({ default: () => null }); // Placeholder for now

export const loadInteractiveCard = () =>
  Promise.resolve({ default: () => null }); // Placeholder for now

// Robotics Components
export const loadRobotSwarm = () =>
  import('../../components/robotics/RobotSwarm').then(m => ({ default: m.default }));

export const loadCollisionSystem = () =>
  import('../../components/robotics/CollisionSystem').then(m => ({ default: m.default }));

export const loadMouseTracker = () =>
  import('../../components/robotics/MouseTracker').then(m => ({ default: m.default }));

export const loadRoboticsCanvas = () =>
  import('../../components/robotics/RoboticsCanvas').then(m => ({ default: m.default }));

// System Components
export const loadDynamicZone = () =>
  import('../../components/system/DynamicZone').then(m => ({ default: m.default }));

export const loadFeatureFlag = () =>
  import('../../components/system/FeatureFlag').then(m => ({ default: m.default }));

export const loadComponentPlayground = () =>
  import('../../components/system/ComponentPlayground').then(m => ({ default: m.default }));

// Register all components
export function registerAllComponents() {
  // UI Components
  componentRegistry.registerLazy(
    {
      id: 'animated-text',
      name: 'Animated Text',
      category: 'ui',
      version: '1.0.0',
      description: 'Smooth text animations with various effects',
      tags: ['animation', 'text', 'ui'],
      isEnabled: true,
    },
    loadAnimatedText
  );

  componentRegistry.registerLazy(
    {
      id: 'glitch-effect',
      name: 'Glitch Effect',
      category: 'ui',
      version: '1.0.0',
      description: 'Cyberpunk-style glitch effects for text and elements',
      tags: ['effect', 'cyberpunk', 'animation'],
      isEnabled: true,
    },
    loadGlitchEffect
  );

  componentRegistry.registerLazy(
    {
      id: 'particle-background',
      name: 'Particle Background',
      category: 'ui',
      version: '1.0.0',
      description: 'Interactive particle system background',
      tags: ['background', 'particles', 'interactive'],
      isEnabled: true,
    },
    loadParticleBackground
  );

  componentRegistry.registerLazy(
    {
      id: 'magnetic-button',
      name: 'Magnetic Button',
      category: 'interactive',
      version: '1.0.0',
      description: 'Button that responds to mouse proximity',
      tags: ['button', 'interactive', 'magnetic'],
      isEnabled: true,
    },
    loadMagneticButton
  );

  componentRegistry.registerLazy(
    {
      id: 'fluid-grid',
      name: 'Fluid Grid',
      category: 'layout',
      version: '1.0.0',
      description: 'Responsive grid layout with smooth transitions',
      tags: ['grid', 'layout', 'responsive'],
      isEnabled: true,
    },
    loadFluidGrid
  );

  componentRegistry.registerLazy(
    {
      id: 'scroll-reveal',
      name: 'Scroll Reveal',
      category: 'ui',
      version: '1.0.0',
      description: 'Elements revealed on scroll with smooth animations',
      tags: ['scroll', 'animation', 'reveal'],
      isEnabled: true,
    },
    loadScrollReveal
  );

  componentRegistry.registerLazy(
    {
      id: 'interactive-card',
      name: 'Interactive Card',
      category: 'ui',
      version: '1.0.0',
      description: '3D transforming card with mouse interactions',
      tags: ['card', '3d', 'interactive'],
      isEnabled: true,
    },
    loadInteractiveCard
  );

  // Robotics Components
  componentRegistry.registerLazy(
    {
      id: 'robot-swarm',
      name: 'Robot Swarm',
      category: 'robotics',
      version: '1.0.0',
      description: 'Autonomous robot swarm with collision avoidance',
      tags: ['robotics', 'swarm', 'autonomous'],
      isEnabled: true,
      featureFlag: 'robotics_enabled',
    },
    loadRobotSwarm
  );

  componentRegistry.registerLazy(
    {
      id: 'collision-system',
      name: 'Collision System',
      category: 'robotics',
      version: '1.0.0',
      description: 'Collision detection and avoidance system',
      tags: ['collision', 'physics', 'robotics'],
      isEnabled: true,
    },
    loadCollisionSystem
  );

  componentRegistry.registerLazy(
    {
      id: 'mouse-tracker',
      name: 'Mouse Tracker',
      category: 'robotics',
      version: '1.0.0',
      description: 'Mouse tracking system for robot behaviors',
      tags: ['mouse', 'tracking', 'behavior'],
      isEnabled: true,
    },
    loadMouseTracker
  );

  componentRegistry.registerLazy(
    {
      id: 'robotics-canvas',
      name: 'Robotics Canvas',
      category: 'robotics',
      version: '1.0.0',
      description: 'Three.js canvas container for robotics visualizations',
      tags: ['threejs', 'canvas', 'robotics'],
      isEnabled: true,
    },
    loadRoboticsCanvas
  );

  // System Components
  componentRegistry.registerLazy(
    {
      id: 'dynamic-zone',
      name: 'Dynamic Zone',
      category: 'layout',
      version: '1.0.0',
      description: 'Render any registered component dynamically',
      tags: ['dynamic', 'zone', 'system'],
      isEnabled: true,
    },
    loadDynamicZone
  );

  componentRegistry.registerLazy(
    {
      id: 'feature-flag',
      name: 'Feature Flag',
      category: 'layout',
      version: '1.0.0',
      description: 'Conditional component rendering based on feature flags',
      tags: ['feature', 'flag', 'conditional'],
      isEnabled: true,
    },
    loadFeatureFlag
  );

  componentRegistry.registerLazy(
    {
      id: 'component-playground',
      name: 'Component Playground',
      category: 'admin',
      version: '1.0.0',
      description: 'Testing interface for components',
      tags: ['playground', 'testing', 'admin'],
      isEnabled: true,
      featureFlag: 'admin_tools',
    },
    loadComponentPlayground
  );
}

export { componentRegistry };