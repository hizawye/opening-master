import { useRef, useCallback } from 'react';
import { Chess } from 'chess.js';

export function useChess(initialFen?: string) {
  const gameRef = useRef(new Chess(initialFen));

  const getFen = useCallback(() => {
    return gameRef.current.fen();
  }, []);

  const getHistory = useCallback(() => {
    return gameRef.current.history({ verbose: true });
  }, []);

  const getPgn = useCallback(() => {
    return gameRef.current.pgn();
  }, []);

  const makeMove = useCallback((move: string | { from: string; to: string; promotion?: string }) => {
    try {
      const result = gameRef.current.move(move);
      return result;
    } catch {
      return null;
    }
  }, []);

  const undo = useCallback(() => {
    return gameRef.current.undo();
  }, []);

  const reset = useCallback(() => {
    gameRef.current.reset();
  }, []);

  const loadFen = useCallback((fen: string) => {
    gameRef.current.load(fen);
  }, []);

  const loadPgn = useCallback((pgn: string) => {
    gameRef.current.loadPgn(pgn);
  }, []);

  const isGameOver = useCallback(() => {
    return gameRef.current.isGameOver();
  }, []);

  const isCheck = useCallback(() => {
    return gameRef.current.isCheck();
  }, []);

  const isCheckmate = useCallback(() => {
    return gameRef.current.isCheckmate();
  }, []);

  const turn = useCallback(() => {
    return gameRef.current.turn() === 'w' ? 'white' : 'black';
  }, []);

  const getLegalMoves = useCallback(() => {
    return gameRef.current.moves({ verbose: true });
  }, []);

  return {
    game: gameRef.current,
    getFen,
    getHistory,
    getPgn,
    makeMove,
    undo,
    reset,
    loadFen,
    loadPgn,
    isGameOver,
    isCheck,
    isCheckmate,
    turn,
    getLegalMoves,
  };
}
