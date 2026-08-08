// Goa-flavored color palettes shared by the 3D street scene and the
// flat scannable QR export, so both views read as the same place.

export const GOA_DARK_PALETTE = [
  '#7A2E1D', // laterite terracotta roof
  '#1F4B3F', // deep coconut-palm green
  '#5C3A21', // weathered wood brown
  '#8A3324', // deep rust orange
  '#2E5339', // banana-leaf dark green
  '#6B2E4D', // deep bougainvillea plum
] as const;

export const GOA_LIGHT_PALETTE = [
  '#F5C242', // sunshine yellow
  '#FFDD8A', // beach sand
  '#FDF3D9', // whitewashed cream
  '#F4A63A', // warm orange
  '#F2C230', // marigold
] as const;

export const GOA_ACCENT_PALETTE = [
  '#F26B21', // Goa orange
  '#2E9E4F', // palm green
  '#F2C230', // sunshine yellow
  '#E24E9C', // sunset pink
  '#2F80ED', // Arabian Sea blue
] as const;

/** Stable FNV-1a style hash for deterministic per-cell pseudo-randomness. */
export function hashCode(...parts: number[]): number {
  let h = 2166136261;
  for (const p of parts) {
    h ^= p;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pick<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length];
}

/** Deterministic pseudo-random float in [0, 1) derived from a seed. */
export function unitFromSeed(seed: number): number {
  return (seed % 1000) / 1000;
}
