"""
Model Evaluation Utilities
Untuk: Evaluasi model dengan metrik akurasi, presisi, recall
Kualifikasi #12
"""
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Union
import logging
from dataclasses import dataclass
from datetime import datetime

logger = logging.getLogger(__name__)

try:
    from sklearn.metrics import (
        accuracy_score, precision_score, recall_score, f1_score,
        confusion_matrix, classification_report, roc_auc_score, roc_curve,
        mean_squared_error, mean_absolute_error, r2_score,
        silhouette_score
    )
    from sklearn.model_selection import cross_val_score, KFold
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


@dataclass
class EvaluationResult:
    """Container for evaluation results"""
    model_name: str
    task_type: str  # classification, regression, clustering
    metrics: Dict[str, float]
    timestamp: str
    additional_info: Optional[Dict] = None


class ModelEvaluator:
    """Komprehensif Model Evaluator - Kualifikasi #12"""
    
    def __init__(self):
        self.evaluation_history: List[EvaluationResult] = []
    
    def evaluate_classification(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        y_proba: Optional[np.ndarray] = None,
        model_name: str = "model",
        labels: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Evaluate classification model"""
        if not SKLEARN_AVAILABLE:
            raise RuntimeError("scikit-learn required")
        
        metrics = {
            'accuracy': float(accuracy_score(y_true, y_pred)),
            'precision_macro': float(precision_score(y_true, y_pred, average='macro', zero_division=0)),
            'precision_weighted': float(precision_score(y_true, y_pred, average='weighted', zero_division=0)),
            'recall_macro': float(recall_score(y_true, y_pred, average='macro', zero_division=0)),
            'recall_weighted': float(recall_score(y_true, y_pred, average='weighted', zero_division=0)),
            'f1_macro': float(f1_score(y_true, y_pred, average='macro', zero_division=0)),
            'f1_weighted': float(f1_score(y_true, y_pred, average='weighted', zero_division=0))
        }
        
        # ROC AUC if probabilities provided
        if y_proba is not None:
            try:
                if len(np.unique(y_true)) == 2:
                    metrics['roc_auc'] = float(roc_auc_score(y_true, y_proba[:, 1] if len(y_proba.shape) > 1 else y_proba))
                else:
                    metrics['roc_auc'] = float(roc_auc_score(y_true, y_proba, multi_class='ovr', average='weighted'))
            except Exception as e:
                logger.warning(f"Could not calculate ROC AUC: {e}")
        
        # Confusion matrix
        cm = confusion_matrix(y_true, y_pred)
        metrics['confusion_matrix'] = cm.tolist()
        
        # Per-class metrics
        report = classification_report(y_true, y_pred, output_dict=True, zero_division=0)
        metrics['per_class'] = {
            str(k): v for k, v in report.items() 
            if k not in ['accuracy', 'macro avg', 'weighted avg']
        }
        
        # Store result
        result = EvaluationResult(
            model_name=model_name,
            task_type='classification',
            metrics=metrics,
            timestamp=datetime.now().isoformat()
        )
        self.evaluation_history.append(result)
        
        return metrics
    
    def evaluate_regression(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        model_name: str = "model"
    ) -> Dict[str, float]:
        """Evaluate regression model"""
        if not SKLEARN_AVAILABLE:
            raise RuntimeError("scikit-learn required")
        
        metrics = {
            'mse': float(mean_squared_error(y_true, y_pred)),
            'rmse': float(np.sqrt(mean_squared_error(y_true, y_pred))),
            'mae': float(mean_absolute_error(y_true, y_pred)),
            'r2': float(r2_score(y_true, y_pred)),
            'mape': float(np.mean(np.abs((y_true - y_pred) / (y_true + 1e-8))) * 100)
        }
        
        # Additional metrics
        metrics['max_error'] = float(np.max(np.abs(y_true - y_pred)))
        metrics['median_error'] = float(np.median(np.abs(y_true - y_pred)))
        
        result = EvaluationResult(
            model_name=model_name,
            task_type='regression',
            metrics=metrics,
            timestamp=datetime.now().isoformat()
        )
        self.evaluation_history.append(result)
        
        return metrics
    
    def cross_validate(
        self,
        model,
        X: np.ndarray,
        y: np.ndarray,
        cv: int = 5,
        scoring: str = 'accuracy'
    ) -> Dict[str, Any]:
        """Perform cross-validation"""
        if not SKLEARN_AVAILABLE:
            raise RuntimeError("scikit-learn required")
        
        scores = cross_val_score(model, X, y, cv=cv, scoring=scoring)
        
        return {
            'mean_score': float(np.mean(scores)),
            'std_score': float(np.std(scores)),
            'scores': scores.tolist(),
            'cv_folds': cv,
            'scoring': scoring
        }
    
    def compare_models(
        self,
        models: Dict[str, Any],
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_test: np.ndarray,
        y_test: np.ndarray,
        task: str = 'classification'
    ) -> pd.DataFrame:
        """Compare multiple models"""
        results = []
        
        for name, model in models.items():
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            
            if task == 'classification':
                metrics = self.evaluate_classification(y_test, y_pred, model_name=name)
            else:
                metrics = self.evaluate_regression(y_test, y_pred, model_name=name)
            
            metrics['model'] = name
            results.append(metrics)
        
        df = pd.DataFrame(results)
        return df.set_index('model')
    
    def get_evaluation_summary(self) -> Dict[str, Any]:
        """Get summary of all evaluations"""
        if not self.evaluation_history:
            return {'message': 'No evaluations performed yet'}
        
        summary = {
            'total_evaluations': len(self.evaluation_history),
            'models': {},
            'best_classification': None,
            'best_regression': None
        }
        
        for result in self.evaluation_history:
            if result.model_name not in summary['models']:
                summary['models'][result.model_name] = []
            summary['models'][result.model_name].append({
                'task': result.task_type,
                'timestamp': result.timestamp,
                'key_metrics': {
                    k: v for k, v in result.metrics.items()
                    if isinstance(v, (int, float))
                }
            })
        
        # Find best models
        classif_results = [r for r in self.evaluation_history if r.task_type == 'classification']
        if classif_results:
            best = max(classif_results, key=lambda x: x.metrics.get('f1_weighted', 0))
            summary['best_classification'] = {
                'model': best.model_name,
                'f1_score': best.metrics.get('f1_weighted', 0)
            }
        
        regr_results = [r for r in self.evaluation_history if r.task_type == 'regression']
        if regr_results:
            best = min(regr_results, key=lambda x: x.metrics.get('rmse', float('inf')))
            summary['best_regression'] = {
                'model': best.model_name,
                'rmse': best.metrics.get('rmse', 0)
            }
        
        return summary


def format_evaluation_report(metrics: Dict[str, Any], task: str = 'classification') -> str:
    """Format evaluation metrics as readable report"""
    lines = ["=" * 50, "MODEL EVALUATION REPORT", "=" * 50, ""]
    
    if task == 'classification':
        lines.append(f"Accuracy:  {metrics.get('accuracy', 0):.4f}")
        lines.append(f"Precision: {metrics.get('precision_weighted', 0):.4f} (weighted)")
        lines.append(f"Recall:    {metrics.get('recall_weighted', 0):.4f} (weighted)")
        lines.append(f"F1 Score:  {metrics.get('f1_weighted', 0):.4f} (weighted)")
        if 'roc_auc' in metrics:
            lines.append(f"ROC AUC:   {metrics['roc_auc']:.4f}")
    else:
        lines.append(f"RMSE: {metrics.get('rmse', 0):.4f}")
        lines.append(f"MAE:  {metrics.get('mae', 0):.4f}")
        lines.append(f"R²:   {metrics.get('r2', 0):.4f}")
        lines.append(f"MAPE: {metrics.get('mape', 0):.2f}%")
    
    lines.extend(["", "=" * 50])
    return "\n".join(lines)
