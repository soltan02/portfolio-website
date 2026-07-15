import * as THREE from 'three';

export interface ConstellationData {
  positions: Float32Array; // xyz triples, unit-sphere scale — the parent scales this to fit the viewport
  colors: Float32Array; // rgb triples per point, 0-1 range, for vertex coloring
  edgePositions: Float32Array; // xyz pairs (2 verts per edge) for THREE.LineSegments
  edgeColors: Float32Array;
}

const MAX_NEIGHBORS_PER_POINT = 2;
const MAX_EDGE_DISTANCE = 0.55;

/** Rejection-samples a point uniformly inside the unit ball. */
function randomInUnitSphere(): [number, number, number] {
  let x = 0, y = 0, z = 0;
  let lengthSq = Infinity;
  while (lengthSq > 1) {
    x = Math.random() * 2 - 1;
    y = Math.random() * 2 - 1;
    z = Math.random() * 2 - 1;
    lengthSq = x * x + y * y + z * z;
  }
  return [x, y, z];
}

/** Generates a sparse point/edge "data constellation" once (not re-randomized
 *  per frame) — a knowledge-graph-like node network rather than a solid
 *  organic mesh. Positions live in a unit ball; the caller scales the whole
 *  group to fit the actual viewport. */
export function generateConstellation(count: number, accentColors: readonly string[]): ConstellationData {
  const points: [number, number, number][] = [];
  for (let i = 0; i < count; i++) points.push(randomInUnitSphere());

  const paletteRgb = accentColors.map((hex) => new THREE.Color(hex));

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const pointColors: THREE.Color[] = [];

  points.forEach((p, i) => {
    positions[i * 3] = p[0];
    positions[i * 3 + 1] = p[1];
    positions[i * 3 + 2] = p[2];
    const color = paletteRgb[i % paletteRgb.length];
    pointColors.push(color);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  });

  // Nearest-neighbor edges, computed once (O(n^2) over ~a few hundred points
  // is trivial) and de-duplicated so A-B isn't drawn twice as B-A.
  const seenPairs = new Set<string>();
  const edgePositionList: number[] = [];
  const edgeColorList: number[] = [];

  for (let i = 0; i < count; i++) {
    const distances: { j: number; dist: number }[] = [];
    for (let j = 0; j < count; j++) {
      if (i === j) continue;
      const dx = points[i][0] - points[j][0];
      const dy = points[i][1] - points[j][1];
      const dz = points[i][2] - points[j][2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist <= MAX_EDGE_DISTANCE) distances.push({ j, dist });
    }
    distances.sort((a, b) => a.dist - b.dist);

    for (const { j } of distances.slice(0, MAX_NEIGHBORS_PER_POINT)) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seenPairs.has(key)) continue;
      seenPairs.add(key);

      edgePositionList.push(...points[i], ...points[j]);
      const midColor = pointColors[i].clone().lerp(pointColors[j], 0.5);
      edgeColorList.push(midColor.r, midColor.g, midColor.b, midColor.r, midColor.g, midColor.b);
    }
  }

  return {
    positions,
    colors,
    edgePositions: new Float32Array(edgePositionList),
    edgeColors: new Float32Array(edgeColorList),
  };
}
