import type { MoveCategory } from '../types/practice';

// Centipawn loss thresholds
const THRESHOLDS = {
  BEST: 10,
  GOOD: 50,
  INACCURACY: 100,
  MISTAKE: 200,
};

export function categorizeMove(centipawnLoss: number, isBookMove: boolean): MoveCategory {
  if (isBookMove) return 'book';
  if (centipawnLoss <= THRESHOLDS.BEST) return 'best';
  if (centipawnLoss <= THRESHOLDS.GOOD) return 'good';
  if (centipawnLoss <= THRESHOLDS.INACCURACY) return 'inaccuracy';
  if (centipawnLoss <= THRESHOLDS.MISTAKE) return 'mistake';
  return 'blunder';
}

export function calculateCentipawnLoss(
  evalBefore: number,
  evalAfter: number,
  playerColor: 'white' | 'black'
): number {
  // Normalize evaluations from player's perspective
  const beforeFromPlayer = playerColor === 'white' ? evalBefore : -evalBefore;
  const afterFromPlayer = playerColor === 'white' ? evalAfter : -evalAfter;

  // Loss is how much worse the position got
  const loss = beforeFromPlayer - afterFromPlayer;

  // Can't have negative loss (position improved)
  return Math.max(0, loss);
}

export const CATEGORY_COLORS: Record<MoveCategory, string> = {
  book: '#9333ea',
  best: '#22c55e',
  good: '#84cc16',
  inaccuracy: '#eab308',
  mistake: '#f97316',
  blunder: '#ef4444',
};

export const CATEGORY_LABELS: Record<MoveCategory, string> = {
  book: 'Book Move',
  best: 'Best Move',
  good: 'Good Move',
  inaccuracy: 'Inaccuracy',
  mistake: 'Mistake',
  blunder: 'Blunder',
};

export function formatEvaluation(score: number, scoreType: 'cp' | 'mate'): string {
  if (scoreType === 'mate') {
    return score > 0 ? `M${score}` : `M${Math.abs(score)}`;
  }
  const pawns = score / 100;
  return pawns >= 0 ? `+${pawns.toFixed(1)}` : pawns.toFixed(1);
}
