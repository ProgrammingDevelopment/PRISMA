# PRISMA AI Backend

Platform AI/ML untuk PRISMA RT 04 Kemayoran dengan kapabilitas komprehensif.

## 🚀 Fitur

### 1. Deep Learning (Kualifikasi #1, #7)
- **CNN**: Convolutional Neural Networks untuk klasifikasi gambar
- **RNN/GRU**: Recurrent Neural Networks untuk data sekuensial
- **LSTM**: Long Short-Term Memory untuk time series
- **Transformer**: Arsitektur attention-based untuk NLP

### 2. Computer Vision (Kualifikasi #2, #5)
- **Image Classification**: Klasifikasi gambar dokumentasi dan keamanan
- **Object Detection**: Deteksi objek untuk CCTV dan keamanan
- **Document Scanner**: Pemindaian dan enhancement dokumen

### 3. Natural Language Processing (Kualifikasi #3, #13-16)
- **Sentiment Analysis**: Analisis sentimen feedback warga
- **Text Classification**: Klasifikasi pengaduan dan permohonan
- **Chatbot**: Asisten virtual PRISMA
- **Summarization**: Ringkasan laporan otomatis
- **Translation**: Terjemahan ID-EN

### 4. Predictive Analytics (Kualifikasi #4, #8, #9)
- **Financial Forecasting**: Prediksi keuangan RT jangka panjang
- **Churn Prediction**: Prediksi keaktifan warga
- **Activity Prediction**: Prediksi partisipasi kegiatan

### 5. Clustering & Segmentation (Kualifikasi #10, #11)
- **Citizen Segmentation**: Segmentasi warga berdasarkan karakteristik
- **PCA**: Principal Component Analysis
- **t-SNE**: Visualisasi data dimensi tinggi

### 6. Recommendation System (Kualifikasi #6)
- **Collaborative Filtering**: Rekomendasi berdasarkan warga serupa
- **Content-Based**: Rekomendasi berdasarkan konten
- **Hybrid**: Kombinasi kedua metode

### 7. Model Evaluation (Kualifikasi #12)
- Metrik: Accuracy, Precision, Recall, F1-Score
- Cross-validation
- ROC AUC, Confusion Matrix
- Model comparison

## 📦 Instalasi

```bash
cd ai-backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

## 🏃 Menjalankan Server

```bash
# Development
python main.py

# atau
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server akan berjalan di `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 📡 API Endpoints

### NLP
```
POST /api/v1/nlp/sentiment     - Analisis sentimen
POST /api/v1/nlp/sentiment/batch - Batch sentiment
POST /api/v1/nlp/chat          - Chatbot
POST /api/v1/nlp/summarize     - Summarisasi
POST /api/v1/nlp/translate     - Terjemahan
```

### Vision
```
POST /api/v1/vision/classify   - Klasifikasi gambar
POST /api/v1/vision/detect     - Deteksi objek
```

### Prediction
```
POST /api/v1/predict/financial - Prediksi keuangan
POST /api/v1/predict/churn     - Prediksi churn
POST /api/v1/predict/activity  - Prediksi partisipasi
```

### Clustering
```
POST /api/v1/cluster/citizens  - Segmentasi warga
```

### Recommendation
```
GET  /api/v1/recommend/activities/{warga_id} - Rekomendasi kegiatan
```

## 🧪 Contoh Penggunaan

### Sentiment Analysis
```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/nlp/sentiment",
    json={"text": "Pelayanan RT sangat memuaskan!"}
)
print(response.json())
# {"text": "...", "sentiment": "positif", "confidence": 0.92, "method": "..."}
```

### Chatbot
```python
response = requests.post(
    "http://localhost:8000/api/v1/nlp/chat",
    json={"message": "Bagaimana cara bayar iuran?", "use_ai": False}
)
print(response.json())
# {"response": "Untuk informasi iuran...", "intent": "iuran", ...}
```

### Financial Prediction
```python
response = requests.post(
    "http://localhost:8000/api/v1/predict/financial?months_ahead=6"
)
print(response.json())
# {"predictions": [...], "trend": "naik", "confidence": 0.75}
```

## 📁 Struktur Folder

```
ai-backend/
├── main.py                 # FastAPI application
├── requirements.txt        # Dependencies
├── config/
│   ├── __init__.py
│   └── settings.py         # Configuration
├── models/
│   ├── __init__.py
│   ├── deep_learning.py    # CNN, RNN, LSTM, Transformer
│   ├── nlp.py              # Sentiment, Chatbot, Summarizer
│   ├── vision.py           # Image Classification, Object Detection
│   ├── predictive.py       # Financial Predictor
│   ├── churn.py            # Churn & Activity Prediction
│   ├── clustering.py       # Segmentation, PCA, t-SNE
│   ├── recommendation.py   # Recommendation Engine
│   └── evaluation.py       # Model Evaluation
├── services/
│   ├── __init__.py
│   └── training.py         # Training Service & Education
├── data/                   # Data storage
├── models/saved/           # Saved models
└── logs/                   # Application logs
```

## 🔧 Frameworks Terpakai

| Framework | Versi | Penggunaan |
|-----------|-------|------------|
| TensorFlow/Keras | ≥2.15 | Deep Learning (CNN, RNN, LSTM) |
| PyTorch | ≥2.1 | Object Detection, Vision |
| scikit-learn | ≥1.3 | Classification, Clustering, Evaluation |
| Hugging Face Transformers | ≥4.36 | NLP, Sentiment, Translation |
| FastAPI | ≥0.109 | REST API |

## 📊 Kualifikasi yang Dipenuhi

| # | Kualifikasi | Status | Model |
|---|-------------|--------|-------|
| 1 | Deep learning (CNN, RNN) | ✅ | deep_learning.py |
| 2 | Computer vision | ✅ | vision.py |
| 3 | NLP (chatbot, dll) | ✅ | nlp.py |
| 4 | Analisis prediktif bisnis | ✅ | predictive.py |
| 5 | Klasifikasi gambar dan teks | ✅ | vision.py, nlp.py |
| 6 | Sistem rekomendasi | ✅ | recommendation.py |
| 7 | Edukasi deep learning | ✅ | training.py |
| 8 | Prediksi jangka panjang | ✅ | predictive.py |
| 9 | Klasifikasi dan regresi | ✅ | churn.py |
| 10 | Clustering segmentasi | ✅ | clustering.py |
| 11 | Dimensionality reduction | ✅ | clustering.py |
| 12 | Evaluasi model | ✅ | evaluation.py |
| 13 | Chatbot virtual assistant | ✅ | nlp.py |
| 14 | Analisis sentimen | ✅ | nlp.py |
| 15 | Terjemahan & summarisasi | ✅ | nlp.py |
| 16 | NLP domain khusus | ✅ | nlp.py |

## 🔒 Environment Variables

```env
# .env
NEXT_PUBLIC_AI_API_URL=http://localhost:8000/api/v1
HF_MODEL_CACHE=./models/hf_cache
DEBUG=true
```

## 📝 License

PRISMA RT 04 Kemayoran © 2026
