import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { generateConstellation } from './constellation';
import { ACCENT_CYCLE } from '../../lib/theme';

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const POINT_COUNT = 220;
// Fraction of the viewport's visible width/height the point cloud should
// span — tuned empirically, not derived from anything physical.
const FILL_FRACTION = 0.6;

const POINTS_VERTEX_SHADER = `
  attribute vec3 color;
  varying vec3 vColor;
  uniform float uPixelRatio;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uPixelRatio * (22.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const POINTS_FRAGMENT_SHADER = `
  varying vec3 vColor;
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    float alpha = smoothstep(0.5, 0.05, dist);
    gl_FragColor = vec4(vColor, alpha * 0.85);
  }
`;

/** The hero's 3D accent — a sparse "data constellation" (points + nearest-
 *  neighbor edges) rather than a solid organic blob. Unlit/additive
 *  materials throughout, so recent three.js's physically-correct lighting
 *  units never come into play and no environment map is needed for it to
 *  read correctly. Scales to the actual viewport each frame so it fills
 *  the backdrop proportionally at any window size/aspect ratio. */
export default function ConstellationField() {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  const data = useMemo(() => generateConstellation(POINT_COUNT, ACCENT_CYCLE), []);

  const pointsGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(data.colors, 3));
    return geo;
  }, [data]);

  const edgeGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(data.edgePositions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(data.edgeColors, 3));
    return geo;
  }, [data]);

  const pointsMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: POINTS_VERTEX_SHADER,
        fragmentShader: POINTS_FRAGMENT_SHADER,
        uniforms: { uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.75) : 1 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const scaleX = viewport.width * FILL_FRACTION;
    const scaleY = viewport.height * FILL_FRACTION;
    group.scale.set(scaleX, scaleY, Math.min(scaleX, scaleY));

    if (!prefersReducedMotion) {
      group.rotation.y += delta * 0.06;
      group.rotation.x += delta * 0.015;
    }

    // Gentle parallax toward the pointer — subtle, never hijacks scroll.
    const targetX = state.pointer.x * 0.4;
    const targetY = state.pointer.y * 0.25;
    group.position.x = THREE.MathUtils.lerp(group.position.x, targetX, 0.03);
    group.position.y = THREE.MathUtils.lerp(group.position.y, targetY, 0.03);
  });

  return (
    <group ref={groupRef} position={[0, 0, -0.3]}>
      <points geometry={pointsGeometry} material={pointsMaterial} />
      <lineSegments geometry={edgeGeometry}>
        <lineBasicMaterial vertexColors transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
    </group>
  );
}
