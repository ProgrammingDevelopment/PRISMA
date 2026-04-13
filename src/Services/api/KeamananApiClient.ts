// KeamananApiClient — REST API client for Keamanan microservice

import { createApiClient, type ApiResponse } from './ApiClient';
import type { SecurityReportEntity, SecurityStatsEntity, IncidentTypeEntity, SecurityReportSubmission } from '@/models/entities/Keamanan';

const client = createApiClient('/keamanan');

export const KeamananApiClient = {
  async getReports(): Promise<ApiResponse<SecurityReportEntity[]>> {
    return client.get<SecurityReportEntity[]>('/reports');
  },

  async submitReport(report: SecurityReportSubmission): Promise<ApiResponse<{ reportId: string; priority: string }>> {
    return client.post<{ reportId: string; priority: string }>('/reports', report);
  },

  async getStats(): Promise<ApiResponse<SecurityStatsEntity>> {
    return client.get<SecurityStatsEntity>('/stats');
  },

  async getIncidentTypes(): Promise<ApiResponse<IncidentTypeEntity[]>> {
    return client.get<IncidentTypeEntity[]>('/incidents');
  },

  async healthCheck(): Promise<boolean> {
    return client.healthCheck();
  },
};
