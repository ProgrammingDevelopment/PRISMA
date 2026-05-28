// WargaRepository — Data access for Warga domain
// Delegates to SqliteDB (local) or API client (remote)

import { BaseRepository, QueryResult } from './BaseRepository';
import { type WargaEntity, type WargaStatus, createWargaEntity, type StatistikWarga, computeStatistik } from '../entities/Warga';
import type { PengurusEntity } from '../entities/Warga';

// Lazy imports to avoid SSR issues — these are client-side only modules
const getSqliteDB = async () => {
  if (typeof window === 'undefined') return null;
  const { SqliteDB } = await import('@/lib/sqliteDB');
  return SqliteDB;
};

const getMockDB = async () => {
  if (typeof window === 'undefined') return null;
  const { MockDB } = await import('@/lib/mockDatabase');
  return MockDB;
};

export class WargaRepository extends BaseRepository<WargaEntity> {
  async getAll(): Promise<WargaEntity[]> {
    const SqliteDB = await getSqliteDB();
    if (!SqliteDB) return [];

    await SqliteDB.init();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawData = SqliteDB.getAllWarga() as any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rawData.map((row: any) => createWargaEntity({
      id: row.id as number,
      nama: row.nama as string,
      alamat: row.alamat as string,
      status: row.status as WargaStatus,
      telepon: row.telepon as string,
    }));
  }

  async getById(id: number): Promise<WargaEntity | null> {
    const all = await this.getAll();
    return all.find(w => w.id === id) ?? null;
  }

  async create(entity: Partial<WargaEntity>): Promise<QueryResult<WargaEntity>> {
    try {
      const SqliteDB = await getSqliteDB();
      if (!SqliteDB) return { success: false, error: 'Database not available' };

      await SqliteDB.init();
      SqliteDB.addWarga(entity);
      const created = createWargaEntity(entity);
      return { success: true, data: created };
    } catch (error) {
      return { success: false, error: `Failed to create warga: ${error}` };
    }
  }

  async update(id: number, entity: Partial<WargaEntity>): Promise<QueryResult<WargaEntity>> {
    // SQLite update not yet implemented — placeholder
    try {
      const existing = await this.getById(id);
      if (!existing) return { success: false, error: 'Warga not found' };

      const updated = { ...existing, ...entity, id };
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: `Failed to update warga: ${error}` };
    }
  }

  async delete(id: number): Promise<QueryResult<void>> {
    // SQLite delete not yet implemented — placeholder
    try {
      const exists = await this.exists(id);
      if (!exists) return { success: false, error: 'Warga not found' };
      return { success: true };
    } catch (error) {
      return { success: false, error: `Failed to delete warga: ${error}` };
    }
  }

  async search(query: string): Promise<WargaEntity[]> {
    const all = await this.getAll();
    if (!query || query.trim().length === 0) return all;

    const lowerQuery = query.toLowerCase();
    return all.filter(w =>
      w.nama.toLowerCase().includes(lowerQuery) ||
      w.alamat.toLowerCase().includes(lowerQuery) ||
      w.status.toLowerCase().includes(lowerQuery)
    );
  }

  async getStatistik(): Promise<StatistikWarga> {
    const wargaList = await this.getAll();
    return computeStatistik(wargaList);
  }

  async getPengurus(): Promise<PengurusEntity[]> {
    const MockDB = await getMockDB();
    if (!MockDB) return [];
    return MockDB.getPengurus();
  }
}

// Singleton instance
let _instance: WargaRepository | null = null;

export function getWargaRepository(): WargaRepository {
  if (!_instance) {
    _instance = new WargaRepository();
  }
  return _instance;
}
