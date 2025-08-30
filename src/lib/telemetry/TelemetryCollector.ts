interface RobotLike {
  id?: string | number;
  role?: string;
  type?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  position?: { x: number; y: number };
  velocity?: { x: number; y: number };
  health?: number;
  energy?: number;
  isAvoiding?: boolean;
  isAttacking?: boolean;
  isCollecting?: boolean;
  patrolling?: boolean;
  target?: { x: number; y: number };
  commandPosition?: { x: number; y: number };
}

interface GameStateLike {
  score?: number;
  wave?: number;
  resources?: number;
  baseHealth?: number;
  gameTime?: number;
  threats?: number;
}

export interface TelemetryData {
  timestamp: number;
  robotId: string;
  robotType: 'scout' | 'follower' | 'leader' | 'defender' | 'collector';
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  speed: number;
  health?: number;
  energy?: number;
  status: 'idle' | 'moving' | 'avoiding' | 'attacking' | 'collecting' | 'patrolling';
  target?: { x: number; y: number };
}

export interface SystemMetrics {
  timestamp: number;
  totalRobots: number;
  activeRobots: number;
  averageSpeed: number;
  averageHealth: number;
  averageEnergy: number;
  collisionCount: number;
  pathfindingEvents: number;
  frameRate: number;
}

export interface TelemetrySnapshot {
  robots: TelemetryData[];
  system: SystemMetrics;
  gameState?: {
    score: number;
    wave: number;
    resources: number;
    baseHealth: number;
    gameTime: number;
    threats: number;
  };
}

export class TelemetryCollector {
  private data: TelemetrySnapshot[] = [];
  private maxHistoryLength = 1000; // Keep last 1000 snapshots
  private lastSnapshot: number = 0;
  private snapshotInterval = 100; // Collect every 100ms
  private frameTimestamps: number[] = [];
  private collisionCount = 0;
  private pathfindingEvents = 0;

  collectRobotData(robot: RobotLike): TelemetryData {
    const speed = Math.sqrt(robot.vx * robot.vx + robot.vy * robot.vy) || 
                  Math.sqrt(robot.velocity?.x * robot.velocity?.x + robot.velocity?.y * robot.velocity?.y) || 0;
    
    // Determine status based on robot properties
    let status: TelemetryData['status'] = 'idle';
    if (speed > 0.1) status = 'moving';
    if (robot.isAvoiding) status = 'avoiding';
    if (robot.isAttacking) status = 'attacking';
    if (robot.isCollecting) status = 'collecting';
    if (robot.role === 'defender' && robot.patrolling) status = 'patrolling';

    return {
      timestamp: Date.now(),
      robotId: robot.id?.toString() || `robot-${Math.random()}`,
      robotType: (robot.role || robot.type || 'follower') as 'scout' | 'follower' | 'leader' | 'defender' | 'collector',
      position: { 
        x: robot.x || robot.position?.x || 0, 
        y: robot.y || robot.position?.y || 0 
      },
      velocity: { 
        x: robot.vx || robot.velocity?.x || 0, 
        y: robot.vy || robot.velocity?.y || 0 
      },
      speed,
      health: robot.health,
      energy: robot.energy,
      status,
      target: robot.target || robot.commandPosition
    };
  }

  recordCollision(): void {
    this.collisionCount++;
  }

  recordPathfindingEvent(): void {
    this.pathfindingEvents++;
  }

  updateFrameRate(): void {
    const now = Date.now();
    this.frameTimestamps.push(now);
    
    // Keep only last second of frame timestamps
    this.frameTimestamps = this.frameTimestamps.filter(t => now - t <= 1000);
  }

  private calculateFrameRate(): number {
    return this.frameTimestamps.length;
  }

  collectSnapshot(robots: RobotLike[], gameState?: GameStateLike): void {
    const now = Date.now();
    if (now - this.lastSnapshot < this.snapshotInterval) return;

    const robotData = robots.map(robot => this.collectRobotData(robot));
    const activeRobots = robotData.filter(r => r.status !== 'idle').length;
    const averageSpeed = robotData.reduce((sum, r) => sum + r.speed, 0) / robotData.length || 0;
    const averageHealth = robotData.reduce((sum, r) => sum + (r.health || 100), 0) / robotData.length || 100;
    const averageEnergy = robotData.reduce((sum, r) => sum + (r.energy || 100), 0) / robotData.length || 100;

    const systemMetrics: SystemMetrics = {
      timestamp: now,
      totalRobots: robotData.length,
      activeRobots,
      averageSpeed,
      averageHealth,
      averageEnergy,
      collisionCount: this.collisionCount,
      pathfindingEvents: this.pathfindingEvents,
      frameRate: this.calculateFrameRate()
    };

    const snapshot: TelemetrySnapshot = {
      robots: robotData,
      system: systemMetrics,
      gameState: gameState ? {
        score: gameState.score || 0,
        wave: gameState.wave || 1,
        resources: gameState.resources || 0,
        baseHealth: gameState.baseHealth || 100,
        gameTime: gameState.gameTime || 0,
        threats: gameState.threats || 0
      } : undefined
    };

    this.data.push(snapshot);
    
    // Limit history
    if (this.data.length > this.maxHistoryLength) {
      this.data.shift();
    }

    this.lastSnapshot = now;
    
    // Reset counters
    this.collisionCount = 0;
    this.pathfindingEvents = 0;
  }

  getLatestSnapshot(): TelemetrySnapshot | null {
    return this.data[this.data.length - 1] || null;
  }

  getHistory(seconds: number = 30): TelemetrySnapshot[] {
    const cutoff = Date.now() - (seconds * 1000);
    return this.data.filter(snapshot => snapshot.system.timestamp > cutoff);
  }

  getAverageMetrics(seconds: number = 30): SystemMetrics | null {
    const history = this.getHistory(seconds);
    if (history.length === 0) return null;

    const totals = history.reduce((acc, snapshot) => ({
      totalRobots: acc.totalRobots + snapshot.system.totalRobots,
      activeRobots: acc.activeRobots + snapshot.system.activeRobots,
      averageSpeed: acc.averageSpeed + snapshot.system.averageSpeed,
      averageHealth: acc.averageHealth + snapshot.system.averageHealth,
      averageEnergy: acc.averageEnergy + snapshot.system.averageEnergy,
      collisionCount: acc.collisionCount + snapshot.system.collisionCount,
      pathfindingEvents: acc.pathfindingEvents + snapshot.system.pathfindingEvents,
      frameRate: acc.frameRate + snapshot.system.frameRate
    }), {
      totalRobots: 0,
      activeRobots: 0,
      averageSpeed: 0,
      averageHealth: 0,
      averageEnergy: 0,
      collisionCount: 0,
      pathfindingEvents: 0,
      frameRate: 0
    });

    const count = history.length;
    return {
      timestamp: Date.now(),
      totalRobots: Math.round(totals.totalRobots / count),
      activeRobots: Math.round(totals.activeRobots / count),
      averageSpeed: totals.averageSpeed / count,
      averageHealth: totals.averageHealth / count,
      averageEnergy: totals.averageEnergy / count,
      collisionCount: totals.collisionCount,
      pathfindingEvents: totals.pathfindingEvents,
      frameRate: totals.frameRate / count
    };
  }

  clear(): void {
    this.data = [];
    this.frameTimestamps = [];
    this.collisionCount = 0;
    this.pathfindingEvents = 0;
  }

  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }
}