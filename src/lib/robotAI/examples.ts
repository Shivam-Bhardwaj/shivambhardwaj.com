/**
 * examples.ts  
 * Usage examples for the GTA Robot AI system
 */

// Example 1: Basic usage in any React component
export const BasicExample = `
import GTARobots from '@/components/GTARobots';

export default function MyPage() {
  return (
    <div className="relative min-h-screen">
      {/* Your page content */}
      <main>
        <h1>My Website</h1>
        <p>Content goes here...</p>
      </main>
      
      {/* GTA Robots overlay */}
      <GTARobots 
        robotCount={4}
        debugMode={false}
        aggressiveness={0.7}
        onCaptureTarget={() => alert('Caught you!')}
      />
    </div>
  );
}
`;

// Example 2: Advanced configuration with state management
export const AdvancedExample = `
'use client';

import { useState, useCallback } from 'react';
import GTARobots from '@/components/GTARobots';

export default function GamePage() {
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [robotCount, setRobotCount] = useState(4);

  const handleCapture = useCallback(() => {
    setScore(prev => prev + 1);
    // Maybe add difficulty scaling
    if (score > 0 && score % 5 === 0) {
      setRobotCount(prev => Math.min(prev + 1, 8));
    }
  }, [score]);

  const toggleGame = () => {
    setGameActive(!gameActive);
    if (!gameActive) {
      setScore(0);
      setRobotCount(4);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-900">
      {/* Game UI */}
      <div className="fixed top-4 left-4 z-50 text-white">
        <button 
          onClick={toggleGame}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded mb-2"
        >
          {gameActive ? 'Stop Game' : 'Start Chase'}
        </button>
        <div>Score: {score}</div>
        <div>Robots: {robotCount}</div>
      </div>

      {/* Page content */}
      <main className="p-8 relative z-10">
        <h1 className="text-4xl font-bold text-white">Robot Chase Game</h1>
        {/* Other content... */}
      </main>

      {/* GTA Robots */}
      {gameActive && (
        <GTARobots
          robotCount={robotCount}
          debugMode={true}
          aggressiveness={0.6 + (score * 0.02)} // Gets harder over time
          onCaptureTarget={handleCapture}
        />
      )}
    </div>
  );
}
`;

// Example 3: Custom styling and behavior
export const CustomStyledExample = `
import GTARobots from '@/components/GTARobots';
import { useTheme } from 'next-themes';

export default function ThemedPage() {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen relative">
      <div className="p-8">
        <h1>My Content</h1>
        {/* Add custom obstacles */}
        <div className="grid grid-cols-3 gap-4 my-8">
          <div className="h-32 bg-blue-500 rounded" />
          <div className="h-40 bg-green-500 rounded" />
          <div className="h-24 bg-purple-500 rounded" />
        </div>
      </div>

      {/* Themed robots */}
      <GTARobots
        robotCount={3}
        aggressiveness={theme === 'dark' ? 0.8 : 0.6}
        debugMode={process.env.NODE_ENV === 'development'}
      />
      
      <style jsx>{\`
        /* Custom robot styling could go here */
        .robot {
          filter: ${theme === 'dark' ? 'brightness(1.2)' : 'brightness(0.8)'};
        }
      \`}</style>
    </div>
  );
}
`;

// Example 4: Performance monitoring
export const PerformanceExample = `
'use client';

import { useState, useRef, useEffect } from 'react';
import GTARobots from '@/components/GTARobots';

export default function PerformancePage() {
  const [fps, setFps] = useState(60);
  const [robotCount, setRobotCount] = useState(4);
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());

  useEffect(() => {
    const updateFPS = () => {
      frameCount.current++;
      const now = Date.now();
      if (now - lastTime.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastTime.current = now;
      }
      requestAnimationFrame(updateFPS);
    };
    updateFPS();
  }, []);

  const adjustRobotCount = (delta: number) => {
    setRobotCount(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Performance controls */}
      <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded z-50">
        <h3 className="font-bold mb-2">Performance Monitor</h3>
        <div>FPS: <span className={fps < 50 ? 'text-red-400' : 'text-green-400'}>{fps}</span></div>
        <div className="flex items-center mt-2">
          <span className="mr-2">Robots:</span>
          <button 
            onClick={() => adjustRobotCount(-1)}
            className="bg-red-500 px-2 py-1 rounded text-xs mr-1"
          >
            -
          </button>
          <span className="mx-2">{robotCount}</span>
          <button 
            onClick={() => adjustRobotCount(1)}
            className="bg-green-500 px-2 py-1 rounded text-xs ml-1"
          >
            +
          </button>
        </div>
        <div className="mt-2 text-xs">
          {fps < 50 && <div className="text-yellow-400">⚠ Consider reducing robots</div>}
          {fps >= 50 && <div className="text-green-400">✓ Good performance</div>}
        </div>
      </div>

      <main className="p-8">
        <h1 className="text-4xl font-bold text-white">Performance Test</h1>
      </main>

      <GTARobots
        robotCount={robotCount}
        debugMode={true}
        aggressiveness={0.7}
        // Reduce aggressiveness if performance is poor
        disabled={fps < 30}
      />
    </div>
  );
}
`;

// Example 5: Integration with existing robot systems
export const IntegrationExample = `
'use client';

import { useState } from 'react';
import GTARobots from '@/components/GTARobots';
import AdvancedRobots from '@/components/AdvancedRobots'; // Existing system

type RobotMode = 'gta' | 'advanced' | 'both';

export default function RobotShowcase() {
  const [mode, setMode] = useState<RobotMode>('gta');

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Mode switcher */}
      <div className="fixed top-4 left-4 z-50 flex space-x-2">
        {(['gta', 'advanced', 'both'] as RobotMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={\`px-3 py-1 rounded text-sm \${
              mode === m 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-600 text-gray-300'
            }\`}
          >
            {m.toUpperCase()}
          </button>
        ))}
      </div>

      <main className="p-8 pt-16">
        <h1 className="text-4xl font-bold text-white mb-4">Robot Comparison</h1>
        <p className="text-gray-300">
          Switch between different robot AI systems to compare behavior.
        </p>
      </main>

      {/* Render robots based on mode */}
      {(mode === 'gta' || mode === 'both') && (
        <GTARobots
          robotCount={mode === 'both' ? 2 : 4}
          debugMode={true}
          aggressiveness={0.8}
        />
      )}
      
      {(mode === 'advanced' || mode === 'both') && (
        <AdvancedRobots />
      )}
    </div>
  );
}
`;

// Example 6: Mobile-optimized version
export const MobileExample = `
'use client';

import { useState, useEffect } from 'react';
import GTARobots from '@/components/GTARobots';

export default function MobilePage() {
  const [isMobile, setIsMobile] = useState(false);
  const [robotCount, setRobotCount] = useState(4);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || 'ontouchstart' in window;
      setIsMobile(mobile);
      setRobotCount(mobile ? 2 : 4); // Fewer robots on mobile
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <main className="p-4 md:p-8">
        <h1 className="text-2xl md:text-4xl font-bold text-white">
          Mobile-Optimized Robots
        </h1>
        {isMobile && (
          <p className="text-yellow-400 mt-2">
            Touch and drag to move the target
          </p>
        )}
      </main>

      <GTARobots
        robotCount={robotCount}
        debugMode={!isMobile} // Disable debug on mobile for performance
        aggressiveness={isMobile ? 0.6 : 0.8}
      />
    </div>
  );
}
`;

// Usage instructions
export const UsageInstructions = `
## How to Use These Examples

1. **Copy the example code** into your React component
2. **Install dependencies** if needed (\`npm install framer-motion\`)
3. **Adjust the imports** to match your project structure
4. **Customize the props** based on your needs:
   - \`robotCount\`: Number of robots (1-10 recommended)
   - \`debugMode\`: Show debug overlay (useful for development)
   - \`aggressiveness\`: How intense the chase is (0.1 to 1.0)
   - \`onCaptureTarget\`: Function called when robots catch the cursor
   - \`disabled\`: Temporarily disable the robots

## Tips for Best Results

- **Place robots last**: Render GTARobots after your main content for proper layering
- **Use relative positioning**: Ensure the parent container has \`position: relative\`
- **Test on mobile**: The system works on touch devices too
- **Monitor performance**: Use debug mode to check FPS in development
- **Customize styling**: Modify the robot appearance in GTARobots.tsx

## Common Use Cases

- **Portfolio sites**: Add interactive elements to impress visitors
- **Games**: Create chase mechanics or AI opponents  
- **Demos**: Showcase AI and pathfinding algorithms
- **Easter eggs**: Hidden interactive features for curious users
- **Loading screens**: Entertaining animation while content loads
`;

export default {
  BasicExample,
  AdvancedExample,
  CustomStyledExample,
  PerformanceExample,
  IntegrationExample,
  MobileExample,
  UsageInstructions
};