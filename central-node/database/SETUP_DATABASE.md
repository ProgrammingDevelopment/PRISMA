# 📚 Panduan Setup Database PRISMA RT 04

## Prasyarat
- XAMPP sudah terinstall
- MySQL/MariaDB sudah berjalan
- Browser untuk mengakses phpMyAdmin

---

## 🚀 Step-by-Step Setup Database

### **STEP 1: Start XAMPP**

1. Buka **XAMPP Control Panel**
2. Klik tombol **Start** pada modul **Apache**
3. Klik tombol **Start** pada modul **MySQL**
4. Pastikan status menunjukkan "Running" (hijau)

---

### **STEP 2: Buka phpMyAdmin**

1. Buka browser (Chrome/Firefox/Edge)
2. Akses URL: `http://localhost/phpmyadmin`

---

### **STEP 3: Buat Database Baru**

1. Di phpMyAdmin, klik **"New"** di panel kiri
2. Masukkan nama database: `admin_rt`
3. Pilih Collation: `utf8mb4_unicode_ci`
4. Klik tombol **"Create"**

---

### **STEP 4: Import SQL Schema**

1. Di phpMyAdmin, klik database **"admin_rt"** di panel kiri
2. Klik tab **"Import"** di bagian atas
3. Klik **"Choose File"**
4. Pilih file: `prisma/database/admin_rt.sql`
5. Klik tombol **"Go"**

---

### **STEP 5: Verifikasi**

Pastikan 12 tabel sudah ada:
- users, warga, kepala_keluarga, keuangan
- saldo_bulanan, surat, template_surat
- laporan_keamanan, file_manager
- subfolder_config, activity_log, pengaturan

---

## 🔐 Default Login

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Super Admin |
| ketua_rt | admin123 | Admin |

⚠️ **Ganti password setelah login pertama!**

---

## 🔧 Konfigurasi .env.local

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=admin_rt
```

---

*PRISMA RT 04 Kemayoran - 2026*
