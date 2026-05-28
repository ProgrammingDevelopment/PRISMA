// Keuangan Service — Express.js microservice for Finance
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

// ── Data Files ────────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data');
const REPORTS_FILE = path.join(DATA_DIR, 'keuangan-monthly.json');
const SUMMARY_FILE = path.join(DATA_DIR, 'keuangan-summary.json');

function loadJSON(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (err) {
    console.error(`Error loading ${filePath}:`, err.message);
  }
  return [];
}

// ── Routes ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'keuangan-service', timestamp: new Date().toISOString() });
});

app.get('/reports', (req, res) => {
  const reports = loadJSON(REPORTS_FILE);
  res.json(reports);
});

app.get('/reports/:bulan/:tahun', (req, res) => {
  const { bulan, tahun } = req.params;
  const reports = loadJSON(REPORTS_FILE);
  const report = reports.find(r => r.bulan === bulan && r.tahun === parseInt(tahun));
  if (!report) return res.status(404).json({ error: 'Report not found' });
  res.json(report);
});

app.get('/balance', (req, res) => {
  const reports = loadJSON(REPORTS_FILE);
  if (reports.length === 0) {
    return res.json({ saldo: 0, lastUpdate: '-' });
  }
  const latest = reports[0];
  res.json({
    saldo: latest.saldo_akhir || 0,
    lastUpdate: `${latest.bulan} ${latest.tahun}`,
  });
});

app.get('/summary', (req, res) => {
  const summary = loadJSON(SUMMARY_FILE);
  res.json(summary);
});

// ── Start ─────────────────────────────────────────────
// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

app.listen(PORT, () => {
  console.log(`💰 Keuangan Service running on http://localhost:${PORT}`);
});

module.exports = app;
