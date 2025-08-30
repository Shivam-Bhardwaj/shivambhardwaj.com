/**
 * RobotNavigationAgent.ts
 * Core AI agent that provides intelligent navigation for robots pursuing mouse cursor
 * Uses A* pathfinding with GTA-style persistent pursuit behavior
 */

export interface Vector2D {
  x: number;
  y: number;
}

export interface NavigationCommand {
  velocity: Vector2D;
  targetPosition: Vector2D;
  confidence: number; // 0-1 confidence in this path
  alternativeRoutes: Vector2D[]; // Backup paths
  pursuitStrategy: 'direct' | 'flank' | 'intercept' | 'surround';
}

export interface RobotState {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  heading: number; // radians
  maxSpeed: number;
  detectionRadius: number;
  lastKnownTargetPosition?: Vector2D;
  pursuitMode: 'hunting' | 'intercepting' | 'flanking' | 'surrounding';
}

export interface GridCell {
  x: number;
  y: number;
  walkable: boolean;
  cost: number; // Movement cost (higher = avoid)
  parent?: GridCell;
  gCost: number; // Distance from start
  hCost: number; // Distance to end
  fCost: number; // Total cost
}

export class RobotNavigationAgent {
  private gridSize: number;
  private gridWidth: number;
  private gridHeight: number;
  private grid: GridCell[][];
  private screenWidth: number;
  private screenHeight: number;

  constructor(screenWidth: number, screenHeight: number, gridSize: number = 20) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.gridSize = gridSize;
    this.gridWidth = Math.ceil(screenWidth / gridSize);
    this.gridHeight = Math.ceil(screenHeight / gridSize);
    this.initializeGrid();
  }

  private initializeGrid(): void {
    this.grid = [];
    for (let y = 0; y < this.gridHeight; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.gridWidth; x++) {
        this.grid[y][x] = {
          x,
          y,
          walkable: true,
          cost: 1,
          gCost: 0,
          hCost: 0,
          fCost: 0
        };
      }
    }
  }

  /**
   * Updates collision map based on detected obstacles
   */
  public updateCollisionMap(collisionMap: boolean[][]): void {
    for (let y = 0; y < this.gridHeight && y < collisionMap.length; y++) {
      for (let x = 0; x < this.gridWidth && x < collisionMap[y].length; x++) {
        if (this.grid[y] && this.grid[y][x]) {
          this.grid[y][x].walkable = !collisionMap[y][x];
          // Higher cost for cells near obstacles
          if (collisionMap[y][x]) {
            this.grid[y][x].cost = 10;
            // Add padding around obstacles
            this.addObstaclePadding(x, y);
          } else {
            this.grid[y][x].cost = 1;
          }
        }
      }
    }
  }

  private addObstaclePadding(x: number, y: number): void {
    const padding = 2;
    for (let dy = -padding; dy <= padding; dy++) {
      for (let dx = -padding; dx <= padding; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (this.isValidGridCell(nx, ny) && this.grid[ny][nx].walkable) {
          this.grid[ny][nx].cost = Math.max(this.grid[ny][nx].cost, 5);
        }
      }
    }
  }

  /**
   * Main navigation function - returns optimal movement command
   */
  public navigate(
    robot: RobotState,
    mousePosition: Vector2D,
    allRobots: RobotState[]
  ): NavigationCommand {
    // Convert screen coordinates to grid coordinates
    const startGrid = this.screenToGrid(robot.position);
    // const targetGrid = this.screenToGrid(mousePosition); // Unused for now

    // Determine pursuit strategy based on robot's role and other robots' positions
    const strategy = this.determinePursuitStrategy(robot, mousePosition, allRobots);
    
    // Adjust target based on strategy
    const adjustedTarget = this.adjustTargetForStrategy(
      mousePosition, 
      robot, 
      allRobots, 
      strategy
    );

    const adjustedTargetGrid = this.screenToGrid(adjustedTarget);

    // Find path using A* algorithm
    const path = this.findPath(startGrid, adjustedTargetGrid);
    
    if (!path || path.length === 0) {
      // No path found - use emergency fallback behavior
      return this.emergencyNavigation(robot, mousePosition, strategy);
    }

    // Convert path to movement command
    const nextPosition = path.length > 1 ? 
      this.gridToScreen(path[1]) : 
      this.gridToScreen(path[0]);

    // Calculate velocity with smooth acceleration
    const direction = this.normalize({
      x: nextPosition.x - robot.position.x,
      y: nextPosition.y - robot.position.y
    });

    const velocity = {
      x: direction.x * robot.maxSpeed,
      y: direction.y * robot.maxSpeed
    };

    // Generate alternative routes for backup
    const alternativeRoutes = this.generateAlternativeRoutes(
      robot.position, 
      adjustedTarget, 
      path
    );

    return {
      velocity,
      targetPosition: adjustedTarget,
      confidence: this.calculatePathConfidence(path),
      alternativeRoutes,
      pursuitStrategy: strategy
    };
  }

  /**
   * A* pathfinding algorithm implementation
   */
  private findPath(start: Vector2D, end: Vector2D): Vector2D[] | null {
    if (!this.isValidGridCell(start.x, start.y) || 
        !this.isValidGridCell(end.x, end.y)) {
      return null;
    }

    // Reset grid costs
    this.resetGridCosts();

    const openSet: GridCell[] = [];
    const closedSet: Set<string> = new Set();

    const startCell = this.grid[start.y][start.x];
    const endCell = this.grid[end.y][end.x];

    startCell.gCost = 0;
    startCell.hCost = this.getDistance(startCell, endCell);
    startCell.fCost = startCell.hCost;

    openSet.push(startCell);

    while (openSet.length > 0) {
      // Find cell with lowest fCost
      let currentCell = openSet[0];
      let currentIndex = 0;

      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].fCost < currentCell.fCost || 
           (openSet[i].fCost === currentCell.fCost && openSet[i].hCost < currentCell.hCost)) {
          currentCell = openSet[i];
          currentIndex = i;
        }
      }

      openSet.splice(currentIndex, 1);
      closedSet.add(`${currentCell.x},${currentCell.y}`);

      // Check if we reached the target
      if (currentCell.x === endCell.x && currentCell.y === endCell.y) {
        return this.reconstructPath(currentCell);
      }

      // Check all neighbors
      const neighbors = this.getNeighbors(currentCell);
      for (const neighbor of neighbors) {
        if (!neighbor.walkable || closedSet.has(`${neighbor.x},${neighbor.y}`)) {
          continue;
        }

        const newGCost = currentCell.gCost + this.getDistance(currentCell, neighbor) + neighbor.cost;

        if (newGCost < neighbor.gCost || !openSet.includes(neighbor)) {
          neighbor.gCost = newGCost;
          neighbor.hCost = this.getDistance(neighbor, endCell);
          neighbor.fCost = neighbor.gCost + neighbor.hCost;
          neighbor.parent = currentCell;

          if (!openSet.includes(neighbor)) {
            openSet.push(neighbor);
          }
        }
      }
    }

    return null; // No path found
  }

  private resetGridCosts(): void {
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        this.grid[y][x].gCost = Infinity;
        this.grid[y][x].hCost = 0;
        this.grid[y][x].fCost = 0;
        this.grid[y][x].parent = undefined;
      }
    }
  }

  private reconstructPath(endCell: GridCell): Vector2D[] {
    const path: Vector2D[] = [];
    let currentCell: GridCell | undefined = endCell;

    while (currentCell) {
      path.unshift({ x: currentCell.x, y: currentCell.y });
      currentCell = currentCell.parent;
    }

    return path;
  }

  private getNeighbors(cell: GridCell): GridCell[] {
    const neighbors: GridCell[] = [];
    const directions = [
      { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
      { x: -1, y: 0 },                   { x: 1, y: 0 },
      { x: -1, y: 1 },  { x: 0, y: 1 },  { x: 1, y: 1 }
    ];

    for (const dir of directions) {
      const x = cell.x + dir.x;
      const y = cell.y + dir.y;

      if (this.isValidGridCell(x, y)) {
        neighbors.push(this.grid[y][x]);
      }
    }

    return neighbors;
  }

  private getDistance(a: GridCell, b: GridCell): number {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);

    // Diagonal distance calculation
    if (dx > dy) {
      return 14 * dy + 10 * (dx - dy);
    }
    return 14 * dx + 10 * (dy - dx);
  }

  private determinePursuitStrategy(
    robot: RobotState, 
    mousePosition: Vector2D, 
    allRobots: RobotState[]
  ): 'direct' | 'flank' | 'intercept' | 'surround' {
    const distance = this.getDistanceToTarget(robot.position, mousePosition);
    const robotCount = allRobots.length;
    const robotIndex = allRobots.findIndex(r => r.id === robot.id);

    // Close range - direct pursuit
    if (distance < 100) {
      return 'direct';
    }

    // Multiple robots - coordinate strategies
    if (robotCount > 1) {
      if (robotIndex % 3 === 0) return 'intercept';
      if (robotIndex % 3 === 1) return 'flank';
      return 'surround';
    }

    return 'direct';
  }

  private adjustTargetForStrategy(
    mousePosition: Vector2D,
    robot: RobotState,
    allRobots: RobotState[],
    strategy: 'direct' | 'flank' | 'intercept' | 'surround'
  ): Vector2D {
    switch (strategy) {
      case 'direct':
        return mousePosition;

      case 'intercept':
        // Predict where the mouse will be
        return this.predictMousePosition(mousePosition, robot);

      case 'flank':
        // Move to the side of the target
        return this.getFlankingPosition(mousePosition, robot);

      case 'surround':
        // Take position in formation around target
        return this.getSurroundingPosition(mousePosition, robot, allRobots);

      default:
        return mousePosition;
    }
  }

  private predictMousePosition(mousePosition: Vector2D, robot: RobotState): Vector2D {
    if (!robot.lastKnownTargetPosition) {
      return mousePosition;
    }

    // Calculate mouse velocity
    const mouseVelocity = {
      x: mousePosition.x - robot.lastKnownTargetPosition.x,
      y: mousePosition.y - robot.lastKnownTargetPosition.y
    };

    // Predict future position based on current velocity
    const predictionTime = 60; // frames ahead
    return {
      x: mousePosition.x + mouseVelocity.x * predictionTime,
      y: mousePosition.y + mouseVelocity.y * predictionTime
    };
  }

  private getFlankingPosition(mousePosition: Vector2D, robot: RobotState): Vector2D {
    const angle = Math.atan2(
      mousePosition.y - robot.position.y,
      mousePosition.x - robot.position.x
    );

    const flankAngle = angle + Math.PI / 2; // 90 degrees offset
    const flankDistance = 150;

    return {
      x: mousePosition.x + Math.cos(flankAngle) * flankDistance,
      y: mousePosition.y + Math.sin(flankAngle) * flankDistance
    };
  }

  private getSurroundingPosition(
    mousePosition: Vector2D,
    robot: RobotState,
    allRobots: RobotState[]
  ): Vector2D {
    const robotIndex = allRobots.findIndex(r => r.id === robot.id);
    const totalRobots = allRobots.length;
    const angleStep = (2 * Math.PI) / totalRobots;
    const surroundAngle = robotIndex * angleStep;
    const surroundDistance = 120;

    return {
      x: mousePosition.x + Math.cos(surroundAngle) * surroundDistance,
      y: mousePosition.y + Math.sin(surroundAngle) * surroundDistance
    };
  }

  private emergencyNavigation(
    robot: RobotState,
    mousePosition: Vector2D,
    strategy: 'direct' | 'flank' | 'intercept' | 'surround'
  ): NavigationCommand {
    // When pathfinding fails, move directly toward target with obstacle avoidance
    const direction = this.normalize({
      x: mousePosition.x - robot.position.x,
      y: mousePosition.y - robot.position.y
    });

    // Check for immediate obstacles and adjust direction
    const avoidanceDirection = this.getObstacleAvoidanceDirection(robot.position, direction);

    return {
      velocity: {
        x: avoidanceDirection.x * robot.maxSpeed * 0.8,
        y: avoidanceDirection.y * robot.maxSpeed * 0.8
      },
      targetPosition: mousePosition,
      confidence: 0.3,
      alternativeRoutes: [mousePosition],
      pursuitStrategy: strategy
    };
  }

  private getObstacleAvoidanceDirection(position: Vector2D, direction: Vector2D): Vector2D {
    const checkDistance = 50;
    const checkPosition = {
      x: position.x + direction.x * checkDistance,
      y: position.y + direction.y * checkDistance
    };

    const gridPos = this.screenToGrid(checkPosition);
    if (this.isValidGridCell(gridPos.x, gridPos.y) && this.grid[gridPos.y][gridPos.x].walkable) {
      return direction;
    }

    // Try alternative directions
    const alternatives = [
      { x: direction.x + 0.5, y: direction.y },
      { x: direction.x - 0.5, y: direction.y },
      { x: direction.x, y: direction.y + 0.5 },
      { x: direction.x, y: direction.y - 0.5 }
    ];

    for (const alt of alternatives) {
      const normalizedAlt = this.normalize(alt);
      const altCheckPosition = {
        x: position.x + normalizedAlt.x * checkDistance,
        y: position.y + normalizedAlt.y * checkDistance
      };
      const altGridPos = this.screenToGrid(altCheckPosition);
      
      if (this.isValidGridCell(altGridPos.x, altGridPos.y) && 
          this.grid[altGridPos.y][altGridPos.x].walkable) {
        return normalizedAlt;
      }
    }

    return direction; // Last resort
  }

  private generateAlternativeRoutes(
    start: Vector2D,
    target: Vector2D,
    _mainPath: Vector2D[]
  ): Vector2D[] {
    const alternatives: Vector2D[] = [];
    
    // Generate waypoints around obstacles
    const angle = Math.atan2(target.y - start.y, target.x - start.x);
    const distance = this.getDistanceToTarget(start, target);
    
    for (let i = 0; i < 3; i++) {
      const offsetAngle = angle + (Math.PI / 4) * (i - 1);
      const waypoint = {
        x: start.x + Math.cos(offsetAngle) * (distance * 0.5),
        y: start.y + Math.sin(offsetAngle) * (distance * 0.5)
      };
      alternatives.push(waypoint);
    }

    return alternatives;
  }

  private calculatePathConfidence(path: Vector2D[]): number {
    if (!path || path.length === 0) return 0;
    
    let confidence = 1.0;
    
    // Reduce confidence for longer paths
    confidence -= (path.length - 2) * 0.05;
    
    // Check for obstacles along path
    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      // const next = path[i + 1]; // Future path smoothing
      
      if (this.grid[current.y] && this.grid[current.y][current.x] && 
          !this.grid[current.y][current.x].walkable) {
        confidence -= 0.2;
      }
    }

    return Math.max(0, Math.min(1, confidence));
  }

  private screenToGrid(position: Vector2D): Vector2D {
    return {
      x: Math.floor(position.x / this.gridSize),
      y: Math.floor(position.y / this.gridSize)
    };
  }

  private gridToScreen(gridPosition: Vector2D): Vector2D {
    return {
      x: gridPosition.x * this.gridSize + this.gridSize / 2,
      y: gridPosition.y * this.gridSize + this.gridSize / 2
    };
  }

  private isValidGridCell(x: number, y: number): boolean {
    return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight;
  }

  private normalize(vector: Vector2D): Vector2D {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (length === 0) return { x: 0, y: 0 };
    return {
      x: vector.x / length,
      y: vector.y / length
    };
  }

  private getDistanceToTarget(pos1: Vector2D, pos2: Vector2D): number {
    return Math.sqrt(
      Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2)
    );
  }

  /**
   * Update screen dimensions when window resizes
   */
  public updateScreenSize(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
    this.gridWidth = Math.ceil(width / this.gridSize);
    this.gridHeight = Math.ceil(height / this.gridSize);
    this.initializeGrid();
  }
}