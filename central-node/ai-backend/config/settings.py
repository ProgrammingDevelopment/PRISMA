"""
PRISMA AI Configuration Settings
"""
import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models" / "saved"
DATA_DIR = BASE_DIR / "data"
LOGS_DIR = BASE_DIR / "logs"

# Create directories if they don't exist
for dir_path in [MODELS_DIR, DATA_DIR, LOGS_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)


class Settings(BaseSettings):
    """Application settings"""
    
    # API Settings
    API_TITLE: str = "PRISMA AI Platform"
    API_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = True
    
    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Security
    SECRET_KEY: str = "prisma-ai-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str = f"sqlite+aiosqlite:///{BASE_DIR}/data/prisma_ai.db"
    
    # Model Settings
    MAX_SEQUENCE_LENGTH: int = 512
    BATCH_SIZE: int = 32
    EMBEDDING_DIM: int = 768
    
    # Hugging Face
    HF_MODEL_CACHE: str = str(BASE_DIR / "models" / "hf_cache")
    DEFAULT_LLM_MODEL: str = "indonesian-nlp/indonesian-roberta-base-sentiment-classifier"
    DEFAULT_NER_MODEL: str = "cahya/bert-base-indonesian-NER"
    DEFAULT_EMBEDDING_MODEL: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    
    # Training Settings
    DEFAULT_EPOCHS: int = 10
    LEARNING_RATE: float = 0.001
    VALIDATION_SPLIT: float = 0.2
    
    # Feature Flags
    ENABLE_GPU: bool = True
    ENABLE_CACHING: bool = True
    ENABLE_LOGGING: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Model type configurations
MODEL_CONFIGS = {
    "sentiment": {
        "name": "Sentiment Analysis",
        "model_type": "classification",
        "labels": ["negatif", "netral", "positif"],
        "description": "Analisis sentimen teks bahasa Indonesia"
    },
    "churn_prediction": {
        "name": "Churn Prediction",
        "model_type": "classification",
        "labels": ["aktif", "tidak_aktif"],
        "description": "Prediksi keaktifan warga"
    },
    "financial_forecast": {
        "name": "Financial Forecast",
        "model_type": "regression",
        "description": "Prediksi keuangan RT jangka panjang"
    },
    "text_classification": {
        "name": "Text Classification",
        "model_type": "classification",
        "description": "Klasifikasi teks umum"
    },
    "image_classification": {
        "name": "Image Classification",
        "model_type": "cnn",
        "description": "Klasifikasi gambar untuk keamanan dan dokumentasi"
    },
    "recommendation": {
        "name": "Recommendation System",
        "model_type": "collaborative",
        "description": "Sistem rekomendasi kegiatan warga"
    },
    "clustering": {
        "name": "Citizen Clustering",
        "model_type": "unsupervised",
        "description": "Segmentasi warga berdasarkan karakteristik"
    },
    "chatbot": {
        "name": "PRISMA Assistant",
        "model_type": "seq2seq",
        "description": "Asisten virtual untuk warga RT"
    }
}

settings = Settings()
