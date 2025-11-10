/**
 * Robot Type Definitions
 * 
 * Defines different robot types with varying sensor capabilities, communication ranges,
 * and other characteristics based on real-world swarm robotics research.
 * 
 * References:
 * - Swarm Robotics: A Survey (Brambilla et al., 2013)
 * - Distributed Coverage Control for Mobile Sensing Networks (Cortes et al., 2004)
 */

export type SensorType = 'lidar' | 'ultrasonic' | 'camera';
export type CommunicationRange = 'short' | 'medium' | 'long';
export type RobotRole = 'prey' | 'predator' | 'scavenger';

export interface RobotType {
  id: string;
  name: string;
  role: RobotRole;
  sensorType: SensorType;
  sensorRange: number; // Multiplier of robot size (e.g., 10x for lidar)
  commRange: number; // Pixels
  batteryCapacity: number; // Maximum battery level
  speed: number; // Base movement speed
  color: string; // Visual color
  description: string;
}

export const ROBOT_TYPES: Record<string, RobotType> = {
  // Prey robots - fast, good sensors, flee from predators
  prey_fast: {
    id: 'prey_fast',
    name: 'Fast Prey',
    role: 'prey',
    sensorType: 'lidar',
    sensorRange: 12, // Good detection range
    commRange: 100,
    batteryCapacity: 80,
    speed: 3.5, // Fast
    color: '#10b981', // Green
    description: 'Fast prey robot with excellent sensors for detecting predators'
  },
  prey_medium: {
    id: 'prey_medium',
    name: 'Medium Prey',
    role: 'prey',
    sensorType: 'ultrasonic',
    sensorRange: 8,
    commRange: 80,
    batteryCapacity: 70,
    speed: 2.8,
    color: '#34d399', // Light green
    description: 'Medium-speed prey robot'
  },
  prey_slow: {
    id: 'prey_slow',
    name: 'Slow Prey',
    role: 'prey',
    sensorType: 'camera',
    sensorRange: 6,
    commRange: 60,
    batteryCapacity: 60,
    speed: 2.0,
    color: '#6ee7b7', // Pale green
    description: 'Slower prey robot with basic sensors'
  },
  
  // Predator robots - slower but hunt prey
  predator_aggressive: {
    id: 'predator_aggressive',
    name: 'Aggressive Predator',
    role: 'predator',
    sensorType: 'lidar',
    sensorRange: 10,
    commRange: 120,
    batteryCapacity: 120, // Higher capacity
    speed: 2.5, // Slower than prey
    color: '#ef4444', // Red
    description: 'Aggressive predator that hunts prey for energy'
  },
  predator_patrol: {
    id: 'predator_patrol',
    name: 'Patrol Predator',
    role: 'predator',
    sensorType: 'ultrasonic',
    sensorRange: 8,
    commRange: 100,
    batteryCapacity: 100,
    speed: 2.2,
    color: '#f87171', // Light red
    description: 'Patrolling predator with medium-range sensors'
  },
  
  // Scavenger robots - collect energy, avoid predators
  scavenger_efficient: {
    id: 'scavenger_efficient',
    name: 'Efficient Scavenger',
    role: 'scavenger',
    sensorType: 'ultrasonic',
    sensorRange: 9,
    commRange: 90,
    batteryCapacity: 90,
    speed: 2.3,
    color: '#fbbf24', // Yellow/amber
    description: 'Efficient scavenger that collects energy from environment'
  },
  scavenger_basic: {
    id: 'scavenger_basic',
    name: 'Basic Scavenger',
    role: 'scavenger',
    sensorType: 'camera',
    sensorRange: 5,
    commRange: 70,
    batteryCapacity: 75,
    speed: 2.0,
    color: '#fcd34d', // Light yellow
    description: 'Basic scavenger robot'
  }
};

/**
 * Get random robot type distribution for prey-predator ecosystem
 */
export function getRandomRobotTypes(count: number): RobotType[] {
  const types = Object.values(ROBOT_TYPES);
  const distribution = [
    { type: types[0], weight: 0.25 }, // 25% prey_fast
    { type: types[1], weight: 0.20 }, // 20% prey_medium
    { type: types[2], weight: 0.15 }, // 15% prey_slow
    { type: types[3], weight: 0.15 }, // 15% predator_aggressive
    { type: types[4], weight: 0.10 }, // 10% predator_patrol
    { type: types[5], weight: 0.10 }, // 10% scavenger_efficient
    { type: types[6], weight: 0.05 }  // 5% scavenger_basic
  ];

  const robots: RobotType[] = [];
  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let cumulative = 0;
    for (const dist of distribution) {
      cumulative += dist.weight;
      if (rand <= cumulative) {
        robots.push(dist.type);
        break;
      }
    }
  }
  return robots;
}

