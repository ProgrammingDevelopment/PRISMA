// Model Entity: User
// Domain entity untuk autentikasi dan otorisasi

export interface UserEntity {
  id: number;
  email: string;
  password: string; // bcrypt hashed
  nama: string;
  role: UserRole;
  noTelepon: string;
}

export type UserRole = 'admin' | 'staff' | 'warga';

export interface SecureCredentials {
  userId: string;
  role: UserRole;
  sessionToken: string;
  expiresAt: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  credentials?: SecureCredentials;
  message?: string;
}

export interface RegistrationRequest {
  email: string;
  password: string;
  nama: string;
  noTelepon?: string;
}

// Validation
export function validateLoginRequest(request: LoginRequest): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!request.email || !request.email.includes('@')) {
    errors.push('Email tidak valid');
  }

  if (!request.password || request.password.length < 6) {
    errors.push('Password minimal 6 karakter');
  }

  return { valid: errors.length === 0, errors };
}

export function validateRegistration(request: RegistrationRequest): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!request.email || !request.email.includes('@')) {
    errors.push('Email tidak valid');
  }

  if (!request.password || request.password.length < 8) {
    errors.push('Password minimal 8 karakter');
  }

  if (!request.nama || request.nama.trim().length < 2) {
    errors.push('Nama minimal 2 karakter');
  }

  if (request.noTelepon && !/^[0-9+\-\s]{8,15}$/.test(request.noTelepon)) {
    errors.push('Format nomor telepon tidak valid');
  }

  return { valid: errors.length === 0, errors };
}

// Check if credentials are expired
export function isSessionExpired(credentials: SecureCredentials): boolean {
  return Date.now() > credentials.expiresAt;
}

// Check role permissions
export function hasPermission(role: UserRole, requiredRole: UserRole): boolean {
  const hierarchy: Record<UserRole, number> = {
    admin: 3,
    staff: 2,
    warga: 1,
  };
  return hierarchy[role] >= hierarchy[requiredRole];
}
