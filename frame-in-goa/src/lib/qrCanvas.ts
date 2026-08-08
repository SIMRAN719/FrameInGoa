import type { QrMatrix } from './qr';
import { GOA_DARK_PALETTE, GOA_LIGHT_PALETTE, hashCode, pick } from './goaPalette';

export const QR_CELL_PX = 16;

/**
 * Renders the QR matrix as flat, high-contrast colored squares on a 2D
 * canvas — no lighting, no perspective, pixel-perfect module boundaries.
 * This is what actually gets scanned; the 3D scene is the showpiece.
 */
export function createGoaQrCanvas(matrix: QrMatrix, decorate = true): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const px = matrix.totalSize * QR_CELL_PX;
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.imageSmoothingEnabled = false;

  for (let row = 0; row < matrix.totalSize; row++) {
    for (let col = 0; col < matrix.totalSize; col++) {
      const dark = matrix.isDark(row, col);
      const seed = hashCode(row, col, dark ? 97 : 13);
      const color = dark ? pick(GOA_DARK_PALETTE, seed) : pick(GOA_LIGHT_PALETTE, seed);
      ctx.fillStyle = color;
      ctx.fillRect(col * QR_CELL_PX, row * QR_CELL_PX, QR_CELL_PX, QR_CELL_PX);

      const isDecorable =
        decorate && !dark && !matrix.isQuietZone(row, col) && !matrix.isStructural(row, col);
      if (isDecorable && seed % 9 === 0) {
        ctx.fillStyle = pick(['#1F4B3F', '#2E5339'], seed);
        const r = QR_CELL_PX * 0.2;
        ctx.beginPath();
        ctx.arc(col * QR_CELL_PX + QR_CELL_PX / 2, row * QR_CELL_PX + QR_CELL_PX / 2, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  return canvas;
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
