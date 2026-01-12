import { useState, useEffect } from 'react';
import { RepertoireNavigator } from '../utils/repertoireNavigator';
import type { Repertoire } from '../types/repertoire';

/**
 * React hook wrapper for RepertoireNavigator with automatic lifecycle management
 *
 * Automatically rebuilds the navigator when repertoire, color, or variation settings change
 */
export function useRepertoireNavigator(
  repertoire: Repertoire | null,
  playerColor: 'white' | 'black',
  allowVariations: boolean = false
) {
  const [navigator, setNavigator] = useState<RepertoireNavigator | null>(null);

  useEffect(() => {
    if (!repertoire) {
      setNavigator(null);
      return;
    }

    const nav = new RepertoireNavigator(repertoire, playerColor, allowVariations);
    setNavigator(nav);
  }, [repertoire, playerColor, allowVariations]);

  return navigator;
}
