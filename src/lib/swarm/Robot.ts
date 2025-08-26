import { RobotType, RobotStats, Vector2D, SensorReading, RobotBehavior, Pheromone, Resource, Obstacle } from './types';
import { SensorSystem } from './sensors/SensorSystem';
import { CommunicationSystem } from './communication/CommunicationSystem';

export class Robot implements RobotStats {
  id: string;
  type: RobotType;
  position: Vector2D;
  velocity: Vector2D;
  heading: number;
  battery: number;
  maxBattery: number;
  speed: number;
  maxSpeed: number;
  sensorRange: number;
  communicationRange: number;
  cargoCapacity: number;
  currentCargo: number;
  health: number;
  age: number;
  
  // Public for external access
  public sensors: SensorSystem;
  public communication: CommunicationSystem;
  private behavior: RobotBehavior;
  private target: Vector2D | null = null;
  private neighbors: Robot[] = [];
  private detectedResources: Resource[] = [];
  private detectedObstacles: Obstacle[] = [];
  private trail: Vector2D[] = [];
  private readonly MAX_TRAIL_LENGTH = 50;

  constructor(type: RobotType, position: Vector2D, id?: string) {
    this.id = id || `robot-${Math.random().toString(36).substr(2, 9)}`;
    this.type = type;
    this.position = { ...position };
    this.velocity = { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 };
    this.heading = Math.atan2(this.velocity.y, this.velocity.x);
    this.age = 0;
    this.health = 100;
    this.trail = [];

    // Set type-specific parameters
    switch (type) {
      case RobotType.SCOUT:
        this.maxSpeed = 3;
        this.maxBattery = 100;
        this.sensorRange = 200;
        this.communicationRange = 250;
        this.cargoCapacity = 2;
        this.behavior = {
          weights: {
            separation: 0.8,
            alignment: 0.3,
            cohesion: 0.2,
            goalSeeking: 0.9,
            obstacleAvoidance: 1.0,
            pheromoneFollowing: 0.4,
            exploration: 0.9
          },
          personality: 'explorer'
        };
        break;
        
      case RobotType.WORKER:
        this.maxSpeed = 1.5;
        this.maxBattery = 150;
        this.sensorRange = 100;
        this.communicationRange = 150;
        this.cargoCapacity = 10;
        this.behavior = {
          weights: {
            separation: 0.5,
            alignment: 0.6,
            cohesion: 0.7,
            goalSeeking: 0.7,
            obstacleAvoidance: 0.9,
            pheromoneFollowing: 0.8,
            exploration: 0.3
          },
          personality: 'cooperative'
        };
        break;
        
      case RobotType.COMMUNICATOR:
        this.maxSpeed = 2;
        this.maxBattery = 120;
        this.sensorRange = 150;
        this.communicationRange = 400;
        this.cargoCapacity = 5;
        this.behavior = {
          weights: {
            separation: 0.6,
            alignment: 0.8,
            cohesion: 0.8,
            goalSeeking: 0.5,
            obstacleAvoidance: 0.8,
            pheromoneFollowing: 0.6,
            exploration: 0.5
          },
          personality: 'cooperative'
        };
        break;
        
      case RobotType.ENERGY:
        this.maxSpeed = 1;
        this.maxBattery = 200;
        this.sensorRange = 120;
        this.communicationRange = 180;
        this.cargoCapacity = 3;
        this.behavior = {
          weights: {
            separation: 0.7,
            alignment: 0.5,
            cohesion: 0.6,
            goalSeeking: 0.4,
            obstacleAvoidance: 0.9,
            pheromoneFollowing: 0.5,
            exploration: 0.2
          },
          personality: 'cautious'
        };
        break;
    }

    this.battery = this.maxBattery;
    this.speed = this.maxSpeed;
    this.currentCargo = 0;

    this.sensors = new SensorSystem(this);
    this.communication = new CommunicationSystem(this);
  }

  update(
    deltaTime: number,
    allRobots: Robot[],
    resources: Resource[],
    obstacles: Obstacle[],
    pheromones: Map<string, Pheromone>,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    this.age += deltaTime;
    
    // Update neighbors
    this.neighbors = allRobots.filter(
      robot => robot.id !== this.id && this.getDistance(robot.position) < this.sensorRange
    );

    // Sensor updates
    this.detectedResources = resources.filter(
      r => this.getDistance(r.position) < this.sensorRange
    );
    this.detectedObstacles = obstacles.filter(
      o => this.getDistance(o.position) < this.sensorRange * 1.5
    );

    // Calculate steering forces
    const steeringForce = this.calculateSteeringForce(pheromones);
    
    // Apply forces to velocity
    this.velocity.x += steeringForce.x * deltaTime;
    this.velocity.y += steeringForce.y * deltaTime;

    // Limit speed
    const currentSpeed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    if (currentSpeed > this.speed) {
      this.velocity.x = (this.velocity.x / currentSpeed) * this.speed;
      this.velocity.y = (this.velocity.y / currentSpeed) * this.speed;
    }

    // Update position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Update heading
    if (currentSpeed > 0.1) {
      this.heading = Math.atan2(this.velocity.y, this.velocity.x);
    }

    // Wrap around edges
    if (this.position.x < 0) this.position.x = canvasWidth;
    if (this.position.x > canvasWidth) this.position.x = 0;
    if (this.position.y < 0) this.position.y = canvasHeight;
    if (this.position.y > canvasHeight) this.position.y = 0;

    // Battery consumption
    const consumptionRate = this.type === RobotType.ENERGY ? 0.01 : 0.02;
    this.battery -= consumptionRate * currentSpeed * deltaTime;
    this.battery = Math.max(0, this.battery);

    // Update trail
    this.trail.push({ ...this.position });
    if (this.trail.length > this.MAX_TRAIL_LENGTH) {
      this.trail.shift();
    }

    // Speed affected by battery
    if (this.battery < 20) {
      this.speed = this.maxSpeed * 0.5;
    } else {
      this.speed = this.maxSpeed;
    }
  }

  private calculateSteeringForce(pheromones: Map<string, Pheromone>): Vector2D {
    const force: Vector2D = { x: 0, y: 0 };

    // Flocking behaviors
    const separation = this.calculateSeparation();
    const alignment = this.calculateAlignment();
    const cohesion = this.calculateCohesion();
    
    // Goal seeking
    const goalForce = this.calculateGoalForce();
    
    // Obstacle avoidance
    const avoidance = this.calculateObstacleAvoidance();
    
    // Pheromone following
    const pheromoneForce = this.calculatePheromoneForce(pheromones);

    // Combine forces with behavior weights
    force.x = 
      separation.x * this.behavior.weights.separation +
      alignment.x * this.behavior.weights.alignment +
      cohesion.x * this.behavior.weights.cohesion +
      goalForce.x * this.behavior.weights.goalSeeking +
      avoidance.x * this.behavior.weights.obstacleAvoidance +
      pheromoneForce.x * this.behavior.weights.pheromoneFollowing;

    force.y = 
      separation.y * this.behavior.weights.separation +
      alignment.y * this.behavior.weights.alignment +
      cohesion.y * this.behavior.weights.cohesion +
      goalForce.y * this.behavior.weights.goalSeeking +
      avoidance.y * this.behavior.weights.obstacleAvoidance +
      pheromoneForce.y * this.behavior.weights.pheromoneFollowing;

    // Add exploration (random walk)
    if (Math.random() < this.behavior.weights.exploration * 0.1) {
      force.x += (Math.random() - 0.5) * 2;
      force.y += (Math.random() - 0.5) * 2;
    }

    return force;
  }

  private calculateSeparation(): Vector2D {
    const force: Vector2D = { x: 0, y: 0 };
    let count = 0;

    for (const neighbor of this.neighbors) {
      const dist = this.getDistance(neighbor.position);
      if (dist < 30 && dist > 0) {
        const diff: Vector2D = {
          x: this.position.x - neighbor.position.x,
          y: this.position.y - neighbor.position.y
        };
        diff.x /= dist;
        diff.y /= dist;
        force.x += diff.x;
        force.y += diff.y;
        count++;
      }
    }

    if (count > 0) {
      force.x /= count;
      force.y /= count;
    }

    return force;
  }

  private calculateAlignment(): Vector2D {
    const force: Vector2D = { x: 0, y: 0 };
    let count = 0;

    for (const neighbor of this.neighbors) {
      force.x += neighbor.velocity.x;
      force.y += neighbor.velocity.y;
      count++;
    }

    if (count > 0) {
      force.x /= count;
      force.y /= count;
      force.x -= this.velocity.x;
      force.y -= this.velocity.y;
    }

    return force;
  }

  private calculateCohesion(): Vector2D {
    const force: Vector2D = { x: 0, y: 0 };
    let count = 0;

    for (const neighbor of this.neighbors) {
      force.x += neighbor.position.x;
      force.y += neighbor.position.y;
      count++;
    }

    if (count > 0) {
      force.x /= count;
      force.y /= count;
      force.x -= this.position.x;
      force.y -= this.position.y;
      
      const dist = Math.sqrt(force.x ** 2 + force.y ** 2);
      if (dist > 0) {
        force.x /= dist;
        force.y /= dist;
      }
    }

    return force;
  }

  private calculateGoalForce(): Vector2D {
    const force: Vector2D = { x: 0, y: 0 };

    // Seek nearest resource if low on battery or carrying capacity available
    if (this.battery < 50 || this.currentCargo < this.cargoCapacity) {
      let nearestResource: Resource | null = null;
      let minDist = Infinity;

      for (const resource of this.detectedResources) {
        const dist = this.getDistance(resource.position);
        if (dist < minDist) {
          minDist = dist;
          nearestResource = resource;
        }
      }

      if (nearestResource) {
        force.x = nearestResource.position.x - this.position.x;
        force.y = nearestResource.position.y - this.position.y;
        const dist = Math.sqrt(force.x ** 2 + force.y ** 2);
        if (dist > 0) {
          force.x /= dist;
          force.y /= dist;
        }
      }
    }

    return force;
  }

  private calculateObstacleAvoidance(): Vector2D {
    const force: Vector2D = { x: 0, y: 0 };
    
    for (const obstacle of this.detectedObstacles) {
      const dist = this.getDistance(obstacle.position);
      const avoidanceRadius = 50;
      
      if (dist < avoidanceRadius) {
        const diff: Vector2D = {
          x: this.position.x - obstacle.position.x,
          y: this.position.y - obstacle.position.y
        };
        
        const strength = 1 - (dist / avoidanceRadius);
        force.x += (diff.x / dist) * strength * 5;
        force.y += (diff.y / dist) * strength * 5;
      }
    }

    return force;
  }

  private calculatePheromoneForce(pheromones: Map<string, Pheromone>): Vector2D {
    const force: Vector2D = { x: 0, y: 0 };
    let totalStrength = 0;

    pheromones.forEach(pheromone => {
      const dist = this.getDistance(pheromone.position);
      if (dist < this.sensorRange && dist > 0) {
        const attraction = pheromone.type === 'food' ? 1 : 
                          pheromone.type === 'danger' ? -1 : 0.5;
        
        const strength = pheromone.strength * attraction / dist;
        force.x += (pheromone.position.x - this.position.x) * strength;
        force.y += (pheromone.position.y - this.position.y) * strength;
        totalStrength += Math.abs(strength);
      }
    });

    if (totalStrength > 0) {
      force.x /= totalStrength;
      force.y /= totalStrength;
    }

    return force;
  }

  private getDistance(point: Vector2D): number {
    const dx = this.position.x - point.x;
    const dy = this.position.y - point.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  depositPheromone(type: 'food' | 'danger' | 'home' | 'explored'): Pheromone {
    return {
      position: { ...this.position },
      strength: 1.0,
      type,
      age: 0,
      depositorId: this.id
    };
  }

  canCommunicateWith(other: Robot): boolean {
    return this.getDistance(other.position) <= this.communicationRange;
  }

  collectResource(resource: Resource): boolean {
    if (this.currentCargo + resource.weight <= this.cargoCapacity) {
      this.currentCargo += resource.weight;
      if (resource.type === 'energy') {
        this.battery = Math.min(this.maxBattery, this.battery + resource.value);
      }
      return true;
    }
    return false;
  }

  shareEnergy(other: Robot, amount: number): boolean {
    if (this.type === RobotType.ENERGY && this.battery > amount) {
      this.battery -= amount;
      other.battery = Math.min(other.maxBattery, other.battery + amount * 0.9); // 90% efficiency
      return true;
    }
    return false;
  }

  getStatus(): RobotStats {
    return {
      id: this.id,
      type: this.type,
      position: { ...this.position },
      velocity: { ...this.velocity },
      heading: this.heading,
      battery: this.battery,
      maxBattery: this.maxBattery,
      speed: this.speed,
      maxSpeed: this.maxSpeed,
      sensorRange: this.sensorRange,
      communicationRange: this.communicationRange,
      cargoCapacity: this.cargoCapacity,
      currentCargo: this.currentCargo,
      health: this.health,
      age: this.age
    };
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    // Draw trail
    if (this.trail.length > 1) {
      ctx.strokeStyle = this.getColor(0.1);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        const alpha = i / this.trail.length * 0.3;
        ctx.strokeStyle = this.getColor(alpha);
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      ctx.stroke();
    }

    // Draw communication range (faint)
    if (this.type === RobotType.COMMUNICATOR) {
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.1)';
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.communicationRange, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw sensor range (very faint)
    if (this.type === RobotType.SCOUT) {
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.1)';
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.sensorRange, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw robot body
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.heading);

    // Different shapes for different types
    const size = this.type === RobotType.WORKER ? 8 : 
                 this.type === RobotType.ENERGY ? 7 :
                 this.type === RobotType.SCOUT ? 5 : 6;

    ctx.fillStyle = this.getColor();
    ctx.strokeStyle = this.getColor(0.8);
    ctx.lineWidth = 2;

    if (this.type === RobotType.WORKER) {
      // Square for workers
      ctx.fillRect(-size/2, -size/2, size, size);
      ctx.strokeRect(-size/2, -size/2, size, size);
    } else if (this.type === RobotType.ENERGY) {
      // Hexagon for energy
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = Math.cos(angle) * size;
        const y = Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Circle for scouts and communicators
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Draw direction indicator
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(size + 3, 0);
    ctx.stroke();

    // Draw battery indicator
    const batteryPercent = this.battery / this.maxBattery;
    ctx.fillStyle = batteryPercent > 0.5 ? 'rgba(34, 197, 94, 0.8)' :
                    batteryPercent > 0.2 ? 'rgba(250, 204, 21, 0.8)' :
                    'rgba(239, 68, 68, 0.8)';
    ctx.fillRect(-size/2, -size - 4, size * batteryPercent, 2);

    // Draw cargo indicator if carrying
    if (this.currentCargo > 0) {
      ctx.fillStyle = 'rgba(251, 146, 60, 0.8)';
      const cargoPercent = this.currentCargo / this.cargoCapacity;
      ctx.fillRect(-size/2, size + 2, size * cargoPercent, 2);
    }

    ctx.restore();
  }

  private getColor(alpha: number = 1): string {
    switch (this.type) {
      case RobotType.SCOUT:
        return `rgba(34, 197, 94, ${alpha})`; // Green
      case RobotType.WORKER:
        return `rgba(59, 130, 246, ${alpha})`; // Blue
      case RobotType.COMMUNICATOR:
        return `rgba(147, 51, 234, ${alpha})`; // Purple
      case RobotType.ENERGY:
        return `rgba(250, 204, 21, ${alpha})`; // Yellow
      default:
        return `rgba(78, 205, 196, ${alpha})`; // Cyan
    }
  }
}