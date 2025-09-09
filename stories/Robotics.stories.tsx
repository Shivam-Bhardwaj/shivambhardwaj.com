import type { Meta, StoryObj } from '@storybook/react';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

// Mock 3D Robotics Components for Storybook
const RobotArm = ({ position = [0, 0, 0], interactive = true, physics = false }) => {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.2, 16]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
      
      {/* First Link */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>
      
      {/* Second Link */}
      <mesh position={[0, 1.3, 0.3]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#1d4ed8" />
      </mesh>
      
      {/* End Effector */}
      <mesh position={[0, 1.8, 0.5]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
    </group>
  );
};

const RoboticsScene = ({ children, lighting = 'default' }) => {
  return (
    <Canvas camera={{ position: [3, 3, 3], fov: 45 }}>
      <Suspense fallback={null}>
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
        
        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#f3f4f6" />
        </mesh>
        
        {children}
      </Suspense>
    </Canvas>
  );
};

const meta: Meta = {
  title: 'Components/Robotics/RoboticsDemo',
  component: RoboticsScene,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Interactive 3D robotics demonstrations showcasing various robot types and scenarios.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '600px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Single Robot Arm
export const SingleRobotArm: Story = {
  render: () => (
    <RoboticsScene>
      <RobotArm position={[0, 0, 0]} interactive={true} physics={false} />
    </RoboticsScene>
  ),
};

// Multiple Robot Arms
export const MultipleRobots: Story = {
  render: () => (
    <RoboticsScene>
      <RobotArm position={[-2, 0, 0]} interactive={true} physics={false} />
      <RobotArm position={[2, 0, 0]} interactive={true} physics={false} />
      <RobotArm position={[0, 0, -2]} interactive={true} physics={false} />
    </RoboticsScene>
  ),
};

// Industrial Workspace
export const IndustrialWorkspace: Story = {
  render: () => (
    <RoboticsScene lighting="industrial">
      {/* Main robot arms */}
      <RobotArm position={[-3, 0, 0]} interactive={true} physics={true} />
      <RobotArm position={[3, 0, 0]} interactive={true} physics={true} />
      
      {/* Workbench */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[4, 0.1, 2]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      
      {/* Work pieces */}
      <mesh position={[-1, 0.55, 0]}>
        <boxGeometry args={[0.3, 0.2, 0.3]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      
      <mesh position={[1, 0.55, 0]}>
        <boxGeometry args={[0.3, 0.2, 0.3]} />
        <meshStandardMaterial color="#16a34a" />
      </mesh>
    </RoboticsScene>
  ),
};

// Laboratory Setting
export const LaboratoryDemo: Story = {
  render: () => (
    <RoboticsScene lighting="laboratory">
      {/* Precision robot arm */}
      <RobotArm position={[0, 0, 0]} interactive={true} physics={true} />
      
      {/* Lab equipment */}
      <mesh position={[-2, 0.3, -1]}>
        <cylinderGeometry args={[0.3, 0.3, 0.6]} />
        <meshStandardMaterial color="#0891b2" />
      </mesh>
      
      <mesh position={[2, 0.2, -1]}>
        <boxGeometry args={[0.6, 0.4, 0.4]} />
        <meshStandardMaterial color="#7c3aed" />
      </mesh>
      
      {/* Sample containers */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[-1.5 + i * 0.3, 0.45, 1]}>
          <cylinderGeometry args={[0.05, 0.05, 0.2]} />
          <meshStandardMaterial color="#f97316" />
        </mesh>
      ))}
    </RoboticsScene>
  ),
};

// Mobile Platform Demo
export const MobilePlatform: Story = {
  render: () => (
    <RoboticsScene>
      {/* Mobile base */}
      <group position={[0, 0.1, 0]}>
        <mesh>
          <boxGeometry args={[1, 0.2, 0.6]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
        
        {/* Wheels */}
        <mesh position={[-0.4, -0.15, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <mesh position={[0.4, -0.15, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <mesh position={[-0.4, -0.15, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <mesh position={[0.4, -0.15, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        
        {/* Mounted robot arm */}
        <group position={[0, 0.3, 0]} scale={[0.6, 0.6, 0.6]}>
          <RobotArm position={[0, 0, 0]} />
        </group>
      </group>
      
      {/* Navigation waypoints */}
      <mesh position={[2, 0.05, 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
      <mesh position={[-2, 0.05, 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
      <mesh position={[2, 0.05, -2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
    </RoboticsScene>
  ),
};

// Performance Test - Many Objects
export const PerformanceTest: Story = {
  render: () => (
    <RoboticsScene>
      {Array.from({ length: 10 }).map((_, i) => (
        <RobotArm 
          key={i}
          position={[
            (i % 5 - 2) * 2,
            0,
            Math.floor(i / 5) * 2 - 1
          ]} 
          interactive={false}
          physics={false}
        />
      ))}
    </RoboticsScene>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Performance test with multiple robot instances to demonstrate LOD system and optimization.',
      },
    },
  },
};

// Dark Environment
export const DarkEnvironment: Story = {
  render: () => (
    <div style={{ backgroundColor: '#0f172a', width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [3, 3, 3], fov: 45 }}>
        <Suspense fallback={null}>
          {/* Minimal lighting for dark environment */}
          <ambientLight intensity={0.1} />
          <pointLight position={[2, 4, 2]} intensity={0.8} color="#3b82f6" />
          <pointLight position={[-2, 4, -2]} intensity={0.6} color="#f59e0b" />
          
          {/* Dark ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
          
          <RobotArm position={[0, 0, 0]} interactive={true} physics={false} />
        </Suspense>
      </Canvas>
    </div>
  ),
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};