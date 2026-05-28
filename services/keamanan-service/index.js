// Keamanan Service — Express.js microservice for Security
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());

// ── Database ──────────────────────────────────────────
const DB_PATH = path.join(__dirname, 'data', 'keamanan.db');
let db;

function initDB() {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS security_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jenis_kejadian TEXT NOT NULL,
      lokasi TEXT DEFAULT '',
      tanggal_kejadian TEXT NOT NULL,
      waktu_kejadian TEXT DEFAULT '',
      status TEXT DEFAULT 'Pending',
      priority TEXT DEFAULT 'Medium',
      nama_pelapor TEXT NOT NULL,
      telepon_pelapor TEXT DEFAULT '',
      kronologi TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

// ── Routes ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'keamanan-service', timestamp: new Date().toISOString() });
});

app.get('/reports', (req, res) => {
  const reports = db.prepare('SELECT * FROM security_reports ORDER BY created_at DESC').all();
  res.json(reports);
});

app.post('/reports', (req, res) => {
  const { jenis_kejadian, lokasi, tanggal_kejadian, waktu_kejadian, nama_pelapor, telepon_pelapor, kronologi } = req.body;

  if (!nama_pelapor || !kronologi || !tanggal_kejadian) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const priorityMap = { theft: 'High', medical: 'High', disturbance: 'Medium', other: 'Low' };
  const priority = priorityMap[jenis_kejadian] || 'Medium';

  const result = db.prepare(`
    INSERT INTO security_reports (jenis_kejadian, lokasi, tanggal_kejadian, waktu_kejadian, status, priority, nama_pelapor, telepon_pelapor, kronologi)
    VALUES (?, ?, ?, ?, 'Pending', ?, ?, ?, ?)
  `).run(jenis_kejadian, lokasi || '', tanggal_kejadian, waktu_kejadian || '', priority, nama_pelapor, telepon_pelapor || '', kronologi);

  res.status(201).json({
    reportId: result.lastInsertRowid.toString(),
    priority,
    message: 'Laporan berhasil dikirim',
  });
});

app.get('/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM security_reports').get().count;
  const pending = db.prepare("SELECT COUNT(*) as count FROM security_reports WHERE status = 'Pending'").get().count;
  const resolved = db.prepare("SELECT COUNT(*) as count FROM security_reports WHERE status = 'Resolved'").get().count;
  const high = db.prepare("SELECT COUNT(*) as count FROM security_reports WHERE priority = 'High'").get().count;
  const medium = db.prepare("SELECT COUNT(*) as count FROM security_reports WHERE priority = 'Medium'").get().count;
  const low = db.prepare("SELECT COUNT(*) as count FROM security_reports WHERE priority = 'Low'").get().count;

  res.json({
    total, pending, resolved,
    byPriority: { High: high, Medium: medium, Low: low },
  });
});

app.get('/incidents', (req, res) => {
  res.json([
    { id: 'theft', label: 'Pencurian', priority: 'High' },
    { id: 'disturbance', label: 'Keributan', priority: 'Medium' },
    { id: 'medical', label: 'Darurat Medis', priority: 'High' },
    { id: 'other', label: 'Lainnya', priority: 'Low' },
  ]);
});

// ── Start ─────────────────────────────────────────────
const fs = require('fs');
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

initDB();
app.listen(PORT, () => {
  console.log(`🛡️ Keamanan Service running on http://localhost:${PORT}`);
});

module.exports = app;
