import { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';

function makeBeachBallTexture(colorA: string, colorB: string): THREE.Texture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  const wedges = 6;
  for (let i = 0; i < wedges; i++) {
    ctx.fillStyle = i % 2 === 0 ? colorA : colorB;
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    const a0 = (i / wedges) * Math.PI * 2;
    const a1 = ((i + 1) / wedges) * Math.PI * 2;
    for (let a = a0; a <= a1; a += 0.05) {
      ctx.lineTo(size / 2 + Math.sin(a) * size, size / 2 - Math.cos(a) * size);
    }
    ctx.closePath();
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

interface BeachBallProps {
  x: number;
  z: number;
  colorA?: string;
  colorB?: string;
}

export const BeachBall = ({ x, z, colorA = '#F26B21', colorB = '#2F80ED' }: BeachBallProps) => {
  const map = useMemo(() => makeBeachBallTexture(colorA, colorB), [colorA, colorB]);
  return (
    <mesh position={[x, 0.14, z]} castShadow>
      <sphereGeometry args={[0.14, 16, 16]} />
      <meshStandardMaterial map={map} roughness={0.5} />
    </mesh>
  );
};

interface VolleyballNetProps {
  x: number;
  z: number;
  rotation?: number;
}

function makeNetTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();
  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 1.4;
  const step = 8;
  for (let i = 0; i <= size; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const VolleyballNet = ({ x, z, rotation = 0 }: VolleyballNetProps) => {
  const netMap = useMemo(() => makeNetTexture(), []);
  const width = 1.4;
  const height = 0.42;
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      <mesh position={[-width / 2, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, height, 6]} />
        <meshStandardMaterial color="#4A2E1E" roughness={0.9} />
      </mesh>
      <mesh position={[width / 2, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, height, 6]} />
        <meshStandardMaterial color="#4A2E1E" roughness={0.9} />
      </mesh>
      <mesh position={[0, height * 0.62, 0]}>
        <planeGeometry args={[width, height * 0.7]} />
        <meshStandardMaterial map={netMap} transparent side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
};

interface CoolerProps {
  x: number;
  z: number;
  rotation?: number;
}

/** A small beach cooler box with a couple of drink cans beside it. */
export const Cooler = ({ x, z, rotation = 0 }: CoolerProps) => {
  const canColors = ['#F5C242', '#E24E9C', '#2F80ED'];
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.09, 0]} castShadow>
        <boxGeometry args={[0.22, 0.18, 0.16]} />
        <meshStandardMaterial color="#2F80ED" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.19, 0]} castShadow>
        <boxGeometry args={[0.24, 0.03, 0.18]} />
        <meshStandardMaterial color="#FDF3D9" roughness={0.6} />
      </mesh>
      {canColors.map((c, i) => (
        <mesh key={c} position={[0.18 + i * 0.08, 0.045, 0.02]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.09, 8]} />
          <meshStandardMaterial color={c} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

interface BeachTowelProps {
  x: number;
  z: number;
  rotation?: number;
  color?: string;
}

export const BeachTowel = ({ x, z, rotation = 0, color = '#E24E9C' }: BeachTowelProps) => {
  const stripes = useMemo<[number, number, number][][]>(() => {
    const n = 5;
    const w = 0.4;
    const lines: [number, number, number][][] = [];
    for (let i = 1; i < n; i++) {
      const lx = -w / 2 + (i / n) * w;
      lines.push([
        [lx, 0.005, -0.28],
        [lx, 0.005, 0.28],
      ]);
    }
    return lines;
  }, []);

  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
        <planeGeometry args={[0.4, 0.6]} />
        <meshStandardMaterial color={color} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {stripes.map((pts, i) => (
        <Line key={i} points={pts} color="#FDF3D9" lineWidth={1.2} />
      ))}
    </group>
  );
};
