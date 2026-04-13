# 🔧 Maintenance & Operations
## PRISMA — Platform Informasi & Sistem Manajemen RT 04
### SDLC Fase 6: Maintenance

**Versi Dokumen:** 1.0  
**Tanggal:** 10 April 2026  

---

## 1. Monitoring

### 1.1 Health Check Schedule

| Service | Metode | Interval | Alert |
|---------|--------|----------|-------|
| Frontend (SSG) | Telegram Bot ping | 5 menit | Admin Telegram |
| API Gateway | `/health` endpoint | 1 menit | Docker healthcheck |
| Warga Service | `/health` endpoint | 1 menit | Docker healthcheck |
| Keuangan Service | `/health` endpoint | 1 menit | Docker healthcheck |
| Keamanan Service | `/health` endpoint | 1 menit | Docker healthcheck |
| Surat Service | `/health` endpoint | 1 menit | Docker healthcheck |
| AI Service | `/health` endpoint | 1 menit | Docker healthcheck |
| Ollama LLM | Port check 11434 | 5 menit | Bot alert |

### 1.2 Log Management

| Source | Location | Retention |
|--------|----------|-----------|
| Frontend | Browser console | Session |
| Gateway | `docker logs gateway` | 7 hari |
| Microservices | `docker logs <service>` | 7 hari |
| Security audit | localStorage `security_audit_log` | Max 1000 entries |
| Bot | Console output / PM2 logs | 30 hari |

---

## 2. Backup Strategy

| Data | Metode | Frekuensi | Lokasi |
|------|--------|-----------|--------|
| SQLite DB (client) | `SqliteDB.exportDB()` → download `.db` | Manual / on-demand | User download |
| SQLite DB (services) | Docker volume backup | Harian | Host filesystem |
| JSON data files | Git version control | Per commit | GitHub |
| Environment vars | Separate secure storage | Per change | Password manager |
| Docker images | Docker registry | Per release | Docker Hub / GHCR |

---

## 3. Incident Response

### 3.1 Severity Levels

| Level | Deskripsi | Response Time | Contoh |
|-------|-----------|---------------|--------|
| **P1 Critical** | Sistem down total | < 1 jam | All services down |
| **P2 High** | Fitur utama tidak berfungsi | < 4 jam | Login gagal, data loss |
| **P3 Medium** | Fitur minor terganggu | < 24 jam | Chatbot error, UI bug |
| **P4 Low** | Cosmetic / enhancement | < 1 minggu | Typo, styling issue |

### 3.2 Response Procedure

```
1. DETECT  → Health check alert / user report
2. ASSESS  → Determine severity level
3. CONTAIN → Isolate affected service (docker stop)
4. FIX     → Apply fix (code change or config)
5. TEST    → Verify fix in staging
6. DEPLOY  → Roll out fix (docker restart / redeploy)
7. REVIEW  → Post-mortem documentation
```

---

## 4. Regular Maintenance Tasks

### 4.1 Weekly

- [ ] Review audit log entries
- [ ] Check database sizes
- [ ] Verify all health checks green
- [ ] Review bot usage stats (`/status`)

### 4.2 Monthly

- [ ] Run `npm audit` for dependency vulnerabilities
- [ ] Update dependencies (`npm outdated`)
- [ ] Review and rotate API keys/tokens
- [ ] Backup all databases

### 4.3 Quarterly

- [ ] Full security review
- [ ] Performance benchmark (Lighthouse)
- [ ] Review and update documentation
- [ ] User feedback review

---

## 5. Scaling Procedure

### 5.1 Horizontal Scaling (Microservices)

```bash
# Scale specific service
docker-compose up -d --scale warga-service=3

# With load balancer (nginx)
# Update nginx.conf upstream block
```

### 5.2 Vertical Scaling

```yaml
# docker-compose.yml — resource limits
services:
  warga-service:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
```

---

*Dokumen ini adalah bagian dari SDLC Waterfall Phase 6 — Maintenance*
