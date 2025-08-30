// import React from 'react'; // Not needed for string templates

// Basic Example - Minimal setup with default behavior
export const BasicExample = `
import { SmartRobots } from '@/components/SmartRobots';

// Basic usage with default settings
<SmartRobots />
`;

export const AdvancedExample = `
import { SmartRobots } from '@/components/SmartRobots';

// Advanced configuration with custom behaviors
<SmartRobots 
  robotCount={8}
  enableAI={true}
  enableCollisions={true}
  speed={2.5}
  className="my-4 border rounded-lg"
/>
`;

export const CustomStyledExample = `
import { SmartRobots } from '@/components/SmartRobots';

// Custom styling and theme integration
<div className="bg-slate-900 p-6 rounded-xl">
  <SmartRobots 
    robotCount={6}
    enableAI={true}
    className="border border-cyan-500/30 rounded-lg"
    style={{
      background: 'linear-gradient(45deg, #1e293b, #0f172a)',
      minHeight: '400px'
    }}
  />
</div>
`;

export const PerformanceExample = `
import { SmartRobots } from '@/components/SmartRobots';
import { useEffect, useState } from 'react';

// Performance monitoring and optimization
function PerformanceDemo() {
  const [fps, setFps] = useState(0);
  const [robotCount, setRobotCount] = useState(5);

  useEffect(() => {
    const monitor = setInterval(() => {
      // Monitor performance metrics
      const start = performance.now();
      requestAnimationFrame(() => {
        const delta = performance.now() - start;
        setFps(Math.round(1000 / delta));
      });
    }, 1000);

    return () => clearInterval(monitor);
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <span>FPS: {fps}</span>
        <input 
          type="range" 
          min="1" 
          max="20" 
          value={robotCount}
          onChange={(e) => setRobotCount(Number(e.target.value))}
        />
        <span>Robots: {robotCount}</span>
      </div>
      
      <SmartRobots 
        robotCount={robotCount}
        enableAI={true}
        enableCollisions={true}
      />
    </div>
  );
}
`;

export const IntegrationExample = `
import { SmartRobots } from '@/components/SmartRobots';
import { useState, useCallback } from 'react';

// Integration with parent component state
function RoboticsDemo() {
  const [isActive, setIsActive] = useState(true);
  const [difficulty, setDifficulty] = useState('normal');

  const handleRobotClick = useCallback((robotId: string) => {
    // console.log(\`Robot \${robotId} was clicked!\`); // Removed for production
    // Custom robot interaction logic
  }, []);

  const speedMap = {
    easy: 1.5,
    normal: 2.5,
    hard: 4.0
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button 
          onClick={() => setIsActive(!isActive)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isActive ? 'Pause' : 'Resume'}
        </button>
        
        <select 
          value={difficulty} 
          onChange={(e) => setDifficulty(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="easy">Easy</option>
          <option value="normal">Normal</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      
      <SmartRobots 
        robotCount={6}
        enableAI={isActive}
        speed={speedMap[difficulty]}
        onRobotClick={handleRobotClick}
      />
    </div>
  );
}
`;

export const MobileExample = `
import { SmartRobots } from '@/components/SmartRobots';
import { useEffect, useState } from 'react';

// Mobile-optimized version with touch support
function MobileRobotDemo() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="w-full">
      <SmartRobots 
        robotCount={isMobile ? 3 : 6}
        enableAI={true}
        enableCollisions={!isMobile} // Disable collisions on mobile for performance
        speed={isMobile ? 2 : 2.5}
        className={isMobile ? 'rounded-lg' : 'rounded-xl'}
        style={{
          minHeight: isMobile ? '250px' : '400px',
          touchAction: 'manipulation' // Optimize for touch
        }}
      />
      
      {isMobile && (
        <p className="text-sm text-gray-600 mt-2">
          Tap anywhere to interact with the robots!
        </p>
      )}
    </div>
  );
}
`;

export const UsageInstructions = `
## SmartRobots Component Usage

### Props
- \`robotCount\` (number): Number of robots to spawn (default: 5)
- \`enableAI\` (boolean): Enable intelligent behavior (default: true)  
- \`enableCollisions\` (boolean): Enable robot-robot collisions (default: true)
- \`speed\` (number): Robot movement speed multiplier (default: 2.5)
- \`className\` (string): Additional CSS classes
- \`style\` (object): Inline styles
- \`onRobotClick\` (function): Callback when robot is clicked

### Key Features
- **Intelligent pathfinding**: Robots navigate around obstacles
- **Collision avoidance**: Sophisticated avoidance algorithms
- **Target tracking**: Robots pursue mouse cursor or touch point
- **Swarm behavior**: Coordinated group movements
- **Responsive design**: Works on desktop and mobile
- **Performance optimized**: Efficient rendering and calculations

### Best Practices
- Use fewer robots on mobile devices for better performance
- Disable collisions for large robot counts (>10) if performance lags
- Adjust speed based on use case (1-5 range recommended)
- Wrap in proper containers for responsive layouts

### Common Use Cases
- **Portfolio showcases**: Demonstrate AI and programming skills
- **Interactive backgrounds**: Engaging website elements
- **Educational tools**: Teach pathfinding and AI concepts
- **Demos**: Showcase AI and pathfinding algorithms
- **Easter eggs**: Hidden interactive features for curious users
- **Loading screens**: Entertaining animation while content loads
`;

const examples = {
  BasicExample,
  AdvancedExample,
  CustomStyledExample,
  PerformanceExample,
  IntegrationExample,
  MobileExample,
  UsageInstructions
};

export default examples;