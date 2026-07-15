import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import ConstellationField from './three/ConstellationField';

/** Lazy-loaded from HeroSection so the three.js chunk downloads after the
 *  text/photo have already painted, and never blocks first contentful paint. */
export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ pointerEvents: 'none' }}
    >
      <Suspense fallback={null}>
        <ConstellationField />
      </Suspense>
    </Canvas>
  );
}
