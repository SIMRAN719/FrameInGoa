import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { QrMatrix } from '../lib/qr';
import { GOA_DARK_PALETTE, GOA_LIGHT_PALETTE, hashCode, pick, unitFromSeed } from '../lib/goaPalette';
import { useFrame } from '@react-three/fiber';
import Scooter from './Scooter';
import Bunting from './Bunting';
import Beach from './Beach';
import StreetLamp from './StreetLamp';
import Pedestrian from './Pedestrian';

interface CityBlocksProps {
  matrix: QrMatrix;
}

const TREE_COLORS = ['#1F4B3F', '#2E5339', '#2E9E4F'] as const;
const ROOF_COLORS = ['#A6432D', '#8C3B12', '#B54A2E', '#7A2E1D', '#943D22'] as const;
const PLINTH_COLOR = '#4a3320';
const WARM_WINDOW = '#ffe3a8';
const COOL_WINDOW = '#bfe0ff';

interface Building {
  x: number;
  z: number;
  height: number;
  color: string;
  roofColor: string;
  roofHeight: number;
}

interface WindowSpot {
  x: number;
  y: number;
  z: number;
  axis: 'x' | 'z';
  warm: boolean;
}

interface Tree {
  x: number;
  z: number;
  trunkHeight: number;
  canopyHeight: number;
  canopyRadius: number;
  color: string;
}

function cellToWorld(index: number, total: number) {
  return index - total / 2 + 0.5;
}

const CityBlocks = ({ matrix }: CityBlocksProps) => {
  const buildingsRef = useRef<THREE.InstancedMesh>(null);
  const roofCapsRef = useRef<THREE.InstancedMesh>(null);
  const plinthsRef = useRef<THREE.InstancedMesh>(null);
  const groundRef = useRef<THREE.InstancedMesh>(null);
  const treeTrunksRef = useRef<THREE.InstancedMesh>(null);
  const treeCanopyRef = useRef<THREE.InstancedMesh>(null);
  const treeShadowsRef = useRef<THREE.InstancedMesh>(null);
  const windowsWarmRef = useRef<THREE.InstancedMesh>(null);
  const windowsCoolRef = useRef<THREE.InstancedMesh>(null);

  const { buildings, groundTiles, trees, windowsWarm, windowsCool } = useMemo(() => {
    const buildings: Building[] = [];
    const groundTiles: { x: number; z: number; color: string }[] = [];
    const trees: Tree[] = [];
    const windows: WindowSpot[] = [];

    for (let row = 0; row < matrix.totalSize; row++) {
      for (let col = 0; col < matrix.totalSize; col++) {
        const dark = matrix.isDark(row, col);
        const x = cellToWorld(col, matrix.totalSize);
        const z = cellToWorld(row, matrix.totalSize);
        const seed = hashCode(row, col, dark ? 97 : 13);

        if (dark) {
          const height = 0.4 + unitFromSeed(seed) * 1.3;
          const roofSeed = hashCode(row, col, 3, 8);
          buildings.push({
            x,
            z,
            height,
            color: pick(GOA_DARK_PALETTE, seed),
            roofColor: pick(ROOF_COLORS, roofSeed),
            roofHeight: 0.3 + unitFromSeed(roofSeed) * 0.24,
          });

          if (height > 0.55) {
            const numWindows = height > 1.15 ? 2 : 1;
            for (let k = 0; k < numWindows; k++) {
              const wSeed = hashCode(row, col, k, 5);
              const frac = (k + 1) / (numWindows + 1);
              windows.push({
                x,
                y: 0.15 + frac * (height - 0.2),
                z,
                axis: wSeed % 2 === 0 ? 'x' : 'z',
                warm: wSeed % 3 !== 0,
              });
            }
          }
        } else {
          groundTiles.push({ x, z, color: pick(GOA_LIGHT_PALETTE, seed) });
          const isDecorable = !matrix.isQuietZone(row, col) && !matrix.isStructural(row, col);
          if (isDecorable && seed % 7 === 0) {
            trees.push({
              x,
              z,
              trunkHeight: 0.2 + unitFromSeed(seed) * 0.14,
              canopyHeight: 0.32 + unitFromSeed(seed + 1) * 0.22,
              canopyRadius: 0.32 + unitFromSeed(seed + 2) * 0.16,
              color: pick(TREE_COLORS, seed),
            });
          }
        }
      }
    }
    return {
      buildings,
      groundTiles,
      trees,
      windowsWarm: windows.filter((w) => w.warm),
      windowsCool: windows.filter((w) => !w.warm),
    };
  }, [matrix]);

  useLayoutEffect(() => {
    const mesh = buildingsRef.current;
    const caps = roofCapsRef.current;
    const plinths = plinthsRef.current;
    if (!mesh || !caps || !plinths) return;
    const dummy = new THREE.Object3D();
    buildings.forEach((b, i) => {
      dummy.position.set(b.x, b.height / 2, b.z);
      dummy.scale.set(0.86, b.height, 0.86);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, new THREE.Color(b.color));

      // sloped hip roof — a 4-sided pyramid rotated 45° so its faces sit flush
      // with the building's walls, not a flat cap (which read as a snow-capped slab)
      dummy.position.set(b.x, b.height + b.roofHeight / 2, b.z);
      dummy.scale.set(1, b.roofHeight, 1);
      dummy.rotation.set(0, Math.PI / 4, 0);
      dummy.updateMatrix();
      caps.setMatrixAt(i, dummy.matrix);
      caps.setColorAt(i, new THREE.Color(b.roofColor));

      dummy.rotation.set(0, 0, 0);
      dummy.position.set(b.x, 0.05, b.z);
      dummy.scale.set(0.94, 0.1, 0.94);
      dummy.updateMatrix();
      plinths.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    caps.instanceMatrix.needsUpdate = true;
    if (caps.instanceColor) caps.instanceColor.needsUpdate = true;
    plinths.instanceMatrix.needsUpdate = true;
  }, [buildings]);

  useLayoutEffect(() => {
    const mesh = groundRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    groundTiles.forEach((t, i) => {
      dummy.position.set(t.x, -0.025, t.z);
      dummy.scale.set(0.97, 0.05, 0.97);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, new THREE.Color(t.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [groundTiles]);

  useLayoutEffect(() => {
    const trunks = treeTrunksRef.current;
    const canopy = treeCanopyRef.current;
    const shadows = treeShadowsRef.current;
    if (!trunks || !canopy || !shadows) return;
    const dummy = new THREE.Object3D();
    trees.forEach((t, i) => {
      dummy.position.set(t.x, t.trunkHeight / 2, t.z);
      dummy.scale.set(1, t.trunkHeight, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      trunks.setMatrixAt(i, dummy.matrix);

      dummy.position.set(t.x, t.trunkHeight + t.canopyHeight / 2, t.z);
      dummy.scale.set(t.canopyRadius / 0.4, t.canopyHeight, t.canopyRadius / 0.4);
      dummy.updateMatrix();
      canopy.setMatrixAt(i, dummy.matrix);
      canopy.setColorAt(i, new THREE.Color(t.color));

      dummy.position.set(t.x, 0.006, t.z);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.scale.set(t.canopyRadius * 1.3, t.canopyRadius * 1.3, 1);
      dummy.updateMatrix();
      shadows.setMatrixAt(i, dummy.matrix);
    });
    trunks.instanceMatrix.needsUpdate = true;
    canopy.instanceMatrix.needsUpdate = true;
    if (canopy.instanceColor) canopy.instanceColor.needsUpdate = true;
    shadows.instanceMatrix.needsUpdate = true;
  }, [trees]);

  // gentle wind sway through the palm canopies — cheap per-frame re-pose of a modest instance count
  useFrame(({ clock }) => {
    const canopy = treeCanopyRef.current;
    if (!canopy || trees.length === 0) return;
    const dummy = new THREE.Object3D();
    const t = clock.getElapsedTime();
    trees.forEach((tr, i) => {
      dummy.position.set(tr.x, tr.trunkHeight + tr.canopyHeight / 2, tr.z);
      dummy.scale.set(tr.canopyRadius / 0.4, tr.canopyHeight, tr.canopyRadius / 0.4);
      dummy.rotation.set(Math.sin(t * 1.1 + i) * 0.06, Math.sin(t * 0.7 + i * 0.4) * 0.5, Math.cos(t * 0.9 + i) * 0.06);
      dummy.updateMatrix();
      canopy.setMatrixAt(i, dummy.matrix);
    });
    canopy.instanceMatrix.needsUpdate = true;
  });

  useLayoutEffect(() => {
    const warm = windowsWarmRef.current;
    const cool = windowsCoolRef.current;
    if (!warm || !cool) return;
    const dummy = new THREE.Object3D();
    const place = (mesh: THREE.InstancedMesh, spots: WindowSpot[]) => {
      spots.forEach((w, i) => {
        const inset = 0.43;
        if (w.axis === 'x') {
          dummy.position.set(w.x + inset, w.y, w.z);
          dummy.scale.set(0.03, 0.12, 0.12);
        } else {
          dummy.position.set(w.x, w.y, w.z + inset);
          dummy.scale.set(0.12, 0.12, 0.03);
        }
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    };
    place(warm, windowsWarm);
    place(cool, windowsCool);
  }, [windowsWarm, windowsCool]);

  const half = matrix.totalSize / 2;
  const scooterRange = Math.max(half - matrix.quietZone, 1);
  const laneOffsets = {
    bottom1: cellToWorld(matrix.totalSize - 2, matrix.totalSize),
    bottom2: cellToWorld(matrix.totalSize - 3, matrix.totalSize),
    top1: cellToWorld(1, matrix.totalSize),
    top2: cellToWorld(2, matrix.totalSize),
    left1: cellToWorld(1, matrix.totalSize),
    left2: cellToWorld(2, matrix.totalSize),
    right1: cellToWorld(matrix.totalSize - 2, matrix.totalSize),
    right2: cellToWorld(matrix.totalSize - 3, matrix.totalSize),
  };

  const sidewalk = {
    bottom: cellToWorld(matrix.totalSize - 4, matrix.totalSize),
    top: cellToWorld(3, matrix.totalSize),
    left: cellToWorld(3, matrix.totalSize),
    right: cellToWorld(matrix.totalSize - 4, matrix.totalSize),
  };
  const walkSpan = Math.max(half - matrix.quietZone - 1, 1.5);
  const pedestrianCenters = [-walkSpan * 0.6, -walkSpan * 0.1, walkSpan * 0.3, walkSpan * 0.7];

  const lampPositions = useMemo(() => {
    const spots: [number, number][] = [];
    const step = 6;
    for (let p = -half + 3; p < half - 2; p += step) {
      spots.push([p, half + 0.5]);
      spots.push([p, -half - 0.5]);
      spots.push([half + 0.5, p]);
      spots.push([-half - 0.5, p]);
    }
    return spots;
  }, [half]);

  return (
    <group>
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[matrix.totalSize + 0.4, 0.06, matrix.totalSize + 0.4]} />
        <meshStandardMaterial color="#3b2a18" />
      </mesh>

      <instancedMesh ref={groundRef} args={[undefined, undefined, groundTiles.length]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>

      <instancedMesh ref={plinthsRef} args={[undefined, undefined, buildings.length]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={PLINTH_COLOR} roughness={0.9} />
      </instancedMesh>

      <instancedMesh ref={buildingsRef} args={[undefined, undefined, buildings.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.7} />
      </instancedMesh>

      <instancedMesh ref={roofCapsRef} args={[undefined, undefined, buildings.length]} castShadow receiveShadow>
        <coneGeometry args={[0.68, 1, 4]} />
        <meshStandardMaterial roughness={0.85} />
      </instancedMesh>

      <instancedMesh ref={windowsWarmRef} args={[undefined, undefined, windowsWarm.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={WARM_WINDOW} roughness={0.15} metalness={0.35} />
      </instancedMesh>
      <instancedMesh ref={windowsCoolRef} args={[undefined, undefined, windowsCool.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={COOL_WINDOW} roughness={0.1} metalness={0.4} />
      </instancedMesh>

      <instancedMesh ref={treeShadowsRef} args={[undefined, undefined, trees.length]}>
        <circleGeometry args={[1, 10]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={treeTrunksRef} args={[undefined, undefined, trees.length]} castShadow>
        <cylinderGeometry args={[0.045, 0.06, 1, 6]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={treeCanopyRef} args={[undefined, undefined, trees.length]} castShadow>
        <coneGeometry args={[0.4, 1, 7]} />
        <meshStandardMaterial roughness={0.85} />
      </instancedMesh>

      <Scooter axis="x" offset={laneOffsets.bottom1} range={scooterRange} color="#F26B21" speed={0.5} />
      <Scooter axis="x" offset={laneOffsets.bottom2} range={scooterRange} color="#F5C242" speed={0.62} phase={1.8} />
      <Scooter axis="x" offset={laneOffsets.top1} range={scooterRange} color="#E24E9C" speed={0.4} phase={Math.PI} />
      <Scooter axis="x" offset={laneOffsets.top2} range={scooterRange} color="#8A3324" speed={0.58} phase={2.4} />
      <Scooter axis="z" offset={laneOffsets.left1} range={scooterRange} color="#2F80ED" speed={0.45} phase={Math.PI / 2} />
      <Scooter axis="z" offset={laneOffsets.left2} range={scooterRange} color="#F2C230" speed={0.52} phase={0.6} />
      <Scooter axis="z" offset={laneOffsets.right1} range={scooterRange} color="#2E9E4F" speed={0.55} phase={-Math.PI / 2} />
      <Scooter axis="z" offset={laneOffsets.right2} range={scooterRange} color="#E85D2B" speed={0.48} phase={-1.1} />

      {lampPositions.map(([x, z], i) => (
        <StreetLamp key={i} x={x} z={z} />
      ))}

      {pedestrianCenters.map((c, i) => (
        <Pedestrian
          key={`ped-b-${i}`}
          axis="x"
          offset={sidewalk.bottom}
          center={c}
          range={1.6}
          speed={0.7 + (i % 3) * 0.15}
          phase={i * 1.7}
          color={i % 2 === 0 ? '#201206' : '#4A2E1E'}
        />
      ))}
      {pedestrianCenters.map((c, i) => (
        <Pedestrian
          key={`ped-t-${i}`}
          axis="x"
          offset={sidewalk.top}
          center={c}
          range={1.4}
          speed={0.6 + (i % 3) * 0.12}
          phase={i * 2.3 + 1}
          color={i % 2 === 0 ? '#4A2E1E' : '#201206'}
        />
      ))}
      {pedestrianCenters.slice(0, 3).map((c, i) => (
        <Pedestrian
          key={`ped-l-${i}`}
          axis="z"
          offset={sidewalk.left}
          center={c}
          range={1.5}
          speed={0.65 + (i % 2) * 0.2}
          phase={i * 1.3 + 0.5}
        />
      ))}
      {pedestrianCenters.slice(0, 3).map((c, i) => (
        <Pedestrian
          key={`ped-r-${i}`}
          axis="z"
          offset={sidewalk.right}
          center={c}
          range={1.5}
          speed={0.75 + (i % 2) * 0.18}
          phase={i * 1.9 + 2}
        />
      ))}

      <Bunting size={matrix.totalSize} />
      {/* beaches wrap all four sides — the other two reuse the same component
          rotated 90°, since Water's reflection math reads the full scene-graph
          transform and composes correctly under a rotated parent */}
      <Beach size={matrix.totalSize} zSign={1} />
      <Beach size={matrix.totalSize} zSign={-1} />
      <group rotation={[0, Math.PI / 2, 0]}>
        <Beach size={matrix.totalSize} zSign={1} />
        <Beach size={matrix.totalSize} zSign={-1} />
      </group>
    </group>
  );
};

export default CityBlocks;
