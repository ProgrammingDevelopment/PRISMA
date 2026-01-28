"""
Deep Learning Models - CNN, RNN, LSTM, Transformer
Untuk: Pengembangan model deep learning dan edukasi
"""
import numpy as np
from typing import Optional, List, Dict, Any, Tuple
import logging

logger = logging.getLogger(__name__)

# TensorFlow/Keras imports
try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers, models, optimizers, callbacks
    from tensorflow.keras.preprocessing.sequence import pad_sequences
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    logger.warning("TensorFlow not available")

# PyTorch imports
try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import DataLoader, TensorDataset
    PYTORCH_AVAILABLE = True
except ImportError:
    PYTORCH_AVAILABLE = False
    logger.warning("PyTorch not available")


class BaseModel:
    """Base class for all deep learning models"""
    
    def __init__(self, name: str = "base_model"):
        self.name = name
        self.model = None
        self.history = None
        self.is_trained = False
        self.metrics = {}
    
    def get_metrics(self) -> Dict[str, float]:
        """Return training metrics"""
        return self.metrics
    
    def save(self, path: str):
        """Save model to disk"""
        raise NotImplementedError
    
    def load(self, path: str):
        """Load model from disk"""
        raise NotImplementedError


class CNNModel(BaseModel):
    """
    Convolutional Neural Network untuk:
    - Klasifikasi gambar
    - Feature extraction
    - Computer Vision tasks
    """
    
    def __init__(
        self,
        input_shape: Tuple[int, int, int] = (224, 224, 3),
        num_classes: int = 10,
        architecture: str = "custom",  # custom, resnet, vgg
        name: str = "cnn_model"
    ):
        super().__init__(name)
        self.input_shape = input_shape
        self.num_classes = num_classes
        self.architecture = architecture
        
        if TENSORFLOW_AVAILABLE:
            self.model = self._build_model()
    
    def _build_model(self) -> keras.Model:
        """Build CNN architecture"""
        if self.architecture == "custom":
            return self._build_custom_cnn()
        elif self.architecture == "resnet":
            return self._build_resnet()
        else:
            return self._build_custom_cnn()
    
    def _build_custom_cnn(self) -> keras.Model:
        """Build custom CNN for PRISMA platform"""
        model = keras.Sequential([
            # Block 1
            layers.Conv2D(32, (3, 3), activation='relu', padding='same', 
                         input_shape=self.input_shape),
            layers.BatchNormalization(),
            layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Block 2
            layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Block 3
            layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Dense layers
            layers.Flatten(),
            layers.Dense(512, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            layers.Dense(256, activation='relu'),
            layers.Dropout(0.3),
            layers.Dense(self.num_classes, activation='softmax')
        ], name=self.name)
        
        model.compile(
            optimizer=optimizers.Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        return model
    
    def _build_resnet(self) -> keras.Model:
        """Build ResNet-based model with transfer learning"""
        base_model = keras.applications.ResNet50(
            weights='imagenet',
            include_top=False,
            input_shape=self.input_shape
        )
        base_model.trainable = False
        
        model = keras.Sequential([
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.Dense(256, activation='relu'),
            layers.Dropout(0.5),
            layers.Dense(self.num_classes, activation='softmax')
        ], name=f"{self.name}_resnet")
        
        model.compile(
            optimizer=optimizers.Adam(learning_rate=0.0001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: Optional[np.ndarray] = None,
        y_val: Optional[np.ndarray] = None,
        epochs: int = 10,
        batch_size: int = 32,
        callbacks_list: Optional[List] = None
    ) -> Dict[str, Any]:
        """Train the CNN model"""
        if not TENSORFLOW_AVAILABLE:
            raise RuntimeError("TensorFlow is required for CNN training")
        
        # Default callbacks
        if callbacks_list is None:
            callbacks_list = [
                callbacks.EarlyStopping(
                    monitor='val_loss', patience=5, restore_best_weights=True
                ),
                callbacks.ReduceLROnPlateau(
                    monitor='val_loss', factor=0.5, patience=3
                )
            ]
        
        validation_data = (X_val, y_val) if X_val is not None else None
        
        self.history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_data=validation_data,
            callbacks=callbacks_list,
            verbose=1
        )
        
        self.is_trained = True
        self.metrics = {
            'final_accuracy': float(self.history.history['accuracy'][-1]),
            'final_loss': float(self.history.history['loss'][-1])
        }
        
        if validation_data:
            self.metrics['val_accuracy'] = float(self.history.history['val_accuracy'][-1])
            self.metrics['val_loss'] = float(self.history.history['val_loss'][-1])
        
        return self.metrics
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make predictions"""
        if not self.is_trained and self.model is None:
            raise RuntimeError("Model not trained yet")
        return self.model.predict(X)
    
    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, float]:
        """Evaluate model on test data"""
        results = self.model.evaluate(X_test, y_test, verbose=0)
        return {
            'loss': results[0],
            'accuracy': results[1],
            'precision': results[2] if len(results) > 2 else None,
            'recall': results[3] if len(results) > 3 else None
        }
    
    def save(self, path: str):
        """Save model"""
        self.model.save(path)
        logger.info(f"CNN model saved to {path}")
    
    def load(self, path: str):
        """Load model"""
        self.model = keras.models.load_model(path)
        self.is_trained = True
        logger.info(f"CNN model loaded from {path}")


class RNNModel(BaseModel):
    """
    Recurrent Neural Network untuk:
    - Sequence processing
    - Time series analysis
    - Text processing (basic)
    """
    
    def __init__(
        self,
        input_dim: int,
        sequence_length: int,
        hidden_units: int = 128,
        num_classes: int = 2,
        rnn_type: str = "simple",  # simple, gru
        name: str = "rnn_model"
    ):
        super().__init__(name)
        self.input_dim = input_dim
        self.sequence_length = sequence_length
        self.hidden_units = hidden_units
        self.num_classes = num_classes
        self.rnn_type = rnn_type
        
        if TENSORFLOW_AVAILABLE:
            self.model = self._build_model()
    
    def _build_model(self) -> keras.Model:
        """Build RNN model"""
        model = keras.Sequential(name=self.name)
        
        if self.rnn_type == "simple":
            model.add(layers.SimpleRNN(
                self.hidden_units,
                input_shape=(self.sequence_length, self.input_dim),
                return_sequences=True
            ))
            model.add(layers.Dropout(0.3))
            model.add(layers.SimpleRNN(self.hidden_units // 2))
        else:  # GRU
            model.add(layers.GRU(
                self.hidden_units,
                input_shape=(self.sequence_length, self.input_dim),
                return_sequences=True
            ))
            model.add(layers.Dropout(0.3))
            model.add(layers.GRU(self.hidden_units // 2))
        
        model.add(layers.Dropout(0.3))
        model.add(layers.Dense(64, activation='relu'))
        model.add(layers.Dense(self.num_classes, activation='softmax'))
        
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: Optional[np.ndarray] = None,
        y_val: Optional[np.ndarray] = None,
        epochs: int = 20,
        batch_size: int = 32
    ) -> Dict[str, Any]:
        """Train RNN model"""
        validation_data = (X_val, y_val) if X_val is not None else None
        
        self.history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_data=validation_data,
            callbacks=[
                callbacks.EarlyStopping(patience=5, restore_best_weights=True)
            ],
            verbose=1
        )
        
        self.is_trained = True
        self.metrics = {
            'accuracy': float(self.history.history['accuracy'][-1]),
            'loss': float(self.history.history['loss'][-1])
        }
        
        return self.metrics
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make predictions"""
        return self.model.predict(X)
    
    def save(self, path: str):
        self.model.save(path)
    
    def load(self, path: str):
        self.model = keras.models.load_model(path)
        self.is_trained = True


class LSTMModel(BaseModel):
    """
    Long Short-Term Memory Network untuk:
    - Time series forecasting
    - Financial prediction
    - Sequential data analysis
    """
    
    def __init__(
        self,
        input_dim: int,
        sequence_length: int,
        hidden_units: List[int] = [128, 64],
        output_dim: int = 1,
        task: str = "regression",  # regression, classification
        name: str = "lstm_model"
    ):
        super().__init__(name)
        self.input_dim = input_dim
        self.sequence_length = sequence_length
        self.hidden_units = hidden_units
        self.output_dim = output_dim
        self.task = task
        
        if TENSORFLOW_AVAILABLE:
            self.model = self._build_model()
    
    def _build_model(self) -> keras.Model:
        """Build LSTM model"""
        model = keras.Sequential(name=self.name)
        
        # First LSTM layer
        model.add(layers.LSTM(
            self.hidden_units[0],
            input_shape=(self.sequence_length, self.input_dim),
            return_sequences=len(self.hidden_units) > 1
        ))
        model.add(layers.Dropout(0.2))
        
        # Additional LSTM layers
        for i, units in enumerate(self.hidden_units[1:]):
            return_seq = i < len(self.hidden_units) - 2
            model.add(layers.LSTM(units, return_sequences=return_seq))
            model.add(layers.Dropout(0.2))
        
        # Output layer
        if self.task == "regression":
            model.add(layers.Dense(self.output_dim))
            model.compile(
                optimizer=optimizers.Adam(0.001),
                loss='mse',
                metrics=['mae']
            )
        else:
            model.add(layers.Dense(self.output_dim, activation='softmax'))
            model.compile(
                optimizer='adam',
                loss='categorical_crossentropy',
                metrics=['accuracy']
            )
        
        return model
    
    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: Optional[np.ndarray] = None,
        y_val: Optional[np.ndarray] = None,
        epochs: int = 50,
        batch_size: int = 32
    ) -> Dict[str, Any]:
        """Train LSTM model"""
        validation_data = (X_val, y_val) if X_val is not None else None
        
        self.history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_data=validation_data,
            callbacks=[
                callbacks.EarlyStopping(patience=10, restore_best_weights=True),
                callbacks.ReduceLROnPlateau(factor=0.5, patience=5)
            ],
            verbose=1
        )
        
        self.is_trained = True
        
        if self.task == "regression":
            self.metrics = {
                'mae': float(self.history.history['mae'][-1]),
                'loss': float(self.history.history['loss'][-1])
            }
        else:
            self.metrics = {
                'accuracy': float(self.history.history['accuracy'][-1]),
                'loss': float(self.history.history['loss'][-1])
            }
        
        return self.metrics
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make predictions"""
        return self.model.predict(X)
    
    def forecast(self, X: np.ndarray, steps: int = 1) -> np.ndarray:
        """Forecast future values (for time series)"""
        predictions = []
        current_input = X.copy()
        
        for _ in range(steps):
            pred = self.model.predict(current_input, verbose=0)
            predictions.append(pred[0])
            
            # Shift window and add prediction
            current_input = np.roll(current_input, -1, axis=1)
            current_input[0, -1] = pred[0]
        
        return np.array(predictions)
    
    def save(self, path: str):
        self.model.save(path)
    
    def load(self, path: str):
        self.model = keras.models.load_model(path)
        self.is_trained = True


class TransformerModel(BaseModel):
    """
    Transformer Model untuk:
    - NLP tasks
    - Sequence-to-sequence
    - Attention-based processing
    """
    
    def __init__(
        self,
        vocab_size: int = 30000,
        max_length: int = 512,
        embed_dim: int = 256,
        num_heads: int = 8,
        ff_dim: int = 512,
        num_layers: int = 4,
        num_classes: int = 3,
        name: str = "transformer_model"
    ):
        super().__init__(name)
        self.vocab_size = vocab_size
        self.max_length = max_length
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.ff_dim = ff_dim
        self.num_layers = num_layers
        self.num_classes = num_classes
        
        if TENSORFLOW_AVAILABLE:
            self.model = self._build_model()
    
    def _transformer_encoder(self, inputs):
        """Build transformer encoder block"""
        # Multi-head attention
        attention = layers.MultiHeadAttention(
            num_heads=self.num_heads,
            key_dim=self.embed_dim
        )(inputs, inputs)
        attention = layers.Dropout(0.1)(attention)
        x = layers.LayerNormalization(epsilon=1e-6)(inputs + attention)
        
        # Feed-forward network
        ffn = layers.Dense(self.ff_dim, activation='relu')(x)
        ffn = layers.Dense(self.embed_dim)(ffn)
        ffn = layers.Dropout(0.1)(ffn)
        
        return layers.LayerNormalization(epsilon=1e-6)(x + ffn)
    
    def _build_model(self) -> keras.Model:
        """Build Transformer model"""
        inputs = layers.Input(shape=(self.max_length,))
        
        # Embedding
        x = layers.Embedding(self.vocab_size, self.embed_dim)(inputs)
        
        # Positional encoding (simplified)
        positions = tf.range(start=0, limit=self.max_length, delta=1)
        pos_embedding = layers.Embedding(self.max_length, self.embed_dim)(positions)
        x = x + pos_embedding
        
        # Transformer encoder layers
        for _ in range(self.num_layers):
            x = self._transformer_encoder(x)
        
        # Global pooling and classification
        x = layers.GlobalAveragePooling1D()(x)
        x = layers.Dropout(0.3)(x)
        x = layers.Dense(128, activation='relu')(x)
        x = layers.Dropout(0.2)(x)
        outputs = layers.Dense(self.num_classes, activation='softmax')(x)
        
        model = keras.Model(inputs=inputs, outputs=outputs, name=self.name)
        
        model.compile(
            optimizer=optimizers.Adam(learning_rate=0.0001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: Optional[np.ndarray] = None,
        y_val: Optional[np.ndarray] = None,
        epochs: int = 20,
        batch_size: int = 32
    ) -> Dict[str, Any]:
        """Train Transformer model"""
        validation_data = (X_val, y_val) if X_val is not None else None
        
        self.history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_data=validation_data,
            callbacks=[
                callbacks.EarlyStopping(patience=5, restore_best_weights=True),
                callbacks.ReduceLROnPlateau(factor=0.5, patience=3)
            ],
            verbose=1
        )
        
        self.is_trained = True
        self.metrics = {
            'accuracy': float(self.history.history['accuracy'][-1]),
            'loss': float(self.history.history['loss'][-1])
        }
        
        return self.metrics
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make predictions"""
        return self.model.predict(X)
    
    def save(self, path: str):
        self.model.save(path)
    
    def load(self, path: str):
        self.model = keras.models.load_model(path)
        self.is_trained = True
