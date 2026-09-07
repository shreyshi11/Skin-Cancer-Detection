from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import tensorflow as tf
import numpy as np
import io
import os

# -----------------------------
# Create FastAPI application
# -----------------------------
app = FastAPI(
    title="Skin Cancer Detection API",
    description="MobileNetV2 based skin lesion classification API",
    version="1.0"
)

# -----------------------------
# Enable CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Model configuration
# -----------------------------
IMG_SIZE = 224

CLASS_NAMES = [
    "Actinic Keratoses",
    "Basal Cell Carcinoma",
    "Benign Keratosis",
    "Dermatofibroma",
    "Melanoma",
    "Melanocytic Nevi",
    "Vascular Lesions"
]

# Model is one level above backend/
MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "mobilenetv2_skin_cancer_finetuned_best.keras"
)

# Load model
model = tf.keras.models.load_model(MODEL_PATH)


# -----------------------------
# Home route
# -----------------------------
@app.get("/")
def home():
    return {
        "message": "Skin Cancer Detection API is running!"
    }


# -----------------------------
# Prediction route
# -----------------------------
@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    # Read uploaded image
    image_bytes = await file.read()

    # Open image
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # Resize image
    image = image.resize((IMG_SIZE, IMG_SIZE))

    # Convert to numpy array
    image_array = np.array(image, dtype=np.float32)

    # Add batch dimension
    image_array = np.expand_dims(image_array, axis=0)

    # MobileNetV2 preprocessing
    image_array = tf.keras.applications.mobilenet_v2.preprocess_input(
        image_array
    )

    # Prediction
    predictions = model.predict(image_array, verbose=0)[0]

    # Get predicted class
    predicted_index = int(np.argmax(predictions))
    predicted_class = CLASS_NAMES[predicted_index]

    # Confidence
    confidence = float(predictions[predicted_index])

    # All probabilities
    probabilities = {
        CLASS_NAMES[i]: float(predictions[i])
        for i in range(len(CLASS_NAMES))
    }

    return {
        "prediction": predicted_class,
        "confidence": confidence,
        "probabilities": probabilities
    }
