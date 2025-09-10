'use client';

import { Canvas } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';

function Scene() {
  return (
    <>
      <color attach="background" args={['#000814']} />
      <ambientLight intensity={0.6} />
      <pointLight position={[5,5,5]} intensity={1} />
      <Text position={[0,0,0]} fontSize={1.2} color="#88ccff" anchorX="center" anchorY="middle">
        Antimony Labs
      </Text>
      <OrbitControls enableZoom={false} enablePan={false} />
    </>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas camera={{ position: [0, 0, 6], fov: 55 }} gl={{ antialias: true, alpha: false }}>
        <Scene />
      </Canvas>
    </div>
  );
}