import { Vector2D, SensorReading, Obstacle, Resource } from '../types';
import { Robot } from '../Robot';

export class SensorSystem {
  private robot: Robot;
  private lidarRays: number = 36; // 360 degree coverage, ray every 10 degrees
  private lastReadings: Map<string, SensorReading> = new Map();
  private noiseLevel: number = 0.05; // 5% sensor noise

  constructor(robot: Robot) {
    this.robot = robot;
  }

  performLidarScan(obstacles: Obstacle[], robots: Robot[]): SensorReading {
    const rays: Array<{ angle: number; distance: number; hit: 'obstacle' | 'robot' | 'none' }> = [];
    
    for (let i = 0; i < this.lidarRays; i++) {
      const angle = (i / this.lidarRays) * Math.PI * 2 + this.robot.heading;
      const ray = this.castRay(angle, obstacles, robots);
      rays.push(ray);
    }

    const reading: SensorReading = {
      type: 'lidar',
      data: rays,
      timestamp: Date.now()
    };

    this.lastReadings.set('lidar', reading);
    return reading;
  }

  private castRay(
    angle: number, 
    obstacles: Obstacle[], 
    robots: Robot[]
  ): { angle: number; distance: number; hit: 'obstacle' | 'robot' | 'none' } {
    const maxDistance = this.robot.sensorRange;
    const stepSize = 2;
    
    for (let distance = 0; distance < maxDistance; distance += stepSize) {
      const x = this.robot.position.x + Math.cos(angle) * distance;
      const y = this.robot.position.y + Math.sin(angle) * distance;
      
      // Check collision with obstacles
      for (const obstacle of obstacles) {
        if (this.pointIntersectsObstacle({ x, y }, obstacle)) {
          return { 
            angle, 
            distance: distance + this.addNoise(distance), 
            hit: 'obstacle' 
          };
        }
      }
      
      // Check collision with other robots
      for (const other of robots) {
        if (other.id !== this.robot.id) {
          const dist = Math.sqrt(
            (other.position.x - x) ** 2 + 
            (other.position.y - y) ** 2
          );
          if (dist < 10) { // Robot radius
            return { 
              angle, 
              distance: distance + this.addNoise(distance), 
              hit: 'robot' 
            };
          }
        }
      }
    }
    
    return { angle, distance: maxDistance, hit: 'none' };
  }

  private pointIntersectsObstacle(point: Vector2D, obstacle: Obstacle): boolean {
    return point.x >= obstacle.position.x - obstacle.width / 2 &&
           point.x <= obstacle.position.x + obstacle.width / 2 &&
           point.y >= obstacle.position.y - obstacle.height / 2 &&
           point.y <= obstacle.position.y + obstacle.height / 2;
  }

  detectProximity(robots: Robot[]): SensorReading {
    const nearbyRobots = robots.filter(r => {
      if (r.id === this.robot.id) return false;
      const dist = this.getDistance(r.position);
      return dist < 50; // Proximity sensor range
    });

    const reading: SensorReading = {
      type: 'proximity',
      data: nearbyRobots.map(r => ({
        id: r.id,
        distance: this.getDistance(r.position) + this.addNoise(this.getDistance(r.position)),
        angle: Math.atan2(
          r.position.y - this.robot.position.y,
          r.position.x - this.robot.position.x
        ) - this.robot.heading,
        type: r.type
      })),
      timestamp: Date.now()
    };

    this.lastReadings.set('proximity', reading);
    return reading;
  }

  detectResources(resources: Resource[]): SensorReading {
    const detectedResources = resources.filter(r => {
      const dist = this.getDistance(r.position);
      return dist < this.robot.sensorRange;
    }).map(r => ({
      ...r,
      distance: this.getDistance(r.position),
      angle: Math.atan2(
        r.position.y - this.robot.position.y,
        r.position.x - this.robot.position.x
      ) - this.robot.heading
    }));

    const reading: SensorReading = {
      type: 'camera',
      data: detectedResources,
      timestamp: Date.now()
    };

    this.lastReadings.set('camera', reading);
    return reading;
  }

  detectEnergySource(robots: Robot[]): SensorReading {
    const energySources = robots.filter(r => 
      r.type === 'energy' && 
      r.id !== this.robot.id &&
      this.getDistance(r.position) < this.robot.sensorRange
    );

    const reading: SensorReading = {
      type: 'energy',
      data: energySources.map(r => ({
        id: r.id,
        position: r.position,
        distance: this.getDistance(r.position),
        batteryLevel: r.battery
      })),
      timestamp: Date.now()
    };

    this.lastReadings.set('energy', reading);
    return reading;
  }

  private getDistance(point: Vector2D): number {
    const dx = this.robot.position.x - point.x;
    const dy = this.robot.position.y - point.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private addNoise(value: number): number {
    const noise = (Math.random() - 0.5) * 2 * this.noiseLevel * value;
    return value + noise;
  }

  getLastReading(type: 'lidar' | 'proximity' | 'camera' | 'energy'): SensorReading | undefined {
    return this.lastReadings.get(type);
  }

  drawSensorVisualization(ctx: CanvasRenderingContext2D): void {
    const lidarReading = this.lastReadings.get('lidar');
    if (!lidarReading) return;

    ctx.save();
    ctx.translate(this.robot.position.x, this.robot.position.y);
    
    // Draw LIDAR rays
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.2)';
    ctx.lineWidth = 0.5;
    
    for (const ray of (lidarReading.data as { angle: number; distance: number; hit: string }[])) {
      if (ray.hit !== 'none') {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const endX = Math.cos(ray.angle) * ray.distance;
        const endY = Math.sin(ray.angle) * ray.distance;
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Draw hit point
        if (ray.hit === 'obstacle') {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
        } else {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
        }
        ctx.beginPath();
        ctx.arc(endX, endY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.restore();
  }
}