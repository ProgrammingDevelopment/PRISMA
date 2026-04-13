// Model Entity: Surat
// Domain entity untuk template surat dan pengajuan

export interface LetterTemplateEntity {
  id: string;
  title: string;
  description: string;
  category: LetterCategory;
  files: {
    docx: string;
    pdf: string;
  };
  requiredFields: string[];
}

export type LetterCategory = 'Administrasi' | 'Kependudukan';

export interface LetterRequestEntity {
  id: string;
  templateId: string;
  pemohon: string;
  status: LetterStatus;
  dataJson: Record<string, string>;
  createdAt: string;
}

export type LetterStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LetterSubmissionResult {
  success: boolean;
  submissionId?: string;
  message?: string;
}

// Factory function
export function createLetterRequest(
  templateId: string,
  pemohon: string,
  data: Record<string, string>
): Omit<LetterRequestEntity, 'id'> {
  return {
    templateId,
    pemohon,
    status: 'Pending',
    dataJson: data,
    createdAt: new Date().toISOString(),
  };
}

// Validation
export function validateLetterRequest(
  templateId: string,
  data: Record<string, string>,
  requiredFields: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!templateId) {
    errors.push('Template surat wajib dipilih');
  }

  for (const field of requiredFields) {
    if (!data[field] || data[field].trim().length === 0) {
      errors.push(`Field "${field}" wajib diisi`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// Filter templates by category
export function filterTemplatesByCategory(
  templates: LetterTemplateEntity[],
  category?: string
): LetterTemplateEntity[] {
  if (!category) return templates;
  return templates.filter(t => t.category === category);
}

// Generate download URL
export function getTemplateDownloadUrl(templateId: string, format: 'docx' | 'pdf'): string {
  return `/templates/surat/${templateId}.${format}`;
}
