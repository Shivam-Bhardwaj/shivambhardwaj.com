/**
 * Robot Instance
 * 
 * Represents a single robot in the swarm with its current state,
 * including position, battery, communication links, etc.
 */

import { Vector2 } from '@/lib/robotics/math';
import { RobotType } from './robotTypes';

export interface RobotState {
  id: number;
  type: RobotType;
  position: Vector2;
  velocity: Vector2;
  angle: number; // Current heading angle in radians
  battery: number; // Current battery level (0-100)
  signalStrength: number; // Current signal strength (0-100)
  exploredArea: Set<string>; // Grid cells this robot has explored
  neighbors: Set<number>; // IDs of robots in communication range
  lastCommunication: Map<number, number>; // Robot ID -> timestamp of last communication
}

export class Robot {
  public state: RobotState;
  private batteryDrainRate = 0.05; // Battery drains per second
  private maxSpeed: number;

  constructor(id: number, type: RobotType, initialPosition: Vector2) {
    this.state = {
      id,
      type,
      position: initialPosition,
      velocity: Vector2.zero(),
      angle: Math.random() * Math.PI * 2,
      battery: type.batteryCapacity,
      signalStrength: 100,
      exploredArea: new Set(),
      neighbors: new Set(),
      lastCommunication: new Map()
    };
    this.maxSpeed = type.speed;
  }

  /**
   * Update robot state each frame
   */
  update(deltaTime: number): void {
    // Drain battery
    this.state.battery = Math.max(0, this.state.battery - this.batteryDrainRate * deltaTime);
    
    // Update position based on velocity
    const movement = this.state.velocity.multiply(deltaTime * 60); // Scale for 60fps
    this.state.position = this.state.position.add(movement);
    
    // Update angle based on velocity direction
    if (this.state.velocity.magnitude() > 0.1) {
      this.state.angle = this.state.velocity.angle();
    }
    
    // Update signal strength based on battery
    this.state.signalStrength = (this.state.battery / this.state.type.batteryCapacity) * 100;
  }

  /**
   * Set target velocity (will be normalized by max speed)
   */
  setTargetVelocity(target: Vector2): void {
    // Reduce speed based on battery level
    const batteryFactor = this.state.battery / this.state.type.batteryCapacity;
    const effectiveSpeed = this.maxSpeed * batteryFactor * 0.7; // 70% max even at full battery
    
    const normalized = target.normalize();
    this.state.velocity = normalized.multiply(effectiveSpeed);
  }

  /**
   * Check if robot can communicate with another robot
   */
  canCommunicateWith(other: Robot): boolean {
    const distance = this.state.position.distanceTo(other.state.position);
    return distance <= this.state.type.commRange;
  }

  /**
   * Get sensor detection range in pixels
   */
  getSensorRange(robotSize: number): number {
    return this.state.type.sensorRange * robotSize;
  }

  /**
   * Check if robot is operational (has battery)
   */
  isOperational(): boolean {
    return this.state.battery > 0;
  }

  /**
   * Mark area as explored
   */
  markExplored(gridX: number, gridY: number): void {
    this.state.exploredArea.add(`${gridX},${gridY}`);
  }

  /**
   * Share exploration data with neighboring robots
   */
  shareExplorationData(other: Robot): void {
    // Share explored areas
    for (const cell of this.state.exploredArea) {
      other.state.exploredArea.add(cell);
    }
    
    // Update communication timestamp
    this.state.lastCommunication.set(other.state.id, Date.now());
    other.state.lastCommunication.set(this.state.id, Date.now());
  }

  /**
   * Get battery percentage
   */
  getBatteryPercentage(): number {
    return (this.state.battery / this.state.type.batteryCapacity) * 100;
  }
}

