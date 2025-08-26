/**
 * PursuitBehavior.ts
 * GTA-style pursuit behavior system for coordinated robot chase mechanics
 * Implements predictive targeting, flanking, and relentless pursuit strategies
 */

import type { Vector2D, RobotState, NavigationCommand } from './RobotNavigationAgent';

export interface PursuitTarget {
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  lastSeen: number;
  predictedPosition: Vector2D;
  evasionPattern: 'linear' | 'circular' | 'zigzag' | 'random';
}

export interface PursuitFormation {
  leaderId: string;
  members: string[];
  strategy: 'swarm' | 'pincer' | 'box' | 'chase';
  positions: Map<string, Vector2D>;
}

export interface PursuitState {
  phase: 'search' | 'approach' | 'intercept' | 'surround' | 'capture';
  intensity: number; // 0-1, higher means more aggressive
  lastContact: number;
  searchPattern: Vector2D[];
  currentSearchIndex: number;
}

export class PursuitBehavior {
  private robots: Map<string, RobotState>;
  private target: PursuitTarget | null;
  private formations: PursuitFormation[];
  private pursuitStates: Map<string, PursuitState>;
  private screenBounds: { width: number; height: number };
  private searchPatterns: Map<string, Vector2D[]>;

  constructor(screenWidth: number, screenHeight: number) {
    this.robots = new Map();
    this.target = null;
    this.formations = [];
    this.pursuitStates = new Map();
    this.screenBounds = { width: screenWidth, height: screenHeight };
    this.searchPatterns = new Map();
  }

  /**
   * Main update function - coordinated GTA-style pursuit behavior
   */
  public updatePursuit(
    robots: RobotState[],
    mousePosition: Vector2D,
    deltaTime: number
  ): Map<string, NavigationCommand> {
    // Update robot states
    this.updateRobotStates(robots);

    // Update target tracking
    this.updateTargetTracking(mousePosition, deltaTime);

    // Organize formations
    this.organizeFormations(robots);

    // Generate commands for each robot
    const commands = new Map<string, NavigationCommand>();

    for (const robot of robots) {
      const command = this.generatePursuitCommand(robot, deltaTime);
      commands.set(robot.id, command);
    }

    return commands;
  }

  private updateRobotStates(robots: RobotState[]): void {
    for (const robot of robots) {
      this.robots.set(robot.id, robot);
      
      // Initialize pursuit state if new robot
      if (!this.pursuitStates.has(robot.id)) {
        this.pursuitStates.set(robot.id, {
          phase: 'search',
          intensity: 0.5,
          lastContact: Date.now(),
          searchPattern: this.generateSearchPattern(robot),
          currentSearchIndex: 0
        });
      }
    }
  }

  private updateTargetTracking(mousePosition: Vector2D, deltaTime: number): void {
    const currentTime = Date.now();

    if (!this.target) {
      // Initialize target tracking
      this.target = {
        position: mousePosition,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        lastSeen: currentTime,
        predictedPosition: mousePosition,
        evasionPattern: 'linear'
      };
    } else {
      // Update velocity and acceleration
      const timeDiff = deltaTime / 1000; // Convert to seconds
      if (timeDiff > 0) {
        const newVelocity = {
          x: (mousePosition.x - this.target.position.x) / timeDiff,
          y: (mousePosition.y - this.target.position.y) / timeDiff
        };

        this.target.acceleration = {
          x: (newVelocity.x - this.target.velocity.x) / timeDiff,
          y: (newVelocity.y - this.target.velocity.y) / timeDiff
        };

        this.target.velocity = newVelocity;
      }

      this.target.position = mousePosition;
      this.target.lastSeen = currentTime;
      this.target.evasionPattern = this.detectEvasionPattern();
      this.target.predictedPosition = this.predictTargetPosition();
    }

    // Update all robots' last known target position
    for (const [robotId, robot] of this.robots) {
      robot.lastKnownTargetPosition = mousePosition;
    }
  }

  private detectEvasionPattern(): 'linear' | 'circular' | 'zigzag' | 'random' {
    if (!this.target) return 'linear';

    const speed = Math.sqrt(
      this.target.velocity.x ** 2 + this.target.velocity.y ** 2
    );

    const accelMagnitude = Math.sqrt(
      this.target.acceleration.x ** 2 + this.target.acceleration.y ** 2
    );

    // High speed with low acceleration = linear movement
    if (speed > 200 && accelMagnitude < 50) {
      return 'linear';
    }

    // High acceleration = evasive maneuvers
    if (accelMagnitude > 100) {
      return 'zigzag';
    }

    // Consistent curved movement = circular
    if (speed > 100 && accelMagnitude > 30 && accelMagnitude < 80) {
      return 'circular';
    }

    return 'random';
  }

  private predictTargetPosition(): Vector2D {
    if (!this.target) return { x: 0, y: 0 };

    const predictionTime = 1.0; // Predict 1 second ahead
    let predicted = { ...this.target.position };

    switch (this.target.evasionPattern) {
      case 'linear':
        predicted = {
          x: this.target.position.x + this.target.velocity.x * predictionTime,
          y: this.target.position.y + this.target.velocity.y * predictionTime
        };
        break;

      case 'circular':
        predicted = this.predictCircularMovement(predictionTime);
        break;

      case 'zigzag':
        predicted = this.predictZigzagMovement(predictionTime);
        break;

      case 'random':
        // For random movement, predict multiple possible positions
        predicted = this.predictRandomMovement(predictionTime);
        break;
    }

    // Clamp to screen bounds
    predicted.x = Math.max(0, Math.min(this.screenBounds.width, predicted.x));
    predicted.y = Math.max(0, Math.min(this.screenBounds.height, predicted.y));

    return predicted;
  }

  private predictCircularMovement(predictionTime: number): Vector2D {
    if (!this.target) return { x: 0, y: 0 };

    // Assume circular motion and predict the arc
    const currentAngle = Math.atan2(this.target.velocity.y, this.target.velocity.x);
    const speed = Math.sqrt(this.target.velocity.x ** 2 + this.target.velocity.y ** 2);
    const radius = speed / (Math.abs(this.target.acceleration.x + this.target.acceleration.y) / 2 || 1);
    
    const angularVelocity = speed / radius;
    const futureAngle = currentAngle + angularVelocity * predictionTime;

    return {
      x: this.target.position.x + Math.cos(futureAngle) * radius,
      y: this.target.position.y + Math.sin(futureAngle) * radius
    };
  }

  private predictZigzagMovement(predictionTime: number): Vector2D {
    if (!this.target) return { x: 0, y: 0 };

    // Assume the target will change direction soon
    const basePredict = {
      x: this.target.position.x + this.target.velocity.x * predictionTime * 0.5,
      y: this.target.position.y + this.target.velocity.y * predictionTime * 0.5
    };

    // Add some randomness for evasive prediction
    const evasionFactor = 50;
    return {
      x: basePredict.x + (Math.random() - 0.5) * evasionFactor,
      y: basePredict.y + (Math.random() - 0.5) * evasionFactor
    };
  }

  private predictRandomMovement(predictionTime: number): Vector2D {
    if (!this.target) return { x: 0, y: 0 };

    // For truly random movement, predict the most likely escape route
    const escapeRoutes = this.calculateEscapeRoutes();
    return escapeRoutes[0] || this.target.position;
  }

  private calculateEscapeRoutes(): Vector2D[] {
    if (!this.target) return [];

    const routes: Vector2D[] = [];
    const currentPos = this.target.position;
    const robotPositions = Array.from(this.robots.values()).map(r => r.position);

    // Calculate directions away from robot concentrations
    const directions = [
      { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
      { x: 1, y: 1 }, { x: -1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: -1 }
    ];

    for (const dir of directions) {
      const testPos = {
        x: currentPos.x + dir.x * 150,
        y: currentPos.y + dir.y * 150
      };

      // Check if this direction is clear of robots
      let clearDistance = Infinity;
      for (const robotPos of robotPositions) {
        const dist = this.getDistance(testPos, robotPos);
        clearDistance = Math.min(clearDistance, dist);
      }

      routes.push({
        ...testPos,
        priority: clearDistance // Store as a property for sorting
      } as any);
    }

    // Sort by clearance (higher is better)
    routes.sort((a: any, b: any) => b.priority - a.priority);
    
    return routes.slice(0, 3); // Return top 3 escape routes
  }

  private organizeFormations(robots: RobotState[]): void {
    if (!this.target || robots.length === 0) return;

    // Clear existing formations
    this.formations = [];

    if (robots.length === 1) {
      // Single robot - direct pursuit
      this.setSingleRobotFormation(robots[0]);
    } else if (robots.length === 2) {
      // Two robots - pincer movement
      this.setPincerFormation(robots);
    } else {
      // Multiple robots - coordinated strategies
      this.setMultiRobotFormation(robots);
    }
  }

  private setSingleRobotFormation(robot: RobotState): void {
    const state = this.pursuitStates.get(robot.id);
    if (state) {
      state.phase = 'intercept';
      state.intensity = 1.0;
    }
  }

  private setPincerFormation(robots: RobotState[]): void {
    if (!this.target) return;

    const formation: PursuitFormation = {
      leaderId: robots[0].id,
      members: robots.map(r => r.id),
      strategy: 'pincer',
      positions: new Map()
    };

    const targetPos = this.target.position;
    const angle = Math.atan2(targetPos.y, targetPos.x);
    const distance = 100;

    // Position robots on opposite sides
    formation.positions.set(robots[0].id, {
      x: targetPos.x + Math.cos(angle + Math.PI / 3) * distance,
      y: targetPos.y + Math.sin(angle + Math.PI / 3) * distance
    });

    formation.positions.set(robots[1].id, {
      x: targetPos.x + Math.cos(angle - Math.PI / 3) * distance,
      y: targetPos.y + Math.sin(angle - Math.PI / 3) * distance
    });

    this.formations.push(formation);

    // Update pursuit states
    for (const robot of robots) {
      const state = this.pursuitStates.get(robot.id);
      if (state) {
        state.phase = 'surround';
        state.intensity = 0.8;
      }
    }
  }

  private setMultiRobotFormation(robots: RobotState[]): void {
    if (!this.target) return;

    const formation: PursuitFormation = {
      leaderId: robots[0].id,
      members: robots.map(r => r.id),
      strategy: 'box',
      positions: new Map()
    };

    const targetPos = this.target.position;
    const robotCount = robots.length;
    const radius = 120;

    // Distribute robots in a circle around target
    for (let i = 0; i < robotCount; i++) {
      const angle = (2 * Math.PI * i) / robotCount;
      const position = {
        x: targetPos.x + Math.cos(angle) * radius,
        y: targetPos.y + Math.sin(angle) * radius
      };

      formation.positions.set(robots[i].id, position);

      // Update pursuit state
      const state = this.pursuitStates.get(robots[i].id);
      if (state) {
        state.phase = 'surround';
        state.intensity = 0.7 + (i === 0 ? 0.3 : 0); // Leader is more aggressive
      }
    }

    this.formations.push(formation);
  }

  private generatePursuitCommand(robot: RobotState, deltaTime: number): NavigationCommand {
    const state = this.pursuitStates.get(robot.id);
    if (!state || !this.target) {
      return this.generateSearchCommand(robot);
    }

    switch (state.phase) {
      case 'search':
        return this.generateSearchCommand(robot);
      case 'approach':
        return this.generateApproachCommand(robot, state);
      case 'intercept':
        return this.generateInterceptCommand(robot, state);
      case 'surround':
        return this.generateSurroundCommand(robot, state);
      case 'capture':
        return this.generateCaptureCommand(robot, state);
      default:
        return this.generateDirectCommand(robot);
    }
  }

  private generateSearchCommand(robot: RobotState): NavigationCommand {
    const state = this.pursuitStates.get(robot.id);
    if (!state) return this.generateDirectCommand(robot);

    // Use search pattern to systematically cover area
    if (state.searchPattern.length === 0) {
      state.searchPattern = this.generateSearchPattern(robot);
    }

    const targetPosition = state.searchPattern[state.currentSearchIndex];
    const distance = this.getDistance(robot.position, targetPosition);

    if (distance < 30) {
      // Move to next search point
      state.currentSearchIndex = (state.currentSearchIndex + 1) % state.searchPattern.length;
    }

    return {
      velocity: this.calculateVelocityToTarget(robot, targetPosition, 0.6),
      targetPosition,
      confidence: 0.4,
      alternativeRoutes: state.searchPattern.slice(state.currentSearchIndex + 1, state.currentSearchIndex + 4),
      pursuitStrategy: 'direct'
    };
  }

  private generateApproachCommand(robot: RobotState, state: PursuitState): NavigationCommand {
    if (!this.target) return this.generateDirectCommand(robot);

    const targetPosition = this.target.predictedPosition;
    const distance = this.getDistance(robot.position, targetPosition);

    // Switch to intercept when close enough
    if (distance < 150) {
      state.phase = 'intercept';
    }

    return {
      velocity: this.calculateVelocityToTarget(robot, targetPosition, state.intensity),
      targetPosition,
      confidence: 0.7,
      alternativeRoutes: this.calculateAlternativePaths(robot.position, targetPosition),
      pursuitStrategy: 'direct'
    };
  }

  private generateInterceptCommand(robot: RobotState, state: PursuitState): NavigationCommand {
    if (!this.target) return this.generateDirectCommand(robot);

    // Calculate interception point
    const interceptPoint = this.calculateInterceptionPoint(robot, this.target);
    
    return {
      velocity: this.calculateVelocityToTarget(robot, interceptPoint, state.intensity),
      targetPosition: interceptPoint,
      confidence: 0.8,
      alternativeRoutes: [this.target.position, this.target.predictedPosition],
      pursuitStrategy: 'intercept'
    };
  }

  private generateSurroundCommand(robot: RobotState, state: PursuitState): NavigationCommand {
    if (!this.target) return this.generateDirectCommand(robot);

    // Find assigned formation position
    const formation = this.formations.find(f => f.members.includes(robot.id));
    const assignedPosition = formation?.positions.get(robot.id) || this.target.position;

    return {
      velocity: this.calculateVelocityToTarget(robot, assignedPosition, state.intensity),
      targetPosition: assignedPosition,
      confidence: 0.9,
      alternativeRoutes: [this.target.position],
      pursuitStrategy: 'surround'
    };
  }

  private generateCaptureCommand(robot: RobotState, state: PursuitState): NavigationCommand {
    if (!this.target) return this.generateDirectCommand(robot);

    // Go straight for the target
    return {
      velocity: this.calculateVelocityToTarget(robot, this.target.position, 1.0),
      targetPosition: this.target.position,
      confidence: 1.0,
      alternativeRoutes: [],
      pursuitStrategy: 'direct'
    };
  }

  private generateDirectCommand(robot: RobotState): NavigationCommand {
    const targetPosition = this.target?.position || { x: this.screenBounds.width / 2, y: this.screenBounds.height / 2 };
    
    return {
      velocity: this.calculateVelocityToTarget(robot, targetPosition, 0.8),
      targetPosition,
      confidence: 0.6,
      alternativeRoutes: [],
      pursuitStrategy: 'direct'
    };
  }

  private calculateInterceptionPoint(robot: RobotState, target: PursuitTarget): Vector2D {
    // Calculate where to go to intercept the target
    const relativePos = {
      x: target.position.x - robot.position.x,
      y: target.position.y - robot.position.y
    };

    const relativeVel = {
      x: target.velocity.x - robot.velocity.x,
      y: target.velocity.y - robot.velocity.y
    };

    // Time to interception (simplified)
    const a = relativeVel.x * relativeVel.x + relativeVel.y * relativeVel.y - robot.maxSpeed * robot.maxSpeed;
    const b = 2 * (relativePos.x * relativeVel.x + relativePos.y * relativeVel.y);
    const c = relativePos.x * relativePos.x + relativePos.y * relativePos.y;

    const discriminant = b * b - 4 * a * c;
    
    if (discriminant < 0 || a === 0) {
      // No valid interception, head to predicted position
      return target.predictedPosition;
    }

    const t = (-b - Math.sqrt(discriminant)) / (2 * a);
    
    if (t < 0) {
      return target.predictedPosition;
    }

    return {
      x: target.position.x + target.velocity.x * t,
      y: target.position.y + target.velocity.y * t
    };
  }

  private calculateVelocityToTarget(robot: RobotState, target: Vector2D, intensity: number): Vector2D {
    const direction = {
      x: target.x - robot.position.x,
      y: target.y - robot.position.y
    };

    const distance = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    
    if (distance === 0) {
      return { x: 0, y: 0 };
    }

    const normalizedDirection = {
      x: direction.x / distance,
      y: direction.y / distance
    };

    const speed = robot.maxSpeed * intensity;

    return {
      x: normalizedDirection.x * speed,
      y: normalizedDirection.y * speed
    };
  }

  private generateSearchPattern(robot: RobotState): Vector2D[] {
    const pattern: Vector2D[] = [];
    const centerX = this.screenBounds.width / 2;
    const centerY = this.screenBounds.height / 2;
    const radius = Math.min(this.screenBounds.width, this.screenBounds.height) / 3;

    // Spiral search pattern
    for (let i = 0; i < 8; i++) {
      const angle = (2 * Math.PI * i) / 8;
      pattern.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    }

    return pattern;
  }

  private calculateAlternativePaths(start: Vector2D, target: Vector2D): Vector2D[] {
    const alternatives: Vector2D[] = [];
    const angle = Math.atan2(target.y - start.y, target.x - start.x);
    const distance = this.getDistance(start, target);

    for (let i = 0; i < 2; i++) {
      const offsetAngle = angle + (Math.PI / 4) * (i === 0 ? 1 : -1);
      alternatives.push({
        x: start.x + Math.cos(offsetAngle) * (distance * 0.7),
        y: start.y + Math.sin(offsetAngle) * (distance * 0.7)
      });
    }

    return alternatives;
  }

  private getDistance(pos1: Vector2D, pos2: Vector2D): number {
    return Math.sqrt(
      Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2)
    );
  }

  /**
   * Update screen dimensions when window resizes
   */
  public updateScreenSize(width: number, height: number): void {
    this.screenBounds = { width, height };
  }

  /**
   * Force all robots into aggressive pursuit mode
   */
  public triggerAggressivePursuit(): void {
    for (const [robotId, state] of this.pursuitStates) {
      state.phase = 'capture';
      state.intensity = 1.0;
    }
  }

  /**
   * Get current pursuit statistics for debugging
   */
  public getPursuitStats(): {
    robotCount: number;
    formationCount: number;
    averageIntensity: number;
    currentPhases: string[];
  } {
    const phases = Array.from(this.pursuitStates.values()).map(s => s.phase);
    const avgIntensity = Array.from(this.pursuitStates.values())
      .reduce((sum, s) => sum + s.intensity, 0) / this.pursuitStates.size;

    return {
      robotCount: this.robots.size,
      formationCount: this.formations.length,
      averageIntensity: avgIntensity,
      currentPhases: phases
    };
  }
}