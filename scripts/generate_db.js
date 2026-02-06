
const fs = require('fs');
const initSqlJs = require('sql.js');
const path = require('path');

async function main() {
    const SQL = await initSqlJs();
    const db = new SQL.Database();

    console.log("Creating tables...");
    db.run(`
        CREATE TABLE IF NOT EXISTS warga (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nama TEXT NOT NULL,
            alamat TEXT,
            status TEXT,
            telepon TEXT
        );

        CREATE TABLE IF NOT EXISTS security_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jenis_kejadian TEXT,
            lokasi TEXT,
            tanggal_kejadian TEXT,
            status TEXT,
            priority TEXT,
            nama_pelapor TEXT,
            telepon_pelapor TEXT,
            kronologi TEXT
        );

        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password TEXT,
            nama TEXT,
            role TEXT,
            no_telepon TEXT
        );
    `);

    console.log("Seeding placeholder users (Passwords are hashed in real app)...");
    const users = [
        { email: 'admin@example.com', password: 'changeme', nama: 'Admin Account', role: 'admin', phone: '081234567890' },
        { email: 'user@example.com', password: 'changeme', nama: 'Test User', role: 'warga', phone: '081234567891' }
    ];

    const stmt = db.prepare("INSERT INTO users (email, password, nama, role, no_telepon) VALUES (?, ?, ?, ?, ?)");
    users.forEach(u => stmt.run([u.email, u.password, u.nama, u.role, u.phone]));
    stmt.free();

    console.log("Seeding 50 random warga...");
    db.run("BEGIN TRANSACTION");
    const stmtWarga = db.prepare("INSERT INTO warga (nama, alamat, status, telepon) VALUES (?, ?, ?, ?)");

    const names = ["Andi", "Budi", "Citra", "Dedi", "Eka", "Fani", "Gita", "Hadi", "Indah", "Joko"];
    const lastNames = ["Santoso", "Wijaya", "Putri", "Kusuma", "Lestari", "Pratama", "Saputra", "Hidayat", "Sari", "Utami"];
    const streets = ["Mawar", "Melati", "Anggrek", "Kenanga", "Flamboyan", "Dahlia", "Tulip"];

    for (let i = 0; i < 50; i++) {
        const name = `${names[Math.floor(Math.random() * names.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        const address = `Jl. ${streets[Math.floor(Math.random() * streets.length)]} No. ${Math.floor(Math.random() * 100)}`;
        const status = Math.random() > 0.3 ? "Tetap" : "Kontrak";
        const phone = `0812${Math.floor(Math.random() * 100000000)}`;

        stmtWarga.run([name, address, status, phone]);
    }
    stmtWarga.free();
    db.run("COMMIT");

    console.log("Saving to prisma_demo.db...");
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(path.join(__dirname, '../prisma_demo.db'), buffer);
    console.log("Done!");
}

main().catch(console.error);
