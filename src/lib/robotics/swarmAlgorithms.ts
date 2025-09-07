import { logger } from '@/lib/logging';

// Core types for swarm algorithms
export interface PersonalBest {
  position: { x: number; y: number };
  fitness: number;
}

export interface AgentMetadata {
  personalBest?: PersonalBest;
  [key: string]: unknown;
}

export interface Agent {
  id: string;
  position: { x: number; y: number; z?: number };
  velocity: { x: number; y: number; z?: number };
  acceleration: { x: number; y: number; z?: number };
  orientation: number; // radians
  mass: number;
  radius: number;
  maxSpeed: number;
  maxForce: number;
  neighbors: Agent[];
  color?: string;
  trail?: { x: number; y: number }[];
  energy?: number;
  state?: string;
  metadata?: AgentMetadata;
}

export interface SwarmParameters {
  separationRadius: number;
  alignmentRadius: number;
  cohesionRadius: number;
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
  maxSpeed: number;
  maxForce: number;
  predatorAvoidanceRadius?: number;
  predatorAvoidanceWeight?: number;
  boundaryForceWeight?: number;
  noiseLevel?: number;
}

export interface Obstacle {
  position: { x: number; y: number };
  radius: number;
  type: 'circle' | 'rectangle' | 'polygon';
  vertices?: { x: number; y: number }[];
  avoidanceRadius: number;
}

export interface SwarmEnvironment {
  width: number;
  height: number;
  boundaries: 'wrap' | 'reflect' | 'absorb';
  obstacles: Obstacle[];
  targets: { x: number; y: number; radius: number }[];
  windForce?: { x: number; y: number };
  predators?: Agent[];
}

/**
 * Boids Algorithm Implementation (Reynolds 1987)
 * Classic flocking behavior with separation, alignment, and cohesion
 */
export class BoidsAlgorithm {
  private parameters: SwarmParameters;
  private environment: SwarmEnvironment;

  constructor(parameters: SwarmParameters, environment: SwarmEnvironment) {
    this.parameters = parameters;
    this.environment = environment;
    logger.info('BoidsAlgorithm initialized', { 
      parameters: this.parameters,
      environmentSize: `${environment.width}x${environment.height}`
    });
  }

  /**
   * Update all agents using boids rules
   */
  updateSwarm(agents: Agent[], deltaTime: number): Agent[] {
    const updatedAgents = agents.map(agent => {
      const neighbors = this.findNeighbors(agent, agents);
      agent.neighbors = neighbors;

      const forces = {
        separation: this.calculateSeparation(agent, neighbors),
        alignment: this.calculateAlignment(agent, neighbors),
        cohesion: this.calculateCohesion(agent, neighbors),
        obstacle: this.calculateObstacleAvoidance(agent),
        boundary: this.calculateBoundaryForce(agent),
        predator: this.calculatePredatorAvoidance(agent),
        noise: this.calculateNoise()
      };

      // Combine forces with weights
      const totalForce = {
        x: forces.separation.x * this.parameters.separationWeight +
           forces.alignment.x * this.parameters.alignmentWeight +
           forces.cohesion.x * this.parameters.cohesionWeight +
           forces.obstacle.x +
           forces.boundary.x * (this.parameters.boundaryForceWeight || 1) +
           forces.predator.x * (this.parameters.predatorAvoidanceWeight || 2) +
           forces.noise.x * (this.parameters.noiseLevel || 0),
        y: forces.separation.y * this.parameters.separationWeight +
           forces.alignment.y * this.parameters.alignmentWeight +
           forces.cohesion.y * this.parameters.cohesionWeight +
           forces.obstacle.y +
           forces.boundary.y * (this.parameters.boundaryForceWeight || 1) +
           forces.predator.y * (this.parameters.predatorAvoidanceWeight || 2) +
           forces.noise.y * (this.parameters.noiseLevel || 0)
      };

      // Limit force magnitude
      const forceMagnitude = Math.sqrt(totalForce.x ** 2 + totalForce.y ** 2);
      if (forceMagnitude > agent.maxForce) {
        totalForce.x = (totalForce.x / forceMagnitude) * agent.maxForce;
        totalForce.y = (totalForce.y / forceMagnitude) * agent.maxForce;
      }

      // Update acceleration
      agent.acceleration = {
        x: totalForce.x / agent.mass,
        y: totalForce.y / agent.mass
      };

      // Update velocity
      agent.velocity.x += agent.acceleration.x * deltaTime;
      agent.velocity.y += agent.acceleration.y * deltaTime;

      // Limit velocity magnitude
      const velocityMagnitude = Math.sqrt(agent.velocity.x ** 2 + agent.velocity.y ** 2);
      if (velocityMagnitude > agent.maxSpeed) {
        agent.velocity.x = (agent.velocity.x / velocityMagnitude) * agent.maxSpeed;
        agent.velocity.y = (agent.velocity.y / velocityMagnitude) * agent.maxSpeed;
      }

      // Update position
      agent.position.x += agent.velocity.x * deltaTime;
      agent.position.y += agent.velocity.y * deltaTime;

      // Update orientation
      if (velocityMagnitude > 0.01) {
        agent.orientation = Math.atan2(agent.velocity.y, agent.velocity.x);
      }

      // Handle boundaries
      this.handleBoundaries(agent);

      // Update trail
      if (agent.trail) {
        agent.trail.push({ x: agent.position.x, y: agent.position.y });
        if (agent.trail.length > 50) {
          agent.trail.shift();
        }
      }

      return agent;
    });

    return updatedAgents;
  }

  private findNeighbors(agent: Agent, allAgents: Agent[]): Agent[] {
    const maxRadius = Math.max(
      this.parameters.separationRadius,
      this.parameters.alignmentRadius,
      this.parameters.cohesionRadius
    );

    return allAgents.filter(other => {
      if (other.id === agent.id) return false;
      
      const distance = this.calculateDistance(agent.position, other.position);
      return distance < maxRadius;
    });
  }

  /**
   * Separation: steer to avoid crowding local flockmates
   */
  private calculateSeparation(agent: Agent, neighbors: Agent[]): { x: number; y: number } {
    const force = { x: 0, y: 0 };
    let count = 0;

    for (const neighbor of neighbors) {
      const distance = this.calculateDistance(agent.position, neighbor.position);
      
      if (distance < this.parameters.separationRadius && distance > 0) {
        const diff = {
          x: agent.position.x - neighbor.position.x,
          y: agent.position.y - neighbor.position.y
        };
        
        // Weight by distance (closer = stronger repulsion)
        const weight = 1 / distance;
        force.x += diff.x * weight;
        force.y += diff.y * weight;
        count++;
      }
    }

    if (count > 0) {
      force.x /= count;
      force.y /= count;
      
      // Normalize and scale
      const magnitude = Math.sqrt(force.x ** 2 + force.y ** 2);
      if (magnitude > 0) {
        force.x = (force.x / magnitude) * agent.maxSpeed - agent.velocity.x;
        force.y = (force.y / magnitude) * agent.maxSpeed - agent.velocity.y;
      }
    }

    return force;
  }

  /**
   * Alignment: steer towards the average heading of neighbors
   */
  private calculateAlignment(agent: Agent, neighbors: Agent[]): { x: number; y: number } {
    const avgVelocity = { x: 0, y: 0 };
    let count = 0;

    for (const neighbor of neighbors) {
      const distance = this.calculateDistance(agent.position, neighbor.position);
      
      if (distance < this.parameters.alignmentRadius) {
        avgVelocity.x += neighbor.velocity.x;
        avgVelocity.y += neighbor.velocity.y;
        count++;
      }
    }

    if (count > 0) {
      avgVelocity.x /= count;
      avgVelocity.y /= count;
      
      // Normalize to max speed
      const magnitude = Math.sqrt(avgVelocity.x ** 2 + avgVelocity.y ** 2);
      if (magnitude > 0) {
        avgVelocity.x = (avgVelocity.x / magnitude) * agent.maxSpeed;
        avgVelocity.y = (avgVelocity.y / magnitude) * agent.maxSpeed;
      }
      
      // Return steering force
      return {
        x: avgVelocity.x - agent.velocity.x,
        y: avgVelocity.y - agent.velocity.y
      };
    }

    return { x: 0, y: 0 };
  }

  /**
   * Cohesion: steer to move toward the average position of local flockmates
   */
  private calculateCohesion(agent: Agent, neighbors: Agent[]): { x: number; y: number } {
    const center = { x: 0, y: 0 };
    let count = 0;

    for (const neighbor of neighbors) {
      const distance = this.calculateDistance(agent.position, neighbor.position);
      
      if (distance < this.parameters.cohesionRadius) {
        center.x += neighbor.position.x;
        center.y += neighbor.position.y;
        count++;
      }
    }

    if (count > 0) {
      center.x /= count;
      center.y /= count;
      
      // Seek towards center
      const desired = {
        x: center.x - agent.position.x,
        y: center.y - agent.position.y
      };
      
      const magnitude = Math.sqrt(desired.x ** 2 + desired.y ** 2);
      if (magnitude > 0) {
        desired.x = (desired.x / magnitude) * agent.maxSpeed;
        desired.y = (desired.y / magnitude) * agent.maxSpeed;
      }
      
      return {
        x: desired.x - agent.velocity.x,
        y: desired.y - agent.velocity.y
      };
    }

    return { x: 0, y: 0 };
  }

  /**
   * Obstacle avoidance using potential fields
   */
  private calculateObstacleAvoidance(agent: Agent): { x: number; y: number } {
    const force = { x: 0, y: 0 };

    for (const obstacle of this.environment.obstacles) {
      const distance = this.calculateDistance(agent.position, obstacle.position);
      const minDistance = obstacle.avoidanceRadius + agent.radius;

      if (distance < minDistance) {
        const diff = {
          x: agent.position.x - obstacle.position.x,
          y: agent.position.y - obstacle.position.y
        };

        if (distance > 0) {
          const strength = (minDistance - distance) / minDistance;
          force.x += (diff.x / distance) * strength * agent.maxForce;
          force.y += (diff.y / distance) * strength * agent.maxForce;
        } else {
          // Emergency avoidance for overlapping cases
          force.x += (Math.random() - 0.5) * agent.maxForce * 2;
          force.y += (Math.random() - 0.5) * agent.maxForce * 2;
        }
      }
    }

    return force;
  }

  /**
   * Boundary forces to keep agents within environment
   */
  private calculateBoundaryForce(agent: Agent): { x: number; y: number } {
    const force = { x: 0, y: 0 };
    const margin = 50; // Distance from boundary to apply force

    if (agent.position.x < margin) {
      force.x += (margin - agent.position.x) / margin * agent.maxForce;
    } else if (agent.position.x > this.environment.width - margin) {
      force.x -= (agent.position.x - (this.environment.width - margin)) / margin * agent.maxForce;
    }

    if (agent.position.y < margin) {
      force.y += (margin - agent.position.y) / margin * agent.maxForce;
    } else if (agent.position.y > this.environment.height - margin) {
      force.y -= (agent.position.y - (this.environment.height - margin)) / margin * agent.maxForce;
    }

    return force;
  }

  /**
   * Predator avoidance
   */
  private calculatePredatorAvoidance(agent: Agent): { x: number; y: number } {
    const force = { x: 0, y: 0 };

    if (!this.environment.predators) return force;

    for (const predator of this.environment.predators) {
      const distance = this.calculateDistance(agent.position, predator.position);
      const avoidanceRadius = this.parameters.predatorAvoidanceRadius || 100;

      if (distance < avoidanceRadius) {
        const diff = {
          x: agent.position.x - predator.position.x,
          y: agent.position.y - predator.position.y
        };

        if (distance > 0) {
          const strength = (avoidanceRadius - distance) / avoidanceRadius;
          force.x += (diff.x / distance) * strength * agent.maxForce * 3;
          force.y += (diff.y / distance) * strength * agent.maxForce * 3;
        }
      }
    }

    return force;
  }

  /**
   * Random noise for natural movement
   */
  private calculateNoise(): { x: number; y: number } {
    return {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2
    };
  }

  /**
   * Handle boundary conditions
   */
  private handleBoundaries(agent: Agent): void {
    switch (this.environment.boundaries) {
      case 'wrap':
        if (agent.position.x < 0) agent.position.x = this.environment.width;
        if (agent.position.x > this.environment.width) agent.position.x = 0;
        if (agent.position.y < 0) agent.position.y = this.environment.height;
        if (agent.position.y > this.environment.height) agent.position.y = 0;
        break;

      case 'reflect':
        if (agent.position.x < 0 || agent.position.x > this.environment.width) {
          agent.velocity.x *= -1;
          agent.position.x = Math.max(0, Math.min(this.environment.width, agent.position.x));
        }
        if (agent.position.y < 0 || agent.position.y > this.environment.height) {
          agent.velocity.y *= -1;
          agent.position.y = Math.max(0, Math.min(this.environment.height, agent.position.y));
        }
        break;

      case 'absorb':
        agent.position.x = Math.max(0, Math.min(this.environment.width, agent.position.x));
        agent.position.y = Math.max(0, Math.min(this.environment.height, agent.position.y));
        break;
    }
  }

  private calculateDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  }
}

/**
 * Particle Swarm Optimization Algorithm
 */
export class ParticleSwarmOptimization {
  private particles: Agent[];
  private globalBest: { position: { x: number; y: number }; fitness: number };
  private parameters: {
    inertiaWeight: number;
    cognitiveWeight: number;
    socialWeight: number;
    maxVelocity: number;
  };

  constructor(
    particleCount: number,
    searchSpace: { min: { x: number; y: number }; max: { x: number; y: number } },
    parameters?: Partial<typeof this.parameters>
  ) {
    this.parameters = {
      inertiaWeight: 0.7,
      cognitiveWeight: 1.4,
      socialWeight: 1.4,
      maxVelocity: 10,
      ...parameters
    };

    this.particles = this.initializeParticles(particleCount, searchSpace);
    this.globalBest = { position: { x: 0, y: 0 }, fitness: -Infinity };
    
    logger.info('ParticleSwarmOptimization initialized', {
      particleCount,
      searchSpace,
      parameters: this.parameters
    });
  }

  private initializeParticles(
    count: number, 
    searchSpace: { min: { x: number; y: number }; max: { x: number; y: number } }
  ): Agent[] {
  return Array.from({ length: count }, (_, i) => ({
      id: `particle_${i}`,
      position: {
        x: Math.random() * (searchSpace.max.x - searchSpace.min.x) + searchSpace.min.x,
        y: Math.random() * (searchSpace.max.y - searchSpace.min.y) + searchSpace.min.y
      },
      velocity: {
        x: (Math.random() - 0.5) * 2 * this.parameters.maxVelocity,
        y: (Math.random() - 0.5) * 2 * this.parameters.maxVelocity
      },
      acceleration: { x: 0, y: 0 },
      orientation: 0,
      mass: 1,
      radius: 2,
      maxSpeed: this.parameters.maxVelocity,
      maxForce: 10,
      neighbors: [],
      metadata: {
        personalBest: { position: { x: 0, y: 0 }, fitness: -Infinity }
      } satisfies AgentMetadata
    }));
  }

  /**
   * Update particles for one optimization iteration
   */
  updateOptimization(fitnessFunction: (position: { x: number; y: number }) => number): Agent[] {
    // Evaluate fitness and update personal/global bests
    for (const particle of this.particles) {
      const fitness = fitnessFunction(particle.position);

      // Ensure metadata structure exists
      if (!particle.metadata) {
        particle.metadata = { personalBest: { position: { ...particle.position }, fitness: -Infinity } };
      } else if (!particle.metadata.personalBest) {
        particle.metadata.personalBest = { position: { ...particle.position }, fitness: -Infinity };
      }

      const personalBest = particle.metadata.personalBest!;

      // Update personal best
      if (fitness > personalBest.fitness) {
        particle.metadata.personalBest = { position: { ...particle.position }, fitness };
      }

      // Update global best
      if (fitness > this.globalBest.fitness) {
        this.globalBest = {
          position: { ...particle.position },
          fitness
        };
      }
    }

    // Update velocities and positions
    for (const particle of this.particles) {
      const personal = particle.metadata?.personalBest?.position ?? { x: particle.position.x, y: particle.position.y };
      const global = this.globalBest.position;

      // Update velocity components
      particle.velocity.x = this.parameters.inertiaWeight * particle.velocity.x +
        this.parameters.cognitiveWeight * Math.random() * (personal.x - particle.position.x) +
        this.parameters.socialWeight * Math.random() * (global.x - particle.position.x);

      particle.velocity.y = this.parameters.inertiaWeight * particle.velocity.y +
        this.parameters.cognitiveWeight * Math.random() * (personal.y - particle.position.y) +
        this.parameters.socialWeight * Math.random() * (global.y - particle.position.y);

      // Limit velocity
      const velocityMag = Math.sqrt(particle.velocity.x ** 2 + particle.velocity.y ** 2);
      if (velocityMag > this.parameters.maxVelocity) {
        particle.velocity.x = (particle.velocity.x / velocityMag) * this.parameters.maxVelocity;
        particle.velocity.y = (particle.velocity.y / velocityMag) * this.parameters.maxVelocity;
      }

      // Update position
      particle.position.x += particle.velocity.x;
      particle.position.y += particle.velocity.y;
    }

    return this.particles;
  }

  getGlobalBest() {
    return this.globalBest;
  }
}

/**
 * Utility functions for swarm algorithms
 */
export const SwarmUtils = {
  /**
   * Create a flock of agents with random positions
   */
  createFlock(count: number, bounds: { width: number; height: number }): Agent[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `agent_${i}`,
      position: {
        x: Math.random() * bounds.width,
        y: Math.random() * bounds.height
      },
      velocity: {
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4
      },
      acceleration: { x: 0, y: 0 },
      orientation: Math.random() * 2 * Math.PI,
      mass: 1,
      radius: 3,
      maxSpeed: 4,
      maxForce: 0.5,
      neighbors: [],
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      trail: []
    }));
  },

  /**
   * Default swarm parameters for different behaviors
   */
  presetParameters: {
    tight: (): SwarmParameters => ({
      separationRadius: 15,
      alignmentRadius: 30,
      cohesionRadius: 30,
      separationWeight: 2.0,
      alignmentWeight: 1.0,
      cohesionWeight: 1.0,
      maxSpeed: 3,
      maxForce: 0.5
    }),

    loose: (): SwarmParameters => ({
      separationRadius: 25,
      alignmentRadius: 50,
      cohesionRadius: 50,
      separationWeight: 1.0,
      alignmentWeight: 1.5,
      cohesionWeight: 1.5,
      maxSpeed: 4,
      maxForce: 0.3
    }),

    chaotic: (): SwarmParameters => ({
      separationRadius: 10,
      alignmentRadius: 20,
      cohesionRadius: 20,
      separationWeight: 3.0,
      alignmentWeight: 0.5,
      cohesionWeight: 0.5,
      maxSpeed: 6,
      maxForce: 1.0,
      noiseLevel: 0.3
    })
  },

  /**
   * Performance metrics for swarm analysis
   */
  calculateMetrics(agents: Agent[]): {
    averageSpeed: number;
    cohesion: number;
    alignment: number;
    separation: number;
    centerOfMass: { x: number; y: number };
  } {
    const n = agents.length;
  let totalSpeed = 0; // total speed accumulator
  const centerOfMass = { x: 0, y: 0 };
  const avgVelocity = { x: 0, y: 0 };

    // Calculate basic metrics
    for (const agent of agents) {
      const speed = Math.sqrt(agent.velocity.x ** 2 + agent.velocity.y ** 2);
      totalSpeed += speed;
      centerOfMass.x += agent.position.x;
      centerOfMass.y += agent.position.y;
      avgVelocity.x += agent.velocity.x;
      avgVelocity.y += agent.velocity.y;
    }

    centerOfMass.x /= n;
    centerOfMass.y /= n;
    avgVelocity.x /= n;
    avgVelocity.y /= n;

    // Calculate cohesion (inverse of average distance from center)
    let totalDistanceFromCenter = 0;
    for (const agent of agents) {
      const dx = agent.position.x - centerOfMass.x;
      const dy = agent.position.y - centerOfMass.y;
      totalDistanceFromCenter += Math.sqrt(dx * dx + dy * dy);
    }
    const cohesion = n / (totalDistanceFromCenter + 1);

    // Calculate alignment (how aligned velocities are)
    const avgSpeed = Math.sqrt(avgVelocity.x ** 2 + avgVelocity.y ** 2);
    const alignment = avgSpeed / (totalSpeed / n + 0.001);

    // Calculate separation (average distance between neighbors)
    let totalSeparation = 0;
    let separationCount = 0;
    for (let i = 0; i < n; i++) {
      const ai = agents[i];
      if (!ai) continue;
      for (let j = i + 1; j < n; j++) {
        const aj = agents[j];
        if (!aj) continue;
        const dx = ai.position.x - aj.position.x;
        const dy = ai.position.y - aj.position.y;
        totalSeparation += Math.sqrt(dx * dx + dy * dy);
        separationCount++;
      }
    }

    return {
      averageSpeed: totalSpeed / n,
      cohesion,
      alignment,
      separation: separationCount > 0 ? totalSeparation / separationCount : 0,
      centerOfMass
    };
  }
};