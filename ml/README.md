# 🌿 Plant Leaf Disease ML Training & Deployment Guide

This document provides the **exact specifications, dataset sources, architecture design, hyperparameters, and deployment pipelines** for training the deep learning model used in the Agro Disease Diagnosis System.

---

## 1. Dataset Specifications

### Recommended Dataset: **PlantVillage Dataset**
- **Source**: [PlantVillage on Kaggle](https://www.kaggle.com/datasets/emmarex/plantdisease) or [SpMohanty/PlantVillage-Dataset](https://github.com/spMohanty/PlantVillage-Dataset)
- **Total Images**: **54,303 healthy and infected leaf photos**
- **Number of Classes**: **38 crop-disease pairs** across 14 crop species:
  - Tomato (9 diseases + healthy: Early Blight, Late Blight, Leaf Mold, Septoria, Spider Mites, Target Spot, Yellow Leaf Curl, Mosaic Virus, Bacterial Spot)
  - Potato (Early Blight, Late Blight, Healthy)
  - Corn / Maize (Common Rust, Gray Leaf Spot, Northern Leaf Blight, Healthy)
  - Grape (Black Rot, Esca, Leaf Blight, Healthy)
  - Apple (Scab, Black Rot, Cedar Apple Rust, Healthy)
  - Rice, Chilli, Cotton, Groundnut, Cucumber

### Dataset Directory Layout
Your training folder should be organized as standard image folders:
```text
dataset/
├── train/
│   ├── Tomato___Early_blight/
│   │   ├── image1.jpg
│   │   └── ...
│   ├── Potato___Late_blight/
│   ├── Cucumber___Powdery_mildew/
│   └── ...
└── val/
    ├── Tomato___Early_blight/
    └── ...
```

---

## 2. Model Architecture Selection

| Architecture | Parameters | Model Size (FP32) | Model Size (Quantized FP16/INT8) | Top-1 Accuracy on PlantVillage | Best Use Case |
|---|---|---|---|---|---|
| **MobileNetV2** *(Recommended)* | **3.4 Million** | **14 MB** | **3.8 MB** | **98.4%** | Web browser (TFJS), Android/iOS mobile, drones |
| **EfficientNet-B0** | 5.3 Million | 21 MB | 5.5 MB | 98.9% | Cloud REST API, High accuracy edge |
| **ResNet-50** | 25.6 Million | 98 MB | 25 MB | 99.1% | Heavy server GPU batch processing |

**Why MobileNetV2?**
- Uses **Inverted Residual Blocks** and **Depthwise Separable Convolutions**
- Reduces compute operations by **75%** compared to standard convolutions
- Sub-50ms inference latency on modern smartphones and browsers via WebGL / WebGPU

---

## 3. Exact Training Hyperparameters

```python
# Image Input
INPUT_SHAPE = (224, 224, 3)

# Optimization
BATCH_SIZE = 32
OPTIMIZER = "Adam"
INITIAL_LR = 1e-4        # Feature extraction phase
FINE_TUNE_LR = 1e-5      # End-to-end unfreezing phase
LOSS_FUNCTION = "categorical_crossentropy" # (or label_smoothing=0.1)

# Training Schedule
PHASE_1_EPOCHS = 15      # Classification head only (Base frozen)
PHASE_2_EPOCHS = 10      # Top 30 convolutional layers unfrozen
EARLY_STOPPING_PATIENCE = 5
LR_REDUCE_FACTOR = 0.2
LR_REDUCE_PATIENCE = 3
MIN_LR = 1e-6

# Augmentation Parameters (Simulates outdoor field conditions)
ROTATION_RANGE = 30°
WIDTH_SHIFT = 0.20
HEIGHT_SHIFT = 0.20
SHEAR_RANGE = 0.20
ZOOM_RANGE = 0.20
HORIZONTAL_FLIP = True
VERTICAL_FLIP = True
BRIGHTNESS_RANGE = [0.8, 1.2]
```

---

## 4. Complete TensorFlow / Keras Training Script

To run the training on your local GPU or Google Colab:

```bash
# 1. Install prerequisites
pip install tensorflow numpy matplotlib pillow scikit-learn

# 2. Run the provided script
python ml/train_plant_disease_model.py --data_dir ./plantvillage_dataset --output_dir ./models
```

### Script Execution Workflow:
1. **Data Augmentation**: Normalizes inputs to `[0, 1]` and adds rotational/zoom jitter to simulate drone/phone photography.
2. **Transfer Learning**: Loads ImageNet pre-trained weights for MobileNetV2 without the top dense layers.
3. **Classification Head**: Adds `GlobalAveragePooling2D` -> `BatchNormalization` -> `Dense(256, relu)` -> `Dropout(0.3)` -> `Dense(num_classes, softmax)`.
4. **Phase 1 Training**: Freezes the base MobileNet backbone and trains only the head for 15 epochs.
5. **Phase 2 Fine-Tuning**: Unfreezes the top 30 convolutional layers of MobileNetV2 at a lower learning rate (`1e-5`) for 10 epochs.
6. **Export**: Saves `SavedModel`, converts to **TensorFlow Lite (`.tflite`)** with FP16 quantization for mobile/edge offline use.

---

## 5. Alternative PyTorch Training Pipeline

For PyTorch workflows, run:
```bash
pip install torch torchvision timm scikit-learn
python ml/pytorch_train_plant_disease.py --data_dir ./plantvillage_dataset
```

---

## 6. How to Deploy to Web (TensorFlow.js in React)

To run the trained neural network directly in the user's browser client-side with 0 server latency:

```bash
# Install TFJS converter
pip install tensorflowjs

# Convert SavedModel to TFJS format
tensorflowjs_converter \
    --input_format=tf_saved_model \
    --output_format=tfjs_graph_model \
    --quantize_float16 \
    models/saved_model \
    public/models/plant_disease_tfjs
```

Then in React:
```typescript
import * as tf from "@tensorflow/tfjs";

// Load model from public folder
const model = await tf.loadGraphModel("/models/plant_disease_tfjs/model.json");

// Preprocess image tensor (224x224x3)
const tensor = tf.browser.fromPixels(imageElement)
  .resizeNearestNeighbor([224, 224])
  .toFloat()
  .div(tf.scalar(255.0))
  .expandDims();

// Run forward pass
const predictions = await model.predict(tensor).data();
```
