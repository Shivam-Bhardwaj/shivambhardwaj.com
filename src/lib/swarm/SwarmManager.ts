import { Robot } from './Robot';
import { MissionManager } from './missions/MissionManager';
import { 
  RobotType, 
  SwarmState, 
  Resource, 
  Obstacle, 
  Pheromone,
  GameConfig,
  Vector2D 
} from './types';

export class SwarmManager {
  private robots: Map<string, Robot> = new Map();
  private resources: Map<string, Resource> = new Map();
  private obstacles: Obstacle[] = [];
  private pheromones: Map<string, Pheromone> = new Map();
  private missionManager: MissionManager;
  private config: GameConfig;
  private globalScore: number = 0;
  private sessionScore: number = 0;
  private timeElapsed: number = 0;
  private lastResourceSpawn: number = 0;
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;
  private contentElements: DOMRect[] = [];

  constructor(config: GameConfig) {
    this.config = config;
    this.missionManager = new MissionManager();
  }

  initialize(canvasWidth: number, canvasHeight: number): void {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    
    // Clear existing state
    this.robots.clear();
    this.resources.clear();
    this.obstacles = [];
    this.pheromones.clear();
    
    // Create initial robot swarm with mixed types
    const robotTypes = [
      RobotType.SCOUT,
      RobotType.WORKER,
      RobotType.COMMUNICATOR,
      RobotType.ENERGY
    ];
    
    for (let i = 0; i < this.config.robotCount; i++) {
      const type = robotTypes[i % robotTypes.length];
      const position: Vector2D = {
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight
      };
      
      const robot = new Robot(type, position);
      this.robots.set(robot.id, robot);
    }
    
    // Create initial resources
    this.spawnResources(10);
    
    // Create some initial obstacles
    this.generateObstacles();
    
    // Start first mission
    this.missionManager.startNewMission();
    
    // Load saved state if exists
    this.loadState();
  }

  update(deltaTime: number): void {
    this.timeElapsed += deltaTime;
    
    // Update all robots
    const robotArray = Array.from(this.robots.values());
    for (const robot of robotArray) {
      robot.update(
        deltaTime,
        robotArray,
        Array.from(this.resources.values()),
        this.obstacles,
        this.pheromones,
        this.canvasWidth,
        this.canvasHeight
      );
      
      // Handle robot interactions with resources
      this.handleResourceCollection(robot);
      
      // Handle robot communication
      robot.communication.transmit(robotArray);
      
      // Deposit pheromones
      if (Math.random() < 0.01) { // 1% chance per update
        const pheromoneType = robot.currentCargo > 0 ? 'food' : 'explored';
        const pheromone = robot.depositPheromone(pheromoneType);
        this.pheromones.set(`${pheromone.position.x}-${pheromone.position.y}`, pheromone);
      }
      
      // Remove dead robots
      if (robot.battery <= 0) {
        this.robots.delete(robot.id);
        this.sessionScore -= 10; // Penalty for losing a robot
      }
    }
    
    // Update pheromones (evaporation)
    this.updatePheromones(deltaTime);
    
    // Update mission
    this.missionManager.update(deltaTime, this.getState());
    
    // Spawn new resources periodically
    if (Date.now() - this.lastResourceSpawn > 5000) { // Every 5 seconds
      this.spawnResources(2);
      this.lastResourceSpawn = Date.now();
    }
    
    // Update obstacles based on content
    this.updateContentObstacles();
    
    // Calculate scores
    this.updateScores();
    
    // Save state periodically
    if (Math.floor(this.timeElapsed) % 10 === 0) { // Every 10 seconds
      this.saveState();
    }
  }

  private handleResourceCollection(robot: Robot): void {
    const robotResources = Array.from(this.resources.values()).filter(
      r => this.getDistance(robot.position, r.position) < 15
    );
    
    for (const resource of robotResources) {
      if (robot.collectResource(resource)) {
        this.resources.delete(resource.id);
        this.sessionScore += resource.value * 10;
        
        // Broadcast discovery
        robot.communication.broadcast('discovery', {
          resourceFound: true,
          resourceType: resource.type,
          position: resource.position
        });
        
        // Deposit pheromone trail
        const pheromone = robot.depositPheromone('food');
        this.pheromones.set(`${pheromone.position.x}-${pheromone.position.y}`, pheromone);
      }
    }
  }

  private updatePheromones(deltaTime: number): void {
    const evaporationRate = this.config.pheromoneEvaporationRate * deltaTime;
    
    for (const [key, pheromone] of this.pheromones) {
      pheromone.age += deltaTime;
      pheromone.strength *= (1 - evaporationRate);
      
      // Remove weak pheromones
      if (pheromone.strength < 0.01 || pheromone.age > 30) {
        this.pheromones.delete(key);
      }
    }
  }

  private spawnResources(count: number): void {
    for (let i = 0; i < count; i++) {
      const resource: Resource = {
        id: `resource-${Date.now()}-${i}`,
        position: {
          x: Math.random() * this.canvasWidth,
          y: Math.random() * this.canvasHeight
        },
        type: Math.random() < 0.3 ? 'energy' : 
              Math.random() < 0.5 ? 'material' : 
              Math.random() < 0.7 ? 'data' : 'survivor',
        value: Math.floor(Math.random() * 10) + 1,
        weight: Math.floor(Math.random() * 3) + 1,
        discovered: false
      };
      
      // Avoid spawning in obstacles
      let validPosition = false;
      let attempts = 0;
      while (!validPosition && attempts < 10) {
        validPosition = true;
        for (const obstacle of this.obstacles) {
          if (this.pointIntersectsObstacle(resource.position, obstacle)) {
            resource.position.x = Math.random() * this.canvasWidth;
            resource.position.y = Math.random() * this.canvasHeight;
            validPosition = false;
            break;
          }
        }
        attempts++;
      }
      
      this.resources.set(resource.id, resource);
    }
  }

  private generateObstacles(): void {
    // Create some random obstacles
    const obstacleCount = 5;
    for (let i = 0; i < obstacleCount; i++) {
      this.obstacles.push({
        position: {
          x: Math.random() * this.canvasWidth,
          y: Math.random() * this.canvasHeight
        },
        width: Math.random() * 100 + 50,
        height: Math.random() * 100 + 50,
        type: 'static'
      });
    }
  }

  updateContentObstacles(): void {
    // Get all content elements on the page
    const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, img, button, a, div[class*="card"]');
    const newObstacles: Obstacle[] = [...this.obstacles.filter(o => o.type === 'static')];
    
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width > 10 && rect.height > 10) { // Ignore very small elements
        newObstacles.push({
          position: {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          },
          width: rect.width + 20, // Add padding
          height: rect.height + 20,
          type: 'dynamic'
        });
      }
    });
    
    this.obstacles = newObstacles;
  }

  private pointIntersectsObstacle(point: Vector2D, obstacle: Obstacle): boolean {
    return point.x >= obstacle.position.x - obstacle.width / 2 &&
           point.x <= obstacle.position.x + obstacle.width / 2 &&
           point.y >= obstacle.position.y - obstacle.height / 2 &&
           point.y <= obstacle.position.y + obstacle.height / 2;
  }

  private getDistance(p1: Vector2D, p2: Vector2D): number {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  }

  private updateScores(): void {
    // Calculate efficiency metrics
    const activeRobots = Array.from(this.robots.values()).filter(r => r.battery > 0);
    const avgBattery = activeRobots.reduce((sum, r) => sum + r.battery, 0) / activeRobots.length;
    const totalCargo = activeRobots.reduce((sum, r) => sum + r.currentCargo, 0);
    
    // Update session score based on performance
    this.sessionScore += totalCargo * 0.1;
    this.sessionScore += avgBattery * 0.01;
    
    // Update global score
    this.globalScore = Math.max(this.globalScore, this.sessionScore);
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Clear canvas
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Draw obstacles (very faint)
    ctx.fillStyle = 'rgba(100, 100, 100, 0.05)';
    for (const obstacle of this.obstacles) {
      if (obstacle.type === 'static') {
        ctx.fillRect(
          obstacle.position.x - obstacle.width / 2,
          obstacle.position.y - obstacle.height / 2,
          obstacle.width,
          obstacle.height
        );
      }
    }
    
    // Draw pheromones
    for (const pheromone of this.pheromones.values()) {
      const color = pheromone.type === 'food' ? 'rgba(34, 197, 94' :
                   pheromone.type === 'danger' ? 'rgba(239, 68, 68' :
                   pheromone.type === 'home' ? 'rgba(59, 130, 246' :
                   'rgba(156, 163, 175';
      
      ctx.fillStyle = `${color}, ${pheromone.strength * 0.3})`;
      ctx.beginPath();
      ctx.arc(pheromone.position.x, pheromone.position.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw resources
    for (const resource of this.resources.values()) {
      ctx.save();
      ctx.translate(resource.position.x, resource.position.y);
      
      const color = resource.type === 'energy' ? 'rgba(250, 204, 21, 0.8)' :
                   resource.type === 'material' ? 'rgba(156, 163, 175, 0.8)' :
                   resource.type === 'data' ? 'rgba(147, 51, 234, 0.8)' :
                   'rgba(239, 68, 68, 0.8)';
      
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      
      // Different shapes for different resources
      if (resource.type === 'energy') {
        // Star shape
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const x = Math.cos(angle) * 8;
          const y = Math.sin(angle) * 8;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          
          const innerAngle = angle + Math.PI / 5;
          const innerX = Math.cos(innerAngle) * 4;
          const innerY = Math.sin(innerAngle) * 4;
          ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
      } else if (resource.type === 'material') {
        // Square
        ctx.fillRect(-6, -6, 12, 12);
      } else if (resource.type === 'data') {
        // Diamond
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(8, 0);
        ctx.lineTo(0, 8);
        ctx.lineTo(-8, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        // Circle for survivor
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Plus sign for medical
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-3, 0);
        ctx.lineTo(3, 0);
        ctx.moveTo(0, -3);
        ctx.lineTo(0, 3);
        ctx.stroke();
      }
      
      ctx.restore();
    }
    
    // Draw communication links between robots
    const robotArray = Array.from(this.robots.values());
    ctx.strokeStyle = 'rgba(147, 51, 234, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < robotArray.length; i++) {
      for (let j = i + 1; j < robotArray.length; j++) {
        if (robotArray[i].canCommunicateWith(robotArray[j])) {
          ctx.beginPath();
          ctx.moveTo(robotArray[i].position.x, robotArray[i].position.y);
          ctx.lineTo(robotArray[j].position.x, robotArray[j].position.y);
          ctx.stroke();
        }
      }
    }
    
    // Draw robots
    for (const robot of this.robots.values()) {
      robot.draw(ctx);
    }
    
    // Draw mission status
    this.missionManager.render(ctx, this.canvasWidth);
    
    // Draw stats overlay
    this.drawStats(ctx);
  }

  private drawStats(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    // Background for stats
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 120);
    
    // Stats text
    ctx.fillStyle = 'white';
    ctx.font = '12px monospace';
    ctx.fillText(`Robots: ${this.robots.size}`, 20, 30);
    ctx.fillText(`Resources: ${this.resources.size}`, 20, 45);
    ctx.fillText(`Score: ${Math.floor(this.sessionScore)}`, 20, 60);
    ctx.fillText(`Global Best: ${Math.floor(this.globalScore)}`, 20, 75);
    ctx.fillText(`Mission: ${this.missionManager.getCurrentMission()?.name || 'None'}`, 20, 90);
    
    const avgBattery = Array.from(this.robots.values()).reduce((sum, r) => sum + r.battery, 0) / this.robots.size;
    ctx.fillText(`Avg Battery: ${Math.floor(avgBattery)}%`, 20, 105);
    ctx.fillText(`Time: ${Math.floor(this.timeElapsed)}s`, 20, 120);
    
    ctx.restore();
  }

  getState(): SwarmState {
    return {
      robots: this.robots,
      resources: this.resources,
      obstacles: this.obstacles,
      mission: this.missionManager.getCurrentMission(),
      pheromones: this.pheromones,
      globalScore: this.globalScore,
      sessionScore: this.sessionScore,
      timeElapsed: this.timeElapsed
    };
  }

  private saveState(): void {
    try {
      const state = {
        globalScore: this.globalScore,
        sessionScore: this.sessionScore,
        timeElapsed: this.timeElapsed,
        robotCount: this.robots.size,
        resourceCount: this.resources.size
      };
      localStorage.setItem('swarmState', JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }

  private loadState(): void {
    try {
      const saved = localStorage.getItem('swarmState');
      if (saved) {
        const state = JSON.parse(saved);
        this.globalScore = state.globalScore || 0;
      }
    } catch (e) {
      console.error('Failed to load state:', e);
    }
  }

  handleResize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.updateContentObstacles();
  }
}