"""
Recommendation System
Untuk: Rekomendasi kegiatan dan layanan untuk warga
Kualifikasi #6
"""
import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Any
import logging
from collections import defaultdict

logger = logging.getLogger(__name__)

try:
    from sklearn.metrics.pairwise import cosine_similarity
    from sklearn.preprocessing import StandardScaler
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


class RecommendationEngine:
    """Sistem Rekomendasi Kegiatan Warga - Kualifikasi #6"""
    
    def __init__(self, method: str = "collaborative"):
        """
        Args:
            method: collaborative, content_based, hybrid
        """
        self.method = method
        self.user_item_matrix = None
        self.item_features = None
        self.user_similarity = None
        self.item_similarity = None
        self.items = []
        self.users = []
    
    def fit(self, interactions: pd.DataFrame, item_features: Optional[pd.DataFrame] = None):
        """
        Train recommendation model
        
        Args:
            interactions: DataFrame with columns [user_id, item_id, rating/interaction]
            item_features: Optional DataFrame with item features for content-based
        """
        # Create user-item matrix
        self.users = interactions['user_id'].unique().tolist()
        self.items = interactions['item_id'].unique().tolist()
        
        self.user_item_matrix = pd.pivot_table(
            interactions,
            values='rating',
            index='user_id',
            columns='item_id',
            fill_value=0
        )
        
        # Calculate similarities
        if self.method in ['collaborative', 'hybrid']:
            # User-user similarity
            self.user_similarity = cosine_similarity(self.user_item_matrix.values)
            self.user_similarity = pd.DataFrame(
                self.user_similarity,
                index=self.user_item_matrix.index,
                columns=self.user_item_matrix.index
            )
        
        if self.method in ['content_based', 'hybrid'] and item_features is not None:
            self.item_features = item_features
            # Item-item similarity based on features
            feature_matrix = item_features.select_dtypes(include=[np.number]).fillna(0)
            if SKLEARN_AVAILABLE:
                scaler = StandardScaler()
                feature_scaled = scaler.fit_transform(feature_matrix)
                self.item_similarity = cosine_similarity(feature_scaled)
                self.item_similarity = pd.DataFrame(
                    self.item_similarity,
                    index=item_features.index,
                    columns=item_features.index
                )
        
        logger.info(f"Trained {self.method} recommender with {len(self.users)} users and {len(self.items)} items")
    
    def recommend(self, user_id: str, n_recommendations: int = 5, exclude_interacted: bool = True) -> List[Dict[str, Any]]:
        """Generate recommendations for a user"""
        if self.user_item_matrix is None:
            raise RuntimeError("Model not trained. Call fit() first.")
        
        if user_id not in self.user_item_matrix.index:
            # Cold start: return popular items
            return self._popular_recommendations(n_recommendations)
        
        if self.method == 'collaborative':
            scores = self._collaborative_scores(user_id)
        elif self.method == 'content_based':
            scores = self._content_based_scores(user_id)
        else:  # hybrid
            collab_scores = self._collaborative_scores(user_id)
            content_scores = self._content_based_scores(user_id)
            scores = 0.6 * collab_scores + 0.4 * content_scores
        
        # Exclude already interacted items
        if exclude_interacted:
            interacted = self.user_item_matrix.loc[user_id]
            interacted_items = interacted[interacted > 0].index.tolist()
            scores = scores.drop(labels=[i for i in interacted_items if i in scores.index], errors='ignore')
        
        # Get top recommendations
        top_items = scores.nlargest(n_recommendations)
        
        recommendations = []
        for item_id, score in top_items.items():
            rec = {
                'item_id': item_id,
                'score': float(score),
                'confidence': 'high' if score > 0.7 else 'medium' if score > 0.4 else 'low'
            }
            
            # Add item details if available
            if self.item_features is not None and item_id in self.item_features.index:
                rec['details'] = self.item_features.loc[item_id].to_dict()
            
            recommendations.append(rec)
        
        return recommendations
    
    def _collaborative_scores(self, user_id: str) -> pd.Series:
        """Calculate collaborative filtering scores"""
        user_sim = self.user_similarity.loc[user_id].drop(user_id)
        
        # Weighted average of similar users' ratings
        weighted_scores = defaultdict(float)
        sim_sum = defaultdict(float)
        
        for other_user, similarity in user_sim.items():
            if similarity <= 0:
                continue
            
            for item_id, rating in self.user_item_matrix.loc[other_user].items():
                if rating > 0:
                    weighted_scores[item_id] += similarity * rating
                    sim_sum[item_id] += similarity
        
        # Normalize scores
        scores = {}
        for item_id in weighted_scores:
            if sim_sum[item_id] > 0:
                scores[item_id] = weighted_scores[item_id] / sim_sum[item_id]
        
        return pd.Series(scores)
    
    def _content_based_scores(self, user_id: str) -> pd.Series:
        """Calculate content-based scores"""
        if self.item_similarity is None:
            return pd.Series(dtype=float)
        
        user_ratings = self.user_item_matrix.loc[user_id]
        liked_items = user_ratings[user_ratings > 0].index.tolist()
        
        if not liked_items:
            return pd.Series(dtype=float)
        
        # Average similarity to liked items
        scores = {}
        for item_id in self.item_similarity.columns:
            if item_id in liked_items:
                continue
            
            similarities = self.item_similarity.loc[liked_items, item_id]
            scores[item_id] = similarities.mean()
        
        return pd.Series(scores)
    
    def _popular_recommendations(self, n: int) -> List[Dict[str, Any]]:
        """Return popular items for cold start"""
        item_popularity = self.user_item_matrix.sum().sort_values(ascending=False)
        
        recommendations = []
        for item_id, count in item_popularity.head(n).items():
            recommendations.append({
                'item_id': item_id,
                'score': float(count / item_popularity.max()),
                'confidence': 'low',
                'reason': 'popular'
            })
        
        return recommendations
    
    def get_similar_items(self, item_id: str, n: int = 5) -> List[Dict[str, Any]]:
        """Get similar items (for "You might also like")"""
        if self.item_similarity is None:
            return []
        
        if item_id not in self.item_similarity.columns:
            return []
        
        similarities = self.item_similarity[item_id].drop(item_id).nlargest(n)
        
        return [
            {'item_id': i, 'similarity': float(s)}
            for i, s in similarities.items()
        ]


class ActivityRecommender(RecommendationEngine):
    """Rekomendasi Kegiatan RT"""
    
    def __init__(self):
        super().__init__(method='hybrid')
        self.activity_types = [
            "kerja_bakti", "rapat_warga", "pengajian", "arisan",
            "olahraga", "lomba", "pelatihan", "sosial"
        ]
    
    def prepare_data(self, participation_history: pd.DataFrame, activities: pd.DataFrame):
        """Prepare data from PRISMA database format"""
        # Convert participation to interactions format
        interactions = participation_history[['warga_id', 'kegiatan_id', 'hadir']].copy()
        interactions.columns = ['user_id', 'item_id', 'rating']
        interactions['rating'] = interactions['rating'].astype(float) * 5  # Convert to 0-5 scale
        
        # Prepare activity features
        activity_features = activities.set_index('kegiatan_id')
        
        self.fit(interactions, activity_features)
    
    def recommend_activities(self, warga_id: str, n: int = 5) -> List[Dict[str, Any]]:
        """Recommend activities for a citizen"""
        recommendations = self.recommend(warga_id, n_recommendations=n)
        
        # Add Indonesian descriptions
        for rec in recommendations:
            rec['recommendation_reason'] = self._get_reason(rec['confidence'])
        
        return recommendations
    
    def _get_reason(self, confidence: str) -> str:
        reasons = {
            'high': "Sangat sesuai dengan minat Anda",
            'medium': "Mungkin Anda tertarik",
            'low': "Kegiatan populer di RT"
        }
        return reasons.get(confidence, "Rekomendasi umum")
