# Robotics Interaction System Guide

## Overview

The Robotics Interaction System transforms the Antimony Labs portfolio into an immersive robotics demonstration platform. Users can interact with 3D robot models, manipulate articulated joints, trigger automated sequences, and experience real-time physics simulations that showcase advanced robotics engineering principles.

## Core Technologies

### 3D Graphics Stack
- **Three.js 0.180.0**: Core 3D rendering engine
- **React Three Fiber 8.17.10**: React integration layer
- **Cannon.js**: Physics simulation engine
- **Three-stdlib**: Extended utilities and loaders
- **R3F Drei**: Common 3D components and helpers

### Physics Engine Integration
- **Collision Detection**: Optimized spatial partitioning with octree
- **Rigid Body Dynamics**: Mass, inertia, and force calculations
- **Constraint Systems**: Joint limits, spring dampers, and friction
- **Performance Optimization**: Level-of-detail physics and culling

### Input Handling Systems
- **Mouse Interaction**: Ray casting for object selection and manipulation
- **Touch Support**: Multi-touch gestures for mobile robotics control
- **Keyboard Controls**: Precision joint control and automation triggers
- **Gamepad API**: Optional controller support for immersive interaction

## Robot Component Architecture

### Base Robot Structure
```typescript
interface RobotComponent {
  // Core properties
  id: string;
  name: string;
  type: RobotType;
  position: Vector3;
  rotation: Euler;
  
  // Physical properties
  mass: number;
  inertia: Matrix3;
  boundingBox: Box3;
  collisionMesh: Mesh;
  
  // Articulation system
  joints: Joint[];
  links: Link[];
  endEffectors: EndEffector[];
  
  // Control system
  controller: RobotController;
  sensors: Sensor[];
  actuators: Actuator[];
  
  // Animation and interaction
  animations: RobotAnimation[];
  interactionHandlers: InteractionHandler[];
  
  // Performance optimization
  lodLevels: LODLevel[];
  cullingStrategy: CullingStrategy;
}

interface Joint {
  id: string;
  type: 'revolute' | 'prismatic' | 'fixed' | 'spherical';
  parentLink: string;
  childLink: string;
  axis: Vector3;
  limits: JointLimits;
  damping: number;
  friction: number;
  currentValue: number;
  targetValue: number;
}

interface Link {
  id: string;
  geometry: BufferGeometry;
  material: Material;
  mass: number;
  centerOfMass: Vector3;
  inertiaMatrix: Matrix3;
  visualMesh: Mesh;
  collisionMesh: Mesh;
}
```

### Supported Robot Types

#### Articulated Manipulators
- **6-DOF Industrial Arms**: Precise positioning and path planning
- **7-DOF Collaborative Robots**: Redundant kinematics with collision avoidance
- **Dual-Arm Systems**: Coordinated manipulation tasks
- **Mobile Manipulators**: Combined locomotion and manipulation

#### Mobile Platforms
- **Differential Drive**: Two-wheel mobile robots with turning capabilities
- **Omnidirectional**: Holonomic motion with mecanum or omni-wheels
- **Tracked Vehicles**: High-traction platforms for rough terrain
- **Legged Robots**: Quadruped and biped locomotion systems

#### Specialized Systems
- **Drone Platforms**: Multi-rotor flight dynamics and control
- **Underwater ROVs**: Buoyancy control and underwater manipulation
- **Humanoid Robots**: Full-body articulation and balance control
- **Modular Systems**: Reconfigurable robot architectures

## Interaction Modes

### Direct Manipulation
Users can directly interact with robot components through:

#### Joint Control
```typescript
class JointController {
  private joint: Joint;
  private dragState: DragState | null = null;
  
  onPointerDown = (event: PointerEvent, intersect: Intersection) => {
    this.dragState = {
      startPosition: intersect.point,
      startValue: this.joint.currentValue,
      axis: this.joint.axis,
      sensitivity: this.calculateSensitivity(event)
    };
  };
  
  onPointerMove = (event: PointerEvent) => {
    if (!this.dragState) return;
    
    const delta = this.calculateDelta(event, this.dragState);
    const newValue = this.clampToLimits(
      this.dragState.startValue + delta * this.dragState.sensitivity
    );
    
    this.setJointTarget(newValue);
    this.updateVisualFeedback(newValue);
  };
  
  private calculateSensitivity(event: PointerEvent): number {
    // Adjust sensitivity based on input device and joint type
    const basesensitivity = this.joint.type === 'revolute' ? 0.01 : 0.001;
    const deviceMultiplier = event.pointerType === 'touch' ? 2.0 : 1.0;
    return baseMatrix * deviceMultiplier;
  }
}
```

#### End Effector Positioning
```typescript
class EndEffectorController {
  private robot: RobotComponent;
  private ikSolver: InverseKinematicsSolver;
  
  setTargetPosition(position: Vector3, orientation?: Quaternion) {
    const solution = this.ikSolver.solve({
      targetPosition: position,
      targetOrientation: orientation || this.getCurrentOrientation(),
      constraints: this.getConstraints()
    });
    
    if (solution.success) {
      this.animateToConfiguration(solution.jointAngles);
      this.showReachabilityVisualization(true);
    } else {
      this.showReachabilityVisualization(false);
      this.displayAlternativeSolutions(solution.alternatives);
    }
  }
  
  private animateToConfiguration(targetAngles: number[]) {
    this.robot.joints.forEach((joint, index) => {
      gsap.to(joint, {
        currentValue: targetAngles[index],
        duration: this.calculateAnimationDuration(joint.currentValue, targetAngles[index]),
        ease: 'power2.inOut',
        onUpdate: () => this.updateRobotPose()
      });
    });
  }
}
```

### Automated Demonstrations

#### Pre-programmed Sequences
```typescript
interface RobotSequence {
  id: string;
  name: string;
  description: string;
  keyframes: Keyframe[];
  duration: number;
  looping: boolean;
  interruptible: boolean;
}

interface Keyframe {
  time: number;
  jointValues: Record<string, number>;
  endEffectorPose?: Pose;
  metadata?: {
    description: string;
    highlightedComponents: string[];
    cameraAngle?: CameraPosition;
  };
}

class SequencePlayer {
  private sequence: RobotSequence;
  private currentTime: number = 0;
  private playing: boolean = false;
  
  play() {
    this.playing = true;
    this.animate();
  }
  
  private animate() {
    if (!this.playing) return;
    
    const progress = this.currentTime / this.sequence.duration;
    const currentKeyframe = this.getCurrentKeyframe(progress);
    const nextKeyframe = this.getNextKeyframe(progress);
    
    if (currentKeyframe && nextKeyframe) {
      const interpolatedPose = this.interpolateKeyframes(
        currentKeyframe,
        nextKeyframe,
        this.getInterpolationFactor(progress)
      );
      
      this.applyPoseToRobot(interpolatedPose);
      this.updateUI(currentKeyframe.metadata);
    }
    
    this.currentTime += 16; // 60 FPS
    
    if (this.currentTime >= this.sequence.duration) {
      if (this.sequence.looping) {
        this.currentTime = 0;
      } else {
        this.stop();
      }
    }
    
    requestAnimationFrame(() => this.animate());
  }
}
```

#### Interactive Demonstrations
- **Pick and Place**: Object manipulation showcasing precision control
- **Path Following**: Demonstrate trajectory planning and execution
- **Obstacle Avoidance**: Real-time collision avoidance algorithms
- **Collaborative Tasks**: Multi-robot coordination examples

### Physics Simulation Features

#### Collision Detection System
```typescript
class CollisionSystem {
  private spatialHash: SpatialHash;
  private collisionPairs: Set<CollisionPair>;
  
  update(deltaTime: number) {
    this.spatialHash.clear();
    this.populateSpatialHash();
    this.detectCollisions();
    this.resolveCollisions(deltaTime);
  }
  
  private detectCollisions() {
    const potentialPairs = this.spatialHash.getBroadPhasePairs();
    
    for (const pair of potentialPairs) {
      const collision = this.narrowPhaseDetection(pair.bodyA, pair.bodyB);
      if (collision) {
        this.collisionPairs.add({
          bodyA: pair.bodyA,
          bodyB: pair.bodyB,
          contactPoints: collision.contacts,
          normal: collision.normal,
          penetrationDepth: collision.depth
        });
      }
    }
  }
  
  private resolveCollisions(deltaTime: number) {
    for (const collision of this.collisionPairs) {
      this.applyCollisionResponse(collision, deltaTime);
      this.triggerCollisionEvents(collision);
    }
  }
}
```

#### Dynamic Response System
```typescript
interface PhysicsProperties {
  mass: number;
  restitution: number; // Bounciness
  friction: number;
  linearDamping: number;
  angularDamping: number;
  gravityScale: number;
}

class RigidBodyController {
  private body: RigidBody;
  private properties: PhysicsProperties;
  
  applyForce(force: Vector3, worldPoint?: Vector3) {
    if (worldPoint) {
      const localPoint = this.worldToLocal(worldPoint);
      this.body.applyForceAtPoint(force, localPoint);
    } else {
      this.body.applyForce(force);
    }
    
    // Update visual representation
    this.syncVisualToPhysics();
  }
  
  applyTorque(torque: Vector3) {
    this.body.applyTorque(torque);
    this.syncVisualToPhysics();
  }
  
  private syncVisualToPhysics() {
    if (this.visualMesh) {
      this.visualMesh.position.copy(this.body.position);
      this.visualMesh.quaternion.copy(this.body.quaternion);
    }
  }
}
```

## User Interface Integration

### 3D UI Components
```typescript
const RobotControlPanel: React.FC<{ robot: RobotComponent }> = ({ robot }) => {
  const [selectedJoint, setSelectedJoint] = useState<Joint | null>(null);
  const [controlMode, setControlMode] = useState<'joint' | 'cartesian'>('joint');
  
  return (
    <Html position={[2, 2, 0]} transform occlude>
      <div className="robot-control-panel">
        <ControlModeSelector 
          mode={controlMode} 
          onModeChange={setControlMode} 
        />
        
        {controlMode === 'joint' && (
          <JointControlInterface 
            joints={robot.joints}
            selectedJoint={selectedJoint}
            onJointSelect={setSelectedJoint}
          />
        )}
        
        {controlMode === 'cartesian' && (
          <CartesianControlInterface 
            robot={robot}
            onTargetChange={handleTargetChange}
          />
        )}
        
        <SequenceControls 
          sequences={robot.animations}
          onSequenceStart={handleSequenceStart}
        />
      </div>
    </Html>
  );
};
```

### Visual Feedback Systems
```typescript
class VisualFeedback {
  private robot: RobotComponent;
  private highlightMaterial: Material;
  private trajectoryLine: Line;
  
  highlightComponent(componentId: string, color: Color = new Color(0x00ff00)) {
    const component = this.robot.getComponent(componentId);
    if (component && component.visualMesh) {
      const originalMaterial = component.visualMesh.material;
      
      // Create highlight material
      this.highlightMaterial = new MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.7
      });
      
      component.visualMesh.material = this.highlightMaterial;
      
      // Auto-remove after delay
      setTimeout(() => {
        component.visualMesh.material = originalMaterial;
      }, 2000);
    }
  }
  
  showTrajectory(waypoints: Vector3[], color: Color = new Color(0x0088ff)) {
    const geometry = new BufferGeometry().setFromPoints(waypoints);
    const material = new LineBasicMaterial({ color, linewidth: 3 });
    
    if (this.trajectoryLine) {
      this.robot.scene.remove(this.trajectoryLine);
    }
    
    this.trajectoryLine = new Line(geometry, material);
    this.robot.scene.add(this.trajectoryLine);
  }
  
  showWorkspaceVisualization() {
    const workspaceGeometry = this.generateWorkspaceGeometry();
    const workspaceMaterial = new MeshBasicMaterial({
      color: 0x444444,
      transparent: true,
      opacity: 0.1,
      wireframe: true
    });
    
    const workspaceMesh = new Mesh(workspaceGeometry, workspaceMaterial);
    this.robot.scene.add(workspaceMesh);
  }
}
```

## Performance Optimization

### Level of Detail (LOD) System
```typescript
class RobotLODManager {
  private lodLevels: LODLevel[] = [
    { distance: 0, triangleCount: 50000, physicsDetail: 'full' },
    { distance: 10, triangleCount: 15000, physicsDetail: 'reduced' },
    { distance: 50, triangleCount: 5000, physicsDetail: 'basic' },
    { distance: 100, triangleCount: 1000, physicsDetail: 'none' }
  ];
  
  updateLOD(camera: Camera, robot: RobotComponent) {
    const distance = camera.position.distanceTo(robot.position);
    const targetLOD = this.selectLODLevel(distance);
    
    if (robot.currentLOD !== targetLOD) {
      this.transitionToLOD(robot, targetLOD);
    }
  }
  
  private transitionToLOD(robot: RobotComponent, targetLOD: LODLevel) {
    // Update geometry complexity
    robot.links.forEach(link => {
      link.visualMesh.geometry = this.getGeometryForLOD(link.id, targetLOD);
    });
    
    // Update physics detail
    this.updatePhysicsDetail(robot, targetLOD.physicsDetail);
    
    robot.currentLOD = targetLOD;
  }
}
```

### Culling and Optimization
```typescript
class PerformanceMonitor {
  private frameTime: number = 0;
  private targetFPS: number = 60;
  private qualitySettings: QualitySettings;
  
  update(deltaTime: number) {
    this.frameTime = deltaTime;
    
    if (this.getAverageFPS() < this.targetFPS * 0.9) {
      this.adjustQuality('down');
    } else if (this.getAverageFPS() > this.targetFPS * 0.95) {
      this.adjustQuality('up');
    }
  }
  
  private adjustQuality(direction: 'up' | 'down') {
    if (direction === 'down') {
      // Reduce quality to maintain performance
      this.qualitySettings.shadowQuality = Math.max(0, this.qualitySettings.shadowQuality - 1);
      this.qualitySettings.physicsIterations = Math.max(3, this.qualitySettings.physicsIterations - 1);
      this.qualitySettings.particleCount = Math.max(100, this.qualitySettings.particleCount * 0.8);
    } else {
      // Increase quality when performance allows
      this.qualitySettings.shadowQuality = Math.min(3, this.qualitySettings.shadowQuality + 1);
      this.qualitySettings.physicsIterations = Math.min(10, this.qualitySettings.physicsIterations + 1);
      this.qualitySettings.particleCount = Math.min(1000, this.qualitySettings.particleCount * 1.2);
    }
    
    this.applyQualitySettings();
  }
}
```

## Integration Examples

### Robot Showcase Page
```typescript
const RoboticsShowcase: React.FC = () => {
  const [selectedRobot, setSelectedRobot] = useState<RobotComponent | null>(null);
  const [controlMode, setControlMode] = useState<ControlMode>('observation');
  
  return (
    <Canvas
      camera={{ position: [5, 5, 5], fov: 45 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => {
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = PCFSoftShadowMap;
      }}
    >
      <Suspense fallback={<RobotLoadingFallback />}>
        <Scene>
          <RobotEnvironment />
          
          {robotModels.map(robotConfig => (
            <InteractiveRobot
              key={robotConfig.id}
              config={robotConfig}
              onSelect={setSelectedRobot}
              controlMode={controlMode}
            />
          ))}
          
          <CameraController selectedRobot={selectedRobot} />
          <PerformanceMonitor />
        </Scene>
      </Suspense>
      
      {selectedRobot && (
        <RobotControlInterface 
          robot={selectedRobot}
          onModeChange={setControlMode}
        />
      )}
    </Canvas>
  );
};
```

### Mobile Adaptation
```typescript
const MobileRobotControls: React.FC<{ robot: RobotComponent }> = ({ robot }) => {
  const [touchMode, setTouchMode] = useState<'rotate' | 'translate' | 'joint'>('rotate');
  
  return (
    <div className="mobile-controls">
      <TouchModeSelector mode={touchMode} onModeChange={setTouchMode} />
      
      <GestureRecognizer
        onPinch={(scale) => handleCameraZoom(scale)}
        onRotate={(angle) => handleCameraRotate(angle)}
        onPan={(delta) => handleRobotControl(delta, touchMode)}
      >
        <VirtualJoystick
          visible={touchMode === 'joint'}
          onMove={handleJointControl}
        />
      </GestureRecognizer>
      
      <HapticFeedback
        enabled={robot.collisionDetected}
        pattern="collision"
      />
    </div>
  );
};
```

## Testing and Quality Assurance

### Physics Simulation Testing
```typescript
describe('Robot Physics', () => {
  test('joint limits are respected', async () => {
    const robot = new RobotComponent(testRobotConfig);
    const joint = robot.getJoint('shoulder-pitch');
    
    // Test upper limit
    joint.setTarget(joint.limits.max + 0.1);
    await advancePhysics(1000); // 1 second
    
    expect(joint.currentValue).toBeCloseTo(joint.limits.max, 2);
  });
  
  test('collision detection works correctly', async () => {
    const robot = new RobotComponent(testRobotConfig);
    const obstacle = new RigidBody(obstacleConfig);
    
    // Move robot into collision
    robot.moveEndEffector(obstacle.position);
    await advancePhysics(500);
    
    expect(robot.collisionSystem.hasCollision()).toBe(true);
  });
});
```

### Performance Benchmarking
```typescript
describe('Performance', () => {
  test('maintains 60 FPS with multiple robots', async () => {
    const robots = Array.from({ length: 5 }, () => new RobotComponent(testConfig));
    const monitor = new PerformanceMonitor();
    
    // Run simulation for 10 seconds
    for (let i = 0; i < 600; i++) {
      robots.forEach(robot => robot.update(16.67)); // 60 FPS
      monitor.update(16.67);
    }
    
    expect(monitor.getAverageFPS()).toBeGreaterThanOrEqual(55);
  });
});
```

This robotics interaction system provides an immersive, educational, and technically impressive demonstration of advanced robotics engineering capabilities through interactive web technologies.