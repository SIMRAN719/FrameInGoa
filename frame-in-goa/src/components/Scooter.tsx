import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ScooterProps {
  /** Fixed coordinate on the cross-axis (z if axis="x", x if axis="z"). */
  offset: number;
  axis: 'x' | 'z';
  range: number;
  color?: string;
  speed?: number;
  phase?: number;
}

// Wheel radius (0.09) + local drop (0.08) below the body center — this is the
// exact group-space height that puts the wheel contact patch at world y=0.
const GROUND_Y = 0.17;

const Scooter = ({ offset, axis, range, color = '#F26B21', speed = 0.6, phase = 0 }: ScooterProps) => {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime() * speed + phase;
    const along = Math.sin(t) * range;
    const forward = Math.cos(t) >= 0 ? 0 : Math.PI;
    if (axis === 'x') {
      group.current.position.set(along, GROUND_Y, offset);
      group.current.rotation.y = forward;
    } else {
      group.current.position.set(offset, GROUND_Y, along);
      group.current.rotation.y = forward + Math.PI / 2;
    }
  });

  return (
    <group ref={group}>
      {/* contact-shadow blob — keeps the scooter visually pinned to the street */}
      <mesh position={[0, -GROUND_Y + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.32, 12]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.4} depthWrite={false} />
      </mesh>

      <mesh castShadow>
        <boxGeometry args={[0.5, 0.18, 0.22]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.18, 0.17, 0]} castShadow>
        <boxGeometry args={[0.06, 0.18, 0.18]} />
        <meshStandardMaterial color="#201206" />
      </mesh>
      <mesh position={[-0.21, -0.08, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.06, 12]} />
        <meshStandardMaterial color="#201206" />
      </mesh>
      <mesh position={[0.21, -0.08, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.06, 12]} />
        <meshStandardMaterial color="#201206" />
      </mesh>
      {/* headlight glow, front of the body */}
      <mesh position={[0.27, 0, 0]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshStandardMaterial color="#fff6d8" emissive="#ffe89a" emissiveIntensity={2} toneMapped={false} />
      </mesh>
    </group>
  );
};

export default Scooter;
