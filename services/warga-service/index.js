// Warga Service — Express.js microservice for Kependudukan
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

// ── Database ──────────────────────────────────────────
const DB_PATH = path.join(__dirname, 'data', 'warga.db');
let db;

function initDB() {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS warga (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      alamat TEXT DEFAULT '',
      status TEXT DEFAULT 'Baru',
      telepon TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pengurus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      jabatan TEXT NOT NULL,
      periode TEXT DEFAULT '',
      kontak TEXT DEFAULT ''
    );
  `);

  // Seed data if empty
  const count = db.prepare('SELECT COUNT(*) as count FROM warga').get();
  if (count.count === 0) {
    const insert = db.prepare('INSERT INTO warga (nama, alamat, status, telepon) VALUES (?, ?, ?, ?)');
    const seedData = [
      ['Ahmad Fauzi', 'Jl. Melati No. 1', 'Tetap', '081234567001'],
      ['Siti Nurjannah', 'Jl. Melati No. 2', 'Tetap', '081234567002'],
      ['Budi Santoso', 'Jl. Anggrek No. 5', 'Kontrak', '081234567003'],
      ['Dewi Lestari', 'Jl. Kenanga No. 3', 'Tetap', '081234567004'],
      ['Eko Prasetyo', 'Jl. Mawar No. 7', 'Kost', '081234567005'],
    ];
    const insertMany = db.transaction(() => {
      seedData.forEach(row => insert.run(...row));
    });
    insertMany();
    console.log('📊 Seeded warga database with sample data');
  }
}

// ── Routes ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'warga-service', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  const warga = db.prepare('SELECT * FROM warga ORDER BY nama ASC').all();
  res.json(warga);
});

app.get('/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM warga').get().count;
  const tetap = db.prepare("SELECT COUNT(*) as count FROM warga WHERE status = 'Tetap'").get().count;
  const baru = db.prepare("SELECT COUNT(*) as count FROM warga WHERE status IN ('Baru', 'Kontrak')").get().count;
  res.json({
    totalWarga: total,
    totalKK: Math.floor(total / 3) + 1,
    wargaAktif: tetap,
    pendatangBaru: baru,
  });
});

app.get('/pengurus', (req, res) => {
  const pengurus = db.prepare('SELECT * FROM pengurus').all();
  res.json(pengurus);
});

app.get('/search', (req, res) => {
  const query = `%${req.query.q || ''}%`;
  const results = db.prepare(
    'SELECT * FROM warga WHERE nama LIKE ? OR alamat LIKE ? OR status LIKE ?'
  ).all(query, query, query);
  res.json(results);
});

app.get('/:id', (req, res) => {
  const warga = db.prepare('SELECT * FROM warga WHERE id = ?').get(req.params.id);
  if (!warga) return res.status(404).json({ error: 'Warga not found' });
  res.json(warga);
});

app.post('/', (req, res) => {
  const { nama, alamat, status, telepon } = req.body;
  if (!nama) return res.status(400).json({ error: 'Nama wajib diisi' });

  const result = db.prepare(
    'INSERT INTO warga (nama, alamat, status, telepon) VALUES (?, ?, ?, ?)'
  ).run(nama, alamat || '', status || 'Baru', telepon || '');

  res.status(201).json({ id: result.lastInsertRowid, nama, alamat, status, telepon });
});

app.put('/:id', (req, res) => {
  const { nama, alamat, status, telepon } = req.body;
  const existing = db.prepare('SELECT * FROM warga WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Warga not found' });

  db.prepare(
    'UPDATE warga SET nama = ?, alamat = ?, status = ?, telepon = ? WHERE id = ?'
  ).run(nama || existing.nama, alamat ?? existing.alamat, status || existing.status, telepon ?? existing.telepon, req.params.id);

  res.json({ id: parseInt(req.params.id), nama, alamat, status, telepon });
});

app.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM warga WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Warga not found' });
  res.json({ success: true });
});

// ── Start ─────────────────────────────────────────────
initDB();
app.listen(PORT, () => {
  console.log(`👥 Warga Service running on http://localhost:${PORT}`);
});

module.exports = app;
