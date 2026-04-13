// MockDataSource — Wrapper around existing mockDatabase.ts
// Provides a uniform interface for local mock/seed data

import { MockDB } from '@/lib/mockDatabase';

export class MockDataSource {
  // Pengurus
  getPengurus(): unknown[] {
    return MockDB.getPengurus();
  }

  // Templates (Surat)
  getTemplates(category?: string): unknown[] {
    return MockDB.getTemplates(category);
  }

  getTemplateById(id: string): unknown | null {
    return MockDB.getTemplateById(id);
  }

  submitLetter(templateId: string, data: Record<string, string>): string {
    return MockDB.submitLetter(templateId, data);
  }

  // Finance
  getFinanceReports(): unknown[] {
    return MockDB.getFinanceReports();
  }

  getFinanceSummary(): Record<string, unknown> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return MockDB.getFinanceSummary() as any as Record<string, unknown>;
  }
}

// Singleton
let _instance: MockDataSource | null = null;

export function getMockDataSource(): MockDataSource {
  if (!_instance) {
    _instance = new MockDataSource();
  }
  return _instance;
}
