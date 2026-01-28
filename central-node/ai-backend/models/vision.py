"""
Computer Vision Models - Image Classification, Object Detection
Untuk: Klasifikasi gambar, deteksi objek keamanan
Kualifikasi #2, #5
"""
import numpy as np
from typing import Optional, List, Dict, Any, Tuple, Union
import logging
from pathlib import Path
import io
import base64

logger = logging.getLogger(__name__)

# TensorFlow/Keras
try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers, models, optimizers
    from tensorflow.keras.preprocessing import image
    from tensorflow.keras.applications import (
        MobileNetV2,
        ResNet50,
        VGG16,
        EfficientNetB0
    )
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    logger.warning("TensorFlow not available for vision")

# PyTorch
try:
    import torch
    import torch.nn as nn
    import torchvision.models as torch_models
    import torchvision.transforms as transforms
    PYTORCH_AVAILABLE = True
except ImportError:
    PYTORCH_AVAILABLE = False
    logger.warning("PyTorch not available for vision")

# OpenCV and PIL
try:
    import cv2
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False


class ImageClassifier:
    """
    Klasifikasi Gambar untuk:
    - Dokumentasi kegiatan RT
    - Klasifikasi jenis surat/dokumen
    - Deteksi anomali visual
    
    Kualifikasi #2, #5
    """
    
    def __init__(
        self,
        num_classes: int = 10,
        input_shape: Tuple[int, int, int] = (224, 224, 3),
        architecture: str = "mobilenet",  # mobilenet, resnet, vgg, efficientnet
        pretrained: bool = True,
        class_names: Optional[List[str]] = None
    ):
        self.num_classes = num_classes
        self.input_shape = input_shape
        self.architecture = architecture
        self.pretrained = pretrained
        self.class_names = class_names or [f"class_{i}" for i in range(num_classes)]
        self.model = None
        self.is_trained = False
        
        if TENSORFLOW_AVAILABLE:
            self.model = self._build_model()
    
    def _build_model(self) -> keras.Model:
        """Build classification model with transfer learning"""
        # Select base model
        base_models = {
            "mobilenet": MobileNetV2,
            "resnet": ResNet50,
            "vgg": VGG16,
            "efficientnet": EfficientNetB0
        }
        
        BaseModelClass = base_models.get(self.architecture, MobileNetV2)
        
        weights = 'imagenet' if self.pretrained else None
        base_model = BaseModelClass(
            weights=weights,
            include_top=False,
            input_shape=self.input_shape
        )
        
        # Freeze base model
        base_model.trainable = False
        
        # Build model
        model = keras.Sequential([
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            layers.Dense(256, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            layers.Dense(self.num_classes, activation='softmax')
        ], name=f"image_classifier_{self.architecture}")
        
        model.compile(
            optimizer=optimizers.Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        return model
    
    def preprocess_image(self, img: Union[np.ndarray, str, bytes]) -> np.ndarray:
        """Preprocess image for model input"""
        if isinstance(img, str):
            # Load from path
            if PIL_AVAILABLE:
                pil_img = Image.open(img)
                pil_img = pil_img.resize(self.input_shape[:2])
                img_array = np.array(pil_img)
            elif OPENCV_AVAILABLE:
                img_array = cv2.imread(img)
                img_array = cv2.resize(img_array, self.input_shape[:2])
                img_array = cv2.cvtColor(img_array, cv2.COLOR_BGR2RGB)
            else:
                raise RuntimeError("Neither PIL nor OpenCV available")
        elif isinstance(img, bytes):
            # Load from bytes
            if PIL_AVAILABLE:
                pil_img = Image.open(io.BytesIO(img))
                pil_img = pil_img.resize(self.input_shape[:2])
                img_array = np.array(pil_img)
            else:
                raise RuntimeError("PIL required for bytes input")
        else:
            img_array = img
        
        # Ensure correct shape
        if len(img_array.shape) == 2:
            img_array = np.stack([img_array] * 3, axis=-1)
        elif img_array.shape[-1] == 4:
            img_array = img_array[:, :, :3]
        
        # Resize if needed
        if img_array.shape[:2] != self.input_shape[:2]:
            if PIL_AVAILABLE:
                pil_img = Image.fromarray(img_array)
                pil_img = pil_img.resize(self.input_shape[:2])
                img_array = np.array(pil_img)
        
        # Normalize
        img_array = img_array.astype(np.float32) / 255.0
        
        return np.expand_dims(img_array, axis=0)
    
    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: Optional[np.ndarray] = None,
        y_val: Optional[np.ndarray] = None,
        epochs: int = 20,
        batch_size: int = 32,
        fine_tune: bool = False,
        fine_tune_at: int = 100
    ) -> Dict[str, Any]:
        """Train the image classifier"""
        if not TENSORFLOW_AVAILABLE:
            raise RuntimeError("TensorFlow required for training")
        
        # Data augmentation
        data_augmentation = keras.Sequential([
            layers.RandomFlip("horizontal"),
            layers.RandomRotation(0.1),
            layers.RandomZoom(0.1),
            layers.RandomContrast(0.1),
        ])
        
        # Callbacks
        callbacks_list = [
            keras.callbacks.EarlyStopping(
                monitor='val_loss', patience=5, restore_best_weights=True
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss', factor=0.5, patience=3
            )
        ]
        
        validation_data = (X_val, y_val) if X_val is not None else None
        
        # Initial training
        history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_data=validation_data,
            callbacks=callbacks_list,
            verbose=1
        )
        
        # Fine-tuning
        if fine_tune:
            # Unfreeze top layers
            base_model = self.model.layers[0]
            base_model.trainable = True
            
            for layer in base_model.layers[:fine_tune_at]:
                layer.trainable = False
            
            self.model.compile(
                optimizer=optimizers.Adam(learning_rate=0.0001),
                loss='categorical_crossentropy',
                metrics=['accuracy']
            )
            
            history = self.model.fit(
                X_train, y_train,
                epochs=epochs // 2,
                batch_size=batch_size,
                validation_data=validation_data,
                callbacks=callbacks_list,
                verbose=1
            )
        
        self.is_trained = True
        
        return {
            'accuracy': float(history.history['accuracy'][-1]),
            'loss': float(history.history['loss'][-1]),
            'val_accuracy': float(history.history.get('val_accuracy', [0])[-1]),
            'val_loss': float(history.history.get('val_loss', [0])[-1])
        }
    
    def predict(self, img: Union[np.ndarray, str, bytes]) -> Dict[str, Any]:
        """Classify single image"""
        if self.model is None:
            raise RuntimeError("Model not initialized")
        
        # Preprocess
        img_array = self.preprocess_image(img)
        
        # Predict
        predictions = self.model.predict(img_array, verbose=0)[0]
        
        # Get top predictions
        top_indices = np.argsort(predictions)[::-1][:5]
        
        results = {
            'predicted_class': self.class_names[top_indices[0]],
            'confidence': float(predictions[top_indices[0]]),
            'top_5': [
                {
                    'class': self.class_names[idx],
                    'confidence': float(predictions[idx])
                }
                for idx in top_indices
            ]
        }
        
        return results
    
    def predict_batch(self, images: List[Union[np.ndarray, str, bytes]]) -> List[Dict[str, Any]]:
        """Classify multiple images"""
        return [self.predict(img) for img in images]
    
    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, float]:
        """Evaluate model performance"""
        results = self.model.evaluate(X_test, y_test, verbose=0)
        metric_names = self.model.metrics_names
        
        return {name: float(val) for name, val in zip(metric_names, results)}
    
    def save(self, path: str):
        """Save model"""
        self.model.save(path)
        logger.info(f"Image classifier saved to {path}")
    
    def load(self, path: str):
        """Load model"""
        self.model = keras.models.load_model(path)
        self.is_trained = True
        logger.info(f"Image classifier loaded from {path}")


class ObjectDetector:
    """
    Deteksi Objek untuk:
    - Keamanan CCTV
    - Deteksi kendaraan
    - Deteksi aktivitas mencurigakan
    
    Kualifikasi #2
    """
    
    def __init__(
        self,
        model_type: str = "yolo",  # yolo, ssd, faster_rcnn
        confidence_threshold: float = 0.5,
        classes: Optional[List[str]] = None
    ):
        self.model_type = model_type
        self.confidence_threshold = confidence_threshold
        self.classes = classes or [
            "person", "car", "motorcycle", "bicycle", "truck",
            "dog", "cat", "bag", "suspicious_object"
        ]
        self.model = None
        
        self._load_model()
    
    def _load_model(self):
        """Load object detection model"""
        if self.model_type == "yolo" and PYTORCH_AVAILABLE:
            try:
                # Try to load YOLOv5 from ultralytics
                self.model = torch.hub.load(
                    'ultralytics/yolov5', 'yolov5s', pretrained=True
                )
                self.model.conf = self.confidence_threshold
                logger.info("Loaded YOLOv5 model")
            except Exception as e:
                logger.warning(f"Failed to load YOLO: {e}")
                self._build_simple_detector()
        else:
            self._build_simple_detector()
    
    def _build_simple_detector(self):
        """Build simple detector using OpenCV DNN"""
        if OPENCV_AVAILABLE:
            # Use OpenCV's built-in face detector as fallback
            self.model = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            )
            self.model_type = "cascade"
            logger.info("Using OpenCV Cascade classifier")
    
    def detect(
        self,
        img: Union[np.ndarray, str, bytes],
        return_image: bool = False
    ) -> Dict[str, Any]:
        """Detect objects in image"""
        # Load image
        if isinstance(img, str):
            if OPENCV_AVAILABLE:
                image_array = cv2.imread(img)
            elif PIL_AVAILABLE:
                pil_img = Image.open(img)
                image_array = np.array(pil_img)
            else:
                raise RuntimeError("Need OpenCV or PIL")
        elif isinstance(img, bytes):
            if PIL_AVAILABLE:
                pil_img = Image.open(io.BytesIO(img))
                image_array = np.array(pil_img)
            else:
                raise RuntimeError("PIL required for bytes input")
        else:
            image_array = img.copy()
        
        detections = []
        
        if self.model_type == "yolo" and self.model is not None:
            # YOLO detection
            results = self.model(image_array)
            
            for detection in results.pred[0]:
                x1, y1, x2, y2, conf, cls = detection.tolist()
                class_name = results.names[int(cls)]
                
                detections.append({
                    'class': class_name,
                    'confidence': float(conf),
                    'bbox': {
                        'x1': int(x1),
                        'y1': int(y1),
                        'x2': int(x2),
                        'y2': int(y2)
                    }
                })
        
        elif self.model_type == "cascade" and self.model is not None:
            # Cascade detection (faces only)
            gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY) if len(image_array.shape) == 3 else image_array
            faces = self.model.detectMultiScale(
                gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
            )
            
            for (x, y, w, h) in faces:
                detections.append({
                    'class': 'person',
                    'confidence': 0.8,
                    'bbox': {
                        'x1': int(x),
                        'y1': int(y),
                        'x2': int(x + w),
                        'y2': int(y + h)
                    }
                })
        
        result = {
            'num_detections': len(detections),
            'detections': detections,
            'image_size': {
                'width': image_array.shape[1],
                'height': image_array.shape[0]
            }
        }
        
        if return_image:
            result['annotated_image'] = self._draw_detections(image_array, detections)
        
        return result
    
    def _draw_detections(
        self,
        image: np.ndarray,
        detections: List[Dict]
    ) -> np.ndarray:
        """Draw bounding boxes on image"""
        if not OPENCV_AVAILABLE:
            return image
        
        annotated = image.copy()
        
        for det in detections:
            bbox = det['bbox']
            label = f"{det['class']}: {det['confidence']:.2f}"
            
            # Draw box
            cv2.rectangle(
                annotated,
                (bbox['x1'], bbox['y1']),
                (bbox['x2'], bbox['y2']),
                (0, 255, 0), 2
            )
            
            # Draw label
            cv2.putText(
                annotated, label,
                (bbox['x1'], bbox['y1'] - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                (0, 255, 0), 2
            )
        
        return annotated
    
    def detect_in_video(
        self,
        video_path: str,
        output_path: Optional[str] = None,
        frame_skip: int = 1
    ) -> Dict[str, Any]:
        """Detect objects in video"""
        if not OPENCV_AVAILABLE:
            raise RuntimeError("OpenCV required for video processing")
        
        cap = cv2.VideoCapture(video_path)
        
        all_detections = []
        frame_count = 0
        
        # Get video properties
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Setup video writer if output specified
        writer = None
        if output_path:
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            
            if frame_count % frame_skip != 0:
                continue
            
            # Detect
            result = self.detect(frame, return_image=output_path is not None)
            result['frame'] = frame_count
            all_detections.append(result)
            
            # Write annotated frame
            if writer and 'annotated_image' in result:
                writer.write(result['annotated_image'])
        
        cap.release()
        if writer:
            writer.release()
        
        return {
            'total_frames': frame_count,
            'analyzed_frames': len(all_detections),
            'detections': all_detections,
            'output_path': output_path
        }


class DocumentScanner:
    """
    Pemindai Dokumen untuk:
    - Scan dan straighten dokumen
    - OCR preparation
    - Document enhancement
    """
    
    def __init__(self):
        self.opencv_available = OPENCV_AVAILABLE
    
    def scan(self, img: Union[np.ndarray, str]) -> Dict[str, Any]:
        """Scan and enhance document image"""
        if not self.opencv_available:
            return {'error': 'OpenCV not available'}
        
        # Load image
        if isinstance(img, str):
            image = cv2.imread(img)
        else:
            image = img.copy()
        
        original = image.copy()
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Edge detection
        edges = cv2.Canny(gray, 50, 150)
        
        # Find contours
        contours, _ = cv2.findContours(
            edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE
        )
        
        # Find document contour (largest 4-sided)
        document_contour = None
        max_area = 0
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > max_area:
                peri = cv2.arcLength(contour, True)
                approx = cv2.approxPolyDP(contour, 0.02 * peri, True)
                if len(approx) == 4:
                    document_contour = approx
                    max_area = area
        
        if document_contour is None:
            # No document found, enhance original
            enhanced = self._enhance_image(gray)
            return {
                'status': 'no_document_detected',
                'enhanced_image': enhanced,
                'original_image': original
            }
        
        # Perspective transform
        warped = self._four_point_transform(original, document_contour.reshape(4, 2))
        
        # Enhance
        enhanced = self._enhance_image(cv2.cvtColor(warped, cv2.COLOR_BGR2GRAY))
        
        return {
            'status': 'success',
            'scanned_image': warped,
            'enhanced_image': enhanced,
            'contour': document_contour.tolist()
        }
    
    def _four_point_transform(
        self,
        image: np.ndarray,
        pts: np.ndarray
    ) -> np.ndarray:
        """Apply perspective transform"""
        rect = self._order_points(pts)
        (tl, tr, br, bl) = rect
        
        # Compute width
        widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
        widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
        maxWidth = max(int(widthA), int(widthB))
        
        # Compute height
        heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
        heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
        maxHeight = max(int(heightA), int(heightB))
        
        dst = np.array([
            [0, 0],
            [maxWidth - 1, 0],
            [maxWidth - 1, maxHeight - 1],
            [0, maxHeight - 1]
        ], dtype="float32")
        
        M = cv2.getPerspectiveTransform(rect, dst)
        warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight))
        
        return warped
    
    def _order_points(self, pts: np.ndarray) -> np.ndarray:
        """Order points: top-left, top-right, bottom-right, bottom-left"""
        rect = np.zeros((4, 2), dtype="float32")
        
        s = pts.sum(axis=1)
        rect[0] = pts[np.argmin(s)]
        rect[2] = pts[np.argmax(s)]
        
        diff = np.diff(pts, axis=1)
        rect[1] = pts[np.argmin(diff)]
        rect[3] = pts[np.argmax(diff)]
        
        return rect
    
    def _enhance_image(self, gray: np.ndarray) -> np.ndarray:
        """Enhance document image"""
        # Adaptive thresholding
        enhanced = cv2.adaptiveThreshold(
            gray, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 11, 2
        )
        
        # Denoise
        enhanced = cv2.fastNlMeansDenoising(enhanced)
        
        return enhanced
