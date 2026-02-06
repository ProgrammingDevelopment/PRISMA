// Demo Credentials have been removed for security.
// This file is kept to avoid import errors in legacy code, but contains no actual data.

export interface DemoUser {
    id: number;
    email: string;
    password: string;
    nama: string;
    role: 'admin' | 'pengurus' | 'warga';
    no_telepon: string;
    tanggal_lahir: string;
    alamat: string;
    blok: string;
    no_rumah: string;
    status: 'Aktif' | 'Pending' | 'Nonaktif';
    foto_path: string | null;
    permissions: string[];
}

export const DEMO_USERS: DemoUser[] = [];

export function authenticateDemo(email: string, password: string): DemoUser | null {
    return null;
}

export function getDemoUserByEmail(email: string): DemoUser | null {
    return null;
}

export function hasPermission(user: DemoUser, permission: string): boolean {
    return false;
}

export const BETA_CONFIG = {
    version: "1.0.0-beta",
    environment: "production",
    features: {
        demoLogin: false,
        customFinanceInput: true,
        realtimeAnalysis: true,
        budgetMonitoring: true
    },
    domain: "rt0409.local",
    lastUpdated: "2026-02-07"
};
