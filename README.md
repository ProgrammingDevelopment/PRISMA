# PRISMA - Platform Informasi & Manajemen RT 04

## 🚀 Quick Start

### Menjalankan Semua Services Sekaligus

```powershell
# Dari root folder
npm run dev:all

# Atau langsung
.\run-all.ps1
```

### Menjalankan Services Secara Terpisah

```powershell
# Terminal 1: Frontend (Next.js) - Port 3000
npm run dev

# Terminal 2: AI Backend (FastAPI) - Port 8000
npm run dev:ai-backend

# Terminal 3: Chatbot Backend (RAG) - Port 8001
npm run dev:chatbot
```

## 🔧 Konfigurasi Port

| Service          | Port  | URL                              |
| ---------------- | ----- | -------------------------------- |
| Frontend Next.js | 3000  | http://localhost:3000            |
| AI Backend       | 8000  | http://localhost:8000/docs       |
| Chatbot Backend  | 8001  | http://localhost:8001/chat       |

## 📁 Struktur Proyek

```
prisma/
├── src/                          # Frontend Next.js
│   ├── app/                      # App Router pages
│   └── components/               # React components
├── central-node/                 # Backend services
│   ├── ai-backend/               # AI Platform (Port 8000)
│   │   ├── main.py               # FastAPI app
│   │   ├── models/               # ML models
│   │   └── requirements.txt
│   ├── backend-python/           # Chatbot RAG (Port 8001)
│   │   ├── main.py               # FastAPI app
│   │   ├── data/                 # PDF documents
│   │   └── requirements.txt
│   └── run-ai.ps1                # AI backend runner
├── run-all.ps1                   # Run all services
├── package.json                  # NPM scripts
└── .env.local                    # Environment variables
```

## 🔌 API Endpoints

### AI Backend (Port 8000)

- `GET /docs` - Swagger documentation
- `POST /api/v1/nlp/sentiment` - Sentiment analysis
- `POST /api/v1/nlp/chat` - AI chat
- `POST /api/v1/vision/classify` - Image classification
- `POST /api/v1/predict/financial` - Financial prediction
- `GET /api/v1/recommend/activities/{warga_id}` - Activity recommendations

### Chatbot Backend (Port 8001)

- `POST /chat` - RAG-based chat with Siaga assistant

## ⚙️ Environment Variables

```env
# Backend URLs
NEXT_PUBLIC_AI_BACKEND_URL="http://localhost:8000"
NEXT_PUBLIC_CHAT_API_URL="http://localhost:8001/chat"

# Database (MySQL/XAMPP)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=admin_rt
```

## 🛠️ Prerequisites

- **Node.js** 18+ (untuk frontend)
- **Python** 3.10+ (untuk backend)
- **XAMPP** (opsional, untuk MySQL database)

## 📝 Troubleshooting

### Port sudah digunakan
```powershell
# Cek process yang menggunakan port
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :8001

# Kill process (ganti PID)
taskkill /PID <PID> /F
```

### Virtual environment tidak ditemukan
```powershell
# Buat ulang virtual environment
cd central-node/ai-backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```
