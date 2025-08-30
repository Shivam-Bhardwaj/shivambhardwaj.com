export enum RobotType {
  SCOUT = 'scout',
  WORKER = 'worker',
  COMMUNICATOR = 'communicator',
  ENERGY = 'energy'
}

export enum MissionType {
  SEARCH_RESCUE = 'search_rescue',
  RESOURCE_COLLECTION = 'resource_collection',
  AREA_MAPPING = 'area_mapping',
  PERIMETER_DEFENSE = 'perimeter_defense',
  CONTAMINATION_CLEANUP = 'contamination_cleanup'
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface SensorReading {
  type: 'lidar' | 'proximity' | 'camera' | 'energy';
  data: unknown;
  timestamp: number;
}

export interface RobotStats {
  type: RobotType;
  id: string;
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
}

export interface Mission {
  id: string;
  type: MissionType;
  name: string;
  description: string;
  objectives: Objective[];
  startTime: number;
  endTime?: number;
  score: number;
  status: 'active' | 'completed' | 'failed';
  difficulty: number;
}

export interface Objective {
  id: string;
  description: string;
  completed: boolean;
  progress: number;
  maxProgress: number;
}

export interface Resource {
  id: string;
  position: Vector2D;
  type: 'energy' | 'material' | 'data' | 'survivor';
  value: number;
  weight: number;
  discovered: boolean;
}

export interface Obstacle {
  position: Vector2D;
  width: number;
  height: number;
  type: 'static' | 'dynamic' | 'hazard';
}

export interface SwarmState {
  robots: Map<string, RobotStats>;
  resources: Map<string, Resource>;
  obstacles: Obstacle[];
  mission: Mission | null;
  pheromones: Map<string, Pheromone>;
  globalScore: number;
  sessionScore: number;
  timeElapsed: number;
}

export interface Pheromone {
  position: Vector2D;
  strength: number;
  type: 'food' | 'danger' | 'home' | 'explored';
  age: number;
  depositorId: string;
}

export interface CommunicationMessage {
  senderId: string;
  receiverId: string | 'broadcast';
  type: 'discovery' | 'help' | 'status' | 'command';
  data: unknown;
  timestamp: number;
  hops: number;
}

export interface GameConfig {
  robotCount: number;
  initialBattery: number;
  batteryConsumptionRate: number;
  communicationRange: number;
  sensorNoise: number;
  pheromoneEvaporationRate: number;
  resourceSpawnRate: number;
  missionDifficulty: number;
  enableEvolution: boolean;
  enableLearning: boolean;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  missionType: MissionType;
  robotsSurvived: number;
  timeElapsed: number;
  timestamp: number;
  swarmName?: string;
}

export interface RobotBehavior {
  weights: {
    separation: number;
    alignment: number;
    cohesion: number;
    goalSeeking: number;
    obstacleAvoidance: number;
    pheromoneFollowing: number;
    exploration: number;
  };
  personality: 'aggressive' | 'cautious' | 'cooperative' | 'explorer';
}