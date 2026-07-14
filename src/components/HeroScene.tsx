import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Sits low and pushed back — reads as a soft glow behind the avatar photo
// rather than a shape competing with the heading text above it.
const BASE_POSITION: [number, number, number] = [0, -0.15, -1.2];

function DistortedBlob() {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const group = groupRef.current;
    const mesh = meshRef.current;
    if (!group || !mesh) return;

    if (!prefersReducedMotion) {
      mesh.rotation.x = state.clock.elapsedTime * 0.12;
      mesh.rotation.y = state.clock.elapsedTime * 0.18;
    }

    // Gentle parallax toward the pointer, relative to the resting position —
    // reads as "alive" without hijacking scroll or requiring drag interaction.
    const targetX = BASE_POSITION[0] + state.pointer.x * 0.4;
    const targetY = BASE_POSITION[1] + state.pointer.y * 0.25;
    group.position.x = THREE.MathUtils.lerp(group.position.x, targetX, 0.04);
    group.position.y = THREE.MathUtils.lerp(group.position.y, targetY, 0.04);
  });

  return (
    <group ref={groupRef} position={BASE_POSITION}>
      <Float speed={prefersReducedMotion ? 0 : 1.4} rotationIntensity={0.3} floatIntensity={0.6}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[0.8, 8]} />
          <MeshDistortMaterial
            color="#2a2f4a"
            roughness={0.35}
            metalness={0.15}
            distort={0.35}
            speed={prefersReducedMotion ? 0 : 1.5}
            emissive="#4c3d99"
            emissiveIntensity={0.5}
          />
        </mesh>
      </Float>
    </group>
  );
}

/** Ambient WebGL backdrop for the hero — an abstract, mouse-reactive blob.
 *  Purely decorative and absolutely positioned behind the real content, so
 *  it never affects layout or blocks first paint; lazy-loaded from
 *  HeroSection so the three.js chunk downloads after the text/photo render. */
export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ pointerEvents: 'none' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 4, 4]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-3, -2, 2]} intensity={2} decay={0} color="#5a4a8a" />
        <DistortedBlob />
      </Suspense>
    </Canvas>
  );
}
