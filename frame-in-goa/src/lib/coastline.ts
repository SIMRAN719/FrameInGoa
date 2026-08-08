import * as THREE from 'three';

/** Smooth, deterministic multi-octave curve — no external noise library needed. */
export function coastCurve(x: number, seed: number): number {
  return (
    Math.sin(x * 0.15 + seed) * 0.9 +
    Math.sin(x * 0.37 + seed * 1.7) * 0.5 +
    Math.sin(x * 0.08 + seed * 2.3) * 0.6
  );
}

/**
 * Builds a flat (y=0) ribbon strip between two z-offset curves, so a
 * shoreline can bow, bay and curve instead of running dead straight.
 * DoubleSide-safe winding regardless of which direction it's mirrored in.
 */
/**
 * @param forWaterRotation three-stdlib's `Water` hardcodes its reflective
 * normal as local +Z, meant to be used after `mesh.rotation.x = -Math.PI/2`.
 * That rotation maps local Y to world -Z, so when this ribbon feeds a Water
 * mesh we author it in the XY plane (z=0) and pre-negate Y, putting the
 * rotated result at the intended world Z.
 */
export function buildRibbonGeometry(
  innerZ: (x: number) => number,
  outerZ: (x: number) => number,
  length: number,
  segments: number,
  forWaterRotation = false,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const half = length / 2;

  for (let i = 0; i <= segments; i++) {
    const x = -half + (i / segments) * length;
    const zi = innerZ(x);
    const zo = outerZ(x);
    if (forWaterRotation) {
      positions.push(x, -zi, 0, x, -zo, 0);
    } else {
      positions.push(x, 0, zi, x, 0, zo);
    }
    uvs.push(i / segments, 0, i / segments, 1);
    if (i < segments) {
      const a = i * 2;
      const b = i * 2 + 1;
      const c = (i + 1) * 2;
      const d = (i + 1) * 2 + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}
