import type { MoveCategory } from '../types/practice';

// Simplified for repertoire-only drilling
// No engine evaluation needed - just correct/incorrect

export const CATEGORY_COLORS: Record<MoveCategory, string> = {
  repertoire: '#a855f7', // Purple - correct move
  mistake: '#ef4444',    // Red - wrong move
};

export const CATEGORY_LABELS: Record<MoveCategory, string> = {
  repertoire: 'Correct',
  mistake: 'Try Again',
};
