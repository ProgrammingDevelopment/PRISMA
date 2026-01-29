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
        nama: "Swandaru Tirta Sandhika",
        role: "admin",
        no_telepon: "081234567890",
        tanggal_lahir: "2003-05-16",
        alamat: "Sekretariat RT 04",
        blok: "A",
        no_rumah: "01",
        status: "Aktif",
        foto_path: null,
        permissions: ['all', 'manage_users', 'manage_finance', 'manage_letters', 'manage_security']
    },
    // ============ PENGURUS RT ============
    {
        id: 2,
        email: "ketuart@rt0409.local",
        password: "ketua123",
        nama: "Erry Adu Sundaru",
        role: "pengurus",
        no_telepon: "087872004448",
        tanggal_lahir: "1980-01-01",
        alamat: "Jl. Utama RT 04",
        blok: "A",
        no_rumah: "02",
        status: "Aktif",
        foto_path: null,
        permissions: ['manage_all', 'approve_letters', 'view_finance']
    },
    {
        id: 3,
        email: "sekretaris@rt0409.local",
        password: "sekret123",
        nama: "Melly",
        role: "pengurus",
        no_telepon: "081234567892",
        tanggal_lahir: "1985-05-20",
        alamat: "Jl. Mawar No. 10",
        blok: "B",
        no_rumah: "10",
        status: "Aktif",
        foto_path: null,
        permissions: ['manage_letters', 'manage_residents', 'view_finance']
    },
    {
        id: 4,
        email: "bendahara1@rt0409.local",
        password: "benda123",
        nama: "Retno Feliyanti",
        role: "pengurus",
        no_telepon: "081234567893",
        tanggal_lahir: "1982-08-15",
        alamat: "Jl. Melati No. 5",
        blok: "B",
        no_rumah: "05",
        status: "Aktif",
        foto_path: null,
        permissions: ['manage_finance', 'view_residents']
    },
    {
        id: 5,
        email: "bendahara2@rt0409.local",
        password: "benda456",
        nama: "Jasmine Renatha",
        role: "pengurus",
        no_telepon: "081234567894",
        tanggal_lahir: "1990-11-30",
        alamat: "Jl. Anggrek No. 8",
        blok: "C",
        no_rumah: "08",
        status: "Aktif",
        foto_path: null,
        permissions: ['manage_finance', 'view_residents']
    },
    {
        id: 6,
        email: "humas@rt0409.local",
        password: "humas123",
        nama: "Wahyu",
        role: "pengurus",
        no_telepon: "081234567895",
        tanggal_lahir: "1988-04-12",
        alamat: "Jl. Kenanga No. 12",
        blok: "C",
        no_rumah: "12",
        status: "Aktif",
        foto_path: null,
        permissions: ['manage_security', 'view_residents', 'broadcast_announcements']
    },
    // ============ WARGA / GUEST ============
    {
        id: 7,
        email: "guest@rt0409.local",
        password: "guest123",
        nama: "Warga Tamu (Guest)",
        role: "warga",
        no_telepon: "-",
        tanggal_lahir: "2000-01-01",
        alamat: "-",
        blok: "-",
        no_rumah: "-",
        status: "Aktif",
        foto_path: null,
        permissions: ['view_public_info', 'view_announcements']
    },
    {
        id: 8,
        email: "warga@rt0409.local",
        password: "warga123",
        nama: "Warga Contoh",
        role: "warga",
        no_telepon: "081111111111",
        tanggal_lahir: "1995-01-01",
        alamat: "Jl. Warga No. 1",
        blok: "D",
        no_rumah: "01",
        status: "Aktif",
        foto_path: null,
        permissions: ['view_own_profile', 'request_letters']
    }
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
