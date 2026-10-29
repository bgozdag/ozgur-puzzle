import type { PieceCount } from './scoring';

/**
 * Her satırdaki parça sayısı. Satırlar farklı sayıda parçaya bölünerek
 * 14 ve 32 gibi sayılarda da parçalar kareye yakın kalır.
 */
const ROWS: Record<PieceCount, number[]> = {
  8: [3, 2, 3],
  14: [4, 3, 4, 3],
  20: [4, 4, 4, 4, 4],
  32: [6, 5, 5, 6, 5, 5],
};

/** Parçanın görsel üzerindeki yeri, 0..1 oranında */
export type PieceRect = { id: number; x: number; y: number; w: number; h: number };

export function pieceGrid(count: PieceCount): PieceRect[] {
  const rows = ROWS[count];
  const h = 1 / rows.length;
  const pieces: PieceRect[] = [];
  rows.forEach((cols, r) => {
    const w = 1 / cols;
    for (let c = 0; c < cols; c++) pieces.push({ id: pieces.length, x: c * w, y: r * h, w, h });
  });
  return pieces;
}

export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
