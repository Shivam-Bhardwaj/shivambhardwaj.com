import React from 'react';
import RobotGameTest from '@/components/RobotGameTest';
// Robot Test Page
// Independent testing environment for robot behavior
export default function RobotTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Robot Behavior Test Lab</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Test and tune robot behaviors in isolation. This environment lets you experiment with
            different parameters without affecting your main website.
          </p>
        </div>
        {/* Robot Test Canvas */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <RobotGameTest />
        </div>
        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">Testing Instructions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-blue-800 mb-2"> Basic Testing</h3>
              <ul className="text-blue-700 space-y-1">
                <li>• Move mouse to attract robots</li>
                <li>• Adjust force weights using sliders</li>
                <li>• Add/remove robots to test scaling</li>
                <li>• Change max speed to test performance</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2"> Advanced Debugging</h3>
              <ul className="text-blue-700 space-y-1">
                <li>• Enable force vectors to see robot decisions</li>
                <li>• Show debug info for detailed metrics</li>
                <li>• Test obstacle avoidance with static blocks</li>
                <li>• Observe swarm behavior patterns</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-100 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2"> Pro Tips</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Start with balanced weights (1.0) and adjust gradually</li>
              <li>• Too much avoidance force can cause oscillation</li>
              <li>• Seek force controls how aggressively robots follow the mouse</li>
              <li>• Swarm forces create realistic group behavior</li>
            </ul>
          </div>
        </div>
        {/* Technical Details */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technical Overview</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Seek Behavior</h3>
              <p className="text-gray-600 text-sm">
                Robots calculate steering forces toward targets using desired velocity minus current velocity.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Obstacle Avoidance</h3>
              <p className="text-gray-600 text-sm">
                Ray casting detects obstacles and generates perpendicular avoidance forces.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Swarm Intelligence</h3>
              <p className="text-gray-600 text-sm">
                Separation, alignment, and cohesion forces create realistic flocking behavior.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
