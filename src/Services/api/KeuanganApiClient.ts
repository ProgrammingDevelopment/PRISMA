// KeuanganApiClient — REST API client for Keuangan microservice

import { createApiClient, type ApiResponse } from './ApiClient';
import type { MonthlyReportEntity, ExpenseSummaryEntity, BalanceInfo, TransactionEntity } from '@/models/entities/Keuangan';

const client = createApiClient('/keuangan');

export const KeuanganApiClient = {
  async getReports(): Promise<ApiResponse<MonthlyReportEntity[]>> {
    return client.get<MonthlyReportEntity[]>('/reports');
  },

  async getReportByPeriod(bulan: string, tahun: number): Promise<ApiResponse<MonthlyReportEntity>> {
    return client.get<MonthlyReportEntity>(`/reports/${encodeURIComponent(bulan)}/${tahun}`);
  },

  async getBalance(): Promise<ApiResponse<BalanceInfo>> {
    return client.get<BalanceInfo>('/balance');
  },

  async getSummary(): Promise<ApiResponse<ExpenseSummaryEntity>> {
    return client.get<ExpenseSummaryEntity>('/summary');
  },

  async addTransaction(transaction: Partial<TransactionEntity>): Promise<ApiResponse<TransactionEntity>> {
    return client.post<TransactionEntity>('/transactions', transaction);
  },

  async healthCheck(): Promise<boolean> {
    return client.healthCheck();
  },
};
