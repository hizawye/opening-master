import { useState, useEffect, useCallback } from 'react';
import { lichessApi } from '../api/lichess';
import type { ExplorerResponse } from '../types/chess';

export function useLichessExplorer(
  currentFen: string,
  prefetchPositions?: string[]
) {
  const [cache, setCache] = useState<Map<string, ExplorerResponse>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch and cache helper
  const fetchAndCache = useCallback(async (fen: string) => {
    if (cache.has(fen)) return; // Already cached

    try {
      const response = await lichessApi.getMasterGames(fen);
      setCache(prev => new Map(prev).set(fen, response));
    } catch (err) {
      console.warn('Lichess fetch failed for', fen, err);
    }
  }, [cache]);

  // Fetch current position
  useEffect(() => {
    if (!currentFen) return;

    setIsLoading(true);
    setError(null);

    fetchAndCache(currentFen).finally(() => setIsLoading(false));
  }, [currentFen, fetchAndCache]);

  // Pre-fetch upcoming positions
  useEffect(() => {
    if (!prefetchPositions || prefetchPositions.length === 0) return;

    // Pre-fetch in background (don't set loading state)
    prefetchPositions.forEach(fen => fetchAndCache(fen));
  }, [prefetchPositions, fetchAndCache]);

  // Check if move is in book (NOW TAKES fenBefore parameter)
  const isBookMove = useCallback((move: string, fenBefore: string): boolean => {
    const data = cache.get(fenBefore); // Use fenBefore, not current FEN
    if (!data) return false;
    return data.moves.some(m => m.san === move || m.uci === move);
  }, [cache]);

  // Get all book moves for a position
  const getBookMoves = useCallback((fen?: string): string[] => {
    const data = cache.get(fen || currentFen);
    if (!data) return [];
    return data.moves.map(m => m.san);
  }, [cache, currentFen]);

  return {
    data: cache.get(currentFen) || null,
    isLoading,
    error,
    isBookMove,
    getBookMoves,
    cache
  };
}
