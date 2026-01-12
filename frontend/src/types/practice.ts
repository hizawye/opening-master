// Simplified categories for repertoire-only drilling
export type MoveCategory = 'repertoire' | 'mistake';

export interface PracticeSession {
  id: string;
  user_id: string;
  repertoire_id: string;
  opening_id?: string;
  mode: 'specific' | 'random';
  color: 'white' | 'black';
  started_at: string;
  ended_at?: string;
  moves: PracticeMove[];
  stats: PracticeStats;
  config: PracticeConfig;
}

export interface PracticeMove {
  ply: number;
  fen_before: string;
  fen_after: string;
  user_move: string;
  expected_move?: string;
  category: MoveCategory;
}

export interface PracticeStats {
  total_moves: number;
  correct_moves?: number;  // Frontend field
  book_moves?: number;     // Backend field (maps to correct_moves)
  mistakes: number;
  accuracy_percentage: number;
}

export interface StartPracticeRequest {
  repertoire_id: string;
  opening_id?: string;
  mode: 'specific' | 'random';
  config?: PracticeConfig;
}

export interface PracticeConfig {
  max_moves: number;           // 0 = unlimited
  difficulty: 'strict' | 'flexible';
  allow_variations: boolean;
}

export interface SubmitMoveRequest {
  fen_before: string;
  fen_after: string;
  user_move: string;
  expected_move?: string;
  category: MoveCategory;
}
