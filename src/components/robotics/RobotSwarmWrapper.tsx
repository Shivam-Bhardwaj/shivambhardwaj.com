'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const RobotSwarm = dynamic(
  () => import('./RobotSwarm'),
  {
    ssr: false,
    loading: () => null
  }
);

const RoboticsErrorBoundary = dynamic(
  () => import('./RoboticsErrorBoundary'),
  {
    ssr: false,
    loading: () => null
  }
);

export default function RobotSwarmWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <RoboticsErrorBoundary fallback={null}>
      <RobotSwarm
        robotCount={12}
        enableCollisionAvoidance={true}
        enableFlocking={true}
        enableMouseInteraction={true}
        enable3DVisualization={true}
        swarmBehavior="autonomous"
        className="z-0"
      />
    </RoboticsErrorBoundary>
  );
}