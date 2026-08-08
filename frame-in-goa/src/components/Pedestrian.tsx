import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PedestrianProps {
  axis: 'x' | 'z';
  offset: number;
  center: number;
  range: number;
  color?: string;
  speed?: number;
  phase?: number;
}

/** A tiny low-poly figure strolling a short patch of sidewalk — street life. */
const Pedestrian = ({ axis, offset, center, range, color = '#201206', speed = 0.9, phase = 0 }: PedestrianProps) => {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const t = clock.getElapsedTime() * speed + phase;
    const along = center + Math.sin(t) * range;
    const bob = Math.abs(Math.sin(t * 6)) * 0.03;
    const facing = Math.cos(t) >= 0 ? 0 : Math.PI;
    if (axis === 'x') {
      g.position.set(along, 0.14 + bob, offset);
      g.rotation.y = facing;
    } else {
      g.position.set(offset, 0.14 + bob, along);
      g.rotation.y = facing + Math.PI / 2;
    }
  });

  return (
    <group ref={group}>
      <mesh castShadow>
        <capsuleGeometry args={[0.045, 0.14, 3, 6]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.13, 0]} castShadow>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#E2B48A" roughness={0.9} />
      </mesh>
    </group>
  );
};

export default Pedestrian;
