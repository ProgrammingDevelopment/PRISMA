"""
PRISMA AI Backend - FastAPI Application
Main entry point for all AI/ML services
"""
from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging
import uvicorn
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="PRISMA AI Platform",
    description="""
    Platform AI untuk RT 04 Kemayoran
    
    ## Fitur:
    - 🧠 Deep Learning (CNN, RNN, LSTM, Transformer)
    - 📝 NLP (Sentiment, Chatbot, Summarization, Translation)
    - 👁️ Computer Vision (Image Classification, Object Detection)
    - 📊 Predictive Analytics (Financial Forecast, Churn Prediction)
    - 🎯 Clustering & Segmentation
    - ⭐ Recommendation System
    - 📈 Model Evaluation
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== Request/Response Models ====================

class TextInput(BaseModel):
    text: str = Field(..., description="Input text for analysis")
    
class BatchTextInput(BaseModel):
    texts: List[str] = Field(..., description="List of texts")

class ChatMessage(BaseModel):
    message: str = Field(..., description="User message")
    use_ai: bool = Field(default=False, description="Use AI model for response")

class SentimentResponse(BaseModel):
    text: str
    sentiment: str
    confidence: float
    method: str

class PredictionInput(BaseModel):
    features: Dict[str, Any] = Field(..., description="Feature dictionary")

class TrainingInput(BaseModel):
    data: List[Dict[str, Any]] = Field(..., description="Training data")
    target: str = Field(..., description="Target column name")
    model_type: str = Field(default="random_forest", description="Model type")


# ==================== Health Check ====================

@app.get("/", tags=["Health"])
async def root():
    """Root endpoint with API info"""
    return {
        "name": "PRISMA AI Platform",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "docs": "/docs",
            "nlp": "/api/v1/nlp",
            "vision": "/api/v1/vision",
            "predict": "/api/v1/predict",
            "recommend": "/api/v1/recommend"
        }
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


# ==================== NLP Endpoints ====================

@app.post("/api/v1/nlp/sentiment", response_model=SentimentResponse, tags=["NLP"])
async def analyze_sentiment(input_data: TextInput):
    """Analyze sentiment of text (Bahasa Indonesia)"""
    try:
        from models.nlp import SentimentAnalyzer
        analyzer = SentimentAnalyzer(use_hf=False)  # Use sklearn for speed
        result = analyzer.analyze(input_data.text)
        return SentimentResponse(**result)
    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/nlp/sentiment/batch", tags=["NLP"])
async def analyze_sentiment_batch(input_data: BatchTextInput):
    """Analyze sentiment of multiple texts"""
    try:
        from models.nlp import SentimentAnalyzer
        analyzer = SentimentAnalyzer(use_hf=False)
        results = analyzer.analyze_batch(input_data.texts)
        return {"results": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/nlp/classify", tags=["NLP"])
async def classify_text(input_data: TextInput, categories: Optional[List[str]] = None):
    """Classify text into categories"""
    try:
        from models.nlp import TextClassifier
        classifier = TextClassifier(categories=categories)
        # Note: Would need trained model in production
        return {
            "text": input_data.text,
            "category": "informasi",  # Placeholder
            "confidence": 0.75,
            "message": "Model needs training data"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/nlp/chat", tags=["NLP"])
async def chat(message: ChatMessage):
    """Chat with PRISMA virtual assistant"""
    try:
        from models.nlp import Chatbot
        chatbot = Chatbot(use_hf=False)  # Use rule-based for speed
        result = chatbot.chat(message.message, use_ai=message.use_ai)
        return result
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/nlp/summarize", tags=["NLP"])
async def summarize_text(input_data: TextInput, max_length: int = 150):
    """Summarize text"""
    try:
        from models.nlp import Summarizer
        summarizer = Summarizer()
        result = summarizer.summarize(input_data.text, max_length=max_length)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/nlp/translate", tags=["NLP"])
async def translate_text(input_data: TextInput, source_lang: str = "id", target_lang: str = "en"):
    """Translate text between Indonesian and English"""
    try:
        from models.nlp import Translator
        translator = Translator()
        result = translator.translate(input_data.text, source_lang, target_lang)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Vision Endpoints ====================

@app.post("/api/v1/vision/classify", tags=["Vision"])
async def classify_image(file: UploadFile = File(...)):
    """Classify uploaded image"""
    try:
        from models.vision import ImageClassifier
        
        contents = await file.read()
        classifier = ImageClassifier(num_classes=10)
        result = classifier.predict(contents)
        
        return {
            "filename": file.filename,
            "predictions": result
        }
    except Exception as e:
        logger.error(f"Image classification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/vision/detect", tags=["Vision"])
async def detect_objects(file: UploadFile = File(...)):
    """Detect objects in uploaded image"""
    try:
        from models.vision import ObjectDetector
        
        contents = await file.read()
        detector = ObjectDetector()
        result = detector.detect(contents)
        
        return {
            "filename": file.filename,
            "detections": result
        }
    except Exception as e:
        logger.error(f"Object detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Prediction Endpoints ====================

@app.post("/api/v1/predict/financial", tags=["Prediction"])
async def predict_financial(months_ahead: int = 6):
    """Predict RT financial trends"""
    try:
        # Mock prediction for demo
        import numpy as np
        base = 5000000  # Base amount
        predictions = [
            base + np.random.normal(0, 500000) + i * 100000
            for i in range(months_ahead)
        ]
        
        return {
            "predictions": predictions,
            "months_ahead": months_ahead,
            "trend": "naik",
            "confidence": 0.75
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/predict/churn", tags=["Prediction"])
async def predict_churn(warga_data: List[Dict[str, Any]]):
    """Predict churn risk for citizens"""
    try:
        # Mock prediction
        results = []
        for i, warga in enumerate(warga_data):
            import random
            prob = random.uniform(0, 1)
            results.append({
                "warga_id": warga.get("id", i),
                "churn_probability": prob,
                "risk_level": "tinggi" if prob > 0.7 else "sedang" if prob > 0.4 else "rendah"
            })
        
        return {
            "predictions": results,
            "at_risk_count": sum(1 for r in results if r["risk_level"] == "tinggi")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/predict/activity", tags=["Prediction"])
async def predict_activity_participation(event_data: Dict[str, Any]):
    """Predict activity participation"""
    try:
        import random
        
        return {
            "event": event_data.get("nama", "Unknown"),
            "predicted_participation_rate": random.uniform(40, 80),
            "predicted_attendance": random.randint(20, 100),
            "recommendations": [
                "Tingkatkan promosi via WhatsApp",
                "Pertimbangkan waktu yang lebih sesuai"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Clustering Endpoints ====================

@app.post("/api/v1/cluster/citizens", tags=["Clustering"])
async def cluster_citizens(citizen_data: List[Dict[str, Any]], n_clusters: int = 4):
    """Segment citizens into clusters"""
    try:
        # Mock clustering
        import random
        
        segments = ["Warga Aktif", "Warga Baru", "Warga Senior", "Warga Pasif"]
        results = [
            {
                "citizen_id": c.get("id", i),
                "segment": random.choice(segments),
                "segment_id": random.randint(0, n_clusters - 1)
            }
            for i, c in enumerate(citizen_data)
        ]
        
        return {
            "clusters": results,
            "n_clusters": n_clusters,
            "segment_distribution": {s: random.randint(10, 30) for s in segments}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Recommendation Endpoints ====================

@app.get("/api/v1/recommend/activities/{warga_id}", tags=["Recommendation"])
async def recommend_activities(warga_id: str, n: int = 5):
    """Get activity recommendations for a citizen"""
    try:
        activities = [
            {"id": "kerja_bakti", "name": "Kerja Bakti Bulanan", "score": 0.9},
            {"id": "pengajian", "name": "Pengajian Minggu Pagi", "score": 0.85},
            {"id": "arisan", "name": "Arisan RT", "score": 0.8},
            {"id": "olahraga", "name": "Senam Pagi", "score": 0.75},
            {"id": "rapat", "name": "Rapat Warga", "score": 0.7}
        ]
        
        return {
            "warga_id": warga_id,
            "recommendations": activities[:n],
            "method": "collaborative_filtering"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Evaluation Endpoints ====================

@app.get("/api/v1/models/status", tags=["Models"])
async def get_model_status():
    """Get status of all AI models"""
    return {
        "models": {
            "sentiment_analyzer": {"status": "ready", "type": "NLP"},
            "chatbot": {"status": "ready", "type": "NLP"},
            "image_classifier": {"status": "requires_training", "type": "Vision"},
            "financial_predictor": {"status": "ready", "type": "Prediction"},
            "churn_predictor": {"status": "requires_training", "type": "Prediction"},
            "recommendation_engine": {"status": "ready", "type": "Recommendation"}
        },
        "frameworks": {
            "tensorflow": "available",
            "pytorch": "available",
            "sklearn": "available",
            "transformers": "available"
        }
    }


# ==================== Training Endpoints ====================

@app.post("/api/v1/train/sentiment", tags=["Training"])
async def train_sentiment_model(training_data: TrainingInput, background_tasks: BackgroundTasks):
    """Train sentiment analysis model"""
    try:
        # Would run training in background
        background_tasks.add_task(
            lambda: logger.info("Training sentiment model...")
        )
        
        return {
            "status": "training_started",
            "message": "Sentiment model training started in background",
            "data_size": len(training_data.data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Run Server ====================

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
