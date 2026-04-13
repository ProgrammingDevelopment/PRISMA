# 🧪 Test Plan
## PRISMA — Platform Informasi & Sistem Manajemen RT 04
### SDLC Fase 4: Testing

**Versi Dokumen:** 1.0  
**Tanggal:** 10 April 2026  
**Framework:** Vitest + @testing-library/react  

---

## 1. Strategi Testing

### 1.1 Test Pyramid

```
        ╱  E2E Tests  ╲           ← Manual / Browser (sedikit)
       ╱  Integration   ╲         ← ViewModel + Repository (sedang)
      ╱   Unit Tests     ╲        ← Entity, Mapper, Utility (banyak)
     ╱────────────────────╲
```

### 1.2 Coverage Target

| Layer | Target Coverage | Prioritas |
|-------|----------------|-----------|
| Models/Entities | > 90% | Tinggi |
| Repositories | > 80% | Tinggi |
| ViewModels | > 75% | Sedang |
| Services/API Clients | > 70% | Sedang |
| Components (View) | > 50% | Rendah |

---

## 2. Unit Test Plan

### 2.1 Model Layer Tests

| Test Suite | File | Test Cases |
|-----------|------|------------|
| Warga Entity | `src/models/entities/__tests__/Warga.test.ts` | Validasi field, createWarga(), status enum |
| Keuangan Entity | `src/models/entities/__tests__/Keuangan.test.ts` | Transaction validation, saldo calculation |
| Keamanan Entity | `src/models/entities/__tests__/Keamanan.test.ts` | Report validation, priority assignment |
| WargaMapper | `src/models/mappers/__tests__/WargaMapper.test.ts` | toEntity(), toDTO(), toDisplayModel() |

### 2.2 Repository Layer Tests

| Test Suite | Test Cases |
|-----------|------------|
| WargaRepository | getAll, getById, create, update, delete, search |
| KeuanganRepository | getReports, getBalance, getSummary, addTransaction |
| KeamananRepository | getReports, getStats, submitReport |
| SuratRepository | getTemplates, getById, submitRequest |

### 2.3 ViewModel Layer Tests

| Test Suite | Test Cases |
|-----------|------------|
| useWargaViewModel | initial load, search filter, add warga, error handling |
| useKeuanganViewModel | load reports, balance, summary, period filter |
| useKeamananViewModel | load stats, submit report, validation |
| useAuthViewModel | login, logout, session check, rate limit |

### 2.4 Existing Tests (Retained)

| File | Size | Status |
|------|------|--------|
| `security.test.ts` | 14.6 KB | ✅ Retained |
| `demo-credentials.test.ts` | 6.7 KB | ✅ Retained |
| `financial-utils.test.ts` | 1.5 KB | ✅ Retained |

---

## 3. Integration Test Plan

### 3.1 ViewModel-Repository Integration

| Test | Description |
|------|-------------|
| Dashboard flow | useDashboardViewModel → WargaRepository + KeuanganRepository |
| Security report flow | useKeamananViewModel → KeamananRepository → SqliteDataSource |
| Auth flow | useAuthViewModel → UserRepository → security.ts |

### 3.2 Microservice API Tests

| Service | Endpoint Test |
|---------|--------------|
| Warga Service | CRUD via REST API |
| Keuangan Service | GET reports, balance, summary |
| Keamanan Service | POST report, GET stats |
| Gateway | Proxy routing, auth middleware |

---

## 4. Acceptance Criteria

| Feature | Criteria | Method |
|---------|----------|--------|
| MVVM refactor | All 23 routes load tanpa error | Manual navigation |
| ViewModel hooks | State updates correctly pada user interaction | Unit test |
| Service registry | Toggle local/remote tanpa crash | Manual test |
| Backward compat | Existing imports dari databaseService masih berfungsi | Build check |
| Microservices | Semua 5 service health check respond 200 | curl / automated |

---

## 5. Test Execution

```bash
# Run all unit tests
npm test

# Watch mode (development)
npm run test:watch

# CI verbose
npm run test:ci

# Microservice tests (from each service dir)
cd services/warga-service && npm test
cd services/keuangan-service && npm test
```

---

*Dokumen ini adalah bagian dari SDLC Waterfall Phase 4 — Testing*
