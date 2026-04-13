// WargaMapper — Maps between data transfer objects and domain entities
// Handles snake_case (DB) ↔ camelCase (Entity) conversion

import { type WargaEntity, type WargaStatus, createWargaEntity } from '../entities/Warga';

// DTO from SQLite (snake_case)
export interface WargaDTO {
  id: number;
  nama: string;
  alamat: string;
  status: string;
  telepon: string;
  created_at?: string;
}

// Display model (used in Views)
export interface WargaDisplayModel {
  id: number;
  nama: string;
  alamat: string;
  statusBadge: {
    label: string;
    color: string;
  };
  teleponDisplay: string; // masked or formatted
}

/**
 * Map DTO (database row) → Entity (domain)
 */
export function toEntity(dto: WargaDTO): WargaEntity {
  return createWargaEntity({
    id: dto.id,
    nama: dto.nama,
    alamat: dto.alamat,
    status: dto.status as WargaStatus,
    telepon: dto.telepon,
    createdAt: dto.created_at,
  });
}

/**
 * Map Entity → DTO (for database write)
 */
export function toDTO(entity: WargaEntity): WargaDTO {
  return {
    id: entity.id,
    nama: entity.nama,
    alamat: entity.alamat,
    status: entity.status,
    telepon: entity.telepon,
    created_at: entity.createdAt,
  };
}

/**
 * Map Entity → Display model (for UI rendering)
 */
export function toDisplayModel(entity: WargaEntity): WargaDisplayModel {
  const statusColors: Record<WargaStatus, string> = {
    Tetap: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Kontrak: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    Kost: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    Baru: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return {
    id: entity.id,
    nama: entity.nama,
    alamat: entity.alamat,
    statusBadge: {
      label: entity.status,
      color: statusColors[entity.status] ?? 'bg-gray-100 text-gray-800',
    },
    teleponDisplay: maskPhoneNumber(entity.telepon),
  };
}

/**
 * Mask phone number for privacy display
 * "081234567890" → "0812****7890"
 */
function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 8) return phone || '-';
  const start = phone.slice(0, 4);
  const end = phone.slice(-4);
  return `${start}****${end}`;
}

/**
 * Batch convert DTOs → Entities
 */
export function toEntityList(dtos: WargaDTO[]): WargaEntity[] {
  return dtos.map(toEntity);
}

/**
 * Batch convert Entities → Display models
 */
export function toDisplayModelList(entities: WargaEntity[]): WargaDisplayModel[] {
  return entities.map(toDisplayModel);
}
