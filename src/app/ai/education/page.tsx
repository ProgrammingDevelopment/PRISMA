"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    ArrowLeft, Brain, Layers, MessageSquare, Eye, TrendingUp,
    BarChart3, ChevronRight, BookOpen, Code, Lightbulb
} from 'lucide-react'

export default function AIEducationPage() {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

    const topics = [
        {
            id: 'neural_networks',
            icon: Brain,
            title: 'Neural Networks',
            description: 'Dasar-dasar jaringan saraf tiruan',
            content: `
## Pengenalan Neural Networks

Neural Network adalah model komputasi yang terinspirasi dari otak manusia. Model ini terdiri dari node (neurons) yang saling terhubung dan dapat belajar dari data.

### Komponen Utama
1. **Neurons (Nodes)** - Unit pemrosesan dasar
2. **Weights** - Parameter yang dipelajari selama training
3. **Bias** - Parameter tambahan untuk fleksibilitas
4. **Activation Functions** - Fungsi non-linear (ReLU, Sigmoid, Tanh)

### Arsitektur
- **Input Layer**: Menerima data input
- **Hidden Layers**: Memproses dan mentransformasi data
- **Output Layer**: Menghasilkan prediksi final

### Contoh Aplikasi
- Klasifikasi gambar
- Prediksi harga
- Pengenalan suara
- Analisis sentimen
            `,
            codeExample: `
import tensorflow as tf
from tensorflow import keras

# Model Neural Network sederhana
model = keras.Sequential([
    keras.layers.Dense(128, activation='relu', input_shape=(784,)),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(64, activation='relu'),
    keras.layers.Dense(10, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)
            `
        },
        {
            id: 'cnn',
            icon: Eye,
            title: 'CNN (Computer Vision)',
            description: 'Deep learning untuk pengolahan gambar',
            content: `
## Convolutional Neural Networks (CNN)

CNN adalah arsitektur deep learning yang dirancang khusus untuk memproses data visual seperti gambar.

### Layer Utama
1. **Convolutional Layer** - Mendeteksi fitur dengan filter
2. **Pooling Layer** - Mengurangi dimensi (Max/Average Pooling)
3. **Fully Connected Layer** - Klasifikasi final

### Konsep Penting
- **Convolution**: Operasi sliding filter pada gambar
- **Feature Maps**: Output dari convolution
- **Receptive Field**: Area input yang mempengaruhi output

### Aplikasi di PRISMA
- Klasifikasi gambar dokumentasi kegiatan
- Deteksi objek untuk keamanan CCTV
- Verifikasi foto KTP/dokumen
            `,
            codeExample: `
from tensorflow.keras import layers, models

model = models.Sequential([
    # Convolutional layers
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(128, (3, 3), activation='relu'),
    
    # Dense layers
    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(10, activation='softmax')
])
            `
        },
        {
            id: 'rnn_lstm',
            icon: Layers,
            title: 'RNN & LSTM',
            description: 'Deep learning untuk data sekuensial',
            content: `
## Recurrent Neural Networks & LSTM

RNN adalah arsitektur untuk memproses data berurutan (sequence). LSTM adalah varian RNN yang mengatasi masalah long-term dependencies.

### RNN
- Memiliki "memory" dari input sebelumnya
- Cocok untuk data time series dan teks
- Masalah: Vanishing gradient pada sequence panjang

### LSTM (Long Short-Term Memory)
- Memiliki "gates" untuk mengontrol informasi
- **Forget Gate**: Memutuskan informasi yang akan dilupakan
- **Input Gate**: Memutuskan informasi baru yang disimpan
- **Output Gate**: Menghasilkan output

### Aplikasi di PRISMA
- Prediksi keuangan bulanan/tahunan
- Analisis tren iuran warga
- Generasi teks untuk chatbot
            `,
            codeExample: `
from tensorflow.keras import layers, models

# Model LSTM untuk time series
model = models.Sequential([
    layers.LSTM(128, input_shape=(sequence_length, features), 
                return_sequences=True),
    layers.Dropout(0.2),
    layers.LSTM(64),
    layers.Dropout(0.2),
    layers.Dense(32, activation='relu'),
    layers.Dense(1)  # Output prediksi
])

model.compile(optimizer='adam', loss='mse', metrics=['mae'])
            `
        },
        {
            id: 'nlp',
            icon: MessageSquare,
            title: 'Natural Language Processing',
            description: 'Pemrosesan bahasa natural',
            content: `
## Natural Language Processing (NLP)

NLP adalah bidang AI untuk memahami dan menghasilkan bahasa manusia.

### Teknik Dasar
1. **Tokenization** - Memecah teks menjadi token/kata
2. **Embedding** - Representasi vektor kata (Word2Vec, GloVe)
3. **Attention** - Mekanisme fokus pada bagian penting

### Model Populer
- **BERT**: Bidirectional Encoder Representations
- **GPT**: Generative Pre-trained Transformer
- **Transformer**: Arsitektur attention-based

### Aplikasi di PRISMA
- Analisis sentimen feedback warga
- Klasifikasi pengaduan/permohonan
- Chatbot asisten virtual
- Summarisasi laporan otomatis
            `,
            codeExample: `
from transformers import pipeline

# Sentiment Analysis
sentiment = pipeline("sentiment-analysis", 
                     model="indonesian-nlp/indonesian-roberta-base-sentiment-classifier")

result = sentiment("Pelayanan RT sangat memuaskan!")
# Output: [{'label': 'positive', 'score': 0.95}]

# Summarization
summarizer = pipeline("summarization")
summary = summarizer(long_text, max_length=150)
            `
        },
        {
            id: 'evaluation',
            icon: BarChart3,
            title: 'Evaluasi Model',
            description: 'Metrik untuk mengukur performa',
            content: `
## Evaluasi Model Machine Learning

Evaluasi adalah langkah kritis untuk mengukur kualitas model.

### Metrik Klasifikasi
- **Accuracy**: (TP + TN) / Total
- **Precision**: TP / (TP + FP) - Akurasi prediksi positif
- **Recall**: TP / (TP + FN) - Kemampuan mendeteksi positif
- **F1-Score**: 2 × (Precision × Recall) / (Precision + Recall)
- **ROC AUC**: Area under ROC curve

### Metrik Regresi
- **MSE**: Mean Squared Error
- **RMSE**: Root Mean Squared Error
- **MAE**: Mean Absolute Error
- **R²**: Koefisien determinasi

### Best Practices
1. Gunakan cross-validation (K-Fold)
2. Pisahkan data train/validation/test
3. Monitor overfitting vs underfitting
4. Bandingkan dengan baseline
            `,
            codeExample: `
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)

# Evaluasi klasifikasi
y_true = [1, 0, 1, 1, 0, 1]
y_pred = [1, 0, 0, 1, 0, 1]

print(f"Accuracy: {accuracy_score(y_true, y_pred):.2f}")
print(f"Precision: {precision_score(y_true, y_pred):.2f}")
print(f"Recall: {recall_score(y_true, y_pred):.2f}")
print(f"F1 Score: {f1_score(y_true, y_pred):.2f}")

print(classification_report(y_true, y_pred))
            `
        },
        {
            id: 'clustering',
            icon: TrendingUp,
            title: 'Clustering & Segmentasi',
            description: 'Pengelompokan data tanpa label',
            content: `
## Clustering (Unsupervised Learning)

Clustering mengelompokkan data berdasarkan kesamaan tanpa label.

### Algoritma Populer
1. **K-Means** - Partisi ke K cluster berdasarkan centroid
2. **DBSCAN** - Density-based clustering
3. **Hierarchical** - Dendogram-based clustering

### Dimensionality Reduction
- **PCA** (Principal Component Analysis)
- **t-SNE** (t-Distributed Stochastic Neighbor Embedding)
- **UMAP** (Uniform Manifold Approximation)

### Aplikasi di PRISMA
- Segmentasi warga berdasarkan karakteristik
- Identifikasi kelompok dengan kebutuhan serupa
- Visualisasi data demografis
            `,
            codeExample: `
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt

# K-Means clustering
kmeans = KMeans(n_clusters=4, random_state=42)
clusters = kmeans.fit_predict(X)

# PCA untuk visualisasi
pca = PCA(n_components=2)
X_reduced = pca.fit_transform(X)

plt.scatter(X_reduced[:, 0], X_reduced[:, 1], c=clusters)
plt.title("Segmentasi Warga RT")
plt.show()
            `
        }
    ]

    const selectedTopicData = topics.find(t => t.id === selectedTopic)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/ai">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali ke AI Dashboard
                        </Link>
                    </Button>

                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <BookOpen className="h-8 w-8 text-primary" />
                        Edukasi AI & Deep Learning
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Pelajari dasar-dasar AI dan Machine Learning untuk platform PRISMA
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Topics List */}
                    <div className="space-y-3">
                        <h2 className="font-semibold text-lg mb-4">Topik Pembelajaran</h2>
                        {topics.map((topic) => (
                            <Card
                                key={topic.id}
                                className={`cursor-pointer transition-all ${selectedTopic === topic.id
                                        ? 'ring-2 ring-primary'
                                        : 'hover:shadow-md'
                                    }`}
                                onClick={() => setSelectedTopic(topic.id)}
                            >
                                <CardHeader className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <topic.icon className="h-5 w-5 text-primary" />
                                            <div>
                                                <CardTitle className="text-sm">{topic.title}</CardTitle>
                                                <CardDescription className="text-xs">
                                                    {topic.description}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="md:col-span-2">
                        {selectedTopicData ? (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <selectedTopicData.icon className="h-6 w-6 text-primary" />
                                        <CardTitle>{selectedTopicData.title}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Content */}
                                    <div className="prose dark:prose-invert max-w-none">
                                        <pre className="whitespace-pre-wrap font-sans text-sm">
                                            {selectedTopicData.content}
                                        </pre>
                                    </div>

                                    {/* Code Example */}
                                    <div>
                                        <h3 className="font-semibold flex items-center gap-2 mb-3">
                                            <Code className="h-4 w-4" />
                                            Contoh Kode
                                        </h3>
                                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                                            <code>{selectedTopicData.codeExample.trim()}</code>
                                        </pre>
                                    </div>

                                    {/* Tips */}
                                    <div className="p-4 bg-primary/10 rounded-lg flex items-start gap-3">
                                        <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                                        <div className="text-sm">
                                            <p className="font-medium">Tips Implementasi</p>
                                            <p className="text-muted-foreground">
                                                Mulai dengan model sederhana dan tingkatkan kompleksitas secara bertahap.
                                                Gunakan data yang ada di PRISMA untuk eksperimen.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="h-full flex items-center justify-center">
                                <CardContent className="text-center py-16">
                                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-lg font-medium">Pilih Topik</p>
                                    <p className="text-muted-foreground">
                                        Klik salah satu topik di sebelah kiri untuk mulai belajar
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
