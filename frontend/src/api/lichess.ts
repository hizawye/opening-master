import type { ExplorerResponse } from '../types/chess';

const LICHESS_EXPLORER_URL = import.meta.env.VITE_LICHESS_EXPLORER_URL || 'https://explorer.lichess.ovh';

export const lichessApi = {
  getMasterGames: async (fen: string): Promise<ExplorerResponse> => {
    const params = new URLSearchParams({
      fen,
      topGames: '0',
    });
    const response = await fetch(`${LICHESS_EXPLORER_URL}/masters?${params}`);
    return response.json();
  },

  getLichessGames: async (
    fen: string,
    ratings: number[] = [1600, 1800, 2000, 2200, 2500],
    speeds: string[] = ['rapid', 'classical']
  ): Promise<ExplorerResponse> => {
    const params = new URLSearchParams({
      fen,
      ratings: ratings.join(','),
      speeds: speeds.join(','),
      topGames: '0',
    });
    const response = await fetch(`${LICHESS_EXPLORER_URL}/lichess?${params}`);
    return response.json();
  },
};
