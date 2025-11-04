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

export interface RobotType {
  id: string;
  name: string;
  sensorType: SensorType;
  sensorRange: number; // Multiplier of robot size (e.g., 10x for lidar)
  commRange: number; // Pixels
  batteryCapacity: number; // Maximum battery level
  speed: number; // Base movement speed
  color: string; // Visual color
  description: string;
}

export const ROBOT_TYPES: Record<string, RobotType> = {
  lidar_long: {
    id: 'lidar_long',
    name: 'Lidar Scout',
    sensorType: 'lidar',
    sensorRange: 10, // 10x robot size (radar-like detection)
    commRange: 150, // Long-range communication
    batteryCapacity: 100,
    speed: 2.5,
    color: '#06b6d4', // Cyan - electric blue
    description: 'Advanced lidar sensor with long-range detection and communication'
  },
  lidar_medium: {
    id: 'lidar_medium',
    name: 'Lidar Explorer',
    sensorType: 'lidar',
    sensorRange: 8, // 8x robot size
    commRange: 100, // Medium-range communication
    batteryCapacity: 80,
    speed: 2.0,
    color: '#0ea5e9', // Sky blue
    description: 'Lidar-equipped robot with medium-range capabilities'
  },
  ultrasonic_short: {
    id: 'ultrasonic_short',
    name: 'Ultrasonic Worker',
    sensorType: 'ultrasonic',
    sensorRange: 3, // 3x robot size (fuzzy detection cloud)
    commRange: 50, // Short-range communication
    batteryCapacity: 60,
    speed: 1.5,
    color: '#f59e0b', // Amber/yellow
    description: 'Short-range ultrasonic sensor with limited communication'
  },
  ultrasonic_medium: {
    id: 'ultrasonic_medium',
    name: 'Ultrasonic Scout',
    sensorType: 'ultrasonic',
    sensorRange: 4, // 4x robot size
    commRange: 75, // Medium-range communication
    batteryCapacity: 70,
    speed: 1.8,
    color: '#fbbf24', // Yellow
    description: 'Medium-range ultrasonic sensor'
  },
  camera_short: {
    id: 'camera_short',
    name: 'Visual Observer',
    sensorType: 'camera',
    sensorRange: 2, // 2x robot size (visual detection)
    commRange: 40, // Very short-range communication
    batteryCapacity: 50,
    speed: 1.2,
    color: '#ec4899', // Pink/magenta
    description: 'Camera-based detection with minimal communication range'
  }
};

/**
 * Get random robot type distribution
 * Returns a mix of robot types for realistic swarm behavior
 */
export function getRandomRobotTypes(count: number): RobotType[] {
  const types = Object.values(ROBOT_TYPES);
  const distribution = [
    { type: types[0], weight: 0.2 }, // 20% lidar_long
    { type: types[1], weight: 0.25 }, // 25% lidar_medium
    { type: types[2], weight: 0.3 }, // 30% ultrasonic_short
    { type: types[3], weight: 0.15 }, // 15% ultrasonic_medium
    { type: types[4], weight: 0.1 }  // 10% camera_short
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

