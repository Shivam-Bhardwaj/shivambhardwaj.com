// Modular Robot Engine
// Separated force calculations for better maintainability and testing

export interface Robot {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  trail: { x: number; y: number }[];
  energy: number;
  role: 'scout' | 'follower' | 'leader';
  wanderAngle: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'text' | 'button' | 'interactive' | 'container' | 'static';
  avoidDistance: number;
}

export interface RobotConfig {
  seekForce: number;
  avoidForce: number;
  separationForce: number;
  alignmentForce: number;
  cohesionForce: number;
  wanderForce: number;
  maxSpeed: number;
  obstacleAvoidanceDistance: number;
  separationDistance: number;
  neighborRadius: number;
}

export interface ForceResult {
  seek: { x: number; y: number };
  avoid: { x: number; y: number };
  separation: { x: number; y: number };
  alignment: { x: number; y: number };
  cohesion: { x: number; y: number };
  wander: { x: number; y: number };
  total: { x: number; y: number };
}

export class RobotEngine {
  private config: RobotConfig;

  constructor(config: Partial<RobotConfig> = {}) {
    this.config = {
      seekForce: 0.2,
      avoidForce: 1.2,
      separationForce: 0.2,
      alignmentForce: 0.1,
      cohesionForce: 0.05,
      wanderForce: 0.02,
      maxSpeed: 3,
      obstacleAvoidanceDistance: 120,
      separationDistance: 70,
      neighborRadius: 100,
      ...config
    };
  }

  updateConfig(newConfig: Partial<RobotConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // Seek behavior - move towards target
  calculateSeekForce(robot: Robot, target: { x: number; y: number }): { x: number; y: number } {
    const dx = target.x - robot.x;
    const dy = target.y - robot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return { x: 0, y: 0 };

    const desiredX = (dx / distance) * this.config.maxSpeed;
    const desiredY = (dy / distance) * this.config.maxSpeed;

    return {
      x: (desiredX - robot.vx) * this.config.seekForce,
      y: (desiredY - robot.vy) * this.config.seekForce
    };
  }

  // Obstacle avoidance using ray casting
  calculateAvoidanceForce(robot: Robot, obstacles: Obstacle[]): { x: number; y: number } {
    let avoidX = 0;
    let avoidY = 0;
    let rayHitCount = 0;

    const robotAngle = Math.atan2(robot.vy, robot.vx);
    const rayAngles = [-Math.PI/3, -Math.PI/6, 0, Math.PI/6, Math.PI/3];
    const rayStep = 8;

    rayAngles.forEach(angleOffset => {
      const rayAngle = robotAngle + angleOffset;
      const rayDx = Math.cos(rayAngle);
      const rayDy = Math.sin(rayAngle);

      for (let distance = 12; distance < this.config.obstacleAvoidanceDistance; distance += rayStep) {
        const rayX = robot.x + rayDx * distance;
        const rayY = robot.y + rayDy * distance;

        for (const obstacle of obstacles) {
          if (rayX >= obstacle.x && rayX <= obstacle.x + obstacle.width &&
              rayY >= obstacle.y && rayY <= obstacle.y + obstacle.height) {

            const avoidStrength = (this.config.obstacleAvoidanceDistance - distance) / this.config.obstacleAvoidanceDistance;
            const perpendicularX = -rayDy;
            const perpendicularY = rayDx;

            const typeMultiplier = obstacle.type === 'button' || obstacle.type === 'interactive' ? 1.5 : 1.0;

            avoidX += perpendicularX * avoidStrength * this.config.avoidForce * typeMultiplier;
            avoidY += perpendicularY * avoidStrength * this.config.avoidForce * typeMultiplier;
            rayHitCount++;
            break;
          }
        }
      }
    });

    // Normalize avoidance force to prevent oscillation
    if (rayHitCount > 0) {
      const forceMagnitude = Math.sqrt(avoidX * avoidX + avoidY * avoidY);
      const maxAvoidanceForce = this.config.avoidForce * 2.0;

      if (forceMagnitude > maxAvoidanceForce) {
        avoidX = (avoidX / forceMagnitude) * maxAvoidanceForce;
        avoidY = (avoidY / forceMagnitude) * maxAvoidanceForce;
      }

      // Add forward bias when forces conflict
      if (rayHitCount >= 3 && forceMagnitude < this.config.avoidForce * 0.5) {
        const currentDirectionX = Math.cos(robotAngle) * this.config.avoidForce * 0.3;
        const currentDirectionY = Math.sin(robotAngle) * this.config.avoidForce * 0.3;
        avoidX += currentDirectionX;
        avoidY += currentDirectionY;
      }
    }

    return { x: avoidX, y: avoidY };
  }

  // Separation - avoid crowding neighbors
  calculateSeparationForce(robot: Robot, neighbors: Robot[]): { x: number; y: number } {
    let steerX = 0, steerY = 0;

    neighbors.forEach(neighbor => {
      const dx = robot.x - neighbor.x;
      const dy = robot.y - neighbor.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0 && dist < this.config.separationDistance) {
        const force = (this.config.separationDistance - dist) / this.config.separationDistance;
        steerX += (dx / dist) * force;
        steerY += (dy / dist) * force;
      }
    });

    return { x: steerX * this.config.separationForce, y: steerY * this.config.separationForce };
  }

  // Alignment - match velocity of neighbors
  calculateAlignmentForce(robot: Robot, neighbors: Robot[]): { x: number; y: number } {
    if (neighbors.length === 0) return { x: 0, y: 0 };

    let avgVx = 0, avgVy = 0;
    neighbors.forEach(neighbor => {
      avgVx += neighbor.vx;
      avgVy += neighbor.vy;
    });

    avgVx /= neighbors.length;
    avgVy /= neighbors.length;

    return {
      x: (avgVx - robot.vx) * this.config.alignmentForce,
      y: (avgVy - robot.vy) * this.config.alignmentForce
    };
  }

  // Cohesion - move towards center of neighbors
  calculateCohesionForce(robot: Robot, neighbors: Robot[]): { x: number; y: number } {
    if (neighbors.length === 0) return { x: 0, y: 0 };

    let centerX = 0, centerY = 0;
    neighbors.forEach(neighbor => {
      centerX += neighbor.x;
      centerY += neighbor.y;
    });

    centerX /= neighbors.length;
    centerY /= neighbors.length;

    const dx = centerX - robot.x;
    const dy = centerY - robot.y;

    return {
      x: dx * this.config.cohesionForce,
      y: dy * this.config.cohesionForce
    };
  }

  // Wander - random movement for exploration
  calculateWanderForce(robot: Robot): { x: number; y: number } {
    robot.wanderAngle += (Math.random() - 0.5) * 0.3;

    const wanderX = Math.cos(robot.wanderAngle);
    const wanderY = Math.sin(robot.wanderAngle);

    return {
      x: wanderX * this.config.wanderForce,
      y: wanderY * this.config.wanderForce
    };
  }

  // Get neighboring robots within radius
  getNeighbors(robot: Robot, robots: Robot[]): Robot[] {
    return robots.filter(other => {
      if (other.id === robot.id) return false;
      const dx = other.x - robot.x;
      const dy = other.y - robot.y;
      return Math.sqrt(dx * dx + dy * dy) < this.config.neighborRadius;
    });
  }

  // Calculate all forces for a robot
  calculateForces(robot: Robot, robots: Robot[], obstacles: Obstacle[], target: { x: number; y: number }): ForceResult {
    const neighbors = this.getNeighbors(robot, robots);

    const seek = this.calculateSeekForce(robot, target);
    const avoid = this.calculateAvoidanceForce(robot, obstacles);
    const separation = this.calculateSeparationForce(robot, neighbors);
    const alignment = this.calculateAlignmentForce(robot, neighbors);
    const cohesion = this.calculateCohesionForce(robot, neighbors);
    const wander = this.calculateWanderForce(robot);

    const total = {
      x: seek.x + avoid.x + separation.x + alignment.x + cohesion.x + wander.x,
      y: seek.y + avoid.y + separation.y + alignment.y + cohesion.y + wander.y
    };

    return { seek, avoid, separation, alignment, cohesion, wander, total };
  }

  // Apply forces to robot and update position
  updateRobot(robot: Robot, forces: ForceResult, canvasWidth: number, canvasHeight: number): void {
    // Apply total force to velocity
    robot.vx += forces.total.x;
    robot.vy += forces.total.y;

    // Limit speed
    const speed = Math.sqrt(robot.vx * robot.vx + robot.vy * robot.vy);
    if (speed > this.config.maxSpeed) {
      robot.vx = (robot.vx / speed) * this.config.maxSpeed;
      robot.vy = (robot.vy / speed) * this.config.maxSpeed;
    }

    // Update position
    robot.x += robot.vx;
    robot.y += robot.vy;

    // Boundary constraints
    const robotSize = 12;
    robot.x = Math.max(robotSize, Math.min(canvasWidth - robotSize, robot.x));
    robot.y = Math.max(robotSize, Math.min(canvasHeight - robotSize, robot.y));

    // Update trail
    robot.trail.push({ x: robot.x, y: robot.y });
    const maxTrailLength = robot.role === 'leader' ? 35 : robot.role === 'scout' ? 20 : 25;
    if (robot.trail.length > maxTrailLength) {
      robot.trail.shift();
    }

    // Update energy
    robot.energy = Math.max(30, robot.energy - 0.1 + Math.random() * 0.3);
  }

  // Create initial robots
  createRobots(count: number, canvasWidth: number, canvasHeight: number): Robot[] {
    const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16"];
    const roles: ('scout' | 'follower' | 'leader')[] = ['scout', 'follower', 'leader'];

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      color: colors[i % colors.length],
      trail: [],
      wanderAngle: Math.random() * Math.PI * 2,
      energy: Math.random() * 100 + 50,
      role: roles[i % roles.length]
    }));
  }
}

// Export singleton instance for easy use
export const robotEngine = new RobotEngine();
