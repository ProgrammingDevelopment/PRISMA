# PRISMA - Platform Informasi & Manajemen RT 04

Selamat datang di repositori **PRISMA (Platform Informasi & Sistem Manajemen RT 04)**. Proyek ini adalah solusi digital end-to-end berstandar enterprise yang ditujukan untuk memodernisasi tata kelola administrasi tingkat Rukun Tetangga (RT), pengelolaan kas, keamanan lingkungan, serta pelayanan warga menggunakan teknologi kecerdasan buatan (AI).

---

## 🏗️ Tech Stack

Sistem ini dikembangkan menggunakan teknologi terdepan dalam ekosistem JavaScript dan Python:
- **Frontend Framework**: Next.js 16.1.4 (App Router) dengan React 19.
- **Language**: TypeScript secara menyeluruh tipe-data ketat (strict typing).
- **Styling**: Tailwind CSS v4 untuk *utility-first* styling, dipadukan dengan konfigurasi PostCSS.
- **AI & Data Science (Backend)**: Python 3.10+ (FastAPI) untuk *Natural Language Processing*, *Computer Vision*, dan *LLM Inference* (Local LLM via Ollama/Llama 3.2).
- **Web Backend & Tooling**: Node.js ecosystem, `dotenv` untuk pengelolaan environment.
- **Testing**: `vitest` bersama `@testing-library/react` dan `jsdom` untuk _unit test_ dan _integration test_ yang secepat kilat.
- **Bot Engine**: `node-telegram-bot-api` bersama `pdfkit` (untuk auto-generate dokumen administrasi PDF).

---

## 🗄️ Database

Arsitektur data PRISMA dirancang fleksibel menyesuaikan tingkat deployment (mulai dari local tier sampai enterprise tier cloud):
1. **Cloud Database (Primary)**: @supabase/supabase-js dan PostgreSQL (Neon Tech) dengan Drizzle ORM (terpisah sesuai branch environment).
2. **Local / Edge Database**: Penggunaan `sql.js` (SQLite `prisma_demo.db`) di memori untuk keperluan fast-demo, stand-alone mode tanpa setup yang rumit. 
3. **Legacy Fallback**: Kompatibilitas relasional RDBMS dengan MySQL (XAMPP basis port 3306) untuk kemudahan host di level komunitas yang lebih umum.

---

## 🎨 UI/UX Design

Kami mengadopsi standar desain **Enterprise Modern** yang intuitif dan interaktif bagi seluruh warga (dari kalangan milenial maupun senior):
- **Component Library**: Radix UI Primitives (`@radix-ui/react-*`) menjamin _accessibility_ tinggi tanpa keharusan design bawaan (A11y Compliant).
- **Smooth Animations**: Interaksi antarmuka didukung transisi elemen mulus dari `framer-motion`.
- **Theming & Color Scheme**: Menggunakan `next-themes` (Dark Mode / Light Mode Auto-detection) dengan Tailwind `clsx` & `tailwind-merge`.
- **Responsive & Mobile First**: Elemen-elemen seperti Navbar, Chatbot Widget (`chatbot.tsx`), dan layout administrasi responsif sempurna di layar perangkat *smartphone* maupun tablet secara proporsional.
- **Inti Pengalaman Warga**: Menghadirkan *floating dashboard*, sistem tiket pelaporan instan, visualisasi data kas transparan, dan navigasi yang sangat _user-friendly_.

---

## 📈 Scalability

Platform tidak hanya berjalan dalam mode _monolith_ melainkan dirancang modular:
- **Microservices Deployment**: Pemisahan jelas antara layer Presentation (Next.js port 3000), ML Model Endpoints (FastAPI port 8000), dan Vector/RAG Chat Backend (port 8001). 
- **Cloud Delivery Network (CDN)**: Memanfaatkan Cloudflare Pages (lewat `deploy:cf` `wrangler` CLI) dan Vercel (melalui `vercel.json` config) sehingga static asset dapat diakses global dengan *latency* amat rendah.
- **State Management**: Perluasan service dapat diskalkulasikan tanpa mengganggu operasi main UI thread. Jika traffic chat membludak, sistem dapat men-scale secara bebas *Backend Chat* (RAG Engine) saja.

---

## ⚡ Optimization

Agar aplikasi memiliki *Time to Interactive (TTI)* dan stabilitas yang unggul:
- **Build Optimization**: Memanfaatkan engine turbopack Next.js; gambar, transisi font, dan layout *server-side rendering (SSR)* berjalan *seamless*.
- **SEO & Web Indexing**: `next-sitemap` dikonfigurasikan agar pengumuman publik RT mudah dirayapi standar *search engine* bila dibuka ke ruang lingkup RT publik/nasional.
- **Testing Terstruktur**: Integrasi *Vitest* dalam konfigurasi workflow untuk menjamin tiada penurunan perfoma *regression bugs* saat rilis *fitur* baru.

---

## 🛡️ Security & Keamanan

Data kependudukan adalah hal krusial, di dalamnya termasuk keamanan privasi warga:
- **Anti XSS & Sanitization**: Layanan komunikasi dijaga dari manipulasi _scripting_ berbahaya (XSS injection) dengan implementasi lib `dompurify`, `sanitize-html`, serta `xss`. Sistem telegram bot (`sanitizeBotInput()`) memotong payload kode arbitrer secara otonom.
- **Data Encryption**: Proses hasing menggunakan algoritma modern dari `bcryptjs`.
- **Bot/Spam Protection**: Pelaporan publik di web page diamankan melalui integrasi reCAPTCHA v2/v3 (`react-google-recaptcha`).
- **Rate-Limiting Logic**: Pengaturan beban IP dengan `ip-rate-limit` pada layer Node.js & *flood guard* otomatis di layer Telegram Server untuk menahan serangan/spammer warga dengan limit standar 30 entri pesan per menit per user ID.
- **Isolated Credentials**: Token, kunci enkripsi, dan credential API diamankan di luar repositori publik menggunakan file lingkungan *strict* (`.env.bot`, `.env.local`).

---

## 🤖 AI Agents

PRISMA melampaui website RT konvensional dengan menghadirkan Kecerdasan Buatan melalui entitas asisten mandiri:
1. **Interactive RAG Web Agent (Siaga)**: Chatbot interaktif terbenam pada pojok sistem Web (`src/components/chat/chatbot.tsx`). Menghubungi API Chat RAG (Retrieval-Augmented Generation) di Python untuk memberi respons pintar terkait pedoman kepengurusan dan arahan URL *Real-time*.
2. **Autonomous Telegram Bot (24/7 Virtual Asisstant)**: Bot Telegram pintar (`scripts/telegram-bot.ts`) sebagai jalur darurat saat _web infrastructure_ tidak dibuka.
   - ➜ **Fungsi Administratif Otomatis**: Membuat *Surat Pengantar* untuk warga seketika dan mencetak file output validasi berupa *PDF* (`pdfkit`).
   - ➜ **Integrasi Penjawab Cepat**: Menyampaikan histori keuangan real-time kas RT, status laporan keamanan, dan integrasi _Ticket ID_ warga.
3. **Advanced AI Microservices**: `FastAPI` Engine mampu memperkirakan tren (`predict/financial`), klasifikasi visi masalah lingkungan (seperti jalanan berlubang/sampah berserakan lewat `vision/classify`), dan analisis sentimen terhadap komplain warga yang masuk (untuk memprioritaskan penyelesaian).

---

## 🚀 Quick Start (Menjalankan Sistem)

### Menjalankan Semua Services Sekaligus

```powershell
# Dari root folder, jalankan orchestrator
npm run dev:all

# Atau langsung mengeksekusi powershell script
.\run-all.ps1
```

### Menjalankan Services Secara Terpisah

1. **Frontend (Next.js) - Port 3000**
   ```powershell
   npm run dev
   ```

2. **AI Backend NLP/Vision (FastAPI) - Port 8000**
   ```powershell
   npm run dev:ai-backend
   ```

3. **Chatbot Retrieval Agent Backend (RAG) - Port 8001**
   ```powershell
   npm run dev:chatbot
   ```

*(Telegram Bot dapat dinyalakan dengan menjalankan `npm run bot` setelah mengatur token di file `.env.bot`.)*

---

## 🔌 API Endpoints Reference

### AI Backend (Port 8000)
- `GET /docs` - Swagger documentation
- `POST /api/v1/nlp/sentiment` - Sentiment analysis
- `POST /api/v1/nlp/chat` - AI chat
- `POST /api/v1/vision/classify` - Image classification
- `POST /api/v1/predict/financial` - Financial prediction
- `GET /api/v1/recommend/activities/{warga_id}` - Activity recommendations

### Chatbot Backend (Port 8001)
- `POST /chat` - RAG-based chat with Siaga assistant

---

## 📂 Struktur Direktori & Fungsi Subfolder (Features & Functions)

Proyek ini menggunakan arsitektur **Feature-Sliced Design** yang terpusat di direktori `src/` dan `scripts/`:

### 1. `src/app/` (Next.js App Router)
Berisi *route handlers* dan *pages* antarmuka sistem:
- **`/admin`**: Panel dashboard khusus Ketua RT/Pengurus untuk memvalidasi laporan warga, mengelola surat, dan analitik.
- **`/auth`**: Sistem registrasi warga, login, dan manajemen sesi pengguna.
- **`/keuangan`**: Modul transparansi kas RT. Berisi rekapitulasi dana dan histori pembayaran.
- **`/layanan`**: Pusat layanan mandiri (*self-service*). Termasuk pelaporan keamanan lingkungan (*Security*) komprehensif.
- **`/surat`**: Route khusus untuk memproses dan mencetak pengajuan dokumen (Surat Pengantar RT, dll).
- **`/profile` & `/settings`**: Personalisasi profil warga, data domisili, dan preferensi akun.

### 2. `src/components/` (React Components)
Berisi modul UI *reusable* pembentuk antarmuka:
- **`/chat`**: Memuat `chatbot.tsx`, antarmuka widget *floating* untuk **AI Siaga (RAG Agent)** berinteraksi via Python Backend.
- **`/home`**: Komponen layout *Landing Page* / Dashboard warga (pengumuman, info kas singkat, navigasi *shortcut*).
- **`/layout`**: Struktur kerangka aplikasi (navbar, sidebar) tertata rapi merespon ukuran perangkat *mobile-first*.
- **`/ui`**: *Base primitives* komponen (Button, Card, Input) dari Radix UI yang di-styling responsif menggunakan Tailwind CSS.
- **`pwa-install-prompt.tsx`**: Modul notifikasi mengajak warga menginstal PWA (Progressive Web App) ke ponsel.
- **`/surat`**: Form interaktif dan tampilan layout spesifik untuk formulir dokumen.

### 3. `scripts/` (Edge & Background Jobs)
- **`telegram-bot.ts`**: Hub mesin *Telegram Bot* otonom 24/7 Node.js. Menanggapi prompt warga dan men-*generate* file PDF secara mandiri langsung (`pdfkit`).
- **`generate_db.js`**: Script inisiasi dan *seeding* struktur tabel (*mock data*) otomatis untuk `prisma_demo.db` (Local SQLite Database).

---

## ⚙️ Environment Variables (.env.local)

```env
# URL Backbone
NEXT_PUBLIC_AI_BACKEND_URL="http://localhost:8000"
NEXT_PUBLIC_CHAT_API_URL="http://localhost:8001/chat"

# Database Relasional Legacy (Bila tidak memakai Drizzle/Supabase)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=admin_rt
```

---

## 📝 Troubleshooting

**A. Port konflik / Port sudah digunakan**
```powershell
# Temukan Process ID (PID)
netstat -ano | findstr :3000

# Kill process berdasarkan nomor PID
taskkill /PID <PID> /F
```

**B. Modul Python "Virtual environment" tidak beroperasi**
```powershell
# Rebuild virtual environment khusus Windows
cd central-node/ai-backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```
