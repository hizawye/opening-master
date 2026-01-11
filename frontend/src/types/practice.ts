export type MoveCategory = 'book' | 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';

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
}

export interface PracticeMove {
  ply: number;
  fen_before: string;
  fen_after: string;
  user_move: string;
  expected_move?: string;
  category: MoveCategory;
  eval_before: number;
  eval_after: number;
  centipawn_loss: number;
}

export interface PracticeStats {
  total_moves: number;
  book_moves: number;
  best_moves: number;
  good_moves: number;
  inaccuracies: number;
  mistakes: number;
  blunders: number;
  accuracy_percentage: number;
}

export interface StartPracticeRequest {
  repertoire_id: string;
  opening_id?: string;
  mode: 'specific' | 'random';
}

export interface SubmitMoveRequest {
  fen_before: string;
  fen_after: string;
  user_move: string;
  expected_move?: string;
  category: MoveCategory;
  eval_before: number;
  eval_after: number;
  centipawn_loss: number;
}
