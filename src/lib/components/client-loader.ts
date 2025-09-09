'use client';

import { componentRegistry } from './registry';

// Client-side component registration
export function registerClientComponents() {
  // Only register on client side
  if (typeof window === 'undefined') {
    return;
  }

  // Register client-only components safely
  try {
    componentRegistry.registerLazy(
      {
        id: 'robot-swarm',
        name: 'Robot Swarm',
        category: 'robotics',
        version: '1.0.0',
        description: 'Interactive robot swarm with collision avoidance',
        isEnabled: true,
        featureFlag: 'robotics_enabled',
      },
      () => import('../../components/robotics/RobotSwarm').then(m => ({ default: m.default })).catch(() => ({ default: () => null }))
    );

    componentRegistry.registerLazy(
      {
        id: 'collision-system',
        name: 'Collision System',
        category: 'robotics',
        version: '1.0.0',
        description: 'Collision detection and avoidance system',
        isEnabled: true,
      },
      () => import('../../components/robotics/CollisionSystem').then(m => ({ default: m.default })).catch(() => ({ default: () => null }))
    );

    componentRegistry.registerLazy(
      {
        id: 'robotics-canvas',
        name: 'Robotics Canvas',
        category: 'robotics',
        version: '1.0.0',
        description: 'Three.js canvas container for robotics visualizations',
        isEnabled: true,
      },
      () => import('../../components/robotics/RoboticsCanvas').then(m => ({ default: m.default })).catch(() => ({ default: () => null }))
    );
  } catch (error) {
    console.warn('Failed to register client components:', error);
  }
}

// Auto-register on client
if (typeof window !== 'undefined') {
  // Use setTimeout to ensure components are available
  setTimeout(() => {
    registerClientComponents();
  }, 0);
}