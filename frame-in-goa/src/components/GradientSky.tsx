import { useMemo } from 'react';
import * as THREE from 'three';
import { SUN_DIRECTION } from '../lib/sunDirection';

interface GradientSkyProps {
  radius: number;
}

const vertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vWorldPosition;
  uniform vec3 topColor;
  uniform vec3 midColor;
  uniform vec3 horizonColor;
  uniform vec3 sunDirection;
  uniform vec3 sunColor;

  void main() {
    float h = normalize(vWorldPosition).y;
    vec3 sky = mix(horizonColor, midColor, smoothstep(-0.02, 0.32, h));
    sky = mix(sky, topColor, smoothstep(0.22, 0.95, h));

    float sunAmount = max(dot(normalize(vWorldPosition), normalize(sunDirection)), 0.0);
    sky += sunColor * pow(sunAmount, 340.0) * 1.6;
    sky += sunColor * pow(sunAmount, 24.0) * 0.5;
    sky += horizonColor * pow(sunAmount, 3.0) * 0.35;

    gl_FragColor = vec4(sky, 1.0);
  }
`;

/** A hand-tuned gradient sky dome — guarantees the sunset palette regardless
 * of camera angle, instead of fighting a physically-based scattering shader's
 * opaque parameter space for a specific art-directed look. */
const GradientSky = ({ radius }: GradientSkyProps) => {
  const uniforms = useMemo(
    () => ({
      topColor: { value: new THREE.Color('#3f6ea8') },
      midColor: { value: new THREE.Color('#ffab5e') },
      horizonColor: { value: new THREE.Color('#ff7a3d') },
      sunDirection: { value: SUN_DIRECTION.clone() },
      sunColor: { value: new THREE.Color('#fff2c2') },
    }),
    [],
  );

  return (
    <mesh scale={[radius, radius, radius]}>
      <sphereGeometry args={[1, 32, 16]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
};

export default GradientSky;
