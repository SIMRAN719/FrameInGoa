import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { GOA_ACCENT_PALETTE } from '../lib/goaPalette';

interface BuntingProps {
  size: number;
}

const FLAG_COUNT = 20;
// Fixed height near the tallest rooftops — NOT scaled by grid size, that was
// the bug that sent these flags drifting ~20 units into the sky.
const LINE_Y = 2.05;
const SAG = 0.35;

/** A string of small fluttering pennant flags hung on a visible rope — the "wind". */
const Bunting = ({ size }: BuntingProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const half = size / 2;
  const span = Math.min(size * 0.9, 14);

  const flags = useMemo(
    () =>
      Array.from({ length: FLAG_COUNT }, (_, i) => {
        const p = i / (FLAG_COUNT - 1);
        const x = -span / 2 + p * span;
        const sag = Math.sin(p * Math.PI) * SAG;
        const y = LINE_Y - sag;
        const color = GOA_ACCENT_PALETTE[i % GOA_ACCENT_PALETTE.length];
        return { x, y, color };
      }),
    [span],
  );

  const ropePoints = useMemo<[number, number, number][]>(
    () => flags.map((f) => [f.x, f.y + 0.06, 0]),
    [flags],
  );

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    g.children.forEach((flag, i) => {
      if (!(flag instanceof THREE.Mesh)) return;
      flag.rotation.y = Math.sin(t * 2.2 + i * 0.5) * 0.6;
      flag.rotation.z = 0.12 + Math.sin(t * 1.4 + i * 0.3) * 0.08;
    });
  });

  return (
    <group position={[0, 0, -half - 0.5]}>
      {/* grounded support posts at each end — without these the rope reads as floating */}
      <mesh position={[-span / 2, LINE_Y / 2, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.045, LINE_Y, 6]} />
        <meshStandardMaterial color="#4A2E1E" roughness={0.85} />
      </mesh>
      <mesh position={[span / 2, LINE_Y / 2, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.045, LINE_Y, 6]} />
        <meshStandardMaterial color="#4A2E1E" roughness={0.85} />
      </mesh>
      <Line points={ropePoints} color="#4A2E1E" lineWidth={1.4} />
      <group ref={groupRef}>
        {flags.map((f, i) => (
          <mesh key={i} position={[f.x, f.y, 0]}>
            <planeGeometry args={[0.22, 0.3]} />
            <meshStandardMaterial color={f.color} side={THREE.DoubleSide} roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export default Bunting;
