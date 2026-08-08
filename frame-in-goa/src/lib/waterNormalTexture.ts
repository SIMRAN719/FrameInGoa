import * as THREE from 'three';

/**
 * Procedurally bakes a seamless, tileable water-ripple normal map on a
 * canvas — no network fetch, no bundled binary asset. Frequencies are
 * integer multiples of 2π so the height field wraps exactly at the edges.
 */
export function createWaterNormalTexture(size = 256): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  const img = ctx.createImageData(size, size);
  const tau = Math.PI * 2;

  const height = (px: number, py: number) => {
    const u = px / size;
    const v = py / size;
    return (
      Math.sin(tau * (3 * u + 2 * v)) * 0.35 +
      Math.sin(tau * (5 * u - 4 * v + 0.3)) * 0.25 +
      Math.sin(tau * (9 * u + 7 * v + 0.6)) * 0.18 +
      Math.sin(tau * (13 * u - 11 * v + 0.15)) * 0.12 +
      Math.sin(tau * (21 * u + 17 * v + 0.8)) * 0.08
    );
  };

  const strength = 2.4;
  const normal = new THREE.Vector3();
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const hL = height(x - 1, y);
      const hR = height(x + 1, y);
      const hD = height(x, y - 1);
      const hU = height(x, y + 1);
      normal.set((hL - hR) * strength, (hD - hU) * strength, 1).normalize();
      const idx = (y * size + x) * 4;
      img.data[idx] = (normal.x * 0.5 + 0.5) * 255;
      img.data[idx + 1] = (normal.y * 0.5 + 0.5) * 255;
      img.data[idx + 2] = (normal.z * 0.5 + 0.5) * 255;
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}
