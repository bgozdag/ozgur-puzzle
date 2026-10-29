export const PIECE_COUNTS = [8, 14, 20, 32] as const;
export type PieceCount = (typeof PIECE_COUNTS)[number];

export const isPieceCount = (n: number): n is PieceCount => (PIECE_COUNTS as readonly number[]).includes(n);

/**
 * Puan skalası: her parça sayısının bir taban puanı ve hedef süresi vardır.
 *  - Hedef süre içinde biterse  : 3 yıldız → taban x 3
 *  - Hedef sürenin 2 katı içinde: 2 yıldız → taban x 2
 *  - Daha uzun sürerse          : 1 yıldız → taban x 1
 */
export const SCORING: Record<PieceCount, { base: number; targetSeconds: number }> = {
  8: { base: 100, targetSeconds: 60 },
  14: { base: 200, targetSeconds: 120 },
  20: { base: 300, targetSeconds: 180 },
  32: { base: 500, targetSeconds: 300 },
};

export type Stars = 1 | 2 | 3;

export function starsFor(pieces: PieceCount, seconds: number): Stars {
  const { targetSeconds } = SCORING[pieces];
  if (seconds <= targetSeconds) return 3;
  if (seconds <= targetSeconds * 2) return 2;
  return 1;
}

export function scoreFor(pieces: PieceCount, seconds: number): { score: number; stars: Stars } {
  const stars = starsFor(pieces, seconds);
  return { score: SCORING[pieces].base * stars, stars };
}

export function formatTime(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export function formatMinutes(seconds: number) {
  return seconds % 60 === 0 ? `${seconds / 60} dk` : `${(seconds / 60).toFixed(1)} dk`;
}
