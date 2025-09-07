import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Torus } from '@react-three/drei';
import * as THREE from 'three';

// Animated torus component
function AnimatedTorus() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
    }
  });

  return (
    <Torus
      ref={meshRef}
      args={[2, 0.5, 16, 32]}
      position={[0, 0, -5]}
    >
      <meshStandardMaterial
        color="#0ea5e9"
        transparent
        opacity={0.3}
        wireframe
      />
    </Torus>
  );
}

// Animated stars component
function AnimatedStars() {
  const starsRef = useRef();
  
  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.x = state.clock.elapsedTime * 0.01;
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <Stars
      ref={starsRef}
      radius={100}
      depth={50}
      count={5000}
      factor={4}
      saturation={0}
      fade
      speed={1}
    />
  );
}

// Main Three.js background component
export default function ThreeBackground() {
  const camera = useMemo(() => ({
    position: [0, 0, 5],
    fov: 75
  }), []);

  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={camera}>
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <AnimatedTorus />
        <AnimatedStars />
      </Canvas>
    </div>
  );
}
