# Robotics 3D Components Examples

## Basic Robot Components

### Robot Arm Example

```tsx
import { RobotArm, RoboticsScene } from '@/components/3d';
import { Canvas } from '@react-three/fiber';

const RobotArmDemo: React.FC = () => {
  const [jointValues, setJointValues] = useState([0, 0, 0, 0, 0, 0]);
  const [selectedJoint, setSelectedJoint] = useState<number | null>(null);
  
  const handleJointChange = useCallback((jointIndex: number, value: number) => {
    setJointValues(prev => {
      const newValues = [...prev];
      newValues[jointIndex] = value;
      return newValues;
    });
  }, []);
  
  return (
    <div className="h-screen flex">
      <div className="flex-1">
        <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
          <RoboticsScene
            lighting="dynamic"
            environment="workshop"
            physics={true}
          >
            <RobotArm
              model="/models/6dof-arm.gltf"
              position={[0, 0, 0]}
              jointValues={jointValues}
              interactive={true}
              physics={true}
              onJointChange={handleJointChange}
              onJointSelect={setSelectedJoint}
              showWorkspace={true}
              showJointLimits={selectedJoint !== null}
            />
          </RoboticsScene>
        </Canvas>
      </div>
      
      <div className="w-80 bg-white p-4 border-l">
        <RobotControlPanel
          jointValues={jointValues}
          selectedJoint={selectedJoint}
          onJointChange={handleJointChange}
          onJointSelect={setSelectedJoint}
        />
      </div>
    </div>
  );
};
```

### Mobile Robot Platform

```tsx
import { MobileRobot, Environment, TrajectoryPath } from '@/components/3d';

const MobileRobotDemo: React.FC = () => {
  const [robotPosition, setRobotPosition] = useState([0, 0, 0]);
  const [trajectory, setTrajectory] = useState<Vector3[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  
  const handleNavigationTarget = useCallback((targetPosition: Vector3) => {
    const path = calculatePath(robotPosition, targetPosition);
    setTrajectory(path);
    setIsNavigating(true);
    
    // Animate robot along path
    animateAlongPath(path, {
      onUpdate: setRobotPosition,
      onComplete: () => setIsNavigating(false),
      duration: path.length * 1000 // 1 second per waypoint
    });
  }, [robotPosition]);
  
  return (
    <Canvas camera={{ position: [10, 10, 10] }}>
      <RoboticsScene
        lighting="outdoor"
        physics={true}
        onClick={handleNavigationTarget}
      >
        {/* Environment */}
        <Environment type="warehouse">
          <Obstacle position={[2, 0, 2]} size={[1, 2, 1]} />
          <Obstacle position={[-3, 0, 1]} size={[2, 1, 0.5]} />
          <Obstacle position={[1, 0, -4]} size={[3, 1, 1]} />
        </Environment>
        
        {/* Mobile robot */}
        <MobileRobot
          model="/models/mobile-platform.gltf"
          position={robotPosition}
          wheelConfiguration="differential"
          sensors={[
            { type: 'lidar', range: 10, resolution: 360 },
            { type: 'camera', fov: 60, resolution: [640, 480] }
          ]}
          isNavigating={isNavigating}
          showSensors={true}
        />
        
        {/* Navigation trajectory */}
        {trajectory.length > 0 && (
          <TrajectoryPath
            waypoints={trajectory}
            color="blue"
            animated={isNavigating}
          />
        )}
        
        {/* Interaction helpers */}
        <ClickableGround onPlaneClick={handleNavigationTarget} />
      </RoboticsScene>
    </Canvas>
  );
};
```

## Advanced Robotics Scenarios

### Multi-Robot Coordination

```tsx
const MultiRobotWorkspace: React.FC = () => {
  const [robots, setRobots] = useState<RobotState[]>([
    { id: 'arm1', type: 'manipulator', position: [-2, 0, 0], active: false },
    { id: 'arm2', type: 'manipulator', position: [2, 0, 0], active: false },
    { id: 'mobile1', type: 'mobile', position: [0, 0, -3], active: false }
  ]);
  
  const [workpieces, setWorkpieces] = useState<Workpiece[]>([
    { id: 'part1', position: [-3, 1, 2], grasped: false },
    { id: 'part2', position: [3, 1, 2], grasped: false }
  ]);
  
  const executeCoordinatedTask = async () => {
    // Coordinate multiple robots for assembly task
    const taskSequence = [
      { robot: 'arm1', action: 'grasp', target: 'part1' },
      { robot: 'mobile1', action: 'move', target: [0, 0, 0] },
      { robot: 'arm1', action: 'place', target: [0, 1, 0] },
      { robot: 'arm2', action: 'grasp', target: 'part2' },
      { robot: 'arm2', action: 'assemble', target: [0, 1, 0] }
    ];
    
    for (const task of taskSequence) {
      await executeRobotTask(task);
      setRobots(prev => updateRobotState(prev, task));
    }
  };
  
  return (
    <Canvas camera={{ position: [8, 8, 8] }}>
      <RoboticsScene
        lighting="industrial"
        physics={true}
        collisionDetection={true}
      >
        {/* Work surface */}
        <WorkSurface 
          position={[0, 0, 0]} 
          size={[6, 0.1, 4]}
          material="aluminum"
        />
        
        {/* Robots */}
        {robots.map(robot => (
          robot.type === 'manipulator' ? (
            <RobotArm
              key={robot.id}
              position={robot.position}
              model="/models/collaborative-arm.gltf"
              active={robot.active}
              safetyZone={true}
              onCollisionWarning={handleSafetyAlert}
            />
          ) : (
            <MobileRobot
              key={robot.id}
              position={robot.position}
              model="/models/agv.gltf"
              active={robot.active}
              pathPlanning="rrt"
            />
          )
        ))}
        
        {/* Workpieces */}
        {workpieces.map(part => (
          <Workpiece
            key={part.id}
            position={part.position}
            geometry="box"
            material="steel"
            grasped={part.grasped}
            physics={!part.grasped}
          />
        ))}
        
        {/* Safety systems */}
        <SafetyZone
          robots={robots}
          onViolation={handleSafetyViolation}
        />
        
        <CollisionVisualization
          showPrediction={true}
          timeHorizon={2.0}
        />
      </RoboticsScene>
    </Canvas>
  );
};
```

### Humanoid Robot Demo

```tsx
const HumanoidRobotDemo: React.FC = () => {
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [balanceMode, setBalanceMode] = useState(true);
  const [walkingTarget, setWalkingTarget] = useState<Vector3 | null>(null);
  
  const animationSequence = [
    { name: 'wave', duration: 3000 },
    { name: 'walk_forward', duration: 5000 },
    { name: 'turn_around', duration: 2000 },
    { name: 'walk_backward', duration: 5000 },
    { name: 'idle', duration: 2000 }
  ];
  
  const executeAnimationSequence = async () => {
    for (const animation of animationSequence) {
      setCurrentAnimation(animation.name);
      await delay(animation.duration);
    }
  };
  
  return (
    <Canvas camera={{ position: [3, 2, 5] }}>
      <RoboticsScene
        lighting="natural"
        physics={true}
        gravity={[0, -9.81, 0]}
      >
        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshLambertMaterial color="#cccccc" />
        </mesh>
        
        {/* Humanoid robot */}
        <HumanoidRobot
          model="/models/humanoid.gltf"
          position={[0, 0, 0]}
          animation={currentAnimation}
          balanceControl={balanceMode}
          physics={true}
          onFallDetection={handleFallDetection}
          onAnimationComplete={(name) => {
            console.log(`Animation ${name} completed`);
          }}
        >
          {/* Robot subsystems */}
          <BikeControl
            enabled={balanceMode}
            kp={10}
            kd={2}
            maxTorque={100}
          />
          
          <WalkingController
            target={walkingTarget}
            gaitPattern="dynamic"
            stepLength={0.3}
            stepHeight={0.1}
          />
          
          <ArmController
            leftArm={{ target: 'natural_swing' }}
            rightArm={{ target: 'natural_swing' }}
          />
        </HumanoidRobot>
        
        {/* Interactive elements */}
        <div className="absolute top-4 left-4 space-y-2">
          <Button onClick={() => setCurrentAnimation('wave')}>
            Wave
          </Button>
          <Button onClick={() => setCurrentAnimation('walk_forward')}>
            Walk Forward
          </Button>
          <Button onClick={() => setCurrentAnimation('dance')}>
            Dance
          </Button>
          <Button onClick={executeAnimationSequence}>
            Demo Sequence
          </Button>
        </div>
        
        {/* Debug visualization */}
        <DebugVisualization
          showCenterOfMass={true}
          showJointAngles={true}
          showBalancePoint={balanceMode}
        />
      </RoboticsScene>
    </Canvas>
  );
};
```

## Interactive Controls and UI

### Robot Control Panel

```tsx
const RobotControlPanel: React.FC<{
  robot: RobotComponent;
  onJointChange: (jointIndex: number, value: number) => void;
  onPresetLoad: (preset: string) => void;
}> = ({ robot, onJointChange, onPresetLoad }) => {
  const [controlMode, setControlMode] = useState<'joint' | 'cartesian'>('joint');
  const [selectedPreset, setSelectedPreset] = useState('home');
  
  const jointPresets = {
    home: [0, 0, 0, 0, 0, 0],
    ready: [0, -45, 90, 0, 45, 0],
    vertical: [0, -90, 90, 0, 0, 0],
    folded: [0, -135, 135, 0, 0, 0]
  };
  
  return (
    <div className="robot-control-panel space-y-4">
      {/* Control mode selector */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Control Mode</h3>
        <div className="flex gap-2">
          <Button
            variant={controlMode === 'joint' ? 'primary' : 'outline'}
            onClick={() => setControlMode('joint')}
          >
            Joint Control
          </Button>
          <Button
            variant={controlMode === 'cartesian' ? 'primary' : 'outline'}
            onClick={() => setControlMode('cartesian')}
          >
            Cartesian
          </Button>
        </div>
      </div>
      
      {/* Joint control */}
      {controlMode === 'joint' && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Joint Positions</h3>
          {robot.joints.map((joint, index) => (
            <div key={index} className="mb-3">
              <label className="block text-sm font-medium mb-1">
                {joint.name} ({joint.currentValue.toFixed(1)}°)
              </label>
              <input
                type="range"
                min={joint.limits.min}
                max={joint.limits.max}
                step="0.1"
                value={joint.currentValue}
                onChange={(e) => onJointChange(index, parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{joint.limits.min}°</span>
                <span>{joint.limits.max}°</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Cartesian control */}
      {controlMode === 'cartesian' && (
        <div>
          <h3 className="text-lg font-semibold mb-2">End Effector Position</h3>
          <CartesianController
            robot={robot}
            onPositionChange={handleCartesianChange}
          />
        </div>
      )}
      
      {/* Presets */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Presets</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(jointPresets).map(preset => (
            <Button
              key={preset}
              variant="outline"
              onClick={() => {
                onPresetLoad(preset);
                setSelectedPreset(preset);
              }}
              className={selectedPreset === preset ? 'ring-2 ring-blue-500' : ''}
            >
              {preset.charAt(0).toUpperCase() + preset.slice(1)}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Robot status */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Status</h3>
        <div className="space-y-1 text-sm">
          <div>State: {robot.state}</div>
          <div>End Effector: ({robot.endEffector.position.map(v => v.toFixed(2)).join(', ')})</div>
          <div>Collisions: {robot.collisions.length}</div>
        </div>
      </div>
    </div>
  );
};
```

### 3D Scene Controls

```tsx
const SceneControls: React.FC<{
  scene: SceneManager;
  camera: CameraController;
}> = ({ scene, camera }) => {
  const [viewMode, setViewMode] = useState<'orbit' | 'first-person' | 'fixed'>('orbit');
  const [showPhysics, setShowPhysics] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false);
  
  const cameraPresets = {
    front: { position: [0, 2, 5], target: [0, 1, 0] },
    side: { position: [5, 2, 0], target: [0, 1, 0] },
    top: { position: [0, 8, 0], target: [0, 0, 0] },
    isometric: { position: [3, 3, 3], target: [0, 0, 0] }
  };
  
  return (
    <div className="scene-controls absolute top-4 right-4 bg-white p-4 rounded shadow space-y-4">
      {/* Camera controls */}
      <div>
        <h4 className="font-semibold mb-2">Camera</h4>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {Object.entries(cameraPresets).map(([name, preset]) => (
            <Button
              key={name}
              size="small"
              variant="outline"
              onClick={() => camera.animateTo(preset)}
            >
              {name}
            </Button>
          ))}
        </div>
      </div>
      
      {/* View mode */}
      <div>
        <h4 className="font-semibold mb-2">View Mode</h4>
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as any)}
          className="w-full p-1 border rounded text-sm"
        >
          <option value="orbit">Orbit</option>
          <option value="first-person">First Person</option>
          <option value="fixed">Fixed</option>
        </select>
      </div>
      
      {/* Visualization options */}
      <div>
        <h4 className="font-semibold mb-2">Visualization</h4>
        <div className="space-y-2">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={showPhysics}
              onChange={(e) => {
                setShowPhysics(e.target.checked);
                scene.showPhysicsDebug(e.target.checked);
              }}
              className="mr-2"
            />
            Physics Debug
          </label>
          
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={showWireframe}
              onChange={(e) => {
                setShowWireframe(e.target.checked);
                scene.setWireframeMode(e.target.checked);
              }}
              className="mr-2"
            />
            Wireframe
          </label>
        </div>
      </div>
      
      {/* Performance info */}
      <div>
        <h4 className="font-semibold mb-2">Performance</h4>
        <PerformanceMonitor />
      </div>
    </div>
  );
};
```

## Physics and Interaction

### Collision Detection Demo

```tsx
const CollisionDemo: React.FC = () => {
  const [objects, setObjects] = useState<PhysicsObject[]>([]);
  const [collisions, setCollisions] = useState<Collision[]>([]);
  
  const spawnObject = (position: Vector3, type: 'box' | 'sphere' | 'cylinder') => {
    const newObject: PhysicsObject = {
      id: generateId(),
      type,
      position,
      velocity: [0, 0, 0],
      angularVelocity: [0, 0, 0],
      mass: 1,
      restitution: 0.6,
      friction: 0.3
    };
    
    setObjects(prev => [...prev, newObject]);
  };
  
  const handleCollision = (collision: Collision) => {
    setCollisions(prev => [...prev.slice(-10), collision]); // Keep last 10
    
    // Visual feedback
    showCollisionEffect(collision.point, collision.normal);
    
    // Audio feedback
    playCollisionSound(collision.impulse);
  };
  
  return (
    <Canvas camera={{ position: [5, 5, 5] }}>
      <RoboticsScene
        physics={true}
        gravity={[0, -9.81, 0]}
        onCollision={handleCollision}
      >
        {/* Ground */}
        <PhysicsBox
          position={[0, -0.5, 0]}
          size={[10, 1, 10]}
          type="static"
          material="concrete"
        />
        
        {/* Dynamic objects */}
        {objects.map(obj => {
          switch (obj.type) {
            case 'box':
              return (
                <PhysicsBox
                  key={obj.id}
                  position={obj.position}
                  size={[0.5, 0.5, 0.5]}
                  mass={obj.mass}
                  restitution={obj.restitution}
                  friction={obj.friction}
                />
              );
            case 'sphere':
              return (
                <PhysicsSphere
                  key={obj.id}
                  position={obj.position}
                  radius={0.3}
                  mass={obj.mass}
                  restitution={obj.restitution}
                  friction={obj.friction}
                />
              );
            case 'cylinder':
              return (
                <PhysicsCylinder
                  key={obj.id}
                  position={obj.position}
                  radius={0.25}
                  height={0.5}
                  mass={obj.mass}
                  restitution={obj.restitution}
                  friction={obj.friction}
                />
              );
          }
        })}
        
        {/* Collision visualization */}
        {collisions.map(collision => (
          <CollisionVisualization
            key={collision.id}
            point={collision.point}
            normal={collision.normal}
            impulse={collision.impulse}
            duration={1000}
          />
        ))}
        
        {/* Spawn controls */}
        <Html position={[0, 3, 0]}>
          <div className="bg-white p-2 rounded shadow">
            <h4 className="font-semibold mb-2">Spawn Objects</h4>
            <div className="flex gap-2">
              <Button
                size="small"
                onClick={() => spawnObject([Math.random() * 2 - 1, 3, Math.random() * 2 - 1], 'box')}
              >
                Box
              </Button>
              <Button
                size="small"
                onClick={() => spawnObject([Math.random() * 2 - 1, 3, Math.random() * 2 - 1], 'sphere')}
              >
                Sphere
              </Button>
              <Button
                size="small"
                onClick={() => spawnObject([Math.random() * 2 - 1, 3, Math.random() * 2 - 1], 'cylinder')}
              >
                Cylinder
              </Button>
            </div>
            <Button
              size="small"
              variant="outline"
              onClick={() => setObjects([])}
              className="w-full mt-2"
            >
              Clear All
            </Button>
          </div>
        </Html>
      </RoboticsScene>
    </Canvas>
  );
};
```

## Performance Optimization Examples

### Level of Detail (LOD) Implementation

```tsx
const OptimizedRobotShowcase: React.FC = () => {
  const cameraRef = useRef<THREE.Camera>();
  const [lodLevel, setLodLevel] = useState<'high' | 'medium' | 'low'>('high');
  
  const robotModels = {
    high: '/models/robot-detailed.gltf',      // 50k triangles
    medium: '/models/robot-medium.gltf',      // 15k triangles  
    low: '/models/robot-simple.gltf'          // 5k triangles
  };
  
  // Update LOD based on distance
  useFrame(() => {
    if (cameraRef.current) {
      const distance = cameraRef.current.position.length();
      
      let newLodLevel: 'high' | 'medium' | 'low';
      if (distance < 5) {
        newLodLevel = 'high';
      } else if (distance < 15) {
        newLodLevel = 'medium';
      } else {
        newLodLevel = 'low';
      }
      
      if (newLodLevel !== lodLevel) {
        setLodLevel(newLodLevel);
      }
    }
  });
  
  return (
    <Canvas camera={{ position: [5, 5, 5] }} onCreated={({ camera }) => {
      cameraRef.current = camera;
    }}>
      <RoboticsScene>
        {/* Multiple robots with LOD */}
        {Array.from({ length: 10 }).map((_, i) => (
          <RobotArm
            key={i}
            model={robotModels[lodLevel]}
            position={[
              (i % 5 - 2) * 3,
              0,
              Math.floor(i / 5) * 3 - 1.5
            ]}
            interactive={lodLevel === 'high'}
            physics={lodLevel !== 'low'}
            lodLevel={lodLevel}
          />
        ))}
        
        {/* Performance monitoring */}
        <PerformanceMonitor
          onPerformanceChange={(fps, memoryUsage) => {
            // Automatically reduce quality if performance drops
            if (fps < 45 && lodLevel !== 'low') {
              const newLevel = lodLevel === 'high' ? 'medium' : 'low';
              setLodLevel(newLevel);
            } else if (fps > 55 && lodLevel !== 'high') {
              const newLevel = lodLevel === 'low' ? 'medium' : 'high';
              setLodLevel(newLevel);
            }
          }}
        />
      </RoboticsScene>
    </Canvas>
  );
};
```

These examples demonstrate comprehensive usage of the robotics 3D components, covering basic robot control, advanced multi-robot scenarios, interactive interfaces, physics simulation, and performance optimization techniques.