"""
Training Service for PRISMA AI Models
Edukasi dan pelatihan dasar deep learning
Kualifikasi #7
"""
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field
from datetime import datetime
import logging
import json
from pathlib import Path

logger = logging.getLogger(__name__)


@dataclass
class TrainingConfig:
    """Configuration for model training"""
    model_type: str
    epochs: int = 10
    batch_size: int = 32
    learning_rate: float = 0.001
    validation_split: float = 0.2
    early_stopping: bool = True
    patience: int = 5
    save_best: bool = True
    callbacks: List[str] = field(default_factory=list)


@dataclass
class TrainingResult:
    """Result of model training"""
    model_name: str
    status: str  # completed, failed, stopped
    epochs_run: int
    final_metrics: Dict[str, float]
    history: Dict[str, List[float]]
    training_time: float
    timestamp: str


class TrainingService:
    """
    Service untuk training dan edukasi model deep learning
    Kualifikasi #7: Edukasi dan pelatihan dasar deep learning
    """
    
    def __init__(self, models_dir: str = "./models/saved"):
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(parents=True, exist_ok=True)
        self.training_history: List[TrainingResult] = []
        self.current_training = None
    
    def train_cnn(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        config: TrainingConfig,
        X_val: Optional[np.ndarray] = None,
        y_val: Optional[np.ndarray] = None
    ) -> TrainingResult:
        """Train CNN model for image classification"""
        from models.deep_learning import CNNModel
        import time
        
        start_time = time.time()
        
        try:
            model = CNNModel(
                input_shape=X_train.shape[1:],
                num_classes=y_train.shape[-1] if len(y_train.shape) > 1 else len(np.unique(y_train))
            )
            
            metrics = model.train(
                X_train, y_train,
                X_val=X_val, y_val=y_val,
                epochs=config.epochs,
                batch_size=config.batch_size
            )
            
            if config.save_best:
                model.save(str(self.models_dir / f"cnn_{datetime.now().strftime('%Y%m%d_%H%M%S')}.keras"))
            
            result = TrainingResult(
                model_name="CNN",
                status="completed",
                epochs_run=config.epochs,
                final_metrics=metrics,
                history=model.history.history if model.history else {},
                training_time=time.time() - start_time,
                timestamp=datetime.now().isoformat()
            )
            
        except Exception as e:
            logger.error(f"CNN training failed: {e}")
            result = TrainingResult(
                model_name="CNN",
                status="failed",
                epochs_run=0,
                final_metrics={"error": str(e)},
                history={},
                training_time=time.time() - start_time,
                timestamp=datetime.now().isoformat()
            )
        
        self.training_history.append(result)
        return result
    
    def train_lstm(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        config: TrainingConfig,
        task: str = "regression"
    ) -> TrainingResult:
        """Train LSTM model for time series"""
        from models.deep_learning import LSTMModel
        import time
        
        start_time = time.time()
        
        try:
            model = LSTMModel(
                input_dim=X_train.shape[-1],
                sequence_length=X_train.shape[1],
                output_dim=y_train.shape[-1] if len(y_train.shape) > 1 else 1,
                task=task
            )
            
            metrics = model.train(
                X_train, y_train,
                epochs=config.epochs,
                batch_size=config.batch_size
            )
            
            if config.save_best:
                model.save(str(self.models_dir / f"lstm_{datetime.now().strftime('%Y%m%d_%H%M%S')}.keras"))
            
            result = TrainingResult(
                model_name="LSTM",
                status="completed",
                epochs_run=config.epochs,
                final_metrics=metrics,
                history=model.history.history if model.history else {},
                training_time=time.time() - start_time,
                timestamp=datetime.now().isoformat()
            )
            
        except Exception as e:
            logger.error(f"LSTM training failed: {e}")
            result = TrainingResult(
                model_name="LSTM",
                status="failed",
                epochs_run=0,
                final_metrics={"error": str(e)},
                history={},
                training_time=time.time() - start_time,
                timestamp=datetime.now().isoformat()
            )
        
        self.training_history.append(result)
        return result
    
    def train_sentiment(
        self,
        texts: List[str],
        labels: List[str],
        config: TrainingConfig
    ) -> TrainingResult:
        """Train sentiment analysis model"""
        from models.nlp import SentimentAnalyzer
        import time
        
        start_time = time.time()
        
        try:
            analyzer = SentimentAnalyzer(use_hf=False)
            metrics = analyzer.train(texts, labels)
            
            result = TrainingResult(
                model_name="SentimentAnalyzer",
                status="completed",
                epochs_run=1,  # sklearn doesn't have epochs
                final_metrics=metrics,
                history={},
                training_time=time.time() - start_time,
                timestamp=datetime.now().isoformat()
            )
            
        except Exception as e:
            logger.error(f"Sentiment training failed: {e}")
            result = TrainingResult(
                model_name="SentimentAnalyzer",
                status="failed",
                epochs_run=0,
                final_metrics={"error": str(e)},
                history={},
                training_time=time.time() - start_time,
                timestamp=datetime.now().isoformat()
            )
        
        self.training_history.append(result)
        return result
    
    def train_churn(
        self,
        X: pd.DataFrame,
        y: pd.Series,
        config: TrainingConfig
    ) -> TrainingResult:
        """Train churn prediction model"""
        from models.churn import ChurnPredictor
        import time
        
        start_time = time.time()
        
        try:
            predictor = ChurnPredictor(model_type=config.model_type)
            metrics = predictor.train(X, y)
            
            result = TrainingResult(
                model_name="ChurnPredictor",
                status="completed",
                epochs_run=1,
                final_metrics=metrics,
                history={},
                training_time=time.time() - start_time,
                timestamp=datetime.now().isoformat()
            )
            
        except Exception as e:
            logger.error(f"Churn training failed: {e}")
            result = TrainingResult(
                model_name="ChurnPredictor",
                status="failed",
                epochs_run=0,
                final_metrics={"error": str(e)},
                history={},
                training_time=time.time() - start_time,
                timestamp=datetime.now().isoformat()
            )
        
        self.training_history.append(result)
        return result
    
    def get_training_history(self) -> List[Dict[str, Any]]:
        """Get all training history"""
        return [
            {
                "model": r.model_name,
                "status": r.status,
                "metrics": r.final_metrics,
                "training_time": r.training_time,
                "timestamp": r.timestamp
            }
            for r in self.training_history
        ]
    
    def get_best_model(self, metric: str = "accuracy") -> Optional[TrainingResult]:
        """Get best performing model"""
        completed = [r for r in self.training_history if r.status == "completed"]
        if not completed:
            return None
        
        return max(completed, key=lambda x: x.final_metrics.get(metric, 0))


class EducationModule:
    """
    Module untuk edukasi dasar deep learning
    Kualifikasi #7
    """
    
    def __init__(self):
        self.topics = self._load_topics()
    
    def _load_topics(self) -> Dict[str, Dict]:
        """Load educational topics"""
        return {
            "neural_networks": {
                "title": "Pengenalan Neural Networks",
                "description": "Dasar-dasar jaringan saraf tiruan",
                "content": """
                Neural Network adalah model komputasi yang terinspirasi dari otak manusia.
                
                Komponen utama:
                1. Neurons (nodes) - unit pemrosesan dasar
                2. Weights - parameter yang dipelajari
                3. Bias - parameter tambahan
                4. Activation functions - fungsi non-linear
                
                Arsitektur dasar:
                - Input layer: menerima data
                - Hidden layers: memproses data
                - Output layer: menghasilkan prediksi
                """,
                "examples": ["Klasifikasi gambar", "Prediksi harga", "Pengenalan suara"]
            },
            "cnn": {
                "title": "Convolutional Neural Networks (CNN)",
                "description": "Deep learning untuk pengolahan gambar",
                "content": """
                CNN adalah arsitektur khusus untuk data visual.
                
                Layer utama:
                1. Convolutional layer - mendeteksi fitur
                2. Pooling layer - mengurangi dimensi
                3. Fully connected layer - klasifikasi
                
                Aplikasi:
                - Klasifikasi gambar
                - Deteksi objek
                - Segmentasi gambar
                """,
                "code_example": """
from tensorflow import keras
from tensorflow.keras import layers

model = keras.Sequential([
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Flatten(),
    layers.Dense(64, activation='relu'),
    layers.Dense(10, activation='softmax')
])
                """
            },
            "rnn_lstm": {
                "title": "RNN dan LSTM",
                "description": "Deep learning untuk data sekuensial",
                "content": """
                RNN (Recurrent Neural Network) untuk data berurutan.
                LSTM (Long Short-Term Memory) mengatasi masalah long-term dependencies.
                
                Aplikasi:
                - Prediksi time series
                - Analisis teks
                - Penerjemahan
                """,
                "code_example": """
from tensorflow import keras
from tensorflow.keras import layers

model = keras.Sequential([
    layers.LSTM(128, input_shape=(sequence_length, features)),
    layers.Dropout(0.2),
    layers.Dense(64, activation='relu'),
    layers.Dense(1)
])
                """
            },
            "nlp_basics": {
                "title": "Natural Language Processing",
                "description": "Pemrosesan bahasa natural dengan deep learning",
                "content": """
                NLP adalah bidang AI untuk memahami bahasa manusia.
                
                Teknik dasar:
                1. Tokenization - memecah teks menjadi token
                2. Embedding - representasi vektor kata
                3. Attention - fokus pada bagian penting
                
                Model populer:
                - BERT
                - GPT
                - Transformer
                """,
                "examples": ["Analisis sentimen", "Chatbot", "Summarization"]
            },
            "evaluation": {
                "title": "Evaluasi Model",
                "description": "Metrik untuk mengukur performa model",
                "content": """
                Metrik klasifikasi:
                - Accuracy: proporsi prediksi benar
                - Precision: presisi prediksi positif
                - Recall: kemampuan mendeteksi positif
                - F1-Score: harmonic mean precision & recall
                
                Metrik regresi:
                - MSE: Mean Squared Error
                - MAE: Mean Absolute Error
                - R²: koefisien determinasi
                """,
                "formulas": {
                    "accuracy": "TP + TN / (TP + TN + FP + FN)",
                    "precision": "TP / (TP + FP)",
                    "recall": "TP / (TP + FN)",
                    "f1": "2 * (precision * recall) / (precision + recall)"
                }
            }
        }
    
    def get_topic(self, topic_id: str) -> Optional[Dict]:
        """Get educational topic by ID"""
        return self.topics.get(topic_id)
    
    def list_topics(self) -> List[Dict]:
        """List all available topics"""
        return [
            {"id": k, "title": v["title"], "description": v["description"]}
            for k, v in self.topics.items()
        ]
    
    def get_learning_path(self, goal: str = "general") -> List[str]:
        """Get recommended learning path"""
        paths = {
            "general": ["neural_networks", "evaluation", "cnn", "rnn_lstm", "nlp_basics"],
            "vision": ["neural_networks", "cnn", "evaluation"],
            "nlp": ["neural_networks", "rnn_lstm", "nlp_basics", "evaluation"],
            "prediction": ["neural_networks", "rnn_lstm", "evaluation"]
        }
        return paths.get(goal, paths["general"])
