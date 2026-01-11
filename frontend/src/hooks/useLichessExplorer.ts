import { useState, useEffect, useCallback } from 'react';
import { lichessApi } from '../api/lichess';
import type { ExplorerResponse } from '../types/chess';

export function useLichessExplorer(fen: string) {
  const [data, setData] = useState<ExplorerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!fen) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    lichessApi
      .getMasterGames(fen)
      .then((response) => {
        if (!cancelled) {
          setData(response);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fen]);

  const isBookMove = useCallback(
    (move: string): boolean => {
      if (!data) return false;
      return data.moves.some((m) => m.san === move || m.uci === move);
    },
    [data]
  );

  const getBookMoves = useCallback((): string[] => {
    if (!data) return [];
    return data.moves.map((m) => m.san);
  }, [data]);

  return { data, isLoading, error, isBookMove, getBookMoves };
}
