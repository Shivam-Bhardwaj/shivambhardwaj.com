# 🧠 Robotics Algorithms

Explore the core algorithms powering autonomous systems, from path planning to sensor fusion, with interactive demonstrations and production-proven implementations.

## 🎯 Algorithm Categories

### 🗺️ SLAM (Simultaneous Localization and Mapping)

SLAM enables robots to build maps of unknown environments while simultaneously tracking their location within those maps.

#### Extended Kalman Filter SLAM

```python
class EKF_SLAM:
    def __init__(self, initial_pose, process_noise, measurement_noise):
        self.state = initial_pose  # [x, y, theta]
        self.landmarks = {}
        self.P = np.eye(3) * 0.1  # Covariance matrix
        self.Q = process_noise    # Process noise
        self.R = measurement_noise # Measurement noise
    
    def predict(self, control_input, dt):
        """Prediction step using odometry"""
        v, omega = control_input
        
        # Motion model
        x, y, theta = self.state
        self.state = np.array([
            x + v * np.cos(theta) * dt,
            y + v * np.sin(theta) * dt,
            theta + omega * dt
        ])
        
        # Jacobian of motion model
        F = np.array([
            [1, 0, -v * np.sin(theta) * dt],
            [0, 1,  v * np.cos(theta) * dt],
            [0, 0,  1]
        ])
        
        # Update covariance
        self.P = F @ self.P @ F.T + self.Q
    
    def update(self, observations):
        """Update step using sensor measurements"""
        for landmark_id, measurement in observations:
            if landmark_id not in self.landmarks:
                # Initialize new landmark
                self.initialize_landmark(landmark_id, measurement)
            else:
                # Update existing landmark
                self.update_landmark(landmark_id, measurement)
    
    def initialize_landmark(self, landmark_id, measurement):
        """Add new landmark to map"""
        range_meas, bearing_meas = measurement
        x, y, theta = self.state
        
        # Convert polar to cartesian
        lx = x + range_meas * np.cos(theta + bearing_meas)
        ly = y + range_meas * np.sin(theta + bearing_meas)
        
        self.landmarks[landmark_id] = np.array([lx, ly])
```

#### Particle Filter SLAM

```typescript
class ParticleFilterSLAM {
  private particles: Particle[];
  private numParticles: number = 100;
  private resamplingThreshold: number = 50;
  
  constructor(initialPose: Pose, numParticles: number = 100) {
    this.numParticles = numParticles;
    this.initializeParticles(initialPose);
  }
  
  predict(odometry: OdometryReading) {
    this.particles.forEach(particle => {
      // Add noise to odometry
      const noisyOdometry = this.addOdometryNoise(odometry);
      
      // Update particle pose
      particle.pose = this.motionModel(particle.pose, noisyOdometry);
    });
  }
  
  update(sensorReadings: SensorReading[]) {
    // Calculate weights for each particle
    this.particles.forEach(particle => {
      let weight = 1.0;
      
      sensorReadings.forEach(reading => {
        const expectedReading = this.measurementModel(
          particle.pose, 
          particle.map
        );
        const likelihood = this.calculateLikelihood(reading, expectedReading);
        weight *= likelihood;
      });
      
      particle.weight = weight;
    });
    
    // Normalize weights
    this.normalizeWeights();
    
    // Update maps
    this.updateMaps(sensorReadings);
    
    // Resample if needed
    if (this.effectiveSampleSize() < this.resamplingThreshold) {
      this.resample();
    }
  }
  
  private updateMaps(sensorReadings: SensorReading[]) {
    this.particles.forEach(particle => {
      sensorReadings.forEach(reading => {
        // Update occupancy grid
        const ray = this.raycast(particle.pose, reading);
        particle.map.updateOccupancy(ray, reading.range);
      });
    });
  }
}
```

### 🛣️ Path Planning Algorithms

#### A* Pathfinding

Optimal pathfinding algorithm with heuristic guidance:

```typescript
class AStarPlanner {
  private grid: Grid;
  private heuristic: HeuristicFunction;
  
  findPath(start: Point, goal: Point): Path | null {
    const openSet = new PriorityQueue<Node>();
    const closedSet = new Set<string>();
    const cameFrom = new Map<string, Node>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();
    
    const startNode = new Node(start.x, start.y);
    gScore.set(startNode.key, 0);
    fScore.set(startNode.key, this.heuristic(start, goal));
    openSet.enqueue(startNode, fScore.get(startNode.key)!);
    
    while (!openSet.isEmpty()) {
      const current = openSet.dequeue()!;
      
      if (current.equals(goal)) {
        return this.reconstructPath(cameFrom, current);
      }
      
      closedSet.add(current.key);
      
      for (const neighbor of this.getNeighbors(current)) {
        if (closedSet.has(neighbor.key) || !this.isTraversable(neighbor)) {
          continue;
        }
        
        const tentativeGScore = gScore.get(current.key)! + 
          this.distance(current, neighbor);
        
        if (!gScore.has(neighbor.key) || 
            tentativeGScore < gScore.get(neighbor.key)!) {
          
          cameFrom.set(neighbor.key, current);
          gScore.set(neighbor.key, tentativeGScore);
          fScore.set(neighbor.key, 
            tentativeGScore + this.heuristic(neighbor, goal));
          
          if (!openSet.contains(neighbor)) {
            openSet.enqueue(neighbor, fScore.get(neighbor.key)!);
          }
        }
      }
    }
    
    return null; // No path found
  }
}
```

#### RRT (Rapidly-exploring Random Tree)

Sampling-based planner for high-dimensional spaces:

```python
class RRTPlanner:
    def __init__(self, start, goal, obstacles, bounds):
        self.start = start
        self.goal = goal
        self.obstacles = obstacles
        self.bounds = bounds
        self.tree = [start]
        self.parent = {0: None}
        self.step_size = 0.5
        self.goal_threshold = 0.1
        
    def plan(self, max_iterations=10000):
        for i in range(max_iterations):
            # Sample random point
            if random.random() < 0.1:  # Goal bias
                rand_point = self.goal
            else:
                rand_point = self.sample_random_point()
            
            # Find nearest node in tree
            nearest_idx = self.find_nearest_node(rand_point)
            nearest_node = self.tree[nearest_idx]
            
            # Extend towards random point
            new_node = self.extend(nearest_node, rand_point)
            
            # Check if collision-free
            if not self.is_collision_free(nearest_node, new_node):
                continue
                
            # Add to tree
            self.tree.append(new_node)
            self.parent[len(self.tree) - 1] = nearest_idx
            
            # Check if goal reached
            if self.distance(new_node, self.goal) < self.goal_threshold:
                return self.extract_path(len(self.tree) - 1)
        
        return None  # No path found
    
    def extend(self, from_node, to_node):
        direction = np.array(to_node) - np.array(from_node)
        distance = np.linalg.norm(direction)
        
        if distance <= self.step_size:
            return to_node
        else:
            direction_normalized = direction / distance
            new_point = np.array(from_node) + direction_normalized * self.step_size
            return new_point.tolist()
```

#### D* Lite (Dynamic A*)

Incremental pathfinding for changing environments:

```cpp
class DStarLite {
private:
    struct Node {
        int x, y;
        double g, rhs, h;
        bool operator<(const Node& other) const {
            double k1 = min(g, rhs) + h;
            double k2 = min(other.g, other.rhs) + other.h;
            return k1 > k2; // Priority queue is max-heap, we want min
        }
    };
    
    Grid grid;
    priority_queue<Node> openSet;
    Point start, goal;
    double km; // Key modifier for dynamic updates
    
public:
    Path replan() {
        while (!openSet.empty() && 
               (openSet.top() < calculateKey(start) || 
                getRHS(start) != getG(start))) {
            
            Node current = openSet.top();
            openSet.pop();
            
            if (getG(current) > getRHS(current)) {
                // Overconsistent
                setG(current, getRHS(current));
                
                for (Node& neighbor : getNeighbors(current)) {
                    updateVertex(neighbor);
                }
            } else {
                // Underconsistent
                setG(current, INFINITY);
                updateVertex(current);
                
                for (Node& neighbor : getNeighbors(current)) {
                    updateVertex(neighbor);
                }
            }
        }
        
        return extractPath();
    }
    
    void updateVertex(Node& node) {
        if (node != goal) {
            double minRHS = INFINITY;
            for (Node& neighbor : getNeighbors(node)) {
                double cost = getG(neighbor) + edgeCost(node, neighbor);
                minRHS = min(minRHS, cost);
            }
            setRHS(node, minRHS);
        }
        
        removeFromOpenSet(node);
        
        if (getG(node) != getRHS(node)) {
            openSet.push(node);
        }
    }
    
    // Handle dynamic environment changes
    void updateEdgeCost(Point u, Point v, double newCost) {
        if (u != goal) updateVertex(getNode(u));
        if (v != goal) updateVertex(getNode(v));
    }
};
```

### 🎛️ Control Systems

#### PID Controller

```typescript
class PIDController {
  private kp: number; // Proportional gain
  private ki: number; // Integral gain  
  private kd: number; // Derivative gain
  
  private integral: number = 0;
  private previousError: number = 0;
  private previousTime: number = 0;
  
  constructor(kp: number, ki: number, kd: number) {
    this.kp = kp;
    this.ki = ki;
    this.kd = kd;
  }
  
  update(setpoint: number, measurement: number, currentTime: number): number {
    const dt = currentTime - this.previousTime;
    if (dt <= 0) return 0;
    
    const error = setpoint - measurement;
    
    // Proportional term
    const P = this.kp * error;
    
    // Integral term (with windup protection)
    this.integral += error * dt;
    this.integral = this.clamp(this.integral, -100, 100);
    const I = this.ki * this.integral;
    
    // Derivative term
    const derivative = (error - this.previousError) / dt;
    const D = this.kd * derivative;
    
    // Update for next iteration
    this.previousError = error;
    this.previousTime = currentTime;
    
    const output = P + I + D;
    return this.clamp(output, -1000, 1000);
  }
  
  // Auto-tuning using Ziegler-Nichols method
  autoTune(): { kp: number; ki: number; kd: number } {
    // Step 1: Find ultimate gain and period
    let ku = 0; // Ultimate gain
    let pu = 0; // Ultimate period
    
    // Increase proportional gain until oscillation
    for (let k = 0.1; k < 100; k += 0.1) {
      const response = this.testStep(k, 0, 0);
      if (this.isOscillating(response)) {
        ku = k;
        pu = this.getPeriod(response);
        break;
      }
    }
    
    // Step 2: Calculate PID parameters
    const kp = 0.6 * ku;
    const ki = 2 * kp / pu;
    const kd = kp * pu / 8;
    
    return { kp, ki, kd };
  }
}
```

#### Model Predictive Control (MPC)

```python
class ModelPredictiveController:
    def __init__(self, model, horizon, constraints):
        self.model = model  # System dynamics model
        self.N = horizon    # Prediction horizon
        self.constraints = constraints
        self.Q = np.eye(4)  # State weight matrix
        self.R = np.eye(2)  # Input weight matrix
        
    def solve(self, current_state, reference_trajectory):
        """Solve MPC optimization problem"""
        # Decision variables: u0, u1, ..., u_{N-1}
        u_vars = cp.Variable((2, self.N))
        x_vars = cp.Variable((4, self.N + 1))
        
        # Initial condition
        constraints = [x_vars[:, 0] == current_state]
        
        # System dynamics constraints
        for k in range(self.N):
            x_next = self.model.predict(x_vars[:, k], u_vars[:, k])
            constraints.append(x_vars[:, k + 1] == x_next)
        
        # Input constraints
        for k in range(self.N):
            constraints.extend([
                u_vars[0, k] >= self.constraints['u_min'][0],
                u_vars[0, k] <= self.constraints['u_max'][0],
                u_vars[1, k] >= self.constraints['u_min'][1],
                u_vars[1, k] <= self.constraints['u_max'][1]
            ])
        
        # State constraints
        for k in range(self.N + 1):
            constraints.extend([
                x_vars[:, k] >= self.constraints['x_min'],
                x_vars[:, k] <= self.constraints['x_max']
            ])
        
        # Cost function
        cost = 0
        for k in range(self.N):
            # State tracking cost
            state_error = x_vars[:, k] - reference_trajectory[:, k]
            cost += cp.quad_form(state_error, self.Q)
            
            # Input cost
            cost += cp.quad_form(u_vars[:, k], self.R)
        
        # Terminal cost
        terminal_error = x_vars[:, -1] - reference_trajectory[:, -1]
        cost += cp.quad_form(terminal_error, self.Q * 10)
        
        # Solve optimization
        problem = cp.Problem(cp.Minimize(cost), constraints)
        problem.solve()
        
        return u_vars.value[:, 0]  # Return first control input
```

### 📡 Sensor Fusion

#### Kalman Filter

```typescript
class KalmanFilter {
  private x: Matrix;  // State vector
  private P: Matrix;  // Covariance matrix
  private F: Matrix;  // State transition model
  private H: Matrix;  // Observation model
  private Q: Matrix;  // Process noise covariance
  private R: Matrix;  // Observation noise covariance
  
  constructor(initialState: number[], initialCovariance: number[][]) {
    this.x = new Matrix([initialState]).transpose();
    this.P = new Matrix(initialCovariance);
  }
  
  predict(dt: number) {
    // Update state transition matrix with time step
    this.F.set(0, 2, dt);
    this.F.set(1, 3, dt);
    
    // Predict state: x = F * x
    this.x = this.F.multiply(this.x);
    
    // Predict covariance: P = F * P * F^T + Q
    this.P = this.F.multiply(this.P).multiply(this.F.transpose()).add(this.Q);
  }
  
  update(measurement: number[]) {
    const z = new Matrix([measurement]).transpose();
    
    // Innovation: y = z - H * x
    const y = z.subtract(this.H.multiply(this.x));
    
    // Innovation covariance: S = H * P * H^T + R
    const S = this.H.multiply(this.P).multiply(this.H.transpose()).add(this.R);
    
    // Kalman gain: K = P * H^T * S^(-1)
    const K = this.P.multiply(this.H.transpose()).multiply(S.inverse());
    
    // Update state: x = x + K * y
    this.x = this.x.add(K.multiply(y));
    
    // Update covariance: P = (I - K * H) * P
    const I = Matrix.identity(this.x.rows);
    this.P = I.subtract(K.multiply(this.H)).multiply(this.P);
  }
  
  getState(): number[] {
    return this.x.toArray().flat();
  }
  
  getCovariance(): number[][] {
    return this.P.toArray();
  }
}
```

## 🎮 Interactive Demonstrations

Experience these algorithms in real-time:

<div class="grid cards" markdown>

-   :material-map: **SLAM Visualization**
    
    Watch robots build maps while localizing
    
    [:octicons-arrow-right-24: Try SLAM Demo](/robot-test?mode=slam)

-   :material-route: **Path Planning**
    
    Compare A*, RRT, and D* algorithms
    
    [:octicons-arrow-right-24: Plan Paths](/calculators?tool=pathplanning)

-   :material-tune: **PID Tuning**
    
    Tune controller parameters interactively
    
    [:octicons-arrow-right-24: Tune PID](/calculators?tool=pid)

-   :material-combine: **Sensor Fusion**
    
    Visualize multi-sensor data integration
    
    [:octicons-arrow-right-24: Fuse Sensors](/calculators?tool=sensorfusion)

</div>

## 📊 Performance Comparisons

### Path Planning Algorithm Comparison

| Algorithm | Optimality | Completeness | Time Complexity | Space | Best For |
|-----------|------------|--------------|-----------------|--------|----------|
| **A*** | Optimal* | Complete* | O(b^d) | O(b^d) | Known static environments |
| **RRT** | Suboptimal | Probabilistically complete | O(n log n) | O(n) | High-dimensional spaces |
| **D* Lite** | Optimal* | Complete* | O(log n) per update | O(n) | Dynamic environments |
| **PRM** | Suboptimal | Probabilistically complete | O(n² log n) | O(n²) | Multi-query scenarios |

*Given admissible heuristic and discrete space

### SLAM Algorithm Comparison

| Method | Accuracy | Computation | Memory | Robustness | Production Use |
|--------|----------|-------------|---------|------------|----------------|
| **EKF-SLAM** | Medium | Low | Low | Medium | Applied Materials |
| **Particle Filter** | High | High | High | High | Saildrone vessels |
| **Graph-SLAM** | High | Medium | Medium | High | Tesla Autopilot |
| **Visual-SLAM** | Very High | Very High | High | Medium | Meta AR/VR |

## 🏭 Production Deployments

### Applied Materials - Semiconductor Manufacturing
- **SLAM**: EKF-SLAM for wafer transport robots
- **Control**: MPC for precision positioning (±0.1mm accuracy)
- **Path Planning**: A* with dynamic obstacles for factory floor navigation

### Tesla - Autonomous Vehicles  
- **Sensor Fusion**: Multi-modal Kalman filtering (camera, radar, ultrasonic)
- **Planning**: Hybrid A*/RRT for highway and urban navigation
- **Control**: Cascaded PID for longitudinal and lateral vehicle control

### Saildrone - Autonomous Vessels
- **SLAM**: Particle filter SLAM for GPS-denied navigation
- **Planning**: D* Lite for dynamic ocean current adaptation
- **Control**: Adaptive MPC for wind and wave disturbance rejection

## 📚 Implementation Resources

### Open Source Libraries
- **SLAM**: [g2o](https://github.com/RainerKuemmerle/g2o), [GTSAM](https://gtsam.org/)
- **Planning**: [OMPL](https://ompl.kavrakilab.org/), [MoveIt](https://moveit.ros.org/)
- **Control**: [Control Toolbox](https://github.com/ethz-adrl/control-toolbox)
- **Visualization**: [RViz](http://wiki.ros.org/rviz), [Gazebo](http://gazebosim.org/)

### Educational Resources
- [Probabilistic Robotics](http://probabilisticrobotics.org/) by Thrun, Burgard, Fox
- [Planning Algorithms](http://planning.cs.uiuc.edu/) by Steven LaValle  
- [Modern Robotics](http://hades.mech.northwestern.edu/index.php/Modern_Robotics) by Lynch & Park

---

Ready to implement these algorithms? [Start with the development setup](../development/setup.md) or [try the interactive demos](/calculators)!