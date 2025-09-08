'use client';

import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh, Vector3, Color, BufferGeometry, BufferAttribute } from 'three';
import { RobotConfig } from '../../lib/components/types';

interface Robot3DProps {
  robot: RobotConfig;
  trails?: Vector3[];
}

function Robot3D({ robot, trails = [] }: Robot3DProps) {
  const meshRef = useRef<Mesh>(null);
  const trailRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Update position
    meshRef.current.position.set(
      (robot.position.x / window.innerWidth - 0.5) * 10,
      -(robot.position.y / window.innerHeight - 0.5) * 10,
      robot.position.z || 0
    );

    // Add gentle floating animation
    const time = state.clock.elapsedTime;
    meshRef.current.position.z += Math.sin(time * 2 + robot.id.length) * 0.02;

    // Rotate based on velocity direction
    const targetRotation = Math.atan2(robot.velocity.y, robot.velocity.x);
    if (meshRef.current.rotation.z !== targetRotation) {
      meshRef.current.rotation.z += (targetRotation - meshRef.current.rotation.z) * 0.1;
    }

    // Scale based on speed
    const speed = Math.sqrt(robot.velocity.x ** 2 + robot.velocity.y ** 2);
    const scale = 1 + speed * 0.01;
    meshRef.current.scale.setScalar(scale);
  });

  // Create trail geometry
  const trailGeometry = useMemo(() => {
    if (trails.length < 2) return null;

    const positions = new Float32Array(trails.length * 3);
    trails.forEach((point, i) => {
      positions[i * 3] = (point.x / window.innerWidth - 0.5) * 10;
      positions[i * 3 + 1] = -(point.y / window.innerHeight - 0.5) * 10;
      positions[i * 3 + 2] = point.z || 0;
    });

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    return geometry;
  }, [trails]);

  return (
    <group>
      {/* Main robot body */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[robot.size * 0.05, 0]} />
        <meshStandardMaterial
          color={robot.color}
          metalness={0.6}
          roughness={0.3}
          emissive={robot.color}
          emissiveIntensity={robot.interactive ? 0.2 : 0.1}
        />
      </mesh>

      {/* Robot trail */}
      {trailGeometry && (
        <line ref={trailRef}>
          <bufferGeometry attach="geometry" {...trailGeometry} />
          <lineBasicMaterial
            color={robot.color}
            opacity={0.3}
            transparent
          />
        </line>
      )}

      {/* Influence sphere (debug visualization) */}
      {process.env.NODE_ENV === 'development' && (
        <mesh>
          <sphereGeometry args={[0.5, 8, 6]} />
          <meshBasicMaterial
            color={robot.color}
            opacity={0.1}
            transparent
            wireframe
          />
        </mesh>
      )}
    </group>
  );
}

interface RoboticsCanvasProps {
  robots: RobotConfig[];
  trails?: Map<string, Vector3[]>;
  backgroundOpacity?: number;
  enablePostProcessing?: boolean;
  performanceMode?: boolean;
}

export default function RoboticsCanvas({
  robots,
  trails = new Map(),
  backgroundOpacity = 0.1,
  enablePostProcessing = false,
  performanceMode = false,
}: RoboticsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Optimize render settings based on performance mode
  const renderSettings = useMemo(() => {
    if (performanceMode) {
      return {
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance' as const,
        stencil: false,
        depth: true,
      };
    }

    return {
      antialias: true,
      alpha: true,
      powerPreference: 'default' as const,
      stencil: true,
      depth: true,
    };
  }, [performanceMode]);

  // Lighting setup
  function Lights() {
    return (
      <>
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.6}
          castShadow={!performanceMode}
        />
        <pointLight
          position={[-5, -5, 5]}
          intensity={0.3}
          color="#4a90e2"
        />
      </>
    );
  }

  // Background environment
  function Background() {
    const meshRef = useRef<Mesh>(null);

    useFrame((state) => {
      if (!meshRef.current) return;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.01;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.005;
    });

    return (
      <mesh ref={meshRef} position={[0, 0, -5]}>
        <sphereGeometry args={[50, 32, 16]} />
        <meshBasicMaterial
          color="#0a0a0a"
          opacity={backgroundOpacity}
          transparent
          wireframe
        />
      </mesh>
    );
  }

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: backgroundOpacity }}
    >
      <Canvas
        ref={canvasRef}
        gl={renderSettings}
        camera={{
          position: [0, 0, 5],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
        onCreated={(state) => {
          state.gl.setClearColor('#000000', 0);
        }}
      >
        <Lights />
        {!performanceMode && <Background />}
        
        {/* Render all robots */}
        {robots.map((robot) => (
          <Robot3D
            key={robot.id}
            robot={robot}
            trails={trails.get(robot.id) || []}
          />
        ))}
        
        {/* Add post-processing effects if enabled */}
        {enablePostProcessing && !performanceMode && (
          // Post-processing effects would go here
          // For now, we'll keep it simple to avoid additional dependencies
          null
        )}
      </Canvas>
    </div>
  );
}