import QRCode from 'qrcode';

const QUIET_ZONE = 4;

export interface QrMatrix {
  /** Number of modules on one side of the raw QR symbol (excludes quiet zone). */
  size: number;
  quietZone: number;
  /** size + quietZone * 2 */
  totalSize: number;
  isDark: (row: number, col: number) => boolean;
  isQuietZone: (row: number, col: number) => boolean;
  /** Finder / timing pattern zones — kept clean of decoration for reliable scanning. */
  isStructural: (row: number, col: number) => boolean;
}

export function buildQrMatrix(text: string): QrMatrix {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'H' });
  const { modules } = qr;
  const size = modules.size;
  const totalSize = size + QUIET_ZONE * 2;

  const inBounds = (r: number, c: number) => r >= 0 && r < size && c >= 0 && c < size;

  const isDark = (row: number, col: number): boolean => {
    const r = row - QUIET_ZONE;
    const c = col - QUIET_ZONE;
    if (!inBounds(r, c)) return false;
    return modules.get(r, c) === 1;
  };

  const isQuietZone = (row: number, col: number): boolean => {
    const r = row - QUIET_ZONE;
    const c = col - QUIET_ZONE;
    return !inBounds(r, c);
  };

  const isStructural = (row: number, col: number): boolean => {
    const r = row - QUIET_ZONE;
    const c = col - QUIET_ZONE;
    if (!inBounds(r, c)) return false;
    const inFinder = (r < 8 && c < 8) || (r < 8 && c >= size - 8) || (r >= size - 8 && c < 8);
    const inTiming = r === 6 || c === 6;
    return inFinder || inTiming;
  };

  return { size, quietZone: QUIET_ZONE, totalSize, isDark, isQuietZone, isStructural };
}
