
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import SVC
from sklearn.pipeline import make_pipeline
from sklearn.base import BaseEstimator, TransformerMixin

# Sample Training Data (Indonesian Context for RT Config)
TRAINING_DATA = [
    # Label: admin (Surat, KTP, KK)
    ("cara bikin surat pengantar", "admin"),
    ("buat ktp baru", "admin"),
    ("perpanjang kk", "admin"),
    ("urus surat pindah", "admin"),
    ("minta surat domisili", "admin"),
    ("tanda tangan pak rt", "admin"),
    ("syarat pembuatan ktp", "admin"),
    
    # Label: finance (Iuran, Uang, Kas)
    ("bayar iuran bulanan", "finance"),
    ("cek tagihan sampah", "finance"),
    ("uang kas rt berapa", "finance"),
    ("rekening bendahara", "finance"),
    ("laporan keuangan", "finance"),
    ("transfer iuran kemana", "finance"),
    ("biaya keamanan", "finance"),

    # Label: report (Lapor, Darurat, Masalah)
    ("lapor lampu mati", "report"),
    ("ada maling di blok a", "report"),
    ("sampah numpuk di depan rumah", "report"),
    ("saluran air mampet", "report"),
    ("ada orang mencurigakan", "report"),
    ("pos kamling kosong", "report"),
    ("kebakaran", "report"),

    # Label: contact (Hubungi, WA, Telp)
    ("hubungi pak rt", "contact"),
    ("nomor wa ketua rt", "contact"),
    ("alamat sekretariat dimana", "contact"),
    ("minta nomor hp pengurus", "contact"),
    ("mau ketemu pak rt", "contact"),

    # Label: chat (General)
    ("halo", "chat"),
    ("selamat pagi", "chat"),
    ("siapa kamu", "chat"),
    ("terima kasih", "chat"),
    ("ok makasih", "chat"),
    ("malam", "chat"),
    ("pagi", "chat"),
]

class HybridClassifier:
    """
    A Hybrid Classifier combining Naive Bayes and SVM.
    Uses Naive Bayes for probabilistic baseline and SVM for decision margin.
    """
    def __init__(self):
        self.nb_model = make_pipeline(CountVectorizer(), MultinomialNB())
        self.svm_model = make_pipeline(CountVectorizer(), SVC(kernel='linear', probability=True))
        self.is_trained = False

    def train(self):
        try:
            texts = [x[0] for x in TRAINING_DATA]
            labels = [x[1] for x in TRAINING_DATA]
            
            print("Training Naive Bayes Model...")
            self.nb_model.fit(texts, labels)
            
            print("Training SVM Model...")
            self.svm_model.fit(texts, labels)
            
            self.is_trained = True
            print("ML Models Trained Successfully.")
        except Exception as e:
            print(f"Error training models: {e}")

    def predict(self, text):
        if not self.is_trained:
            return "chat"
        
        # We can use an ensemble vote or one over the other.
        # SVM is generally more robust for this text classification.
        # But let's look at probabilities if we want to be fancy.
        try:
            svm_pred = self.svm_model.predict([text])[0]
            # nb_pred = self.nb_model.predict([text])[0] # Optional: Compare
            
            # Simple logic: Return SVM prediction
            return svm_pred
        except:
            return "chat"

# Initialize a global instance
ml_classifier = HybridClassifier()
