import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Water } from 'three-stdlib';
import { buildRibbonGeometry, coastCurve } from '../lib/coastline';
import { createWaterNormalTexture } from '../lib/waterNormalTexture';
import { SUN_DIRECTION } from '../lib/sunDirection';
import Hut, { Umbrella } from './Hut';
import Boat from './Boat';
import { BeachBall, VolleyballNet, Cooler, BeachTowel } from './BeachToys';

interface BeachProps {
  size: number;
  /** +1 = beach sits beyond the +z edge, -1 = beyond the -z edge. */
  zSign: 1 | -1;
}

const SAND_BASE = 1.9;
const SAND_AMPLITUDE = 1.0;
const SEA_WIDTH = 6.5;
const SEA_FAR_AMPLITUDE = 0.7;
const RIBBON_SEGMENTS = 48;

let sharedWaterNormals: THREE.Texture | null = null;
function getWaterNormals(): THREE.Texture {
  if (!sharedWaterNormals) sharedWaterNormals = createWaterNormalTexture(256);
  return sharedWaterNormals;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A curved, sandy bay lined with huts, with a real reflective sea beyond it. */
const Beach = ({ size, zSign }: BeachProps) => {
  const foamRef = useRef<THREE.Mesh>(null);

  // Kept tight (not padded far past the corners) since beaches now wrap all
  // four sides of the city and would otherwise overlap heavily at the corners.
  const ribbonLength = size + 4;
  const seed = zSign === 1 ? 4.1 : 11.7;

  const cityZ = zSign * (size / 2);
  const shoreZ = (x: number) => zSign * (size / 2 + SAND_BASE + coastCurve(x, seed) * (SAND_AMPLITUDE / 2));
  const farZ = (x: number) =>
    zSign * (size / 2 + SAND_BASE + SEA_WIDTH + coastCurve(x * 0.6 + 20, seed) * SEA_FAR_AMPLITUDE);

  const sandGeometry = useMemo(
    () => buildRibbonGeometry(() => cityZ, shoreZ, ribbonLength, RIBBON_SEGMENTS),
    [size, zSign],
  );

  const waterGeometry = useMemo(
    () => buildRibbonGeometry(shoreZ, farZ, ribbonLength, RIBBON_SEGMENTS, true),
    [size, zSign],
  );

  const foamGeometry = useMemo(
    () =>
      buildRibbonGeometry(
        (x) => shoreZ(x) - zSign * 0.18,
        (x) => shoreZ(x) + zSign * 0.18,
        ribbonLength,
        RIBBON_SEGMENTS,
      ),
    [size, zSign],
  );

  const water = useMemo(() => {
    const w = new Water(waterGeometry, {
      textureWidth: 256,
      textureHeight: 256,
      waterNormals: getWaterNormals(),
      sunDirection: SUN_DIRECTION,
      sunColor: 0xfff4d6,
      waterColor: 0x0f6f8a,
      distortionScale: 1.8,
      alpha: 0.97,
      fog: false,
      side: THREE.DoubleSide,
    });
    w.rotation.x = -Math.PI / 2;
    w.receiveShadow = true;
    w.material.uniforms.size.value = 2.2;
    return w;
  }, [waterGeometry]);

  useFrame((_, delta) => {
    water.material.uniforms.time.value += delta * 0.6;
    const foamMat = foamRef.current?.material as THREE.MeshBasicMaterial | undefined;
    if (foamMat) {
      foamMat.opacity = 0.4 + Math.sin(performance.now() * 0.0016) * 0.15;
    }
  });

  const decor = useMemo(() => {
    const rand = mulberry32(Math.floor(size * 1000) + (zSign === 1 ? 7 : 13));
    const huts: { x: number; z: number; rotation: number; scale: number; roof: string }[] = [];
    const umbrellas: { x: number; z: number; color: string }[] = [];
    const boats: { x: number; z: number; phase: number }[] = [];
    const balls: { x: number; z: number; a: string; b: string }[] = [];
    const nets: { x: number; z: number; rotation: number }[] = [];
    const coolers: { x: number; z: number; rotation: number }[] = [];
    const towels: { x: number; z: number; rotation: number; color: string }[] = [];
    const roofColors = ['#C99A4B', '#B98442', '#D9AE63'];
    const umbrellaColors = ['#E24E9C', '#F26B21', '#2F80ED', '#2E9E4F'];
    const towelColors = ['#E24E9C', '#2F80ED', '#F5C242', '#2E9E4F'];
    const count = Math.max(5, Math.floor(size / 7));
    for (let i = 0; i < count; i++) {
      const x = -size / 2 + (i + 0.5) * (size / count) + (rand() - 0.5) * 2;
      const shore = shoreZ(x);
      const z = cityZ + (shore - cityZ) * (0.35 + rand() * 0.4);
      huts.push({
        x,
        z,
        rotation: rand() * Math.PI * 2,
        scale: 0.85 + rand() * 0.35,
        roof: roofColors[i % roofColors.length],
      });
      if (i % 2 === 0) {
        umbrellas.push({ x: x + 1.1, z: z + (rand() - 0.5) * 0.6, color: umbrellaColors[i % umbrellaColors.length] });
      }
      // beach party clutter, sprinkled on the open sand between huts
      const openZ = cityZ + (shore - cityZ) * (0.55 + rand() * 0.3);
      if (i % 3 === 0) balls.push({ x: x - 0.6 + rand() * 0.6, z: openZ, a: umbrellaColors[i % 4], b: '#FDF3D9' });
      if (i % 4 === 1) coolers.push({ x: x + 0.4, z: openZ - 0.3, rotation: rand() * Math.PI });
      if (i % 4 === 2) towels.push({ x: x - 0.5, z: openZ + 0.2, rotation: rand() * Math.PI, color: towelColors[i % 4] });
    }
    if (count >= 2) {
      const netX = -size / 4;
      nets.push({ x: netX, z: cityZ + (shoreZ(netX) - cityZ) * 0.6, rotation: Math.PI / 2 + (rand() - 0.5) * 0.3 });
    }
    for (let i = 0; i < 2; i++) {
      const x = -size / 3 + i * (size / 1.5) + (rand() - 0.5) * 2;
      const sea = farZ(x);
      const shore = shoreZ(x);
      boats.push({ x, z: shore + (sea - shore) * 0.5, phase: rand() * 10 });
    }
    return { huts, umbrellas, boats, balls, nets, coolers, towels };
  }, [size, zSign]);

  return (
    <group>
      <mesh geometry={sandGeometry} receiveShadow>
        <meshStandardMaterial color="#F4D9A0" roughness={1} side={THREE.DoubleSide} />
      </mesh>

      <mesh ref={foamRef} geometry={foamGeometry}>
        <meshBasicMaterial color="#eafcff" transparent opacity={0.5} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      <primitive object={water} />

      {decor.huts.map((h, i) => (
        <Hut key={i} x={h.x} z={h.z} rotation={h.rotation} scale={h.scale} roofColor={h.roof} />
      ))}
      {decor.umbrellas.map((u, i) => (
        <Umbrella key={i} x={u.x} z={u.z} color={u.color} />
      ))}
      {decor.boats.map((b, i) => (
        <Boat key={i} x={b.x} z={b.z} phase={b.phase} />
      ))}
      {decor.balls.map((b, i) => (
        <BeachBall key={i} x={b.x} z={b.z} colorA={b.a} colorB={b.b} />
      ))}
      {decor.nets.map((n, i) => (
        <VolleyballNet key={i} x={n.x} z={n.z} rotation={n.rotation} />
      ))}
      {decor.coolers.map((c, i) => (
        <Cooler key={i} x={c.x} z={c.z} rotation={c.rotation} />
      ))}
      {decor.towels.map((t, i) => (
        <BeachTowel key={i} x={t.x} z={t.z} rotation={t.rotation} color={t.color} />
      ))}
    </group>
  );
};

export default Beach;
