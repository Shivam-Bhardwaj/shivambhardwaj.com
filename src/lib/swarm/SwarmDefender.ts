import { Vector2D } from './types';

// Game Types
export enum EntityType {
  SCOUT = 'scout',
  DEFENDER = 'defender', 
  COLLECTOR = 'collector',
  THREAT = 'threat',
  RESOURCE = 'resource',
  BASE = 'base'
}

export interface GameEntity {
  id: string;
  type: EntityType;
  position: Vector2D;
  velocity: Vector2D;
  health: number;
  maxHealth: number;
  speed: number;
  radius: number;
  team: 'player' | 'enemy' | 'neutral';
}

export interface GameState {
  score: number;
  highScore: number;
  wave: number;
  resources: number;
  baseHealth: number;
  gameTime: number;
  isGameOver: boolean;
  isPaused: boolean;
}

export class SwarmDefender {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private entities: Map<string, GameEntity> = new Map();
  private fogOfWar: boolean[][] = [];
  private exploredArea: boolean[][] = [];
  private gameState: GameState;
  private mousePosition: Vector2D = { x: 0, y: 0 };
  private selectedRobots: Set<string> = new Set();
  private commandPosition: Vector2D | null = null;
  private lastSpawnTime: number = 0;
  private lastThreatTime: number = 0;
  private gridSize: number = 20; // For fog of war
  
  // Game constants
  private readonly BASE_POSITION: Vector2D;
  private readonly BASE_SIZE = 40;
  private readonly VISION_RANGE = 150;
  private readonly ROBOT_SPEED = 2;
  private readonly THREAT_SPEED = 1;
  private readonly SPAWN_RATE = 5000; // Resources spawn every 5s
  private readonly THREAT_RATE = 8000; // Threats spawn every 8s
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    // Center base
    this.BASE_POSITION = {
      x: canvas.width / 2,
      y: canvas.height / 2
    };
    
    // Initialize game state
    this.gameState = {
      score: 0,
      highScore: this.loadHighScore(),
      wave: 1,
      resources: 0,
      baseHealth: 100,
      gameTime: 0,
      isGameOver: false,
      isPaused: false
    };
    
    this.initializeFogOfWar();
    this.spawnInitialUnits();
    this.setupEventListeners();
  }
  
  private initializeFogOfWar(): void {
    const cols = Math.ceil(this.canvas.width / this.gridSize);
    const rows = Math.ceil(this.canvas.height / this.gridSize);
    
    this.fogOfWar = [];
    this.exploredArea = [];
    
    for (let i = 0; i < rows; i++) {
      this.fogOfWar[i] = [];
      this.exploredArea[i] = [];
      for (let j = 0; j < cols; j++) {
        this.fogOfWar[i][j] = true; // All fogged initially
        this.exploredArea[i][j] = false;
      }
    }
    
    // Reveal area around base
    this.revealArea(this.BASE_POSITION, this.VISION_RANGE * 2);
  }
  
  private spawnInitialUnits(): void {
    // Create base
    const base: GameEntity = {
      id: 'base',
      type: EntityType.BASE,
      position: { ...this.BASE_POSITION },
      velocity: { x: 0, y: 0 },
      health: 100,
      maxHealth: 100,
      speed: 0,
      radius: this.BASE_SIZE,
      team: 'player'
    };
    this.entities.set(base.id, base);
    
    // Spawn initial robots
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2;
      const distance = 80 + Math.random() * 40;
      
      const robot: GameEntity = {
        id: `robot-${i}`,
        type: i < 5 ? EntityType.SCOUT : 
              i < 10 ? EntityType.DEFENDER : 
              EntityType.COLLECTOR,
        position: {
          x: this.BASE_POSITION.x + Math.cos(angle) * distance,
          y: this.BASE_POSITION.y + Math.sin(angle) * distance
        },
        velocity: { x: 0, y: 0 },
        health: this.getMaxHealth(i < 5 ? EntityType.SCOUT : i < 10 ? EntityType.DEFENDER : EntityType.COLLECTOR),
        maxHealth: this.getMaxHealth(i < 5 ? EntityType.SCOUT : i < 10 ? EntityType.DEFENDER : EntityType.COLLECTOR),
        speed: this.getSpeed(i < 5 ? EntityType.SCOUT : i < 10 ? EntityType.DEFENDER : EntityType.COLLECTOR),
        radius: 8,
        team: 'player'
      };
      this.entities.set(robot.id, robot);
    }
  }
  
  private getMaxHealth(type: EntityType): number {
    switch (type) {
      case EntityType.SCOUT: return 50;
      case EntityType.DEFENDER: return 150;
      case EntityType.COLLECTOR: return 75;
      case EntityType.THREAT: return 100;
      default: return 100;
    }
  }
  
  private getSpeed(type: EntityType): number {
    switch (type) {
      case EntityType.SCOUT: return 3;
      case EntityType.DEFENDER: return 1.5;
      case EntityType.COLLECTOR: return 2;
      case EntityType.THREAT: return 1;
      default: return 2;
    }
  }
  
  private setupEventListeners(): void {
    // Mouse movement
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    });
    
    // Left click - select/command
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      // Check if clicking on a robot (increased hit area)
      let clickedRobot = false;
      for (const entity of this.entities.values()) {
        if (entity.team === 'player' && entity.type !== EntityType.BASE) {
          const dist = this.getDistance(clickPos, entity.position);
          if (dist < entity.radius * 2.5) { // Much larger hit area
            // Toggle selection with shift, otherwise clear and select
            if (!e.shiftKey) {
              this.selectedRobots.clear();
            }
            
            if (this.selectedRobots.has(entity.id)) {
              this.selectedRobots.delete(entity.id);
            } else {
              this.selectedRobots.add(entity.id);
            }
            
            clickedRobot = true;
            console.log(`Selected ${this.selectedRobots.size} robots`);
            break;
          }
        }
      }
      
      // If not clicking a robot, set command position
      if (!clickedRobot) {
        if (this.selectedRobots.size > 0) {
          this.commandPosition = { ...clickPos };
          
          // Move selected robots to command position with better pathfinding
          for (const id of this.selectedRobots) {
            const robot = this.entities.get(id);
            if (robot && robot.team === 'player') {
              // Set strong velocity toward command position
              const dx = clickPos.x - robot.position.x;
              const dy = clickPos.y - robot.position.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > 5) { // Only move if far enough
                robot.velocity.x = (dx / dist) * robot.speed * 2; // Double speed for commands
                robot.velocity.y = (dy / dist) * robot.speed * 2;
              }
            }
          }
          console.log(`Commanding ${this.selectedRobots.size} robots to (${Math.round(clickPos.x)}, ${Math.round(clickPos.y)})`);
        } else {
          // No robots selected - select all nearby robots
          for (const entity of this.entities.values()) {
            if (entity.team === 'player' && entity.type !== EntityType.BASE) {
              const dist = this.getDistance(clickPos, entity.position);
              if (dist < 100) { // Select all robots within 100px
                this.selectedRobots.add(entity.id);
              }
            }
          }
          if (this.selectedRobots.size > 0) {
            console.log(`Area selected ${this.selectedRobots.size} robots`);
          }
        }
      }
    });
    
    // Right click - rally all
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const clickPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      // Rally all robots to position
      for (const entity of this.entities.values()) {
        if (entity.team === 'player' && entity.type !== EntityType.BASE) {
          const dx = clickPos.x - entity.position.x;
          const dy = clickPos.y - entity.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0) {
            entity.velocity.x = (dx / dist) * entity.speed;
            entity.velocity.y = (dy / dist) * entity.speed;
          }
        }
      }
      
      this.commandPosition = { ...clickPos };
    });
    
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        this.gameState.isPaused = !this.gameState.isPaused;
      }
      if (e.key === 'r' && this.gameState.isGameOver) {
        this.restart();
      }
    });
  }
  
  public update(deltaTime: number): void {
    if (this.gameState.isPaused || this.gameState.isGameOver) return;
    
    this.gameState.gameTime += deltaTime;
    
    // Update fog of war
    this.updateFogOfWar();
    
    // Spawn resources
    if (Date.now() - this.lastSpawnTime > this.SPAWN_RATE) {
      this.spawnResource();
      this.lastSpawnTime = Date.now();
    }
    
    // Spawn threats
    const threatInterval = Math.max(2000, this.THREAT_RATE - this.gameState.wave * 500);
    if (Date.now() - this.lastThreatTime > threatInterval) {
      this.spawnThreat();
      this.lastThreatTime = Date.now();
    }
    
    // Update all entities
    for (const entity of this.entities.values()) {
      this.updateEntity(entity, deltaTime);
    }
    
    // Check collisions
    this.checkCollisions();
    
    // Remove dead entities
    for (const [id, entity] of this.entities) {
      if (entity.health <= 0 && entity.type !== EntityType.BASE) {
        this.entities.delete(id);
        
        // Score for killing threats
        if (entity.type === EntityType.THREAT) {
          this.gameState.score += 50;
        }
      }
    }
    
    // Check game over
    const base = this.entities.get('base');
    if (base && base.health <= 0) {
      this.gameOver();
    }
    
    // Update score
    this.gameState.score += deltaTime * 0.01; // Survival bonus
    
    // Increase difficulty
    if (this.gameState.gameTime > this.gameState.wave * 30) {
      this.gameState.wave++;
    }
  }
  
  private updateEntity(entity: GameEntity, deltaTime: number): void {
    // Update position
    entity.position.x += entity.velocity.x;
    entity.position.y += entity.velocity.y;
    
    // Keep in bounds
    entity.position.x = Math.max(entity.radius, Math.min(this.canvas.width - entity.radius, entity.position.x));
    entity.position.y = Math.max(entity.radius, Math.min(this.canvas.height - entity.radius, entity.position.y));
    
    // Entity-specific behaviors
    if (entity.type === EntityType.THREAT) {
      // Move toward base
      const base = this.entities.get('base');
      if (base) {
        const dx = base.position.x - entity.position.x;
        const dy = base.position.y - entity.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          entity.velocity.x = (dx / dist) * entity.speed;
          entity.velocity.y = (dy / dist) * entity.speed;
        }
      }
    } else if (entity.team === 'player' && entity.type !== EntityType.BASE) {
      // Robot behaviors
      
      // Attack nearby threats
      let nearestThreat: GameEntity | null = null;
      let minDist = Infinity;
      
      for (const other of this.entities.values()) {
        if (other.type === EntityType.THREAT) {
          const dist = this.getDistance(entity.position, other.position);
          if (dist < 150 && dist < minDist) {
            minDist = dist;
            nearestThreat = other;
          }
        }
      }
      
      if (nearestThreat && entity.type === EntityType.DEFENDER) {
        // Move toward and attack threat
        const dx = nearestThreat.position.x - entity.position.x;
        const dy = nearestThreat.position.y - entity.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          entity.velocity.x = (dx / dist) * entity.speed * 1.5;
          entity.velocity.y = (dy / dist) * entity.speed * 1.5;
        }
      }
      
      // Collectors seek resources
      if (entity.type === EntityType.COLLECTOR) {
        let nearestResource: GameEntity | null = null;
        let minResourceDist = Infinity;
        
        for (const other of this.entities.values()) {
          if (other.type === EntityType.RESOURCE) {
            const dist = this.getDistance(entity.position, other.position);
            if (dist < 200 && dist < minResourceDist) {
              minResourceDist = dist;
              nearestResource = other;
            }
          }
        }
        
        if (nearestResource && !nearestThreat) {
          const dx = nearestResource.position.x - entity.position.x;
          const dy = nearestResource.position.y - entity.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0) {
            entity.velocity.x = (dx / dist) * entity.speed;
            entity.velocity.y = (dy / dist) * entity.speed;
          }
        }
      }
      
      // Check if robot has a command to follow
      const hasCommand = this.selectedRobots.has(entity.id) && this.commandPosition;
      
      // Only apply default behaviors if no command
      if (!hasCommand) {
        // Default patrol behavior if no threats or resources nearby
        if (!nearestThreat && entity.type === EntityType.SCOUT) {
          // Scouts explore - random movement
          if (Math.random() < 0.02) {
            const angle = Math.random() * Math.PI * 2;
            entity.velocity.x = Math.cos(angle) * entity.speed;
            entity.velocity.y = Math.sin(angle) * entity.speed;
          }
        } else if (!nearestThreat && entity.type === EntityType.DEFENDER) {
          // Defenders patrol around base
          const base = this.entities.get('base');
          if (base) {
            const dx = base.position.x - entity.position.x;
            const dy = base.position.y - entity.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Stay within 100-150 pixels of base
            if (dist > 150) {
              entity.velocity.x = (dx / dist) * entity.speed;
              entity.velocity.y = (dy / dist) * entity.speed;
            } else if (dist < 100) {
              entity.velocity.x = -(dx / dist) * entity.speed * 0.5;
              entity.velocity.y = -(dy / dist) * entity.speed * 0.5;
            } else {
              // Orbit around base
              const angle = Math.atan2(dy, dx) + Math.PI / 2;
              entity.velocity.x = Math.cos(angle) * entity.speed * 0.7;
              entity.velocity.y = Math.sin(angle) * entity.speed * 0.7;
            }
          }
        }
        
        // Apply friction to slow down gradually
        entity.velocity.x *= 0.98;
        entity.velocity.y *= 0.98;
      }
    }
  }
  
  private updateFogOfWar(): void {
    // Reset fog
    for (let i = 0; i < this.fogOfWar.length; i++) {
      for (let j = 0; j < this.fogOfWar[i].length; j++) {
        this.fogOfWar[i][j] = true;
      }
    }
    
    // Reveal areas around player units
    for (const entity of this.entities.values()) {
      if (entity.team === 'player') {
        const range = entity.type === EntityType.SCOUT ? this.VISION_RANGE * 1.5 : this.VISION_RANGE;
        this.revealArea(entity.position, range);
      }
    }
  }
  
  private revealArea(position: Vector2D, range: number): void {
    const startX = Math.floor((position.x - range) / this.gridSize);
    const endX = Math.ceil((position.x + range) / this.gridSize);
    const startY = Math.floor((position.y - range) / this.gridSize);
    const endY = Math.ceil((position.y + range) / this.gridSize);
    
    for (let i = Math.max(0, startY); i < Math.min(this.fogOfWar.length, endY); i++) {
      for (let j = Math.max(0, startX); j < Math.min(this.fogOfWar[i].length, endX); j++) {
        const cellX = j * this.gridSize + this.gridSize / 2;
        const cellY = i * this.gridSize + this.gridSize / 2;
        const dist = this.getDistance(position, { x: cellX, y: cellY });
        
        if (dist < range) {
          this.fogOfWar[i][j] = false;
          this.exploredArea[i][j] = true;
          
          // Score for exploration
          if (!this.exploredArea[i][j]) {
            this.gameState.score += 5;
          }
        }
      }
    }
  }
  
  private spawnResource(): void {
    const angle = Math.random() * Math.PI * 2;
    const distance = 200 + Math.random() * 300;
    
    const resource: GameEntity = {
      id: `resource-${Date.now()}`,
      type: EntityType.RESOURCE,
      position: {
        x: this.BASE_POSITION.x + Math.cos(angle) * distance,
        y: this.BASE_POSITION.y + Math.sin(angle) * distance
      },
      velocity: { x: 0, y: 0 },
      health: 1,
      maxHealth: 1,
      speed: 0,
      radius: 8,
      team: 'neutral'
    };
    
    // Only spawn if position is valid
    if (resource.position.x > 0 && resource.position.x < this.canvas.width &&
        resource.position.y > 0 && resource.position.y < this.canvas.height) {
      this.entities.set(resource.id, resource);
    }
  }
  
  private spawnThreat(): void {
    // Spawn from edges
    const edge = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    
    switch (edge) {
      case 0: // Top
        x = Math.random() * this.canvas.width;
        y = 0;
        break;
      case 1: // Right
        x = this.canvas.width;
        y = Math.random() * this.canvas.height;
        break;
      case 2: // Bottom
        x = Math.random() * this.canvas.width;
        y = this.canvas.height;
        break;
      case 3: // Left
        x = 0;
        y = Math.random() * this.canvas.height;
        break;
    }
    
    const threat: GameEntity = {
      id: `threat-${Date.now()}`,
      type: EntityType.THREAT,
      position: { x, y },
      velocity: { x: 0, y: 0 },
      health: 100 + this.gameState.wave * 20,
      maxHealth: 100 + this.gameState.wave * 20,
      speed: 0.5 + this.gameState.wave * 0.1,
      radius: 10,
      team: 'enemy'
    };
    
    this.entities.set(threat.id, threat);
  }
  
  private checkCollisions(): void {
    const entities = Array.from(this.entities.values());
    
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const a = entities[i];
        const b = entities[j];
        const dist = this.getDistance(a.position, b.position);
        
        if (dist < a.radius + b.radius) {
          // Handle collision
          
          // Robot vs Threat combat
          if ((a.team === 'player' && b.type === EntityType.THREAT) ||
              (b.team === 'player' && a.type === EntityType.THREAT)) {
            const robot = a.team === 'player' ? a : b;
            const threat = a.type === EntityType.THREAT ? a : b;
            
            // Damage based on robot type
            const damage = robot.type === EntityType.DEFENDER ? 5 :
                          robot.type === EntityType.SCOUT ? 2 : 1;
            
            threat.health -= damage;
            robot.health -= 1;
          }
          
          // Threat vs Base
          if ((a.type === EntityType.BASE && b.type === EntityType.THREAT) ||
              (b.type === EntityType.BASE && a.type === EntityType.THREAT)) {
            const base = a.type === EntityType.BASE ? a : b;
            const threat = a.type === EntityType.THREAT ? a : b;
            
            base.health -= 2;
            threat.health = 0; // Threat dies on base contact
            this.gameState.baseHealth = base.health;
          }
          
          // Robot vs Resource
          if ((a.team === 'player' && b.type === EntityType.RESOURCE) ||
              (b.team === 'player' && a.type === EntityType.RESOURCE)) {
            const resource = a.type === EntityType.RESOURCE ? a : b;
            
            resource.health = 0; // Collect resource
            this.gameState.resources++;
            this.gameState.score += 10;
          }
          
          // Push entities apart
          const pushX = (a.position.x - b.position.x) / dist;
          const pushY = (a.position.y - b.position.y) / dist;
          
          a.position.x += pushX * 2;
          a.position.y += pushY * 2;
          b.position.x -= pushX * 2;
          b.position.y -= pushY * 2;
        }
      }
    }
  }
  
  public render(): void {
    // Clear canvas with transparent background
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw subtle grid pattern for visual interest
    this.ctx.strokeStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? 
      'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';
    this.ctx.lineWidth = 1;
    
    for (let x = 0; x < this.canvas.width; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    for (let y = 0; y < this.canvas.height; y += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
    
    // Draw fog of war with transparency
    for (let i = 0; i < this.fogOfWar.length; i++) {
      for (let j = 0; j < this.fogOfWar[i].length; j++) {
        if (!this.exploredArea[i][j]) {
          // Unexplored - semi-transparent
          this.ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? 
            'rgba(0, 0, 0, 0.7)' : 'rgba(240, 240, 240, 0.7)';
          this.ctx.fillRect(j * this.gridSize, i * this.gridSize, this.gridSize, this.gridSize);
        } else if (this.fogOfWar[i][j]) {
          // Explored but fogged - lighter
          this.ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? 
            'rgba(0, 0, 0, 0.3)' : 'rgba(200, 200, 200, 0.3)';
          this.ctx.fillRect(j * this.gridSize, i * this.gridSize, this.gridSize, this.gridSize);
        }
      }
    }
    
    // Draw command position
    if (this.commandPosition) {
      this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(this.commandPosition.x, this.commandPosition.y, 20, 0, Math.PI * 2);
      this.ctx.stroke();
      
      // Fade out command position
      if (Math.random() > 0.98) {
        this.commandPosition = null;
      }
    }
    
    // Draw entities
    for (const entity of this.entities.values()) {
      // Skip if in fog
      const gridX = Math.floor(entity.position.x / this.gridSize);
      const gridY = Math.floor(entity.position.y / this.gridSize);
      if (this.fogOfWar[gridY] && this.fogOfWar[gridY][gridX]) continue;
      
      // Draw entity
      this.ctx.save();
      this.ctx.translate(entity.position.x, entity.position.y);
      
      // Entity body
      if (entity.type === EntityType.BASE) {
        // Base - much more prominent
        this.ctx.shadowColor = 'rgba(59, 130, 246, 0.8)';
        this.ctx.shadowBlur = 20;
        
        // Gradient fill for base
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, entity.radius);
        gradient.addColorStop(0, '#60a5fa');
        gradient.addColorStop(1, '#3b82f6');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(-entity.radius, -entity.radius, entity.radius * 2, entity.radius * 2);
        
        this.ctx.strokeStyle = '#2563eb';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(-entity.radius, -entity.radius, entity.radius * 2, entity.radius * 2);
        
        // Base symbol
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 20px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('⚡', 0, 0);
        
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
      } else if (entity.type === EntityType.THREAT) {
        // Threat - more menacing
        this.ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
        this.ctx.shadowBlur = 15;
        
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -entity.radius);
        this.ctx.lineTo(-entity.radius, entity.radius);
        this.ctx.lineTo(entity.radius, entity.radius);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#dc2626';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Threat symbol
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 10px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('!', 0, 3);
        
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
      } else if (entity.type === EntityType.RESOURCE) {
        // Resource - glowing effect
        this.ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
        this.ctx.shadowBlur = 10;
        
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -entity.radius);
        this.ctx.lineTo(entity.radius, 0);
        this.ctx.lineTo(0, entity.radius);
        this.ctx.lineTo(-entity.radius, 0);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#f59e0b';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
      } else {
        // Robots - much more visible
        const colors = {
          [EntityType.SCOUT]: { fill: '#22c55e', stroke: '#16a34a', glow: 'rgba(34, 197, 94, 0.6)' },
          [EntityType.DEFENDER]: { fill: '#a855f7', stroke: '#9333ea', glow: 'rgba(168, 85, 247, 0.6)' },
          [EntityType.COLLECTOR]: { fill: '#3b82f6', stroke: '#2563eb', glow: 'rgba(59, 130, 246, 0.6)' }
        };
        
        const robotColor = colors[entity.type] || colors[EntityType.COLLECTOR];
        
        // Glow effect
        this.ctx.shadowColor = robotColor.glow;
        this.ctx.shadowBlur = 15;
        
        // Robot body - solid color
        this.ctx.fillStyle = robotColor.fill;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, entity.radius * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Robot outline
        this.ctx.strokeStyle = robotColor.stroke;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Inner circle for depth
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(-entity.radius * 0.3, -entity.radius * 0.3, entity.radius * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        
        // Selection indicator
        if (this.selectedRobots.has(entity.id)) {
          this.ctx.strokeStyle = '#ffffff';
          this.ctx.lineWidth = 3;
          this.ctx.setLineDash([5, 5]);
          this.ctx.beginPath();
          this.ctx.arc(0, 0, entity.radius * 2, 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.setLineDash([]);
        }
      }
      
      // Health bar
      if (entity.health < entity.maxHealth && entity.type !== EntityType.RESOURCE) {
        const barWidth = entity.radius * 2;
        const barHeight = 3;
        const healthPercent = entity.health / entity.maxHealth;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(-barWidth/2, -entity.radius - 8, barWidth, barHeight);
        
        this.ctx.fillStyle = healthPercent > 0.5 ? 'rgba(34, 197, 94, 0.8)' :
                            healthPercent > 0.25 ? 'rgba(251, 191, 36, 0.8)' :
                            'rgba(239, 68, 68, 0.8)';
        this.ctx.fillRect(-barWidth/2, -entity.radius - 8, barWidth * healthPercent, barHeight);
      }
      
      this.ctx.restore();
    }
    
    // Draw HUD
    this.drawHUD();
    
    // Draw game over screen
    if (this.gameState.isGameOver) {
      this.drawGameOver();
    }
  }
  
  private drawHUD(): void {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // HUD background
    this.ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    this.ctx.fillRect(10, 10, 200, 140);
    
    this.ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(10, 10, 200, 140);
    
    // Text
    this.ctx.fillStyle = isDark ? '#fff' : '#000';
    this.ctx.font = '12px JetBrains Mono';
    
    this.ctx.fillText(`SCORE: ${Math.floor(this.gameState.score)}`, 20, 30);
    this.ctx.fillText(`HIGH: ${Math.floor(this.gameState.highScore)}`, 20, 45);
    this.ctx.fillText(`WAVE: ${this.gameState.wave}`, 20, 60);
    this.ctx.fillText(`RESOURCES: ${this.gameState.resources}`, 20, 75);
    this.ctx.fillText(`BASE: ${this.gameState.baseHealth}%`, 20, 90);
    
    const robotCount = Array.from(this.entities.values()).filter(e => e.team === 'player' && e.type !== EntityType.BASE).length;
    const threatCount = Array.from(this.entities.values()).filter(e => e.type === EntityType.THREAT).length;
    
    this.ctx.fillText(`ROBOTS: ${robotCount}`, 20, 105);
    this.ctx.fillText(`THREATS: ${threatCount}`, 20, 120);
    
    if (this.gameState.isPaused) {
      this.ctx.fillText('PAUSED', 20, 140);
    }
    
    // Controls hint
    this.ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
    this.ctx.font = '10px JetBrains Mono';
    this.ctx.fillText('Click: Select/Move', 20, 170);
    this.ctx.fillText('Right-Click: Rally All', 20, 185);
    this.ctx.fillText('Space: Pause', 20, 200);
  }
  
  private drawGameOver(): void {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Overlay
    this.ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Game over text
    this.ctx.fillStyle = isDark ? '#fff' : '#000';
    this.ctx.font = '48px JetBrains Mono';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
    
    this.ctx.font = '24px JetBrains Mono';
    this.ctx.fillText(`Final Score: ${Math.floor(this.gameState.score)}`, this.canvas.width / 2, this.canvas.height / 2);
    
    if (this.gameState.score > this.gameState.highScore) {
      this.ctx.fillStyle = 'rgba(34, 197, 94, 1)';
      this.ctx.fillText('NEW HIGH SCORE!', this.canvas.width / 2, this.canvas.height / 2 + 30);
    }
    
    this.ctx.fillStyle = isDark ? '#fff' : '#000';
    this.ctx.font = '16px JetBrains Mono';
    this.ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 80);
    
    this.ctx.textAlign = 'left';
  }
  
  private gameOver(): void {
    this.gameState.isGameOver = true;
    
    if (this.gameState.score > this.gameState.highScore) {
      this.gameState.highScore = this.gameState.score;
      this.saveHighScore();
    }
    
    // Auto-restart after 5 seconds
    setTimeout(() => {
      if (this.gameState.isGameOver) {
        this.restart();
      }
    }, 5000);
  }
  
  private restart(): void {
    // Reset game state
    this.gameState = {
      score: 0,
      highScore: this.gameState.highScore,
      wave: 1,
      resources: 0,
      baseHealth: 100,
      gameTime: 0,
      isGameOver: false,
      isPaused: false
    };
    
    // Clear entities
    this.entities.clear();
    this.selectedRobots.clear();
    this.commandPosition = null;
    
    // Reinitialize
    this.initializeFogOfWar();
    this.spawnInitialUnits();
  }
  
  private getDistance(a: Vector2D, b: Vector2D): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  private loadHighScore(): number {
    const saved = localStorage.getItem('swarmDefenderHighScore');
    return saved ? parseFloat(saved) : 0;
  }
  
  private saveHighScore(): void {
    localStorage.setItem('swarmDefenderHighScore', this.gameState.highScore.toString());
  }
  
  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.BASE_POSITION.x = width / 2;
    this.BASE_POSITION.y = height / 2;
    this.initializeFogOfWar();
  }
}