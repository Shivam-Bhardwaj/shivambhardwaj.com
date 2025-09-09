'use client';

import { useEffect, useState } from 'react';
import FeatureFlag from './FeatureFlag';

export default function RobotFeature() {
  const [RobotSwarmWrapper, setRobotSwarmWrapper] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Register client components first
    import('../../lib/components/client-loader').then(() => {
      // Then import robot wrapper
      import('../robotics/RobotSwarmWrapper').then((module) => {
        setRobotSwarmWrapper(() => module.default);
      }).catch((error) => {
        console.warn('Failed to load RobotSwarmWrapper:', error);
      });
    }).catch((error) => {
      console.warn('Failed to load client loader:', error);
    });
  }, []);

  if (!mounted || !RobotSwarmWrapper) {
    return null;
  }

  return (
    <FeatureFlag flag="robotics_enabled">
      <RobotSwarmWrapper />
    </FeatureFlag>
  );
}