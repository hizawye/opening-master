import api from './client';
import type { PracticeSession, StartPracticeRequest, SubmitMoveRequest, PracticeMove } from '../types/practice';

export const practiceApi = {
  start: async (data: StartPracticeRequest): Promise<PracticeSession> => {
    const response = await api.post<PracticeSession>('/practice/start', data);
    return response.data;
  },

  submitMove: async (sessionId: string, data: SubmitMoveRequest): Promise<PracticeMove> => {
    const response = await api.post<PracticeMove>(`/practice/${sessionId}/move`, data);
    return response.data;
  },

  end: async (sessionId: string): Promise<PracticeSession> => {
    const response = await api.post<PracticeSession>(`/practice/${sessionId}/end`);
    return response.data;
  },

  getSession: async (sessionId: string): Promise<PracticeSession> => {
    const response = await api.get<PracticeSession>(`/practice/${sessionId}`);
    return response.data;
  },

  getHistory: async (): Promise<PracticeSession[]> => {
    const response = await api.get<PracticeSession[]>('/practice/history');
    return response.data;
  },
};
