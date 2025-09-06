'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Center, OrbitControls, Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField({ count = 5000 }) {
  const mesh = useRef<THREE.Points>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      temp[i3] = (Math.random() - 0.5) * 25;
      temp[i3 + 1] = (Math.random() - 0.5) * 25;
      temp[i3 + 2] = (Math.random() - 0.5) * 25;
    }
    return temp;
  }, [count]);

  const colors = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.1 + 0.55, 0.8, 0.6);
      temp[i3] = color.r;
      temp[i3 + 1] = color.g;
      temp[i3 + 2] = color.b;
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.getElapsedTime();
    
    mesh.current.rotation.x = time * 0.05;
    mesh.current.rotation.y = time * 0.075;
    
    const positions = mesh.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = positions[i3];
      const y = positions[i3 + 1];
      
      positions[i3 + 1] = y + Math.sin(time + x) * 0.01;
      positions[i3] = x + Math.cos(time + y) * 0.01;
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function AnimatedText({ text, position = [0, 0, 0] }: { text: string; position?: [number, number, number] }) {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.getElapsedTime();
    mesh.current.rotation.y = Math.sin(time * 0.5) * 0.1;
    if (hovered) {
      mesh.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), 0.1);
    } else {
      mesh.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <Center>
        <Text3D
          ref={mesh}
          font="/fonts/helvetiker_regular.typeface.json"
          size={1.5}
          height={0.3}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
          position={position}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          {text}
          <meshNormalMaterial />
        </Text3D>
      </Center>
    </Float>
  );
}

function GlassOrb() {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.getElapsedTime();
    mesh.current.rotation.x = Math.sin(time * 0.3) * 0.2;
    mesh.current.rotation.y = time * 0.2;
    mesh.current.position.y = Math.sin(time * 0.5) * 0.5;
  });

  return (
    <mesh ref={mesh} position={[0, 0, -2]}>
      <sphereGeometry args={[2, 64, 64]} />
      <MeshTransmissionMaterial
        backside
        samples={10}
        thickness={0.3}
        chromaticAberration={0.3}
        anisotropicBlur={0.3}
        roughness={0.1}
        distortion={0.5}
        distortionScale={0.5}
        temporalDistortion={0.2}
        clearcoat={1}
        attenuationDistance={0.5}
        attenuationColor="#ffffff"
        color="#88ccff"
      />
    </mesh>
  );
}

function Scene() {
  const { viewport } = useThree();
  
  return (
    <>
      <color attach="background" args={['#000814']} />
      <fog attach="fog" args={['#000814', 10, 30]} />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#88ccff" />
      
      <ParticleField count={3000} />
      <GlassOrb />
      
      <AnimatedText text="SHIVAM" position={[-3, 1, 0]} />
      <AnimatedText text="BHARDWAJ" position={[2, -1, 0]} />
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 3}
      />
    </>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}