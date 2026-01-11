export interface Evaluation {
  depth: number;
  scoreType: 'cp' | 'mate';
  score: number;
  pv: string[];
}

export interface ChessMove {
  from: string;
  to: string;
  promotion?: string;
  san?: string;
  uci?: string;
}

export interface ExplorerMove {
  uci: string;
  san: string;
  white: number;
  draws: number;
  black: number;
  averageRating: number;
}

export interface ExplorerResponse {
  white: number;
  draws: number;
  black: number;
  moves: ExplorerMove[];
  opening?: {
    eco: string;
    name: string;
  };
}
