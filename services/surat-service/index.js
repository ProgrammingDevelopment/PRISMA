// Surat Service — Express.js microservice for Letters/Documents
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4004;

app.use(cors());
app.use(express.json());

// ── Data ──────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'sk-domisili',
    title: 'Surat Keterangan Domisili',
    description: 'Surat keterangan tempat tinggal',
    category: 'Administrasi',
    files: { docx: '/templates/surat/sk-domisili.docx', pdf: '/templates/surat/sk-domisili.pdf' },
    requiredFields: ['nama', 'alamat', 'nik', 'keperluan'],
  },
  {
    id: 'sk-pengantar',
    title: 'Surat Pengantar RT',
    description: 'Surat pengantar dari ketua RT',
    category: 'Administrasi',
    files: { docx: '/templates/surat/sk-pengantar.docx', pdf: '/templates/surat/sk-pengantar.pdf' },
    requiredFields: ['nama', 'alamat', 'keperluan'],
  },
  {
    id: 'sk-pindah',
    title: 'Surat Keterangan Pindah',
    description: 'Surat keterangan pindah alamat',
    category: 'Kependudukan',
    files: { docx: '/templates/surat/sk-pindah.docx', pdf: '/templates/surat/sk-pindah.pdf' },
    requiredFields: ['nama', 'alamatAsal', 'alamatTujuan', 'nik'],
  },
];

// In-memory submission store (for demo)
const submissions = [];

// ── Routes ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'surat-service', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  const { category } = req.query;
  let filtered = TEMPLATES;
  if (category) {
    filtered = TEMPLATES.filter(t => t.category === category);
  }
  res.json(filtered);
});

app.get('/:id', (req, res) => {
  const template = TEMPLATES.find(t => t.id === req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  res.json(template);
});

app.post('/submit', (req, res) => {
  const { templateId, data } = req.body;
  const template = TEMPLATES.find(t => t.id === templateId);
  if (!template) return res.status(404).json({ error: 'Template not found' });

  const submissionId = `SUB-${Date.now()}`;
  submissions.push({
    id: submissionId,
    templateId,
    data,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    success: true,
    submissionId,
    message: 'Permohonan surat berhasil dikirim',
  });
});

// ── Start ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`📄 Surat Service running on http://localhost:${PORT}`);
});

module.exports = app;
