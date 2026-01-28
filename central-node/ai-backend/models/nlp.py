"""
NLP Models - Sentiment, Classification, Chatbot, Summarization, Translation
Untuk: Analisis sentimen, chatbot, summarisasi teks, terjemahan
"""
import numpy as np
from typing import Optional, List, Dict, Any, Union
import logging
import json
import re

logger = logging.getLogger(__name__)

# Hugging Face imports
try:
    from transformers import (
        pipeline,
        AutoModelForSequenceClassification,
        AutoModelForSeq2SeqLM,
        AutoModelForCausalLM,
        AutoTokenizer,
        AutoConfig,
        TrainingArguments,
        Trainer
    )
    from sentence_transformers import SentenceTransformer
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    logger.warning("Hugging Face Transformers not available")

# scikit-learn for traditional ML
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.naive_bayes import MultinomialNB
    from sklearn.svm import SVC
    from sklearn.pipeline import Pipeline
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import classification_report, accuracy_score
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    logger.warning("scikit-learn not available")

# NLTK for text processing
try:
    import nltk
    from nltk.tokenize import word_tokenize
    from nltk.corpus import stopwords
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False


class SentimentAnalyzer:
    """
    Analisis Sentimen Media Sosial dan Feedback Warga
    Kualifikasi #3, #8, #14
    """
    
    def __init__(
        self,
        model_name: str = "indonesian-nlp/indonesian-roberta-base-sentiment-classifier",
        use_hf: bool = True
    ):
        self.model_name = model_name
        self.use_hf = use_hf and TRANSFORMERS_AVAILABLE
        self.labels = ["negatif", "netral", "positif"]
        self.pipeline = None
        self.sklearn_model = None
        
        if self.use_hf:
            self._load_hf_model()
        else:
            self._build_sklearn_model()
    
    def _load_hf_model(self):
        """Load Hugging Face sentiment model"""
        try:
            self.pipeline = pipeline(
                "sentiment-analysis",
                model=self.model_name,
                tokenizer=self.model_name
            )
            logger.info(f"Loaded HF model: {self.model_name}")
        except Exception as e:
            logger.error(f"Failed to load HF model: {e}")
            self.use_hf = False
            self._build_sklearn_model()
    
    def _build_sklearn_model(self):
        """Build fallback sklearn model"""
        if SKLEARN_AVAILABLE:
            self.sklearn_model = Pipeline([
                ('tfidf', TfidfVectorizer(max_features=5000, ngram_range=(1, 2))),
                ('clf', MultinomialNB(alpha=0.1))
            ])
            logger.info("Built sklearn fallback model")
    
    def train(
        self,
        texts: List[str],
        labels: List[str],
        test_size: float = 0.2
    ) -> Dict[str, float]:
        """Train sentiment model (sklearn only)"""
        if not SKLEARN_AVAILABLE:
            raise RuntimeError("scikit-learn required for training")
        
        # Convert labels to indices
        label_to_idx = {l: i for i, l in enumerate(self.labels)}
        y = [label_to_idx.get(l, 1) for l in labels]  # default to netral
        
        X_train, X_test, y_train, y_test = train_test_split(
            texts, y, test_size=test_size, random_state=42
        )
        
        self.sklearn_model.fit(X_train, y_train)
        y_pred = self.sklearn_model.predict(X_test)
        
        accuracy = accuracy_score(y_test, y_pred)
        report = classification_report(y_test, y_pred, output_dict=True)
        
        return {
            'accuracy': accuracy,
            'precision': report['weighted avg']['precision'],
            'recall': report['weighted avg']['recall'],
            'f1': report['weighted avg']['f1-score']
        }
    
    def analyze(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of text"""
        if self.use_hf and self.pipeline:
            result = self.pipeline(text[:512])[0]  # Limit to 512 chars
            return {
                'text': text,
                'sentiment': result['label'],
                'confidence': result['score'],
                'method': 'huggingface'
            }
        elif self.sklearn_model:
            # Fallback to sklearn
            pred = self.sklearn_model.predict([text])[0]
            proba = self.sklearn_model.predict_proba([text])[0]
            return {
                'text': text,
                'sentiment': self.labels[pred],
                'confidence': float(max(proba)),
                'method': 'sklearn'
            }
        else:
            # Simple rule-based fallback
            return self._rule_based_sentiment(text)
    
    def analyze_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        """Analyze multiple texts"""
        return [self.analyze(text) for text in texts]
    
    def _rule_based_sentiment(self, text: str) -> Dict[str, Any]:
        """Simple rule-based sentiment (fallback)"""
        text_lower = text.lower()
        
        positive_words = ['bagus', 'baik', 'senang', 'terima kasih', 'mantap', 
                         'hebat', 'luar biasa', 'puas', 'sukses', 'berhasil']
        negative_words = ['buruk', 'jelek', 'kecewa', 'gagal', 'marah',
                         'tidak puas', 'lambat', 'rusak', 'susah', 'sulit']
        
        pos_count = sum(1 for w in positive_words if w in text_lower)
        neg_count = sum(1 for w in negative_words if w in text_lower)
        
        if pos_count > neg_count:
            sentiment = 'positif'
            confidence = min(0.5 + pos_count * 0.1, 0.9)
        elif neg_count > pos_count:
            sentiment = 'negatif'
            confidence = min(0.5 + neg_count * 0.1, 0.9)
        else:
            sentiment = 'netral'
            confidence = 0.5
        
        return {
            'text': text,
            'sentiment': sentiment,
            'confidence': confidence,
            'method': 'rule_based'
        }


class TextClassifier:
    """
    Klasifikasi Teks untuk dokumen dan pesan warga
    Kualifikasi #5, #16
    """
    
    def __init__(
        self,
        categories: List[str] = None,
        model_type: str = "svm"  # svm, naive_bayes, transformer
    ):
        self.categories = categories or [
            "pengaduan", "permohonan", "informasi", "saran", "lainnya"
        ]
        self.model_type = model_type
        self.model = None
        self.vectorizer = None
        
        if SKLEARN_AVAILABLE and model_type != "transformer":
            self._build_model()
    
    def _build_model(self):
        """Build text classification model"""
        self.vectorizer = TfidfVectorizer(
            max_features=10000,
            ngram_range=(1, 2),
            min_df=2
        )
        
        if self.model_type == "svm":
            self.model = SVC(kernel='linear', probability=True)
        else:
            self.model = MultinomialNB()
    
    def train(
        self,
        texts: List[str],
        labels: List[str],
        test_size: float = 0.2
    ) -> Dict[str, float]:
        """Train classifier"""
        # Convert labels
        label_to_idx = {l: i for i, l in enumerate(self.categories)}
        y = [label_to_idx.get(l, len(self.categories) - 1) for l in labels]
        
        X_train, X_test, y_train, y_test = train_test_split(
            texts, y, test_size=test_size, random_state=42
        )
        
        X_train_vec = self.vectorizer.fit_transform(X_train)
        X_test_vec = self.vectorizer.transform(X_test)
        
        self.model.fit(X_train_vec, y_train)
        y_pred = self.model.predict(X_test_vec)
        
        return {
            'accuracy': accuracy_score(y_test, y_pred),
            'report': classification_report(y_test, y_pred, output_dict=True)
        }
    
    def classify(self, text: str) -> Dict[str, Any]:
        """Classify text"""
        X = self.vectorizer.transform([text])
        pred = self.model.predict(X)[0]
        proba = self.model.predict_proba(X)[0]
        
        return {
            'text': text,
            'category': self.categories[pred],
            'confidence': float(max(proba)),
            'all_scores': {
                self.categories[i]: float(p) 
                for i, p in enumerate(proba)
            }
        }
    
    def classify_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        """Classify multiple texts"""
        return [self.classify(text) for text in texts]


class Chatbot:
    """
    Chatbot Virtual Assistant untuk warga PRISMA
    Kualifikasi #3, #13
    """
    
    def __init__(
        self,
        model_name: str = "cahya/gpt2-small-indonesian-522M",
        use_hf: bool = True
    ):
        self.model_name = model_name
        self.use_hf = use_hf and TRANSFORMERS_AVAILABLE
        self.pipeline = None
        self.conversation_history = []
        self.intents = self._load_intents()
        
        if self.use_hf:
            self._load_model()
    
    def _load_model(self):
        """Load chatbot model"""
        try:
            self.pipeline = pipeline(
                "text-generation",
                model=self.model_name,
                max_new_tokens=100
            )
            logger.info(f"Loaded chatbot model: {self.model_name}")
        except Exception as e:
            logger.warning(f"Failed to load HF model: {e}")
            self.use_hf = False
    
    def _load_intents(self) -> Dict[str, Dict]:
        """Load chatbot intents for PRISMA context"""
        return {
            "greeting": {
                "patterns": ["halo", "hai", "selamat", "pagi", "siang", "sore", "malam"],
                "responses": [
                    "Halo! Selamat datang di PRISMA RT 04. Ada yang bisa saya bantu?",
                    "Hai! Saya asisten virtual PRISMA. Silakan tanyakan apa saja tentang RT 04.",
                    "Selamat datang! Bagaimana saya bisa membantu Anda hari ini?"
                ]
            },
            "iuran": {
                "patterns": ["iuran", "bayar", "pembayaran", "tunggakan", "tagihan"],
                "responses": [
                    "Untuk informasi iuran, silakan kunjungi menu Keuangan > Iuran. Iuran bulanan RT adalah Rp 50.000/bulan.",
                    "Status pembayaran iuran dapat dilihat di halaman Keuangan. Jika ada tunggakan, hubungi bendahara RT."
                ]
            },
            "surat": {
                "patterns": ["surat", "dokumen", "pengantar", "domisili", "keterangan"],
                "responses": [
                    "Untuk pengajuan surat, silakan ke menu Layanan > Surat. Tersedia template surat domisili, keterangan usaha, dan lainnya.",
                    "Pembuatan surat dapat dilakukan online melalui PRISMA. Prosesnya 1-2 hari kerja."
                ]
            },
            "laporan": {
                "patterns": ["laporan", "keuangan", "transparansi", "pengeluaran", "pemasukan"],
                "responses": [
                    "Laporan keuangan RT tersedia di menu Keuangan > Laporan. Semua data transparan dan diupdate setiap bulan.",
                    "Anda dapat melihat detail pemasukan dan pengeluaran RT di halaman Laporan Keuangan."
                ]
            },
            "keamanan": {
                "patterns": ["keamanan", "ronda", "satpam", "aman", "pos"],
                "responses": [
                    "Jadwal ronda dan laporan keamanan dapat dilihat di menu Respons & Keamanan.",
                    "Untuk melaporkan kejadian, gunakan fitur Laporan Keamanan di aplikasi PRISMA."
                ]
            },
            "kegiatan": {
                "patterns": ["kegiatan", "acara", "event", "17 agustus", "kerja bakti"],
                "responses": [
                    "Informasi kegiatan RT akan diumumkan melalui PRISMA dan grup WhatsApp.",
                    "Jadwal kegiatan mendatang dapat dilihat di halaman utama PRISMA."
                ]
            },
            "kontak": {
                "patterns": ["kontak", "hubungi", "ketua", "pengurus", "nomor"],
                "responses": [
                    "Kontak pengurus RT dapat dilihat di menu Tentang Kami. Ketua RT: Bapak Hendra Wijaya.",
                    "Untuk kontak darurat, hubungi Pos Keamanan di nomor yang tertera di halaman Kontak."
                ]
            },
            "fallback": {
                "patterns": [],
                "responses": [
                    "Maaf, saya kurang memahami pertanyaan Anda. Bisa diulangi dengan kata kunci yang lebih spesifik?",
                    "Saya belum bisa menjawab pertanyaan tersebut. Silakan hubungi pengurus RT untuk informasi lebih lanjut.",
                    "Pertanyaan Anda akan saya teruskan ke pengurus RT. Ada yang lain yang bisa saya bantu?"
                ]
            }
        }
    
    def _match_intent(self, text: str) -> str:
        """Match user input to intent"""
        text_lower = text.lower()
        
        for intent, data in self.intents.items():
            if intent == "fallback":
                continue
            for pattern in data["patterns"]:
                if pattern in text_lower:
                    return intent
        
        return "fallback"
    
    def chat(self, user_input: str, use_ai: bool = False) -> Dict[str, Any]:
        """Process user input and generate response"""
        import random
        
        # Store in history
        self.conversation_history.append({
            "role": "user",
            "content": user_input
        })
        
        # Intent matching
        intent = self._match_intent(user_input)
        
        if use_ai and self.use_hf and self.pipeline:
            # Use AI model for response generation
            prompt = f"Pengguna: {user_input}\nAsisten PRISMA RT:"
            response = self.pipeline(prompt, do_sample=True, temperature=0.7)[0]['generated_text']
            response = response.split("Asisten PRISMA RT:")[-1].strip()
            response = response.split("\n")[0]  # Take first line only
        else:
            # Use intent-based response
            responses = self.intents[intent]["responses"]
            response = random.choice(responses)
        
        # Store response
        self.conversation_history.append({
            "role": "assistant",
            "content": response
        })
        
        return {
            "user_input": user_input,
            "response": response,
            "intent": intent,
            "confidence": 0.9 if intent != "fallback" else 0.3
        }
    
    def get_history(self) -> List[Dict[str, str]]:
        """Get conversation history"""
        return self.conversation_history
    
    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []


class Summarizer:
    """
    Summarisasi Teks untuk laporan dan dokumen
    Kualifikasi #15
    """
    
    def __init__(
        self,
        model_name: str = "cahya/t5-base-indonesian-summarization-cased"
    ):
        self.model_name = model_name
        self.pipeline = None
        
        if TRANSFORMERS_AVAILABLE:
            self._load_model()
    
    def _load_model(self):
        """Load summarization model"""
        try:
            self.pipeline = pipeline(
                "summarization",
                model=self.model_name
            )
            logger.info(f"Loaded summarization model: {self.model_name}")
        except Exception as e:
            logger.warning(f"Failed to load model: {e}")
    
    def summarize(
        self,
        text: str,
        max_length: int = 150,
        min_length: int = 30
    ) -> Dict[str, Any]:
        """Summarize text"""
        if self.pipeline:
            try:
                result = self.pipeline(
                    text,
                    max_length=max_length,
                    min_length=min_length,
                    do_sample=False
                )[0]
                return {
                    'original_text': text,
                    'summary': result['summary_text'],
                    'compression_ratio': len(result['summary_text']) / len(text),
                    'method': 'transformer'
                }
            except Exception as e:
                logger.error(f"Summarization error: {e}")
        
        # Fallback: Extractive summarization
        return self._extractive_summarize(text, max_length)
    
    def _extractive_summarize(self, text: str, max_length: int) -> Dict[str, Any]:
        """Simple extractive summarization"""
        sentences = text.replace('!', '.').replace('?', '.').split('.')
        sentences = [s.strip() for s in sentences if s.strip()]
        
        # Take first few sentences
        summary_sentences = []
        current_length = 0
        
        for sent in sentences:
            if current_length + len(sent) > max_length:
                break
            summary_sentences.append(sent)
            current_length += len(sent)
        
        summary = '. '.join(summary_sentences) + '.'
        
        return {
            'original_text': text,
            'summary': summary,
            'compression_ratio': len(summary) / len(text) if text else 0,
            'method': 'extractive'
        }


class Translator:
    """
    Terjemahan Otomatis (ID <-> EN)
    Kualifikasi #15
    """
    
    def __init__(self):
        self.pipelines = {}
        
        if TRANSFORMERS_AVAILABLE:
            self._load_models()
    
    def _load_models(self):
        """Load translation models"""
        try:
            # ID to EN
            self.pipelines['id-en'] = pipeline(
                "translation",
                model="Helsinki-NLP/opus-mt-id-en"
            )
            # EN to ID
            self.pipelines['en-id'] = pipeline(
                "translation",
                model="Helsinki-NLP/opus-mt-en-id"
            )
            logger.info("Loaded translation models")
        except Exception as e:
            logger.warning(f"Failed to load translation models: {e}")
    
    def translate(
        self,
        text: str,
        source_lang: str = "id",
        target_lang: str = "en"
    ) -> Dict[str, Any]:
        """Translate text"""
        direction = f"{source_lang}-{target_lang}"
        
        if direction in self.pipelines:
            try:
                result = self.pipelines[direction](text)[0]
                return {
                    'original_text': text,
                    'translated_text': result['translation_text'],
                    'source_lang': source_lang,
                    'target_lang': target_lang,
                    'method': 'transformer'
                }
            except Exception as e:
                logger.error(f"Translation error: {e}")
        
        return {
            'original_text': text,
            'translated_text': text,  # Return original if can't translate
            'source_lang': source_lang,
            'target_lang': target_lang,
            'method': 'failed',
            'error': 'Translation not available'
        }
    
    def detect_language(self, text: str) -> str:
        """Simple language detection"""
        # Check for common Indonesian words
        id_words = ['dan', 'yang', 'untuk', 'dengan', 'adalah', 'dari', 'ini', 'itu']
        en_words = ['and', 'the', 'for', 'with', 'is', 'from', 'this', 'that']
        
        text_lower = text.lower()
        id_count = sum(1 for w in id_words if f' {w} ' in f' {text_lower} ')
        en_count = sum(1 for w in en_words if f' {w} ' in f' {text_lower} ')
        
        return 'id' if id_count >= en_count else 'en'
