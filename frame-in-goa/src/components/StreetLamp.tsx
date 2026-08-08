interface StreetLampProps {
  x: number;
  z: number;
}

/** A small daytime lamp post — streetscape detail along the promenade. */
const StreetLamp = ({ x, z }: StreetLampProps) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 0.4, 0]} castShadow>
      <cylinderGeometry args={[0.025, 0.03, 0.8, 6]} />
      <meshStandardMaterial color="#2a1c10" roughness={0.7} />
    </mesh>
    <mesh position={[0, 0.82, 0]} castShadow>
      <sphereGeometry args={[0.07, 8, 8]} />
      <meshStandardMaterial color="#FDF3D9" roughness={0.4} />
    </mesh>
  </group>
);

export default StreetLamp;
