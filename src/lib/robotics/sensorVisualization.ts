/**
 * Sensor Visualization
 * 
 * Renders different sensor types (lidar, ultrasonic, camera) with appropriate
 * visual representations based on real-world sensor characteristics.
 */

import { Vector2 } from '@/lib/robotics/math';
import { Robot } from './robot';

export class SensorVisualization {
  /**
   * Render lidar sensor (radar-like rotating lines)
   */
  static renderLidar(
    ctx: CanvasRenderingContext2D,
    robot: Robot,
    robotSize: number,
    time: number
  ): void {
    const range = robot.getSensorRange(robotSize);
    const pos = robot.state.position;
    
    // Rotating radar sweep (360 degrees)
    const sweepAngle = (time * 0.005) % (Math.PI * 2); // Slow rotation
    const sweepCount = 8; // Number of radar lines
    
    ctx.strokeStyle = robot.state.type.color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.6;
    
    for (let i = 0; i < sweepCount; i++) {
      const angle = sweepAngle + (i / sweepCount) * Math.PI * 2;
      const endX = pos.x + Math.cos(angle) * range;
      const endY = pos.y + Math.sin(angle) * range;
      
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
    
    // Detection circle
    ctx.strokeStyle = robot.state.type.color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, range, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.globalAlpha = 1.0;
  }

  /**
   * Render ultrasonic sensor (fuzzy detection cloud)
   */
  static renderUltrasonic(
    ctx: CanvasRenderingContext2D,
    robot: Robot,
    robotSize: number
  ): void {
    const range = robot.getSensorRange(robotSize);
    const pos = robot.state.position;
    
    // Create gradient for fuzzy cloud effect
    const gradient = ctx.createRadialGradient(
      pos.x, pos.y, 0,
      pos.x, pos.y, range
    );
    
    // More opaque in center, fade out at edges
    gradient.addColorStop(0, `${robot.state.type.color}40`);
    gradient.addColorStop(0.5, `${robot.state.type.color}20`);
    gradient.addColorStop(1, `${robot.state.type.color}00`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, range, 0, Math.PI * 2);
    ctx.fill();
    
    // Outer ring
    ctx.strokeStyle = robot.state.type.color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, range, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  }

  /**
   * Render camera sensor (visual cone)
   */
  static renderCamera(
    ctx: CanvasRenderingContext2D,
    robot: Robot,
    robotSize: number
  ): void {
    const range = robot.getSensorRange(robotSize);
    const pos = robot.state.position;
    const angle = robot.state.angle;
    const fov = Math.PI / 3; // 60 degree field of view
    
    // Draw field of view cone
    ctx.fillStyle = `${robot.state.type.color}20`;
    ctx.strokeStyle = robot.state.type.color;
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(
      pos.x + Math.cos(angle - fov / 2) * range,
      pos.y + Math.sin(angle - fov / 2) * range
    );
    ctx.lineTo(
      pos.x + Math.cos(angle + fov / 2) * range,
      pos.y + Math.sin(angle + fov / 2) * range
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  /**
   * Render sensor based on robot type
   */
  static render(
    ctx: CanvasRenderingContext2D,
    robot: Robot,
    robotSize: number,
    time: number
  ): void {
    if (!robot.isOperational()) return;
    
    switch (robot.state.type.sensorType) {
      case 'lidar':
        this.renderLidar(ctx, robot, robotSize, time);
        break;
      case 'ultrasonic':
        this.renderUltrasonic(ctx, robot, robotSize);
        break;
      case 'camera':
        this.renderCamera(ctx, robot, robotSize);
        break;
    }
  }
}

