// Demo Credentials for Beta Mode Preview
// Domain: rt0409.local
// Full Stack Frontend Engineer Testing

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

// Demo credentials dengan domain rt0409.local
export const DEMO_USERS: DemoUser[] = [
    // ============ ADMIN ============
    {
        id: 1,
        email: "admin@rt0409.local",
        password: "admin123",
        nama: "Pak Hendra Wijaya",
        role: "admin",
        no_telepon: "081234567890",
        tanggal_lahir: "1975-03-15",
        alamat: "Jl. Kemayoran Baru No. 10",
        blok: "A",
        no_rumah: "10",
        status: "Aktif",
        foto_path: null,
        permissions: ['all', 'manage_users', 'manage_finance', 'manage_letters', 'manage_security']
    },
    // ============ PENGURUS RT ============
    {
        id: 2,
        email: "sekretaris@rt0409.local",
        password: "sekret123",
        nama: "Ibu Sari Dewi",
        role: "pengurus",
        no_telepon: "081234567891",
        tanggal_lahir: "1980-07-22",
        alamat: "Gg. Bugis No. 15",
        blok: "A",
        no_rumah: "15",
        status: "Aktif",
        foto_path: null,
        permissions: ['manage_letters', 'view_finance', 'manage_residents']
    },
    {
        id: 3,
        email: "bendahara@rt0409.local",
        password: "benda123",
        nama: "Pak Ahmad Fauzi",
        role: "pengurus",
        no_telepon: "081234567892",
        tanggal_lahir: "1978-11-08",
        alamat: "Gg. Bugis No. 20",
        blok: "A",
        no_rumah: "20",
        status: "Aktif",
        foto_path: null,
        permissions: ['manage_finance', 'view_letters', 'view_residents']
    },
    {
        id: 4,
        email: "keamanan@rt0409.local",
        password: "keamanan123",
        nama: "Pak Budi Santoso",
        role: "pengurus",
        no_telepon: "081234567893",
        tanggal_lahir: "1982-05-18",
        alamat: "Gg. Bugis No. 25",
        blok: "B",
        no_rumah: "25",
        status: "Aktif",
        foto_path: null,
        permissions: ['manage_security', 'view_residents']
    },
    // ============ WARGA ============
    {
        id: 5,
        email: "budi.warga@rt0409.local",
        password: "warga123",
        nama: "Budi Prasetyo",
        role: "warga",
        no_telepon: "081234567894",
        tanggal_lahir: "1990-01-10",
        alamat: "Gg. Bugis No. 30",
        blok: "B",
        no_rumah: "30",
        status: "Aktif",
        foto_path: null,
        permissions: ['view_own_profile', 'request_letters', 'view_announcements']
    },
    {
        id: 6,
        email: "siti.warga@rt0409.local",
        password: "warga123",
        nama: "Siti Aminah",
        role: "warga",
        no_telepon: "081234567895",
        tanggal_lahir: "1988-04-25",
        alamat: "Gg. Bugis No. 35",
        blok: "B",
        no_rumah: "35",
        status: "Aktif",
        foto_path: null,
        permissions: ['view_own_profile', 'request_letters', 'view_announcements']
    },
    {
        id: 7,
        email: "joko.warga@rt0409.local",
        password: "warga123",
        nama: "Joko Susilo",
        role: "warga",
        no_telepon: "081234567896",
        tanggal_lahir: "1985-09-12",
        alamat: "Gg. Bugis No. 40",
        blok: "C",
        no_rumah: "40",
        status: "Aktif",
        foto_path: null,
        permissions: ['view_own_profile', 'request_letters', 'view_announcements']
    },
    {
        id: 8,
        email: "dewi.warga@rt0409.local",
        password: "warga123",
        nama: "Dewi Lestari",
        role: "warga",
        no_telepon: "081234567897",
        tanggal_lahir: "1992-12-03",
        alamat: "Gg. Bugis No. 45",
        blok: "C",
        no_rumah: "45",
        status: "Pending",
        foto_path: null,
        permissions: ['view_own_profile', 'view_announcements']
    },
];

// Authentication helper
export function authenticateDemo(email: string, password: string): DemoUser | null {
    const user = DEMO_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    return user || null;
}

// Get user by email
export function getDemoUserByEmail(email: string): DemoUser | null {
    return DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

// Check permission
export function hasPermission(user: DemoUser, permission: string): boolean {
    return user.permissions.includes('all') || user.permissions.includes(permission);
}

// Beta mode config
export const BETA_CONFIG = {
    version: "1.0.0-beta",
    environment: "preview",
    features: {
        demoLogin: true,
        customFinanceInput: true,
        realtimeAnalysis: true,
        budgetMonitoring: true
    },
    domain: "rt0409.local",
    lastUpdated: "2026-01-27"
};
