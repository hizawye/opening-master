import { useRef, useCallback } from 'react';
import type { useStockfish } from './useStockfish';

/**
 * Hook for caching Stockfish evaluations to avoid race conditions and improve performance
 *
 * Pre-computes evaluations before they're needed, stores results in a ref-based Map cache
 */
export function useEvaluationCache(
  stockfish: ReturnType<typeof useStockfish>,
  depth: number = 15
) {
  const cache = useRef<Map<string, number>>(new Map());

  /**
   * Get evaluation for a FEN position, using cache if available
   */
  const getCachedEvaluation = useCallback(async (fen: string): Promise<number> => {
    if (cache.current.has(fen)) {
      return cache.current.get(fen)!;
    }

    if (!stockfish.isReady) return 0;

    const evaluation = await stockfish.getEvaluation(fen, depth);
    cache.current.set(fen, evaluation);
    return evaluation;
  }, [stockfish, depth]);

  /**
   * Pre-fetch evaluations for multiple positions
   * Useful for warming up the cache before practice starts
   */
  const prefetchEvaluations = useCallback(async (fens: string[]) => {
    await Promise.all(fens.map(fen => getCachedEvaluation(fen)));
  }, [getCachedEvaluation]);

  /**
   * Clear the evaluation cache
   */
  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  return { getCachedEvaluation, prefetchEvaluations, clearCache };
}
