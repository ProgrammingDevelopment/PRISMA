# 🎨 System Architecture Design (SAD)
## PRISMA — Platform Informasi & Sistem Manajemen RT 04
### SDLC Fase 2: System Design

**Versi Dokumen:** 1.1  
**Tanggal:** 10 April 2026 (Updated: Finalized MVVM Migration)
**Pattern:** MVVM + Microservices  

---

## 1. Arsitektur Keseluruhan

### 1.1 High-Level Architecture

```mermaid
graph TB
    subgraph Client["🌐 Client Layer"]
        WEB["Next.js 16 SSG\n(Port 3000)"]
        PWA["PWA Mobile"]
        TG["Telegram Bot"]
    end
    
    subgraph MVVM["🧠 MVVM Frontend (React)"]
        VIEW["View Layer\n(Pages + Components)"]
        VIEWMODEL["ViewModel Layer\n(React Hooks)"]
        MODEL["Model Layer\n(Entities + Repositories)"]
    end

    subgraph Gateway["🚪 API Gateway (Port 4000)"]
        GW["Express.js Gateway\nAuth | Rate Limit | CORS"]
    end
    
    subgraph Microservices["⚙️ Domain Microservices"]
        MS1["Warga Service\n:4001"]
        MS2["Keuangan Service\n:4002"]
        MS3["Keamanan Service\n:4003"]
        MS4["Surat Service\n:4004"]
        MS5["AI Service\n:4005"]
    end
    
    subgraph DataStores["💾 Data Stores"]
        DB1["SQLite\n(Client-side)"]
        DB2["SQLite\n(Server-side per service)"]
        DB3["JSON Files"]
        DB4["Ollama LLM\n:11434"]
    end
    
    Client --> MVVM
    VIEW --> VIEWMODEL
    VIEWMODEL --> MODEL
    MODEL -->|"Local Mode"| DB1
    MODEL -->|"Remote Mode"| GW
    GW --> Microservices
    MS1 --> DB2
    MS2 --> DB3
    MS3 --> DB2
    MS4 --> DB3
    MS5 --> DB4
    TG --> GW
```

### 1.2 Deployment Diagram

```mermaid
graph TB
    subgraph CloudflarPages["☁️ Cloudflare Pages"]
        STATIC["Static HTML/JS/CSS\n(Next.js SSG Output)"]
    end
    
    subgraph DockerHost["🐳 Docker Host (Local/VPS)"]
        DC["docker-compose.yml"]
        DC --> GW["API Gateway :4000"]
        DC --> S1["warga-service :4001"]
        DC --> S2["keuangan-service :4002"]
        DC --> S3["keamanan-service :4003"]
        DC --> S4["surat-service :4004"]
        DC --> S5["ai-service :4005"]
    end
    
    subgraph LocalMachine["💻 Local Machine"]
        OLLAMA["Ollama LLM :11434"]
        TGBOT["Telegram Bot Process"]
    end
    
    STATIC -->|"REST API"| GW
    S5 --> OLLAMA
    TGBOT --> GW
```

---

## 2. MVVM Pattern Detail

### 2.1 Layer Responsibilities

| Layer | Tanggung Jawab | Teknologi |
|-------|---------------|-----------|
| **View** | Rendering UI, user interaction, layout | React Components (TSX), Tailwind CSS, Framer Motion |
| **ViewModel** | State management, business logic, data transformation | React Hooks (useState, useCallback, useEffect) |
| **Model** | Domain entities, data validation, repository abstraction | TypeScript interfaces, Repository classes |

### 2.2 MVVM Data Binding

```mermaid
sequenceDiagram
    participant V as View (page.tsx)
    participant VM as ViewModel (useXxxViewModel)
    participant M as Model (Repository)
    participant DS as DataSource
    
    Note over V,DS: Initialization Flow
    V->>VM: const { data, isLoading } = useXxxViewModel()
    VM->>M: repository.getAll()
    M->>DS: query / fetch
    DS-->>M: raw data
    M-->>VM: Entity[]
    VM-->>V: { data, isLoading: false }
    
    Note over V,DS: User Action Flow
    V->>VM: handleSubmit(formData)
    VM->>VM: validate(formData)
    VM->>M: repository.create(entity)
    M->>DS: insert / POST
    DS-->>M: result
    M-->>VM: { success: true }
    VM->>VM: setState(updated)
    VM-->>V: re-render with new data
```

### 2.3 View Layer — Komponen Mapping

> **Catatan Migrasi Final:** Semua view (_page components_) kini mengambil data secara eksklusif menggunakan sistem hook `useXxxViewModel()` terkait. Pemanggilan `fetch('/api/...')` tradisional langsung ke endpoint internal Next.js telah dihapus seluruhnya untuk menjamin konsistensi _Single Source of Truth_.

| View (Page) | ViewModel Hook | Model Repository |
|-------------|---------------|-----------------|
| `/` (Dashboard) | `useDashboardViewModel` | WargaRepository, KeuanganRepository |
| `/layanan/administrasi` | `useWargaViewModel` | WargaRepository |
| `/keuangan/laporan` | `useKeuanganViewModel` | KeuanganRepository |
| `/keuangan/iuran` | `useKeuanganViewModel` | KeuanganRepository |
| `/surat/keamanan` | `useKeamananViewModel` | KeamananRepository |
| `/surat` | `useSuratViewModel` | SuratRepository |
| `/auth/login` | `useAuthViewModel` | UserRepository |
| Chatbot Widget | `useAIViewModel` | AIApiClient |

---

## 3. Microservices Design

### 3.1 Service Boundaries (Domain-Driven)

```mermaid
graph LR
    subgraph BC1["📋 Warga Context"]
        E1["Warga Entity"]
        E2["Pengurus Entity"]
        E3["Statistik Value Object"]
    end
    
    subgraph BC2["💰 Keuangan Context"]
        E4["Transaction Entity"]
        E5["MonthlyReport Aggregate"]
        E6["ExpenseSummary Value Object"]
    end
    
    subgraph BC3["🚨 Keamanan Context"]
        E7["SecurityReport Entity"]
        E8["IncidentType Value Object"]
    end
    
    subgraph BC4["📄 Surat Context"]
        E9["LetterTemplate Entity"]
        E10["LetterRequest Entity"]
    end
    
    subgraph BC5["🤖 AI Context"]
        E11["ChatMessage Entity"]
        E12["NLPResult Value Object"]
    end
```

### 3.2 API Contract

#### Warga Service (Port 4001)

```
GET    /api/v1/warga           → List all warga
GET    /api/v1/warga/:id       → Get warga by ID
POST   /api/v1/warga           → Create new warga
PUT    /api/v1/warga/:id       → Update warga
DELETE /api/v1/warga/:id       → Delete warga
GET    /api/v1/warga/stats     → Get statistik
GET    /api/v1/pengurus        → List pengurus
```

#### Keuangan Service (Port 4002)

```
GET    /api/v1/keuangan/reports              → All monthly reports
GET    /api/v1/keuangan/reports/:bulan/:tahun → Specific month report
GET    /api/v1/keuangan/balance              → Current balance
GET    /api/v1/keuangan/summary              → Expense summary
POST   /api/v1/keuangan/transactions         → Add transaction
```

#### Keamanan Service (Port 4003)

```
GET    /api/v1/keamanan/reports    → List security reports
POST   /api/v1/keamanan/reports    → Submit new report
GET    /api/v1/keamanan/stats      → Security statistics
GET    /api/v1/keamanan/incidents  → Incident types
```

#### Surat Service (Port 4004)

```
GET    /api/v1/surat/templates           → List templates
GET    /api/v1/surat/templates/:id       → Get template detail
POST   /api/v1/surat/requests            → Submit letter request
GET    /api/v1/surat/download/:id/:fmt   → Download template file
```

#### AI Service (Port 4005)

```
POST   /api/v1/ai/chat           → Chat with Siaga AI
POST   /api/v1/ai/nlp/analyze    → Full NLP analysis
POST   /api/v1/ai/nlp/sentiment  → Sentiment analysis only
GET    /api/v1/ai/health         → Service health check
```

### 3.3 Inter-Service Communication

```mermaid
graph LR
    GW["API Gateway\n:4000"]
    
    GW -->|"/api/v1/warga/*"| S1["Warga\n:4001"]
    GW -->|"/api/v1/keuangan/*"| S2["Keuangan\n:4002"]
    GW -->|"/api/v1/keamanan/*"| S3["Keamanan\n:4003"]
    GW -->|"/api/v1/surat/*"| S4["Surat\n:4004"]
    GW -->|"/api/v1/ai/*"| S5["AI\n:4005"]
    
    GW -->|"Middleware"| MW["Auth · Rate Limit · CORS · Logging"]
```

### 3.4 Service Registry & Discovery

Mode operasi sistem:

| Mode | Keterangan | ServiceRegistry Config |
|------|-----------|----------------------|
| **Local** | SQLite client-side, tanpa backend | `mode: 'local'` |
| **Remote** | Full microservices via API Gateway | `mode: 'remote'` |
| **Hybrid** | SQLite lokal + API untuk AI/NLP | `mode: 'hybrid'` |

---

## 4. Database Design

### 4.1 Database per Service

| Service | Database | Engine |
|---------|----------|--------|
| Warga | `warga.db` | SQLite (better-sqlite3) |
| Keuangan | `keuangan-data.json` | JSON File Store |
| Keamanan | `keamanan.db` | SQLite (better-sqlite3) |
| Surat | `surat-templates.json` | JSON File Store |
| AI | N/A (Ollama external) | — |
| Frontend | `prisma_demo.db` (client-side) | sql.js (WASM) |

### 4.2 ERD (tetap seperti existing)

```mermaid
erDiagram
    USERS ||--|| WARGA : "linked"
    WARGA ||--o{ SECURITY_REPORTS : "reports"
    WARGA ||--o{ LETTERS : "requests"
    WARGA ||--o{ FINANCE_TRANSACTIONS : "pays"
    PENGURUS ||--o{ LETTERS : "approves"
```

---

## 5. Security Architecture

### 5.1 API Gateway Security

```
Request → CORS Check → Rate Limiter → Auth Token Verify → Route Proxy → Service
```

### 5.2 Security Layers

| Layer | Mekanisme |
|-------|-----------|
| Transport | HTTPS (Cloudflare SSL) |
| Gateway | CORS whitelist, Rate limit (100 req/min) |
| Auth | JWT / Session token validation |
| Input | sanitizeInput() — XSS, SQL injection prevention |
| Audit | logSecurityEvent() for all mutations |
| Data | PII masking (phone, email, NIK) |

---

## 6. Technology Stack per Service

| Service | Runtime | Framework | Dependencies |
|---------|---------|-----------|-------------|
| Gateway | Node.js 18+ | Express.js | http-proxy-middleware, cors, express-rate-limit |
| Warga | Node.js 18+ | Express.js | better-sqlite3, uuid |
| Keuangan | Node.js 18+ | Express.js | uuid |
| Keamanan | Node.js 18+ | Express.js | better-sqlite3, uuid |
| Surat | Node.js 18+ | Express.js | uuid |
| AI | Node.js 18+ | Express.js | node-fetch (Ollama client) |

---

*Dokumen ini adalah bagian dari SDLC Waterfall Phase 2 — System Design*
