import { Mission, MissionType, Objective, SwarmState, Vector2D, RobotType } from '../types';

export class MissionManager {
  private currentMission: Mission | null = null;
  private missionHistory: Mission[] = [];
  private missionTemplates: Map<MissionType, () => Mission> = new Map();

  constructor() {
    this.initializeMissionTemplates();
  }

  private initializeMissionTemplates(): void {
    this.missionTemplates.set(MissionType.SEARCH_RESCUE, () => ({
      id: `mission-${Date.now()}`,
      type: MissionType.SEARCH_RESCUE,
      name: 'Search & Rescue',
      description: 'Find and rescue 5 survivors in the area',
      objectives: [
        {
          id: 'find-survivors',
          description: 'Locate survivors',
          completed: false,
          progress: 0,
          maxProgress: 5
        },
        {
          id: 'rescue-survivors',
          description: 'Bring survivors to safety',
          completed: false,
          progress: 0,
          maxProgress: 5
        }
      ],
      startTime: Date.now(),
      score: 0,
      status: 'active',
      difficulty: 1
    }));

    this.missionTemplates.set(MissionType.RESOURCE_COLLECTION, () => ({
      id: `mission-${Date.now()}`,
      type: MissionType.RESOURCE_COLLECTION,
      name: 'Resource Gathering',
      description: 'Collect 20 units of resources',
      objectives: [
        {
          id: 'collect-energy',
          description: 'Collect energy resources',
          completed: false,
          progress: 0,
          maxProgress: 10
        },
        {
          id: 'collect-materials',
          description: 'Collect material resources',
          completed: false,
          progress: 0,
          maxProgress: 10
        }
      ],
      startTime: Date.now(),
      score: 0,
      status: 'active',
      difficulty: 1
    }));

    this.missionTemplates.set(MissionType.AREA_MAPPING, () => ({
      id: `mission-${Date.now()}`,
      type: MissionType.AREA_MAPPING,
      name: 'Area Exploration',
      description: 'Map 80% of the area',
      objectives: [
        {
          id: 'explore-area',
          description: 'Explore the area',
          completed: false,
          progress: 0,
          maxProgress: 80
        },
        {
          id: 'mark-hazards',
          description: 'Mark hazardous zones',
          completed: false,
          progress: 0,
          maxProgress: 5
        }
      ],
      startTime: Date.now(),
      score: 0,
      status: 'active',
      difficulty: 1
    }));

    this.missionTemplates.set(MissionType.PERIMETER_DEFENSE, () => ({
      id: `mission-${Date.now()}`,
      type: MissionType.PERIMETER_DEFENSE,
      name: 'Perimeter Defense',
      description: 'Maintain defensive formation for 60 seconds',
      objectives: [
        {
          id: 'form-perimeter',
          description: 'Form defensive perimeter',
          completed: false,
          progress: 0,
          maxProgress: 1
        },
        {
          id: 'maintain-formation',
          description: 'Maintain formation',
          completed: false,
          progress: 0,
          maxProgress: 60
        }
      ],
      startTime: Date.now(),
      score: 0,
      status: 'active',
      difficulty: 2
    }));

    this.missionTemplates.set(MissionType.CONTAMINATION_CLEANUP, () => ({
      id: `mission-${Date.now()}`,
      type: MissionType.CONTAMINATION_CLEANUP,
      name: 'Contamination Cleanup',
      description: 'Clear contaminated zones',
      objectives: [
        {
          id: 'identify-contamination',
          description: 'Identify contaminated areas',
          completed: false,
          progress: 0,
          maxProgress: 3
        },
        {
          id: 'clean-contamination',
          description: 'Clean contaminated zones',
          completed: false,
          progress: 0,
          maxProgress: 3
        }
      ],
      startTime: Date.now(),
      score: 0,
      status: 'active',
      difficulty: 2
    }));
  }

  startNewMission(type?: MissionType): Mission {
    // Complete current mission if exists
    if (this.currentMission && this.currentMission.status === 'active') {
      this.completeMission(false);
    }

    // Select random mission type if not specified
    if (!type) {
      const types = Array.from(this.missionTemplates.keys());
      type = types[Math.floor(Math.random() * types.length)];
    }

    // Create new mission
    const missionCreator = this.missionTemplates.get(type);
    if (missionCreator) {
      this.currentMission = missionCreator();
      return this.currentMission;
    }

    throw new Error(`Unknown mission type: ${type}`);
  }

  update(deltaTime: number, swarmState: SwarmState): void {
    if (!this.currentMission || this.currentMission.status !== 'active') {
      return;
    }

    // Update mission progress based on type
    switch (this.currentMission.type) {
      case MissionType.SEARCH_RESCUE:
        this.updateSearchRescue(swarmState);
        break;
      case MissionType.RESOURCE_COLLECTION:
        this.updateResourceCollection(swarmState);
        break;
      case MissionType.AREA_MAPPING:
        this.updateAreaMapping(swarmState);
        break;
      case MissionType.PERIMETER_DEFENSE:
        this.updatePerimeterDefense(deltaTime, swarmState);
        break;
      case MissionType.CONTAMINATION_CLEANUP:
        this.updateContaminationCleanup(swarmState);
        break;
    }

    // Check if all objectives are completed
    const allCompleted = this.currentMission.objectives.every(obj => obj.completed);
    if (allCompleted) {
      this.completeMission(true);
    }

    // Check for mission timeout (5 minutes)
    const elapsed = Date.now() - this.currentMission.startTime;
    if (elapsed > 300000) {
      this.completeMission(false);
    }
  }

  private updateSearchRescue(swarmState: SwarmState): void {
    if (!this.currentMission) return;

    // Count survivors found (resources of type 'survivor')
    const survivorsFound = Array.from(swarmState.resources.values())
      .filter(r => r.type === 'survivor' && r.discovered).length;

    const objective = this.currentMission.objectives[0];
    objective.progress = Math.min(survivorsFound, objective.maxProgress);
    objective.completed = objective.progress >= objective.maxProgress;

    // Update rescue objective based on robots carrying survivors
    const robotsWithSurvivors = Array.from(swarmState.robots.values())
      .filter(r => r.currentCargo > 0).length;
    
    const rescueObjective = this.currentMission.objectives[1];
    rescueObjective.progress = robotsWithSurvivors;
    rescueObjective.completed = rescueObjective.progress >= rescueObjective.maxProgress;
  }

  private updateResourceCollection(swarmState: SwarmState): void {
    if (!this.currentMission) return;

    // Count collected resources by type
    let energyCollected = 0;
    let materialsCollected = 0;

    for (const robot of swarmState.robots.values()) {
      if (robot.currentCargo > 0) {
        if (robot.type === RobotType.ENERGY) {
          energyCollected += robot.currentCargo;
        } else {
          materialsCollected += robot.currentCargo;
        }
      }
    }

    this.currentMission.objectives[0].progress = energyCollected;
    this.currentMission.objectives[0].completed = energyCollected >= 10;

    this.currentMission.objectives[1].progress = materialsCollected;
    this.currentMission.objectives[1].completed = materialsCollected >= 10;
  }

  private updateAreaMapping(swarmState: SwarmState): void {
    if (!this.currentMission) return;

    // Calculate explored area based on pheromone coverage
    const exploredCells = swarmState.pheromones.size;
    const totalCells = 1000; // Approximate total area cells
    const explorationPercent = Math.min(100, (exploredCells / totalCells) * 100);

    this.currentMission.objectives[0].progress = explorationPercent;
    this.currentMission.objectives[0].completed = explorationPercent >= 80;

    // Count marked hazards (danger pheromones)
    const hazardsMarked = Array.from(swarmState.pheromones.values())
      .filter(p => p.type === 'danger').length;

    this.currentMission.objectives[1].progress = Math.min(hazardsMarked, 5);
    this.currentMission.objectives[1].completed = hazardsMarked >= 5;
  }

  private updatePerimeterDefense(deltaTime: number, swarmState: SwarmState): void {
    if (!this.currentMission) return;

    // Check if robots are in formation
    const robots = Array.from(swarmState.robots.values());
    const center = this.calculateCenter(robots.map(r => r.position));
    
    let inFormation = 0;
    const formationRadius = 150;
    
    for (const robot of robots) {
      const dist = this.getDistance(robot.position, center);
      if (Math.abs(dist - formationRadius) < 30) {
        inFormation++;
      }
    }

    const formationQuality = inFormation / robots.length;
    
    if (formationQuality > 0.7) {
      this.currentMission.objectives[0].progress = 1;
      this.currentMission.objectives[0].completed = true;
      
      // Update time maintained
      this.currentMission.objectives[1].progress += deltaTime;
      this.currentMission.objectives[1].completed = 
        this.currentMission.objectives[1].progress >= 60;
    }
  }

  private updateContaminationCleanup(swarmState: SwarmState): void {
    if (!this.currentMission) return;

    // Count identified contamination zones
    const contaminationZones = Array.from(swarmState.pheromones.values())
      .filter(p => p.type === 'danger').length;

    this.currentMission.objectives[0].progress = Math.min(contaminationZones, 3);
    this.currentMission.objectives[0].completed = contaminationZones >= 3;

    // Simulate cleanup (robots spending time in danger zones)
    let cleanupProgress = 0;
    for (const robot of swarmState.robots.values()) {
      for (const pheromone of swarmState.pheromones.values()) {
        if (pheromone.type === 'danger') {
          const dist = this.getDistance(robot.position, pheromone.position);
          if (dist < 50) {
            cleanupProgress += 0.01;
          }
        }
      }
    }

    this.currentMission.objectives[1].progress = Math.min(cleanupProgress, 3);
    this.currentMission.objectives[1].completed = cleanupProgress >= 3;
  }

  private calculateCenter(positions: Vector2D[]): Vector2D {
    const sum = positions.reduce((acc, pos) => ({
      x: acc.x + pos.x,
      y: acc.y + pos.y
    }), { x: 0, y: 0 });

    return {
      x: sum.x / positions.length,
      y: sum.y / positions.length
    };
  }

  private getDistance(p1: Vector2D, p2: Vector2D): number {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  }

  private completeMission(success: boolean): void {
    if (!this.currentMission) return;

    this.currentMission.status = success ? 'completed' : 'failed';
    this.currentMission.endTime = Date.now();

    // Calculate score
    const timeBonus = Math.max(0, 300000 - (this.currentMission.endTime - this.currentMission.startTime)) / 1000;
    const objectiveScore = this.currentMission.objectives.reduce((sum, obj) => 
      sum + (obj.completed ? 100 : obj.progress / obj.maxProgress * 50), 0
    );

    this.currentMission.score = objectiveScore + (success ? timeBonus : 0);

    // Add to history
    this.missionHistory.push(this.currentMission);

    // Start new mission after a delay
    setTimeout(() => {
      this.startNewMission();
    }, 3000);
  }

  getCurrentMission(): Mission | null {
    return this.currentMission;
  }

  getMissionHistory(): Mission[] {
    return this.missionHistory;
  }

  render(ctx: CanvasRenderingContext2D, canvasWidth: number): void {
    if (!this.currentMission || this.currentMission.status !== 'active') return;

    ctx.save();

    // Mission info background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvasWidth - 250, 10, 240, 100);

    // Mission text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(this.currentMission.name, canvasWidth - 240, 30);

    ctx.font = '10px monospace';
    ctx.fillText(this.currentMission.description, canvasWidth - 240, 45);

    // Objectives
    let y = 60;
    for (const objective of this.currentMission.objectives) {
      const progressPercent = (objective.progress / objective.maxProgress) * 100;
      
      // Progress bar background
      ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
      ctx.fillRect(canvasWidth - 240, y, 220, 10);
      
      // Progress bar fill
      ctx.fillStyle = objective.completed ? 'rgba(34, 197, 94, 0.8)' : 'rgba(250, 204, 21, 0.8)';
      ctx.fillRect(canvasWidth - 240, y, (220 * progressPercent) / 100, 10);
      
      // Progress text
      ctx.fillStyle = 'white';
      ctx.font = '9px monospace';
      ctx.fillText(
        `${objective.description}: ${Math.floor(objective.progress)}/${objective.maxProgress}`,
        canvasWidth - 240,
        y + 8
      );
      
      y += 15;
    }

    // Time elapsed
    const elapsed = Math.floor((Date.now() - this.currentMission.startTime) / 1000);
    ctx.fillText(`Time: ${elapsed}s`, canvasWidth - 240, y + 10);

    ctx.restore();
  }
}