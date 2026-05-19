// API Gateway — Express.js entry point
// Routes requests to domain microservices

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ─────────────────────────────────────────
app.use(cors({
  origin: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting (simple in-memory)
const requestCounts = new Map();
const RATE_LIMIT = 100;
const RATE_WINDOW = 60 * 1000;

app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const key = `${ip}`;
  const record = requestCounts.get(key) || { count: 0, resetAt: now + RATE_WINDOW };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + RATE_WINDOW;
  }

  record.count++;
  requestCounts.set(key, record);

  if (record.count > RATE_LIMIT) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  next();
});

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ── Health Check ──────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── Service Routes (Proxy) ────────────────────────────
const getVercelUrl = () => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return '';
};

const vercelBase = getVercelUrl();

const services = {
  '/api/v1/warga': process.env.WARGA_SERVICE_URL || (vercelBase ? `${vercelBase}/_/warga-service` : 'http://localhost:4001'),
  '/api/v1/keuangan': process.env.KEUANGAN_SERVICE_URL || (vercelBase ? `${vercelBase}/_/keuangan-service` : 'http://localhost:4002'),
  '/api/v1/keamanan': process.env.KEAMANAN_SERVICE_URL || (vercelBase ? `${vercelBase}/_/keamanan-service` : 'http://localhost:4003'),
  '/api/v1/surat': process.env.SURAT_SERVICE_URL || (vercelBase ? `${vercelBase}/_/surat-service` : 'http://localhost:4004'),
  '/api/v1/ai': process.env.AI_SERVICE_URL || (vercelBase ? `${vercelBase}/_/ai-service` : 'http://localhost:4005'),
};

Object.entries(services).forEach(([path, target]) => {
  app.use(path, createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: { [`^${path}`]: '' },
    onError: (err, req, res) => {
      console.error(`[PROXY ERROR] ${path} → ${target}:`, err.message);
      res.status(503).json({
        error: 'Service unavailable',
        service: path.split('/').pop(),
      });
    },
  }));
});

// ── 404 Handler ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    availableRoutes: Object.keys(services),
  });
});

// ── Start ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 PRISMA API Gateway running on http://localhost:${PORT}`);
  console.log(`📡 Service routing:`);
  Object.entries(services).forEach(([path, target]) => {
    console.log(`   ${path} → ${target}`);
  });
  console.log('');
});

module.exports = app;
