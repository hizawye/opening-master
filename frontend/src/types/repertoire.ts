export interface Repertoire {
  id: string;
  user_id: string;
  name: string;
  color: 'white' | 'black';
  openings: Opening[];
  created_at: string;
  updated_at: string;
}

export interface Opening {
  id: string;
  name: string;
  eco: string;
  starting_fen: string;
  moves: MoveNode[];
}

export interface MoveNode {
  fen: string;
  move: string;
  uci: string;
  comment?: string;
  is_main_line: boolean;
  children?: MoveNode[];
}

export interface CreateRepertoireRequest {
  name: string;
  color: 'white' | 'black';
}

export interface AddOpeningRequest {
  name: string;
  eco?: string;
  starting_fen?: string;
  moves?: MoveNode[];
}
