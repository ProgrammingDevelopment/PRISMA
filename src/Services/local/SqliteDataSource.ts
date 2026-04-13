// SqliteDataSource — Wrapper around existing sqliteDB.ts
// Provides a uniform interface for local SQLite data access

import { SqliteDB } from '@/lib/sqliteDB';

export class SqliteDataSource {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    if (typeof window === 'undefined') return;
    await SqliteDB.init();
    this.initialized = true;
  }

  async isAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      await this.init();
      return true;
    } catch {
      return false;
    }
  }

  // Warga operations
  getAllWarga(): unknown[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return SqliteDB.getAllWarga() as any as unknown[];
  }

  addWarga(data: Record<string, unknown>): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SqliteDB.addWarga(data as any);
  }

  // Security operations
  getAllSecurityReports(): unknown[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return SqliteDB.getAllSecurityReports() as any as unknown[];
  }

  addSecurityReport(report: Record<string, unknown>): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SqliteDB.addSecurityReport(report as any);
  }

  // Database management
  exportDB(): Uint8Array | null {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return SqliteDB.exportDB() as any;
  }

  importDB(data: Uint8Array): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SqliteDB.importDB(data as any);
  }
}

// Singleton
let _instance: SqliteDataSource | null = null;

export function getSqliteDataSource(): SqliteDataSource {
  if (!_instance) {
    _instance = new SqliteDataSource();
  }
  return _instance;
}
