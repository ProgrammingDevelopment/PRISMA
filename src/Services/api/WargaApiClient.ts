// WargaApiClient — REST API client for Warga microservice

import { createApiClient, type ApiResponse } from './ApiClient';
import type { WargaEntity, StatistikWarga } from '@/models/entities/Warga';
import type { PengurusEntity } from '@/models/entities/Warga';

const client = createApiClient('/warga');

export const WargaApiClient = {
  async getAll(): Promise<ApiResponse<WargaEntity[]>> {
    return client.get<WargaEntity[]>('/');
  },

  async getById(id: number): Promise<ApiResponse<WargaEntity>> {
    return client.get<WargaEntity>(`/${id}`);
  },

  async create(data: Partial<WargaEntity>): Promise<ApiResponse<WargaEntity>> {
    return client.post<WargaEntity>('/', data);
  },

  async update(id: number, data: Partial<WargaEntity>): Promise<ApiResponse<WargaEntity>> {
    return client.put<WargaEntity>(`/${id}`, data);
  },

  async delete(id: number): Promise<ApiResponse<void>> {
    return client.delete<void>(`/${id}`);
  },

  async getStats(): Promise<ApiResponse<StatistikWarga>> {
    return client.get<StatistikWarga>('/stats');
  },

  async getPengurus(): Promise<ApiResponse<PengurusEntity[]>> {
    return client.get<PengurusEntity[]>('/pengurus');
  },

  async search(query: string): Promise<ApiResponse<WargaEntity[]>> {
    return client.get<WargaEntity[]>(`/search?q=${encodeURIComponent(query)}`);
  },

  async healthCheck(): Promise<boolean> {
    return client.healthCheck();
  },
};
