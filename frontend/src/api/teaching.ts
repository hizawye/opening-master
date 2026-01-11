import api from './client';

interface ExplainOpeningRequest {
  opening_name: string;
  eco?: string;
  pgn?: string;
}

interface SuggestPlanRequest {
  fen: string;
  opening_name?: string;
  player_color: 'white' | 'black';
}

interface AnalyzeMistakeRequest {
  fen: string;
  played_move: string;
  best_move: string;
  centipawn_loss: number;
}

export const teachingApi = {
  explainOpening: async (data: ExplainOpeningRequest): Promise<string> => {
    const response = await api.post<{ explanation: string }>('/teaching/explain-opening', data);
    return response.data.explanation;
  },

  suggestPlan: async (data: SuggestPlanRequest): Promise<string> => {
    const response = await api.post<{ plan: string }>('/teaching/suggest-plan', data);
    return response.data.plan;
  },

  analyzeMistake: async (data: AnalyzeMistakeRequest): Promise<string> => {
    const response = await api.post<{ analysis: string }>('/teaching/analyze-mistake', data);
    return response.data.analysis;
  },
};
