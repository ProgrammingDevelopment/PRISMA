"""
Churn & Activity Prediction - Part 2
Kualifikasi #9
"""
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

try:
    from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, GradientBoostingRegressor
    from sklearn.linear_model import LogisticRegression
    from sklearn.preprocessing import StandardScaler
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
    from sklearn.metrics import mean_absolute_error, r2_score
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


class ChurnPredictor:
    """Prediksi Churn/Keaktifan Warga - Kualifikasi #9"""
    
    def __init__(self, model_type: str = "random_forest"):
        self.model_type = model_type
        self.model = None
        self.scaler = StandardScaler() if SKLEARN_AVAILABLE else None
        self.is_trained = False
        self.feature_importance = None
        
        if SKLEARN_AVAILABLE:
            models = {
                "logistic": LogisticRegression(max_iter=1000, random_state=42),
                "random_forest": RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42),
                "gradient_boosting": GradientBoostingClassifier(n_estimators=100, random_state=42)
            }
            self.model = models.get(model_type, RandomForestClassifier())
    
    def prepare_features(self, warga_data: pd.DataFrame) -> pd.DataFrame:
        df = warga_data.copy()
        features = pd.DataFrame()
        
        if 'tanggal_bergabung' in df.columns:
            df['tanggal_bergabung'] = pd.to_datetime(df['tanggal_bergabung'])
            features['tenure_months'] = ((datetime.now() - df['tanggal_bergabung']).dt.days / 30).astype(int)
        
        if 'total_iuran_dibayar' in df.columns:
            features['total_payments'] = df['total_iuran_dibayar']
        
        if 'tunggakan' in df.columns:
            features['has_arrears'] = (df['tunggakan'] > 0).astype(int)
        
        if 'kehadiran_rapat' in df.columns:
            features['meeting_attendance'] = df['kehadiran_rapat']
        
        if 'partisipasi_kegiatan' in df.columns:
            features['event_participation'] = df['partisipasi_kegiatan']
        
        return features.fillna(0)
    
    def train(self, X: pd.DataFrame, y: pd.Series, test_size: float = 0.2) -> Dict[str, float]:
        X_scaled = self.scaler.fit_transform(X)
        X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=test_size, random_state=42, stratify=y)
        
        self.model.fit(X_train, y_train)
        y_pred = self.model.predict(X_test)
        
        metrics = {
            'accuracy': float(accuracy_score(y_test, y_pred)),
            'precision': float(precision_score(y_test, y_pred, zero_division=0)),
            'recall': float(recall_score(y_test, y_pred, zero_division=0)),
            'f1': float(f1_score(y_test, y_pred, zero_division=0))
        }
        
        if hasattr(self.model, 'feature_importances_'):
            self.feature_importance = dict(zip(X.columns, self.model.feature_importances_))
        
        self.is_trained = True
        return metrics
    
    def predict(self, X: pd.DataFrame) -> Dict[str, Any]:
        X_scaled = self.scaler.transform(X)
        predictions = self.model.predict(X_scaled)
        probabilities = self.model.predict_proba(X_scaled)
        
        results = []
        for i, (pred, proba) in enumerate(zip(predictions, probabilities)):
            risk = "tinggi" if proba[1] > 0.7 else "sedang" if proba[1] > 0.4 else "rendah"
            results.append({
                'index': i, 'prediction': 'tidak_aktif' if pred == 1 else 'aktif',
                'churn_probability': float(proba[1]), 'risk_level': risk
            })
        
        return {'predictions': results, 'at_risk_count': sum(1 for r in results if r['risk_level'] == 'tinggi')}


class ActivityPredictor:
    """Prediksi Aktivitas/Kegiatan RT - Kualifikasi #9"""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler() if SKLEARN_AVAILABLE else None
        self.is_trained = False
        
        if SKLEARN_AVAILABLE:
            self.model = GradientBoostingRegressor(n_estimators=100, random_state=42)
    
    def prepare_event_features(self, event_data: pd.DataFrame) -> pd.DataFrame:
        df = event_data.copy()
        features = pd.DataFrame()
        
        if 'jenis_kegiatan' in df.columns:
            features = pd.get_dummies(df['jenis_kegiatan'], prefix='type')
        
        if 'tanggal' in df.columns:
            df['tanggal'] = pd.to_datetime(df['tanggal'])
            features['month'] = df['tanggal'].dt.month
            features['is_weekend'] = (df['tanggal'].dt.dayofweek >= 5).astype(int)
        
        if 'budget' in df.columns:
            features['budget'] = df['budget']
        
        return features.fillna(0)
    
    def train(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, float]:
        X_scaled = self.scaler.fit_transform(X)
        X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
        
        self.model.fit(X_train, y_train)
        y_pred = self.model.predict(X_test)
        
        self.is_trained = True
        return {'mae': float(mean_absolute_error(y_test, y_pred)), 'r2': float(r2_score(y_test, y_pred))}
    
    def predict_event(self, event_features: pd.DataFrame) -> Dict[str, Any]:
        X_scaled = self.scaler.transform(event_features)
        participation = self.model.predict(X_scaled)
        
        return {
            'predicted_participation_rate': float(np.clip(participation[0], 0, 100)),
            'recommendations': self._get_recommendations(participation[0])
        }
    
    def _get_recommendations(self, participation: float) -> List[str]:
        if participation < 30:
            return ["Tingkatkan promosi via WhatsApp", "Pertimbangkan waktu yang lebih sesuai"]
        elif participation < 50:
            return ["Libatkan lebih banyak pengurus"]
        return ["Prediksi menunjukkan partisipasi baik!"]
