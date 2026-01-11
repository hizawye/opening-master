import api from './client';
import type { Repertoire, CreateRepertoireRequest, AddOpeningRequest, Opening } from '../types/repertoire';

export const repertoireApi = {
  list: async (): Promise<Repertoire[]> => {
    const response = await api.get<Repertoire[]>('/repertoires');
    return response.data;
  },

  get: async (id: string): Promise<Repertoire> => {
    const response = await api.get<Repertoire>(`/repertoires/${id}`);
    return response.data;
  },

  create: async (data: CreateRepertoireRequest): Promise<Repertoire> => {
    const response = await api.post<Repertoire>('/repertoires', data);
    return response.data;
  },

  update: async (id: string, data: CreateRepertoireRequest): Promise<Repertoire> => {
    const response = await api.put<Repertoire>(`/repertoires/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/repertoires/${id}`);
  },

  addOpening: async (repertoireId: string, data: AddOpeningRequest): Promise<Opening> => {
    const response = await api.post<Opening>(`/repertoires/${repertoireId}/openings`, data);
    return response.data;
  },

  updateOpening: async (repertoireId: string, openingId: string, data: AddOpeningRequest): Promise<Opening> => {
    const response = await api.put<Opening>(`/repertoires/${repertoireId}/openings/${openingId}`, data);
    return response.data;
  },

  deleteOpening: async (repertoireId: string, openingId: string): Promise<void> => {
    await api.delete(`/repertoires/${repertoireId}/openings/${openingId}`);
  },
};
