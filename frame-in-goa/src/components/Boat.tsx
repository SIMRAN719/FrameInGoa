import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BoatProps {
  x: number;
  z: number;
  hullColor?: string;
  sailColor?: string;
  phase?: number;
}

/** A tiny low-poly fishing boat, gently bobbing and rocking on the water. */
const Boat = ({ x, z, hullColor = '#8B5A2B', sailColor = '#FDF3D9', phase = 0 }: BoatProps) => {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const t = clock.getElapsedTime() + phase;
    g.position.set(x + Math.sin(t * 0.25) * 0.3, Math.sin(t * 1.6) * 0.05, z + Math.cos(t * 0.2) * 0.2);
    g.rotation.z = Math.sin(t * 1.4) * 0.08;
    g.rotation.x = Math.cos(t * 1.1) * 0.05;
    g.rotation.y = Math.sin(t * 0.15) * 0.4;
  });

  return (
    <group ref={group}>
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.14, 0.18]} />
        <meshStandardMaterial color={hullColor} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[0, 0, Math.PI]} castShadow>
        <coneGeometry args={[0.11, 0.22, 4]} />
        <meshStandardMaterial color={hullColor} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.3, 5]} />
        <meshStandardMaterial color="#4A2E1E" roughness={0.9} />
      </mesh>
      <mesh position={[0.06, 0.22, 0]}>
        <planeGeometry args={[0.18, 0.2]} />
        <meshStandardMaterial color={sailColor} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
    </group>
  );
};

export default Boat;
