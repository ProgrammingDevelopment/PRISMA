"""
Clustering & Segmentation Models
Untuk: Segmentasi warga, dimensionality reduction
Kualifikasi #10, #11
"""
import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Any
import logging

logger = logging.getLogger(__name__)

try:
    from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
    from sklearn.decomposition import PCA
    from sklearn.manifold import TSNE
    from sklearn.preprocessing import StandardScaler
    from sklearn.metrics import silhouette_score, calinski_harabasz_score
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


class CitizenSegmentation:
    """Segmentasi Warga RT - Kualifikasi #10"""
    
    def __init__(self, n_clusters: int = 4, method: str = "kmeans"):
        self.n_clusters = n_clusters
        self.method = method
        self.model = None
        self.scaler = StandardScaler() if SKLEARN_AVAILABLE else None
        self.cluster_labels = None
        self.cluster_profiles = None
        
        if SKLEARN_AVAILABLE:
            self._build_model()
    
    def _build_model(self):
        models = {
            "kmeans": KMeans(n_clusters=self.n_clusters, random_state=42, n_init=10),
            "dbscan": DBSCAN(eps=0.5, min_samples=5),
            "hierarchical": AgglomerativeClustering(n_clusters=self.n_clusters)
        }
        self.model = models.get(self.method, KMeans(n_clusters=self.n_clusters))
    
    def fit(self, X: pd.DataFrame) -> Dict[str, Any]:
        X_scaled = self.scaler.fit_transform(X)
        self.cluster_labels = self.model.fit_predict(X_scaled)
        
        silhouette = silhouette_score(X_scaled, self.cluster_labels) if len(set(self.cluster_labels)) > 1 else 0
        calinski = calinski_harabasz_score(X_scaled, self.cluster_labels) if len(set(self.cluster_labels)) > 1 else 0
        
        self.cluster_profiles = self._create_profiles(X, self.cluster_labels)
        
        return {
            'n_clusters': len(set(self.cluster_labels)) - (1 if -1 in self.cluster_labels else 0),
            'silhouette_score': float(silhouette),
            'calinski_harabasz_score': float(calinski),
            'cluster_sizes': pd.Series(self.cluster_labels).value_counts().to_dict()
        }
    
    def _create_profiles(self, X: pd.DataFrame, labels: np.ndarray) -> Dict[int, Dict]:
        df = X.copy()
        df['cluster'] = labels
        
        profiles = {}
        for cluster_id in sorted(df['cluster'].unique()):
            if cluster_id == -1:
                continue
            cluster_data = df[df['cluster'] == cluster_id]
            profiles[int(cluster_id)] = {
                'size': len(cluster_data),
                'percentage': len(cluster_data) / len(df) * 100,
                'characteristics': cluster_data.drop('cluster', axis=1).mean().to_dict()
            }
        return profiles
    
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        X_scaled = self.scaler.transform(X)
        if hasattr(self.model, 'predict'):
            return self.model.predict(X_scaled)
        return self.model.fit_predict(X_scaled)
    
    def get_segment_names(self) -> Dict[int, str]:
        """Generate descriptive segment names"""
        names = {
            0: "Warga Aktif & Partisipatif",
            1: "Warga Baru",
            2: "Warga Senior",
            3: "Warga Pasif"
        }
        return {k: names.get(k, f"Segmen {k}") for k in range(self.n_clusters)}


class DimensionalityReducer:
    """Dimensionality Reduction - Kualifikasi #11"""
    
    def __init__(self, method: str = "pca", n_components: int = 2):
        self.method = method
        self.n_components = n_components
        self.model = None
        self.scaler = StandardScaler() if SKLEARN_AVAILABLE else None
        self.explained_variance = None
        
        if SKLEARN_AVAILABLE:
            self._build_model()
    
    def _build_model(self):
        if self.method == "pca":
            self.model = PCA(n_components=self.n_components)
        elif self.method == "tsne":
            self.model = TSNE(n_components=self.n_components, random_state=42, perplexity=30)
    
    def fit_transform(self, X: pd.DataFrame) -> Dict[str, Any]:
        X_scaled = self.scaler.fit_transform(X)
        X_reduced = self.model.fit_transform(X_scaled)
        
        result = {
            'reduced_data': X_reduced.tolist(),
            'n_components': self.n_components,
            'method': self.method
        }
        
        if self.method == "pca":
            self.explained_variance = self.model.explained_variance_ratio_
            result['explained_variance'] = self.explained_variance.tolist()
            result['total_variance_explained'] = float(sum(self.explained_variance))
            result['component_importance'] = self._get_component_importance(X.columns)
        
        return result
    
    def _get_component_importance(self, feature_names: List[str]) -> Dict[str, List]:
        importance = {}
        for i, comp in enumerate(self.model.components_):
            sorted_idx = np.argsort(np.abs(comp))[::-1]
            importance[f'PC{i+1}'] = [
                {'feature': feature_names[idx], 'loading': float(comp[idx])}
                for idx in sorted_idx[:5]
            ]
        return importance
    
    def transform(self, X: pd.DataFrame) -> np.ndarray:
        X_scaled = self.scaler.transform(X)
        return self.model.transform(X_scaled) if self.method == "pca" else self.model.fit_transform(X_scaled)
