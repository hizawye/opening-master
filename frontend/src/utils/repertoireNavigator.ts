import type { Repertoire, MoveNode } from '../types/repertoire';

/**
 * RepertoireNavigator - Utility for traversing repertoire MoveNode trees
 *
 * Provides O(1) position lookup via FEN-based mapping and handles:
 * - Finding opponent responses from the repertoire
 * - Validating user moves against prepared lines
 * - Supporting both main line and variation play
 * - Handling transpositions naturally via FEN matching
 */
export class RepertoireNavigator {
  private positionMap: Map<string, MoveNode>;
  private playerColor: 'white' | 'black';
  private allowVariations: boolean;

  constructor(
    repertoire: Repertoire,
    playerColor: 'white' | 'black',
    allowVariations: boolean = false
  ) {
    this.playerColor = playerColor;
    this.allowVariations = allowVariations;
    this.positionMap = this.buildPositionMap(repertoire);
  }

  /**
   * Build FEN → MoveNode lookup map for O(1) position finding
   */
  private buildPositionMap(repertoire: Repertoire): Map<string, MoveNode> {
    const map = new Map<string, MoveNode>();

    repertoire.openings.forEach(opening => {
      // Start from starting position (default to initial chess position)
      const startFen = opening.starting_fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      this.traverseMoves(opening.moves, map, startFen);
    });

    return map;
  }

  /**
   * Recursively traverse move tree and build position map
   * Maps: parent FEN → MoveNode (contains children for that position)
   */
  private traverseMoves(
    moves: MoveNode[],
    map: Map<string, MoveNode>,
    parentFen: string
  ): void {
    moves.forEach(move => {
      // Store this position's possible continuations
      // If multiple moves exist for same position, we store the first one
      // (children array will contain all variations)
      if (!map.has(parentFen)) {
        map.set(parentFen, move);
      } else {
        // Position already exists - this is a variation
        // Merge children arrays
        const existing = map.get(parentFen)!;
        if (!existing.children) {
          existing.children = [];
        }
        existing.children.push(move);
      }

      // Recursively process children using this move's resulting FEN
      if (move.children && move.children.length > 0) {
        this.traverseMoves(move.children, map, move.fen);
      }
    });
  }

  /**
   * Get opponent's response move for a given position
   * Returns UCI notation, or null if out of repertoire
   */
  getOpponentMove(currentFen: string): string | null {
    const position = this.positionMap.get(currentFen);
    if (!position || !position.children || position.children.length === 0) {
      return null; // Out of repertoire
    }

    if (this.allowVariations && position.children.length > 1) {
      // Pick random variation for training variety
      const randomIndex = Math.floor(Math.random() * position.children.length);
      return position.children[randomIndex].uci;
    } else {
      // Always play main line (or first move if no main line marked)
      const mainLineMove = position.children.find(child => child.is_main_line);
      return mainLineMove?.uci || position.children[0].uci;
    }
  }

  /**
   * Check if user's move matches any move in the repertoire for this position
   * Accepts both SAN and UCI notation
   */
  isRepertoireMove(fenBefore: string, userMove: string): boolean {
    const position = this.positionMap.get(fenBefore);
    if (!position || !position.children) return false;

    return position.children.some(child =>
      child.move === userMove || child.uci === userMove
    );
  }

  /**
   * Get all expected repertoire moves for a position
   * Returns array of MoveNodes (can include multiple variations)
   */
  getExpectedMoves(fen: string): MoveNode[] {
    const position = this.positionMap.get(fen);
    return position?.children || [];
  }

  /**
   * Get all positions in the repertoire for pre-fetching
   * Useful for warming up caches and pre-loading data
   */
  getAllPositions(): string[] {
    return Array.from(this.positionMap.keys());
  }

  /**
   * Check if a position exists in the repertoire
   */
  hasPosition(fen: string): boolean {
    return this.positionMap.has(fen);
  }

  /**
   * Get the number of positions in the repertoire
   */
  getPositionCount(): number {
    return this.positionMap.size;
  }
}
