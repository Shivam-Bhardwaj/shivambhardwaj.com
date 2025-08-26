"use client";
import { useState } from "react";
import AdvancedRobots from "@/components/AdvancedRobots";
import GTARobots from "@/components/GTARobots";

export default function RobotTestPage() {
  const [debugInfo, setDebugInfo] = useState(true);
  const [robotMode, setRobotMode] = useState<'advanced' | 'gta'>('gta');
  const [gtaCaptureCount, setGtaCaptureCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Robot Systems */}
      {robotMode === 'advanced' && <AdvancedRobots />}
      {robotMode === 'gta' && (
        <GTARobots 
          robotCount={4}
          debugMode={debugInfo}
          aggressiveness={0.8}
          onCaptureTarget={() => setGtaCaptureCount(prev => prev + 1)}
        />
      )}
      
      {/* Test UI Elements for Robot Navigation */}
      <div className="relative z-10 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">
            Robot AI System Test
          </h1>

          {/* Mode Switcher */}
          <div className="bg-black/70 backdrop-blur-md rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-white font-medium">Robot Mode:</span>
                <button
                  onClick={() => setRobotMode('gta')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    robotMode === 'gta'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  GTA Police Chase
                </button>
                <button
                  onClick={() => setRobotMode('advanced')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    robotMode === 'advanced'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Advanced Navigation
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center text-white">
                  <input
                    type="checkbox"
                    checked={debugInfo}
                    onChange={(e) => setDebugInfo(e.target.checked)}
                    className="mr-2"
                  />
                  Debug Mode
                </label>
                {robotMode === 'gta' && (
                  <div className="text-white">
                    Captures: <span className="text-red-400 font-bold">{gtaCaptureCount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Info Panel */}
          <div className="bg-black/50 backdrop-blur-md rounded-lg p-6 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              {robotMode === 'gta' ? 'GTA Police Chase System' : 'Advanced Navigation System'}
            </h2>
            
            {robotMode === 'gta' ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-red-300">🚔 GTA-Style Features</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Relentless pursuit behavior</li>
                    <li>• A* pathfinding with dynamic obstacles</li>
                    <li>• Predictive targeting and interception</li>
                    <li>• Coordinated team formations</li>
                    <li>• Multiple pursuit strategies (flank, surround, intercept)</li>
                    <li>• Never gives up - always finds alternative routes</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-red-300">⚡ Chase Physics</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Smooth physics-based movement</li>
                    <li>• Dynamic acceleration and friction</li>
                    <li>• Real-time collision detection</li>
                    <li>• Energy-based performance scaling</li>
                    <li>• Trail visualization for pursuit paths</li>
                    <li>• 60fps optimized performance</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-cyan-300">🧠 Intelligence Features</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Vector field navigation around obstacles</li>
                    <li>• Real-time DOM element detection</li>
                    <li>• Potential field pathfinding</li>
                    <li>• Wall-following when stuck</li>
                    <li>• Random exploration behavior</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-cyan-300">⚡ Physics System</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Velocity and acceleration based movement</li>
                    <li>• Smooth steering with damping</li>
                    <li>• Collision detection and avoidance</li>
                    <li>• Boundary handling with bounce</li>
                    <li>• Trail rendering for path visualization</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Test Elements */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-red-500/80 backdrop-blur-sm rounded-lg p-6 h-32">
              <h3 className="text-white font-bold">Obstacle 1</h3>
              <p className="text-white/80 text-sm mt-2">
                Robots navigate around this element
              </p>
            </div>
            <div className="bg-blue-500/80 backdrop-blur-sm rounded-lg p-6 h-40">
              <h3 className="text-white font-bold">Obstacle 2</h3>
              <p className="text-white/80 text-sm mt-2">
                Different sizes create varied navigation patterns
              </p>
            </div>
            <div className="bg-green-500/80 backdrop-blur-sm rounded-lg p-6 h-24">
              <h3 className="text-white font-bold">Obstacle 3</h3>
              <p className="text-white/80 text-sm mt-2">Compact obstacle</p>
            </div>
          </div>

          {/* Complex Layout Test */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-purple-500/60 backdrop-blur-sm rounded p-4 h-20">
              <span className="text-white text-sm">Card 1</span>
            </div>
            <div className="bg-yellow-500/60 backdrop-blur-sm rounded p-4 h-20">
              <span className="text-white text-sm">Card 2</span>
            </div>
            <div className="bg-pink-500/60 backdrop-blur-sm rounded p-4 h-20">
              <span className="text-white text-sm">Card 3</span>
            </div>
            <div className="bg-indigo-500/60 backdrop-blur-sm rounded p-4 h-20">
              <span className="text-white text-sm">Card 4</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-black/50 backdrop-blur-md rounded-lg p-6 text-white">
            <h3 className="text-lg font-bold mb-4">🎮 Test Instructions</h3>
            {robotMode === 'gta' ? (
              <div className="space-y-2 text-sm">
                <p>• Move your mouse around - robots will hunt you relentlessly like GTA police</p>
                <p>• Watch coordinated team behavior - robots take different pursuit strategies</p>
                <p>• Try to evade by moving quickly or hiding behind obstacles</p>
                <p>• Robots use A* pathfinding and predict your movement</p>
                <p>• Red trails show pursuit paths, energy bars show robot stamina</p>
                <p>• Debug mode reveals AI decisions and collision detection</p>
                <p>• Robots will never give up - they always find alternative routes</p>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <p>• Move your mouse around to see robots follow intelligently</p>
                <p>• Watch how robots flow around UI elements with 40px padding</p>
                <p>• Observe wall-following behavior when robots get stuck</p>
                <p>• Notice smooth acceleration/deceleration physics</p>
                <p>• Yellow circles indicate robots in wall-following mode</p>
                <p>• Debug mode shows vector field and obstacle boundaries</p>
              </div>
            )}
          </div>

          {/* Performance Metrics */}
          <div className="mt-8 bg-black/50 backdrop-blur-md rounded-lg p-6 text-white">
            <h3 className="text-lg font-bold mb-4">📊 System Status</h3>
            {robotMode === 'gta' ? (
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-red-300">Active Robots:</span> 4
                </div>
                <div>
                  <span className="text-red-300">Update Rate:</span> 60 FPS
                </div>
                <div>
                  <span className="text-red-300">AI System:</span> A* + GTA Pursuit
                </div>
                <div>
                  <span className="text-red-300">Captures:</span> {gtaCaptureCount}
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-cyan-300">Active Robots:</span> 10
                </div>
                <div>
                  <span className="text-cyan-300">Update Rate:</span> 60 FPS
                </div>
                <div>
                  <span className="text-cyan-300">Navigation:</span> Vector Field + AI
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Positioned Test Elements */}
      <div className="fixed top-20 right-8 bg-orange-500/80 backdrop-blur-sm rounded-lg p-4 z-20">
        <h4 className="text-white font-bold">Fixed Element</h4>
        <p className="text-white/80 text-xs">
          Tests fixed positioning navigation
        </p>
      </div>

      <div className="fixed bottom-20 left-8 bg-teal-500/80 backdrop-blur-sm rounded-lg p-4 z-20">
        <h4 className="text-white font-bold">Bottom Fixed</h4>
        <p className="text-white/80 text-xs">
          Complex layout obstacle
        </p>
      </div>
    </div>
  );
}