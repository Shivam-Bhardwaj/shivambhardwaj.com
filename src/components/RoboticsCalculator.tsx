"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { KinematicsCalculator } from './calculators/KinematicsCalculator';
import { TransformCalculator } from './calculators/TransformCalculator';
import { TrajectoryCalculator } from './calculators/TrajectoryCalculator';
import { PIDCalculator } from './calculators/PIDCalculator';
import { SensorCalculator } from './calculators/SensorCalculator';

interface CalculatorProps {
  type?: 'kinematics' | 'transforms' | 'trajectories' | 'pid' | 'sensors';
}

export default function RoboticsCalculator(_props: CalculatorProps) {
  const [activeTab, setActiveTab] = useState(0);
  
  const calculators = [
    { id: 'kinematics', name: 'Forward/Inverse Kinematics', component: KinematicsCalculator },
    { id: 'transforms', name: '3D Transformations', component: TransformCalculator },
    { id: 'trajectories', name: 'Trajectory Planning', component: TrajectoryCalculator },
    { id: 'pid', name: 'PID Tuning', component: PIDCalculator },
    { id: 'sensors', name: 'Sensor Fusion', component: SensorCalculator }
  ];

  const ActiveCalculator = calculators[activeTab].component;

  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Interactive Robotics Calculators</h2>
      
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b">
        {calculators.map((calc, index) => (
          <button
            key={calc.id}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
              activeTab === index
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-foreground-muted hover:text-foreground hover:border-gray-300'
            }`}
          >
            {calc.name}
          </button>
        ))}
      </div>

      {/* Calculator Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ActiveCalculator />
      </motion.div>
    </div>
  );
}

