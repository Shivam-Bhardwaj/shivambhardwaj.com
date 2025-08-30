# 🐝 Swarm Intelligence & Multi-Agent Systems

Explore advanced algorithms for coordinating multiple autonomous robots with emergent collective behaviors.

## 🎯 Overview

Swarm intelligence enables groups of simple agents to exhibit complex, intelligent behaviors through local interactions. This section covers the algorithms and techniques I've implemented in production systems for companies like Saildrone and Applied Materials.

## 🔬 Core Algorithms

### Flocking Behaviors (Craig Reynolds' Boids)

The foundation of swarm robotics, based on three simple rules that create complex emergent behaviors:

#### 1. Separation
Avoid crowding local flockmates:

```python
def separation(agent, neighbors, separation_radius=30):
    """Steer to avoid crowding local flockmates"""
    steer = Vector2D(0, 0)
    count = 0
    
    for neighbor in neighbors:
        distance = agent.position.distance_to(neighbor.position)
        if 0 < distance < separation_radius:
            # Calculate vector pointing away from neighbor
            diff = agent.position - neighbor.position
            diff.normalize()
            diff /= distance  # Weight by distance
            steer += diff
            count += 1
    
    if count > 0:
        steer /= count
        steer.normalize()
        steer *= agent.max_speed
        steer -= agent.velocity
        steer.limit(agent.max_force)
    
    return steer
```

#### 2. Alignment  
Steer towards the average heading of neighbors:

```python
def alignment(agent, neighbors, alignment_radius=60):
    """Steer towards the average heading of neighbors"""
    sum_velocity = Vector2D(0, 0)
    count = 0
    
    for neighbor in neighbors:
        distance = agent.position.distance_to(neighbor.position)
        if 0 < distance < alignment_radius:
            sum_velocity += neighbor.velocity
            count += 1
    
    if count > 0:
        sum_velocity /= count
        sum_velocity.normalize()
        sum_velocity *= agent.max_speed
        steer = sum_velocity - agent.velocity
        steer.limit(agent.max_force)
        return steer
    
    return Vector2D(0, 0)
```

#### 3. Cohesion
Steer to move toward the average position of local flockmates:

```python
def cohesion(agent, neighbors, cohesion_radius=80):
    """Steer to move toward the average position of neighbors"""
    sum_position = Vector2D(0, 0)
    count = 0
    
    for neighbor in neighbors:
        distance = agent.position.distance_to(neighbor.position)
        if 0 < distance < cohesion_radius:
            sum_position += neighbor.position
            count += 1
    
    if count > 0:
        sum_position /= count
        return seek(agent, sum_position)
    
    return Vector2D(0, 0)

def seek(agent, target):
    """Seek a specific target location"""
    desired = target - agent.position
    desired.normalize()
    desired *= agent.max_speed
    
    steer = desired - agent.velocity
    steer.limit(agent.max_force)
    return steer
```

### Advanced Swarm Behaviors

#### Formation Control

Maintain specific geometric formations while navigating:

```typescript
class FormationController {
  private formation: Formation;
  private agents: SwarmAgent[];
  
  constructor(formationType: 'line' | 'circle' | 'wedge' | 'grid') {
    this.formation = new Formation(formationType);
  }
  
  updateFormation(leader: SwarmAgent, followers: SwarmAgent[]) {
    const desiredPositions = this.formation.getPositions(
      leader.position, 
      leader.heading, 
      followers.length
    );
    
    followers.forEach((agent, index) => {
      const target = desiredPositions[index];
      const formationForce = this.seekPosition(agent, target);
      const avoidanceForce = this.avoidCollisions(agent, this.agents);
      
      agent.applyForce(formationForce.multiply(0.8));
      agent.applyForce(avoidanceForce.multiply(1.2));
    });
  }
  
  private seekPosition(agent: SwarmAgent, target: Vector2D): Vector2D {
    const desired = target.subtract(agent.position);
    const distance = desired.magnitude();
    
    // Slow down when approaching target
    if (distance < 100) {
      const m = map(distance, 0, 100, 0, agent.maxSpeed);
      desired.normalize().multiply(m);
    } else {
      desired.normalize().multiply(agent.maxSpeed);
    }
    
    const steer = desired.subtract(agent.velocity);
    return steer.limit(agent.maxForce);
  }
}
```

#### Consensus Algorithms

Achieve agreement across distributed agents:

```typescript
class ConsensusProtocol {
  private agents: SwarmAgent[];
  private consensusValue: number = 0;
  private convergenceThreshold: number = 0.01;
  
  // Average consensus using gossip protocol
  updateConsensus(iterations: number = 1) {
    for (let i = 0; i < iterations; i++) {
      this.agents.forEach(agent => {
        const neighbors = this.getNeighbors(agent);
        if (neighbors.length > 0) {
          const avgValue = neighbors.reduce((sum, neighbor) => 
            sum + neighbor.consensusValue, agent.consensusValue
          ) / (neighbors.length + 1);
          
          agent.consensusValue += 0.1 * (avgValue - agent.consensusValue);
        }
      });
    }
  }
  
  // Check if consensus has been reached
  hasConverged(): boolean {
    const values = this.agents.map(a => a.consensusValue);
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((sum, val) => 
      sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance) < this.convergenceThreshold;
  }
}
```

## 🌊 Emergent Behaviors

### Collective Decision Making

Swarms can make decisions without centralized control:

```typescript
class CollectiveDecisionMaking {
  // Site selection using scout-recruit mechanism (inspired by honeybees)
  selectSite(scouts: SwarmAgent[], sites: Site[]): Site {
    const siteQuality = new Map<Site, number>();
    const siteVotes = new Map<Site, number>();
    
    // Scouts evaluate sites
    scouts.forEach(scout => {
      const nearestSite = this.findNearestSite(scout, sites);
      const quality = this.evaluateSite(nearestSite);
      siteQuality.set(nearestSite, quality);
    });
    
    // Voting process based on quality
    for (let round = 0; round < 100; round++) {
      scouts.forEach(scout => {
        const supportedSite = scout.supportedSite;
        const quality = siteQuality.get(supportedSite) || 0;
        
        // Probability of recruiting others
        const recruitmentProb = quality / 100;
        
        if (Math.random() < recruitmentProb) {
          // Find uncommitted scout
          const target = scouts.find(s => !s.supportedSite);
          if (target) {
            target.supportedSite = supportedSite;
            siteVotes.set(supportedSite, (siteVotes.get(supportedSite) || 0) + 1);
          }
        }
      });
      
      // Check for quorum
      for (const [site, votes] of siteVotes) {
        if (votes > scouts.length * 0.7) {  // 70% threshold
          return site;
        }
      }
    }
    
    // Return most voted site
    return Array.from(siteVotes.entries())
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }
}
```

### Adaptive Network Topology

Dynamic communication networks that adapt to task requirements:

```typescript
class AdaptiveNetwork {
  private agents: SwarmAgent[];
  private connections: Map<string, Set<string>>;
  
  // Adapt network topology based on task and environment
  adaptTopology(taskType: 'exploration' | 'formation' | 'consensus') {
    switch (taskType) {
      case 'exploration':
        this.createSmallWorldNetwork(); // Balance local and global connections
        break;
      case 'formation':
        this.createNearestNeighborNetwork(); // Local coordination
        break;
      case 'consensus':
        this.createRandomNetwork(); // Fast information spread
        break;
    }
  }
  
  private createSmallWorldNetwork() {
    const k = 4; // Initial degree
    const beta = 0.3; // Rewiring probability
    
    this.agents.forEach((agent, i) => {
      // Connect to k nearest neighbors
      for (let j = 1; j <= k/2; j++) {
        const neighbor1 = this.agents[(i + j) % this.agents.length];
        const neighbor2 = this.agents[(i - j + this.agents.length) % this.agents.length];
        
        // Rewire with probability beta
        if (Math.random() < beta) {
          const randomNeighbor = this.agents[Math.floor(Math.random() * this.agents.length)];
          this.addConnection(agent.id, randomNeighbor.id);
        } else {
          this.addConnection(agent.id, neighbor1.id);
          this.addConnection(agent.id, neighbor2.id);
        }
      }
    });
  }
}
```

## 🏭 Production Applications

### Autonomous Ocean Data Collection (Saildrone)

Deployed swarm algorithms for coordinating multiple autonomous vessels:

```typescript
class OceanSwarmController {
  private vessels: AutonomousVessel[];
  private missionArea: GeoPolygon;
  private dataCollectionPoints: GeoPoint[];
  
  // Coordinate multiple vessels for efficient ocean data collection
  planMission() {
    // Divide mission area using Voronoi partitioning
    const voronoiCells = this.computeVoronoiPartition(
      this.vessels.map(v => v.position),
      this.missionArea
    );
    
    // Assign each vessel to its cell
    this.vessels.forEach((vessel, index) => {
      vessel.assignedArea = voronoiCells[index];
      vessel.dataPoints = this.dataCollectionPoints.filter(point =>
        voronoiCells[index].contains(point)
      );
    });
    
    // Optimize collection routes within each cell
    this.vessels.forEach(vessel => {
      vessel.route = this.optimizeTSP(vessel.dataPoints);
    });
  }
  
  // Dynamic reallocation when vessel fails
  handleVesselFailure(failedVesselId: string) {
    const failedVessel = this.vessels.find(v => v.id === failedVesselId);
    if (!failedVessel) return;
    
    // Redistribute failed vessel's tasks
    const nearestVessels = this.findNearestVessels(failedVessel.position, 2);
    const redistributedPoints = this.redistribute(
      failedVessel.dataPoints, 
      nearestVessels
    );
    
    nearestVessels.forEach((vessel, index) => {
      vessel.dataPoints.push(...redistributedPoints[index]);
      vessel.route = this.optimizeTSP(vessel.dataPoints);
    });
  }
}
```

### Manufacturing Robot Coordination (Applied Materials)

Swarm coordination for semiconductor manufacturing:

```typescript
class ManufacturingSwarm {
  private robots: ManufacturingRobot[];
  private workstations: Workstation[];
  private tasks: Task[];
  
  // Distributed task allocation using market-based approach
  allocateTasks() {
    while (this.tasks.length > 0) {
      const taskBids = new Map<Task, Map<string, number>>();
      
      // Robots bid on available tasks
      this.tasks.forEach(task => {
        const bids = new Map<string, number>();
        
        this.robots.forEach(robot => {
          if (robot.canPerform(task)) {
            const cost = this.calculateTaskCost(robot, task);
            const utility = task.priority / cost;
            bids.set(robot.id, utility);
          }
        });
        
        taskBids.set(task, bids);
      });
      
      // Award tasks to highest bidders
      taskBids.forEach((bids, task) => {
        if (bids.size > 0) {
          const winner = Array.from(bids.entries())
            .reduce((a, b) => a[1] > b[1] ? a : b);
          
          const robot = this.robots.find(r => r.id === winner[0]);
          robot?.assignTask(task);
          this.tasks = this.tasks.filter(t => t !== task);
        }
      });
    }
  }
  
  // Collision-free path planning for multiple robots
  planPaths() {
    const paths = new Map<string, Path>();
    
    // Prioritized planning
    this.robots
      .sort((a, b) => a.priority - b.priority)
      .forEach(robot => {
        const existingPaths = Array.from(paths.values());
        const path = this.planCollisionFreePath(
          robot.currentPosition,
          robot.targetPosition,
          existingPaths,
          robot.timeWindow
        );
        paths.set(robot.id, path);
      });
    
    return paths;
  }
}
```

## 📊 Performance Metrics

### Real-Time Monitoring

Track swarm performance with key metrics:

```typescript
interface SwarmMetrics {
  // Cohesion metrics
  averageDistance: number;
  formationMaintenance: number; // 0-1 score
  
  // Efficiency metrics  
  taskCompletionRate: number;
  energyConsumption: number;
  pathOptimality: number;
  
  // Robustness metrics
  failureTolerance: number;
  recoveryTime: number;
  
  // Communication metrics
  messageLatency: number;
  networkConnectivity: number;
}

class SwarmMonitor {
  calculateMetrics(swarm: SwarmAgent[]): SwarmMetrics {
    return {
      averageDistance: this.calculateAverageDistance(swarm),
      formationMaintenance: this.assessFormationQuality(swarm),
      taskCompletionRate: this.getCompletionRate(swarm),
      energyConsumption: this.getTotalEnergyUsage(swarm),
      pathOptimality: this.assessPathQuality(swarm),
      failureTolerance: this.testFailureScenarios(swarm),
      recoveryTime: this.measureRecoveryTime(swarm),
      messageLatency: this.getAverageLatency(swarm),
      networkConnectivity: this.calculateConnectivity(swarm)
    };
  }
}
```

## 🎮 Interactive Demo

Experience swarm intelligence in action:

<div class="grid cards" markdown>

-   :material-play-circle: **Live Swarm Demo**
    
    Watch flocking behaviors and formation control
    
    [:octicons-arrow-right-24: Open Simulation](/swarm)

-   :material-cog: **Parameter Tuning**
    
    Adjust separation, alignment, and cohesion weights
    
    [:octicons-arrow-right-24: Tune Parameters](/swarm?mode=tuning)

-   :material-chart-line: **Performance Analysis**
    
    Monitor real-time swarm metrics and efficiency
    
    [:octicons-arrow-right-24: View Metrics](/swarm?panel=metrics)

-   :material-school: **Educational Mode**
    
    Step-by-step algorithm explanation
    
    [:octicons-arrow-right-24: Learn Algorithms](/swarm?mode=education)

</div>

## 📚 Further Reading

### Academic Papers
- Reynolds, C. W. (1987). "Flocks, herds and schools: A distributed behavioral model"
- Vicsek, T. (1995). "Novel type of phase transition in a system of self-driven particles"
- Olfati-Saber, R. (2006). "Flocking for multi-agent dynamic systems"

### My Publications
- Bhardwaj, S. et al. (2023). "Distributed consensus in maritime autonomous systems"
- Bhardwaj, S. et al. (2022). "Swarm coordination for industrial automation"

### Industry Applications
- **Precision Agriculture**: Coordinated drone swarms for crop monitoring
- **Search and Rescue**: Multi-robot coordination for disaster response  
- **Smart Manufacturing**: Autonomous factory robot coordination
- **Environmental Monitoring**: Sensor network deployment and maintenance