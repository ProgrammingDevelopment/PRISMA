-- =============================================
-- DATABASE: admin_rt
-- PRISMA RT 04 - Sistem Manajemen Digital
-- =============================================
-- Step-by-Step Pembuatan Database di phpMyAdmin XAMPP
--
-- LANGKAH 1: Buka XAMPP Control Panel dan Start Apache & MySQL
-- LANGKAH 2: Buka browser, akses http://localhost/phpmyadmin
-- LANGKAH 3: Klik tab "SQL" atau "New" untuk membuat database baru
-- LANGKAH 4: Copy dan paste seluruh script SQL ini
-- LANGKAH 5: Klik tombol "Go" atau "Execute"
-- =============================================

-- Buat Database
CREATE DATABASE IF NOT EXISTS admin_rt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE admin_rt;

-- =============================================
-- TABLE 1: Users (Admin & Pengurus)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL COMMENT 'Hashed with bcrypt',
    role ENUM(
        'super_admin',
        'admin',
        'pengurus',
        'operator'
    ) NOT NULL DEFAULT 'operator',
    nama_lengkap VARCHAR(100) NOT NULL,
    jabatan VARCHAR(50),
    no_telepon VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE = InnoDB;

-- =============================================
-- TABLE 2: Warga (Data Kependudukan)
-- =============================================
CREATE TABLE IF NOT EXISTS warga (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nik VARCHAR(16) NOT NULL UNIQUE COMMENT 'Nomor Induk Kependudukan',
    no_kk VARCHAR(16) NOT NULL COMMENT 'Nomor Kartu Keluarga',
    nama_lengkap VARCHAR(100) NOT NULL,
    tempat_lahir VARCHAR(50),
    tanggal_lahir DATE,
    jenis_kelamin ENUM('L', 'P') NOT NULL,
    alamat TEXT NOT NULL,
    blok VARCHAR(10),
    no_rumah VARCHAR(10),
    rt VARCHAR(3) DEFAULT '004',
    rw VARCHAR(3) DEFAULT '009',
    kelurahan VARCHAR(50) DEFAULT 'Kemayoran',
    kecamatan VARCHAR(50) DEFAULT 'Kemayoran',
    kota VARCHAR(50) DEFAULT 'Jakarta Pusat',
    agama ENUM(
        'Islam',
        'Kristen',
        'Katolik',
        'Hindu',
        'Buddha',
        'Konghucu',
        'Lainnya'
    ),
    status_perkawinan ENUM(
        'Belum Kawin',
        'Kawin',
        'Cerai Hidup',
        'Cerai Mati'
    ),
    pekerjaan VARCHAR(50),
    pendidikan_terakhir VARCHAR(30),
    no_telepon VARCHAR(20),
    email VARCHAR(100),
    status ENUM(
        'Aktif',
        'Tidak Aktif',
        'Pindah',
        'Meninggal'
    ) DEFAULT 'Aktif',
    tanggal_daftar DATE DEFAULT(CURRENT_DATE),
    foto_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nik (nik),
    INDEX idx_no_kk (no_kk),
    INDEX idx_nama (nama_lengkap),
    INDEX idx_status (status),
    INDEX idx_blok (blok)
) ENGINE = InnoDB;

-- =============================================
-- TABLE 3: Kepala Keluarga (KK)
-- =============================================
CREATE TABLE IF NOT EXISTS kepala_keluarga (
    id INT AUTO_INCREMENT PRIMARY KEY,
    no_kk VARCHAR(16) NOT NULL UNIQUE,
    nama_kepala_keluarga VARCHAR(100) NOT NULL,
    warga_id INT,
    alamat TEXT NOT NULL,
    blok VARCHAR(10),
    no_rumah VARCHAR(10),
    jumlah_anggota INT DEFAULT 1,
    status_rumah ENUM(
        'Milik Sendiri',
        'Sewa/Kontrak',
        'Menumpang',
        'Lainnya'
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (warga_id) REFERENCES warga (id) ON DELETE SET NULL,
    INDEX idx_no_kk (no_kk)
) ENGINE = InnoDB;

-- =============================================
-- TABLE 4: Keuangan (Transaksi)
-- =============================================
CREATE TABLE IF NOT EXISTS keuangan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode_transaksi VARCHAR(20) NOT NULL UNIQUE,
    tanggal DATE NOT NULL,
    tipe ENUM('pemasukan', 'pengeluaran') NOT NULL,
    kategori ENUM(
        'Iuran',
        'Donasi',
        'Kebersihan',
        'Operasional',
        'Fasilitas',
        'Keamanan',
        'Event',
        'Lainnya'
    ) NOT NULL,
    keterangan TEXT NOT NULL,
    jumlah DECIMAL(15, 2) NOT NULL,
    bukti_path VARCHAR(255) COMMENT 'Path ke file bukti transaksi',
    verified_by INT COMMENT 'User ID yang memverifikasi',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (verified_by) REFERENCES users (id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users (id),
    INDEX idx_tanggal (tanggal),
    INDEX idx_tipe (tipe),
    INDEX idx_kategori (kategori)
) ENGINE = InnoDB;

-- =============================================
-- TABLE 5: Saldo Bulanan (Ringkasan Keuangan)
-- =============================================
CREATE TABLE IF NOT EXISTS saldo_bulanan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bulan VARCHAR(20) NOT NULL,
    tahun INT NOT NULL,
    saldo_awal DECIMAL(15, 2) NOT NULL,
    total_pemasukan DECIMAL(15, 2) DEFAULT 0,
    total_pengeluaran DECIMAL(15, 2) DEFAULT 0,
    saldo_akhir DECIMAL(15, 2) NOT NULL,
    catatan TEXT,
    is_closed BOOLEAN DEFAULT FALSE COMMENT 'TRUE jika sudah ditutup/finalized',
    closed_by INT,
    closed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (closed_by) REFERENCES users (id) ON DELETE SET NULL,
    UNIQUE KEY unique_periode (bulan, tahun)
) ENGINE = InnoDB;

-- =============================================
-- TABLE 6: Surat Menyurat
-- =============================================
CREATE TABLE IF NOT EXISTS surat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomor_surat VARCHAR(50) UNIQUE,
    jenis_surat ENUM(
        'kematian',
        'sktm',
        'pindah',
        'umum',
        'domisili',
        'keamanan'
    ) NOT NULL,
    warga_id INT NOT NULL,
    nama_pemohon VARCHAR(100) NOT NULL,
    keperluan TEXT NOT NULL,
    data_tambahan JSON COMMENT 'Data dinamis sesuai jenis surat',
    status ENUM(
        'pending',
        'diproses',
        'selesai',
        'ditolak'
    ) DEFAULT 'pending',
    catatan_admin TEXT,
    tanggal_pengajuan DATETIME DEFAULT CURRENT_TIMESTAMP,
    tanggal_selesai DATETIME,
    file_path VARCHAR(255) COMMENT 'Path ke file surat yang sudah jadi',
    processed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (warga_id) REFERENCES warga (id),
    FOREIGN KEY (processed_by) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_jenis (jenis_surat),
    INDEX idx_status (status),
    INDEX idx_tanggal (tanggal_pengajuan)
) ENGINE = InnoDB;

-- =============================================
-- TABLE 7: Template Surat
-- =============================================
CREATE TABLE IF NOT EXISTS template_surat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode_template VARCHAR(30) NOT NULL UNIQUE,
    nama_template VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    kategori ENUM(
        'administrasi',
        'keamanan',
        'lainnya'
    ) DEFAULT 'administrasi',
    file_docx_path VARCHAR(255),
    file_pdf_path VARCHAR(255),
    fields_required JSON COMMENT 'Array of required field names',
    is_active BOOLEAN DEFAULT TRUE,
    download_count INT DEFAULT 0,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_kode (kode_template),
    INDEX idx_kategori (kategori)
) ENGINE = InnoDB;

-- =============================================
-- TABLE 8: Laporan Keamanan
-- =============================================
CREATE TABLE IF NOT EXISTS laporan_keamanan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode_laporan VARCHAR(36) NOT NULL UNIQUE COMMENT 'UUID',
    jenis_kejadian ENUM(
        'pencurian',
        'vandalisme',
        'gangguan_ketertiban',
        'orang_mencurigakan',
        'kebakaran',
        'banjir',
        'kecelakaan',
        'lainnya'
    ) NOT NULL,
    kronologi TEXT NOT NULL,
    tanggal_kejadian DATE NOT NULL,
    waktu_kejadian TIME,
    lokasi VARCHAR(255),
    nama_pelapor VARCHAR(100) NOT NULL,
    telepon_hash VARCHAR(255) NOT NULL COMMENT 'Encrypted with bcrypt',
    telepon_last4 VARCHAR(4),
    status ENUM(
        'pending',
        'in_progress',
        'resolved',
        'closed'
    ) DEFAULT 'pending',
    priority ENUM(
        'low',
        'medium',
        'high',
        'critical'
    ) DEFAULT 'low',
    tindak_lanjut TEXT,
    handled_by INT,
    resolved_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (handled_by) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_jenis (jenis_kejadian),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_tanggal (tanggal_kejadian)
) ENGINE = InnoDB;

-- =============================================
-- TABLE 9: File Manager (Subfolder untuk Admin)
-- =============================================
CREATE TABLE IF NOT EXISTS file_manager (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_file VARCHAR(255) NOT NULL,
    nama_asli VARCHAR(255) NOT NULL COMMENT 'Nama file original saat upload',
    kategori ENUM(
        'surat',
        'keuangan',
        'keamanan',
        'administrasi',
        'foto',
        'dokumen',
        'lainnya'
    ) NOT NULL,
    subfolder VARCHAR(100) NOT NULL COMMENT 'Nama subfolder: surat/administrasi, surat/keamanan, dll',
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) COMMENT 'MIME type',
    file_size INT COMMENT 'Ukuran file dalam bytes',
    file_extension VARCHAR(10),
    deskripsi TEXT,
    is_public BOOLEAN DEFAULT FALSE COMMENT 'TRUE jika bisa diakses public',
    is_template BOOLEAN DEFAULT FALSE COMMENT 'TRUE jika ini template',
    download_count INT DEFAULT 0,
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users (id),
    INDEX idx_kategori (kategori),
    INDEX idx_subfolder (subfolder),
    INDEX idx_is_public (is_public)
) ENGINE = InnoDB;

-- =============================================
-- TABLE 10: Subfolder Configuration
-- =============================================
CREATE TABLE IF NOT EXISTS subfolder_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_subfolder VARCHAR(100) NOT NULL UNIQUE,
    parent_folder VARCHAR(100) NOT NULL,
    full_path VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    allowed_extensions VARCHAR(255) DEFAULT 'pdf,docx,doc,jpg,jpeg,png',
    max_file_size INT DEFAULT 10485760 COMMENT 'Max size in bytes (default 10MB)',
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_parent (parent_folder)
) ENGINE = InnoDB;

-- =============================================
-- TABLE 11: Activity Log (Audit Trail)
-- =============================================
CREATE TABLE IF NOT EXISTS activity_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(50) NOT NULL COMMENT 'CREATE, UPDATE, DELETE, LOGIN, UPLOAD, DOWNLOAD',
    table_name VARCHAR(50),
    record_id INT,
    old_data JSON,
    new_data JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_table (table_name),
    INDEX idx_created (created_at)
) ENGINE = InnoDB;

-- =============================================
-- TABLE 12: Pengaturan Sistem
-- =============================================
CREATE TABLE IF NOT EXISTS pengaturan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode VARCHAR(50) NOT NULL UNIQUE,
    nama VARCHAR(100) NOT NULL,
    nilai TEXT,
    tipe ENUM(
        'text',
        'number',
        'boolean',
        'json',
        'file'
    ) DEFAULT 'text',
    kategori VARCHAR(50) DEFAULT 'general',
    deskripsi TEXT,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB;

-- =============================================
-- INSERT DEFAULT DATA
-- =============================================

-- Default Admin User (password: admin123 - GANTI SETELAH LOGIN PERTAMA!)
INSERT INTO
    users (
        username,
        email,
        password_hash,
        role,
        nama_lengkap,
        jabatan,
        no_telepon
    )
VALUES (
        'admin',
        'admin@rt04.local',
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4hHqKCEW3pEeP.Ua',
        'super_admin',
        'Administrator',
        'Super Admin',
        '08123456789'
    ),
    (
        'ketua_rt',
        'ketuart@rt04.local',
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4hHqKCEW3pEeP.Ua',
        'admin',
        'H. Sutrisno',
        'Ketua RT',
        '08234567890'
    ),
    (
        'sekretaris',
        'sekretaris@rt04.local',
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4hHqKCEW3pEeP.Ua',
        'pengurus',
        'Ibu Sari',
        'Sekretaris',
        '08345678901'
    ),
    (
        'bendahara',
        'bendahara@rt04.local',
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4hHqKCEW3pEeP.Ua',
        'pengurus',
        'Pak Bambang',
        'Bendahara',
        '08456789012'
    );

-- Default Subfolder Configuration
INSERT INTO
    subfolder_config (
        nama_subfolder,
        parent_folder,
        full_path,
        deskripsi,
        allowed_extensions
    )
VALUES (
        'administrasi',
        'surat',
        'templates/surat/administrasi',
        'Template surat administrasi umum',
        'pdf,docx,doc'
    ),
    (
        'keamanan',
        'surat',
        'templates/surat/keamanan',
        'Template laporan keamanan',
        'pdf,docx,doc'
    ),
    (
        'iuran',
        'keuangan',
        'dokumen/keuangan/iuran',
        'Bukti iuran warga',
        'pdf,jpg,jpeg,png'
    ),
    (
        'laporan',
        'keuangan',
        'dokumen/keuangan/laporan',
        'Laporan keuangan bulanan',
        'pdf,xlsx,xls'
    ),
    (
        'bukti',
        'keuangan',
        'dokumen/keuangan/bukti',
        'Bukti transaksi pengeluaran',
        'pdf,jpg,jpeg,png'
    ),
    (
        'foto_warga',
        'warga',
        'dokumen/warga/foto',
        'Foto identitas warga',
        'jpg,jpeg,png'
    ),
    (
        'ktp',
        'warga',
        'dokumen/warga/ktp',
        'Scan KTP warga',
        'pdf,jpg,jpeg,png'
    ),
    (
        'kk',
        'warga',
        'dokumen/warga/kk',
        'Scan Kartu Keluarga',
        'pdf,jpg,jpeg,png'
    );

-- Default Template Surat
INSERT INTO
    template_surat (
        kode_template,
        nama_template,
        deskripsi,
        kategori,
        fields_required
    )
VALUES (
        'kematian',
        'Surat Keterangan Kematian',
        'Surat keterangan untuk pelaporan kematian warga',
        'administrasi',
        '["nama_almarhum", "tanggal_meninggal", "tempat_meninggal", "penyebab"]'
    ),
    (
        'sktm',
        'Surat Keterangan Tidak Mampu',
        'Surat keterangan untuk warga yang membutuhkan bantuan ekonomi',
        'administrasi',
        '["nama", "alamat", "pekerjaan", "penghasilan"]'
    ),
    (
        'pindah',
        'Surat Pengantar Pindah Domisili',
        'Surat pengantar untuk warga yang akan pindah domisili',
        'administrasi',
        '["nama", "alamat_asal", "alamat_tujuan", "alasan_pindah"]'
    ),
    (
        'umum',
        'Surat Keterangan RT (Umum)',
        'Surat keterangan umum dari RT untuk berbagai keperluan',
        'administrasi',
        '["nama", "alamat", "keperluan"]'
    ),
    (
        'domisili',
        'Surat Keterangan Domisili',
        'Surat keterangan tempat tinggal warga',
        'administrasi',
        '["nama", "alamat", "lama_tinggal"]'
    ),
    (
        'keamanan',
        'Form Laporan Keamanan',
        'Form pelaporan kejadian keamanan di lingkungan RT',
        'keamanan',
        '["kronologi", "tanggal_kejadian", "nama_pelapor", "telepon_pelapor"]'
    );

-- Default Pengaturan
INSERT INTO
    pengaturan (
        kode,
        nama,
        nilai,
        tipe,
        kategori,
        deskripsi
    )
VALUES (
        'nama_rt',
        'Nama RT',
        'RT 04 RW 09 Kemayoran',
        'text',
        'general',
        'Nama lengkap RT'
    ),
    (
        'alamat_rt',
        'Alamat Sekretariat',
        'Gg. Bugis No.95, Kemayoran, Jakarta Pusat',
        'text',
        'general',
        'Alamat kantor sekretariat RT'
    ),
    (
        'telepon_rt',
        'Telepon RT',
        '087872004448',
        'text',
        'general',
        'Nomor telepon sekretariat'
    ),
    (
        'iuran_bulanan',
        'Nominal Iuran Bulanan',
        '10000',
        'number',
        'keuangan',
        'Nominal iuran warga per bulan dalam Rupiah'
    ),
    (
        'max_upload_size',
        'Maksimal Ukuran Upload',
        '10485760',
        'number',
        'system',
        'Maksimal ukuran file upload dalam bytes (10MB)'
    ),
    (
        'allowed_file_types',
        'Tipe File Diizinkan',
        '["pdf","docx","doc","jpg","jpeg","png","xlsx","xls"]',
        'json',
        'system',
        'Daftar ekstensi file yang diizinkan'
    );

-- Default Saldo Bulan - Disesuaikan dengan LPJ RT 04 RW 09 Kemayoran
INSERT INTO
    saldo_bulanan (
        bulan,
        tahun,
        saldo_awal,
        total_pemasukan,
        total_pengeluaran,
        saldo_akhir,
        catatan
    )
VALUES (
        'Januari',
        2026,
        3600000,
        750000,
        500000,
        3850000,
        'Laporan keuangan bulan Januari 2026 - Periode awal tahun'
    ),
    (
        'November',
        2025,
        3200000,
        850000,
        450000,
        3600000,
        'Laporan Pertanggungjawaban Kas RT 04 Bulan November 2025'
    ),
    (
        'Oktober',
        2025,
        2850000,
        700000,
        350000,
        3200000,
        'Laporan Pertanggungjawaban Kas RT 04 Bulan Oktober 2025'
    ),
    (
        'September',
        2025,
        2600000,
        550000,
        300000,
        2850000,
        'Laporan Pertanggungjawaban Kas RT 04 Bulan September 2025'
    ),
    (
        'Agustus',
        2025,
        2100000,
        1200000,
        700000,
        2600000,
        'Laporan Pertanggungjawaban Kas RT 04 Bulan Agustus 2025 - Termasuk Kegiatan HUT RI ke-80'
    ),
    (
        'Juli',
        2025,
        1850000,
        600000,
        350000,
        2100000,
        'Laporan Pertanggungjawaban Kas RT 04 Bulan Juli 2025'
    );

-- =============================================
-- VIEW: Ringkasan Statistik
-- =============================================
CREATE OR REPLACE VIEW v_statistik_warga AS
SELECT
    COUNT(*) as total_warga,
    COUNT(DISTINCT no_kk) as total_kk,
    SUM(
        CASE
            WHEN status = 'Aktif' THEN 1
            ELSE 0
        END
    ) as warga_aktif,
    SUM(
        CASE
            WHEN MONTH(tanggal_daftar) = MONTH(CURRENT_DATE)
            AND YEAR(tanggal_daftar) = YEAR(CURRENT_DATE) THEN 1
            ELSE 0
        END
    ) as pendatang_baru
FROM warga;

-- =============================================
-- VIEW: Ringkasan Keuangan Terkini
-- =============================================
CREATE OR REPLACE VIEW v_keuangan_terkini AS
SELECT sb.bulan, sb.tahun, sb.saldo_awal, sb.total_pemasukan, sb.total_pengeluaran, sb.saldo_akhir, (
        SELECT COUNT(*)
        FROM keuangan k
        WHERE
            MONTH(k.tanggal) = CASE sb.bulan
                WHEN 'Januari' THEN 1
                WHEN 'Februari' THEN 2
                WHEN 'Maret' THEN 3
                WHEN 'April' THEN 4
                WHEN 'Mei' THEN 5
                WHEN 'Juni' THEN 6
                WHEN 'Juli' THEN 7
                WHEN 'Agustus' THEN 8
                WHEN 'September' THEN 9
                WHEN 'Oktober' THEN 10
                WHEN 'November' THEN 11
                WHEN 'Desember' THEN 12
            END
            AND YEAR(k.tanggal) = sb.tahun
    ) as jumlah_transaksi
FROM saldo_bulanan sb
ORDER BY sb.tahun DESC, FIELD(
        sb.bulan, 'Desember', 'November', 'Oktober', 'September', 'Agustus', 'Juli', 'Juni', 'Mei', 'April', 'Maret', 'Februari', 'Januari'
    ) DESC;

-- =============================================
-- SCRIPT SELESAI
-- =============================================
-- Total Tables: 12
-- Total Views: 2
--
-- CATATAN KEAMANAN:
-- 1. Ganti password default admin setelah login pertama
-- 2. Password di-hash menggunakan bcrypt dengan salt rounds 12
-- 3. Simpan file .env dengan kredensial database di luar Git
-- =============================================