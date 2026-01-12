import { useState, useEffect, useCallback, useRef } from 'react';
import type { Evaluation } from '../types/chess';

interface StockfishState {
  isReady: boolean;
  isAnalyzing: boolean;
  evaluation: Evaluation | null;
  bestMove: string | null;
}

export function useStockfish() {
  const [state, setState] = useState<StockfishState>({
    isReady: false,
    isAnalyzing: false,
    evaluation: null,
    bestMove: null,
  });

  const workerRef = useRef<Worker | null>(null);
  const resolveRef = useRef<((move: string) => void) | null>(null);

  useEffect(() => {
    // Create a web worker for Stockfish
    // Pass the origin from main thread since blob workers don't have access to location.origin
    const origin = window.location.origin;

    const workerCode = `
      let stockfish = null;
      const ORIGIN = '${origin}';

      self.onmessage = function(e) {
        const { type, payload } = e.data;

        if (type === 'INIT') {
          try {
            const stockfishPath = ORIGIN + '/stockfish/stockfish.js';
            stockfish = new Worker(stockfishPath);
            stockfish.onmessage = function(event) {
              self.postMessage({ type: 'ENGINE_MESSAGE', payload: event.data });
            };
            stockfish.postMessage('uci');
          } catch (error) {
            self.postMessage({ type: 'ERROR', payload: error.message || String(error) });
          }
        } else if (stockfish) {
          stockfish.postMessage(payload);
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    workerRef.current = new Worker(URL.createObjectURL(blob));

    workerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;

      if (type === 'ENGINE_MESSAGE') {
        handleEngineMessage(payload);
      } else if (type === 'ERROR') {
        console.error('Stockfish error:', payload);
      }
    };

    workerRef.current.postMessage({ type: 'INIT' });

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleEngineMessage = (message: string) => {
    if (message === 'uciok') {
      workerRef.current?.postMessage({ type: 'CMD', payload: 'isready' });
    } else if (message === 'readyok') {
      setState((s) => ({ ...s, isReady: true }));
    } else if (message.startsWith('info depth')) {
      const evaluation = parseInfoLine(message);
      if (evaluation) {
        setState((s) => ({ ...s, evaluation }));
      }
    } else if (message.startsWith('bestmove')) {
      const bestMove = message.split(' ')[1];
      setState((s) => ({ ...s, bestMove, isAnalyzing: false }));
      if (resolveRef.current) {
        resolveRef.current(bestMove);
        resolveRef.current = null;
      }
    }
  };

  const parseInfoLine = (line: string): Evaluation | null => {
    const depthMatch = line.match(/depth (\d+)/);
    const scoreMatch = line.match(/score (cp|mate) (-?\d+)/);
    const pvMatch = line.match(/pv (.+)$/);

    if (!depthMatch || !scoreMatch) return null;

    return {
      depth: parseInt(depthMatch[1]),
      scoreType: scoreMatch[1] as 'cp' | 'mate',
      score: parseInt(scoreMatch[2]),
      pv: pvMatch ? pvMatch[1].split(' ') : [],
    };
  };

  const analyze = useCallback((fen: string, depth = 20) => {
    if (!workerRef.current || !state.isReady) return;

    setState((s) => ({ ...s, isAnalyzing: true, evaluation: null }));
    workerRef.current.postMessage({ type: 'CMD', payload: `position fen ${fen}` });
    workerRef.current.postMessage({ type: 'CMD', payload: `go depth ${depth}` });
  }, [state.isReady]);

  const stop = useCallback(() => {
    if (!workerRef.current) return;
    workerRef.current.postMessage({ type: 'CMD', payload: 'stop' });
  }, []);

  const getBestMove = useCallback((fen: string, depth = 15): Promise<string> => {
    return new Promise((resolve) => {
      if (!workerRef.current || !state.isReady) {
        resolve('');
        return;
      }

      resolveRef.current = resolve;
      setState((s) => ({ ...s, isAnalyzing: true }));
      workerRef.current.postMessage({ type: 'CMD', payload: `position fen ${fen}` });
      workerRef.current.postMessage({ type: 'CMD', payload: `go depth ${depth}` });
    });
  }, [state.isReady]);

  const getEvaluation = useCallback((fen: string, depth = 15): Promise<number> => {
    return new Promise((resolve) => {
      if (!workerRef.current || !state.isReady) {
        resolve(0);
        return;
      }

      let latestEvaluation: number | null = null;
      let timeoutId: number;

      const handleMessage = (e: MessageEvent) => {
        if (e.data.type === 'ENGINE_MESSAGE') {
          const message = e.data.payload;

          // Capture evaluation from info lines (fixes closure bug)
          if (message.startsWith('info depth')) {
            const evaluation = parseInfoLine(message);
            if (evaluation) {
              latestEvaluation = evaluation.score;
            }
          }

          // Resolve when bestmove arrives with captured evaluation
          if (message.startsWith('bestmove')) {
            clearTimeout(timeoutId);
            workerRef.current?.removeEventListener('message', handleMessage);
            resolve(latestEvaluation || 0);
          }
        }
      };

      // Add timeout to prevent hanging
      timeoutId = window.setTimeout(() => {
        workerRef.current?.removeEventListener('message', handleMessage);
        resolve(latestEvaluation || 0);
      }, 10000); // 10 second timeout

      workerRef.current.addEventListener('message', handleMessage);
      workerRef.current.postMessage({ type: 'CMD', payload: `position fen ${fen}` });
      workerRef.current.postMessage({ type: 'CMD', payload: `go depth ${depth}` });
    });
  }, [state.isReady]); // Remove state.evaluation dependency

  return {
    ...state,
    analyze,
    stop,
    getBestMove,
    getEvaluation,
  };
}
