import { Metadata } from "next";
import { TelemetryPlayground } from "@/components/TelemetryPlayground";

export const metadata: Metadata = {
  title: "Robot Telemetry Dashboard - Shivam Bhardwaj",
  description: "Real-time telemetry and monitoring dashboard for robotic swarms and autonomous systems. Monitor robot performance, system metrics, and behavioral analytics.",
};

export default function TelemetryPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🤖 Robot Telemetry Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Real-time monitoring and analytics for robotic systems. Track robot performance, 
            analyze behavioral patterns, and monitor system health across different robot types 
            and scenarios.
          </p>
        </div>
        
        <div className="space-y-8">
          {/* Dashboard Description */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 text-center">
              Telemetry Features
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="text-center">
                <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Real-time Metrics</h3>
                <ul className="space-y-1 text-left inline-block">
                  <li>• Robot position, velocity, and health</li>
                  <li>• System performance and frame rates</li>
                  <li>• Collision detection and avoidance</li>
                  <li>• Energy consumption patterns</li>
                </ul>
              </div>
              <div className="text-center">
                <h3 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Analytics</h3>
                <ul className="space-y-1 text-left inline-block">
                  <li>• Historical trend visualization</li>
                  <li>• Behavioral pattern analysis</li>
                  <li>• Performance optimization insights</li>
                  <li>• Data export capabilities</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Interactive Playground */}
          <div className="flex justify-center">
            <TelemetryPlayground />
          </div>
        </div>
      </div>
    </div>
  );
}