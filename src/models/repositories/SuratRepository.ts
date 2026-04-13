// SuratRepository — Data access for Letter/Document domain
// Delegates to MockDB

import { BaseRepository, QueryResult } from './BaseRepository';
import {
  type LetterTemplateEntity,
  type LetterSubmissionResult,
  filterTemplatesByCategory,
  getTemplateDownloadUrl,
} from '../entities/Surat';

const getMockDB = async () => {
  if (typeof window === 'undefined') return null;
  const { MockDB } = await import('@/lib/mockDatabase');
  return MockDB;
};

export class SuratRepository extends BaseRepository<LetterTemplateEntity, string> {
  async getAll(): Promise<LetterTemplateEntity[]> {
    const MockDB = await getMockDB();
    if (!MockDB) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return MockDB.getTemplates() as any as LetterTemplateEntity[];
  }

  async getById(id: string): Promise<LetterTemplateEntity | null> {
    const MockDB = await getMockDB();
    if (!MockDB) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (MockDB.getTemplateById(id) as any as LetterTemplateEntity) ?? null;
  }

  async getByCategory(category: string): Promise<LetterTemplateEntity[]> {
    const templates = await this.getAll();
    return filterTemplatesByCategory(templates, category);
  }

  async create(_entity: Partial<LetterTemplateEntity>): Promise<QueryResult<LetterTemplateEntity>> {
    return { success: false, error: 'Template creation not supported in local mode' };
  }

  async update(_id: string, _entity: Partial<LetterTemplateEntity>): Promise<QueryResult<LetterTemplateEntity>> {
    return { success: false, error: 'Template update not supported in local mode' };
  }

  async delete(_id: string): Promise<QueryResult<void>> {
    return { success: false, error: 'Template deletion not supported in local mode' };
  }

  async submitRequest(templateId: string, data: Record<string, string>): Promise<LetterSubmissionResult> {
    try {
      const MockDB = await getMockDB();
      if (!MockDB) return { success: false, message: 'Database not available' };

      const submissionId = MockDB.submitLetter(templateId, data);
      return {
        success: true,
        submissionId,
        message: 'Permohonan surat berhasil dikirim',
      };
    } catch (error) {
      return { success: false, message: `Failed to submit letter request: ${error}` };
    }
  }

  getDownloadUrl(templateId: string, format: 'docx' | 'pdf'): string {
    return getTemplateDownloadUrl(templateId, format);
  }
}

// Singleton instance
let _instance: SuratRepository | null = null;

export function getSuratRepository(): SuratRepository {
  if (!_instance) {
    _instance = new SuratRepository();
  }
  return _instance;
}
