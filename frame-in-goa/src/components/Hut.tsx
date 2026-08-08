interface HutProps {
  x: number;
  z: number;
  rotation: number;
  scale?: number;
  roofColor?: string;
  wallColor?: string;
}

/** A small thatched-roof Goa beach hut — old-school shack vibes. */
const Hut = ({ x, z, rotation, scale = 1, roofColor = '#C99A4B', wallColor = '#8B5A2B' }: HutProps) => {
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]} scale={scale}>
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.46, 0.56, 8]} />
        <meshStandardMaterial color={wallColor} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.62, 0]} castShadow>
        <coneGeometry args={[0.68, 0.5, 8]} />
        <meshStandardMaterial color={roofColor} roughness={1} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#4A2E1E" roughness={1} />
      </mesh>
      <mesh position={[0, 0.14, 0.44]} castShadow>
        <boxGeometry args={[0.22, 0.3, 0.06]} />
        <meshStandardMaterial color="#4A2E1E" roughness={0.9} />
      </mesh>
    </group>
  );
};

interface UmbrellaProps {
  x: number;
  z: number;
  color?: string;
}

/** A cheap beach umbrella + pole for extra shoreline flavour. */
export const Umbrella = ({ x, z, color = '#E24E9C' }: UmbrellaProps) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 0.32, 0]}>
      <cylinderGeometry args={[0.02, 0.02, 0.64, 6]} />
      <meshStandardMaterial color="#4A2E1E" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.62, 0]} castShadow>
      <coneGeometry args={[0.4, 0.26, 10]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  </group>
);

export default Hut;
