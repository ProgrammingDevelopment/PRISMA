"""
Predictive Analytics Models - Part 1
Financial Predictor untuk prediksi keuangan RT
Kualifikasi #4, #8
"""
import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

try:
    from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
    from sklearn.linear_model import LinearRegression, Ridge
    from sklearn.preprocessing import StandardScaler
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


class FinancialPredictor:
    """Prediksi Keuangan RT - Kualifikasi #4, #8"""
    
    def __init__(self, model_type: str = "gradient_boosting", forecast_horizon: int = 12):
        self.model_type = model_type
        self.forecast_horizon = forecast_horizon
        self.model = None
        self.scaler = StandardScaler() if SKLEARN_AVAILABLE else None
        self.is_trained = False
        self.metrics = {}
        
        if SKLEARN_AVAILABLE:
            self._build_model()
    
    def _build_model(self):
        models = {
            "linear": LinearRegression(),
            "ridge": Ridge(alpha=1.0),
            "random_forest": RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42),
            "gradient_boosting": GradientBoostingRegressor(n_estimators=100, max_depth=5, random_state=42)
        }
        self.model = models.get(self.model_type, LinearRegression())
    
    def prepare_time_series(self, data: pd.DataFrame, target_col: str, date_col: str, lags: int = 6):
        df = data.copy()
        df[date_col] = pd.to_datetime(df[date_col])
        df = df.sort_values(date_col)
        
        for i in range(1, lags + 1):
            df[f'lag_{i}'] = df[target_col].shift(i)
        
        df['month'] = df[date_col].dt.month
        df['rolling_mean'] = df[target_col].rolling(window=3).mean()
        df = df.dropna()
        
        feature_cols = [f'lag_{i}' for i in range(1, lags + 1)] + ['month', 'rolling_mean']
        return df[feature_cols].values, df[target_col].values
    
    def train(self, X: np.ndarray, y: np.ndarray, test_size: float = 0.2) -> Dict[str, float]:
        X_scaled = self.scaler.fit_transform(X)
        X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=test_size, shuffle=False)
        
        self.model.fit(X_train, y_train)
        y_pred = self.model.predict(X_test)
        
        self.metrics = {
            'rmse': float(np.sqrt(mean_squared_error(y_test, y_pred))),
            'mae': float(mean_absolute_error(y_test, y_pred)),
            'r2': float(r2_score(y_test, y_pred))
        }
        self.is_trained = True
        return self.metrics
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict(self.scaler.transform(X))
    
    def forecast(self, historical_data: np.ndarray, periods: int = None) -> Dict[str, Any]:
        periods = periods or self.forecast_horizon
        forecasts = []
        current = historical_data.copy()
        
        for _ in range(periods):
            pred = self.predict(current[-1:].reshape(1, -1))[0]
            forecasts.append(pred)
            new_row = np.roll(current[-1], -1)
            new_row[-1] = pred
            current = np.vstack([current, new_row])
        
        return {'forecasts': forecasts, 'periods': periods}
