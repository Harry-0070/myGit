"""
Handwritten Digit Recognition Web App
Uses scikit-learn's SVM trained on the built-in digits dataset (8x8 grayscale images).
The user draws a digit on an HTML canvas, which is sent to this Flask server for prediction.
"""

import base64
import io
from pathlib import Path

import numpy as np
from flask import Flask, jsonify, render_template, request, send_file
from PIL import Image
from sklearn.datasets import load_digits
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

app = Flask(__name__)


def train_model():
    """Train an SVM classifier on scikit-learn's built-in digits dataset."""
    print("Loading digits dataset and training model...")
    digits = load_digits()
    X, y = digits.data, digits.target

    # SVM with RBF kernel — works well for digit classification
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("svm", SVC(kernel="rbf", C=10, gamma=0.001, probability=True)),
    ])
    pipeline.fit(X, y)

    accuracy = pipeline.score(X, y)
    print(f"Model trained! Training accuracy: {accuracy * 100:.1f}%")
    return pipeline


def preprocess_image(image_data_url: str) -> np.ndarray | None:
    """
    Convert a base64-encoded canvas image into an 8x8 feature vector
    that matches the scikit-learn digits dataset format (values in 0–16).

    Steps:
      1. Decode base64 PNG → grayscale PIL image
      2. Invert colors  (canvas = dark ink on white; digits dataset = bright on dark)
      3. Crop to the bounding box of the drawn content + padding
      4. Make the crop square and resize to 8x8
      5. Normalize pixel values to the 0–16 range
    """
    # --- 1. Decode base64 PNG ---
    header, encoded = image_data_url.split(",", 1)
    image_bytes = base64.b64decode(encoded)
    image = Image.open(io.BytesIO(image_bytes)).convert("L")  # grayscale
    img_array = np.array(image, dtype=np.float64)

    # --- 2. Invert: make digit bright, background dark ---
    img_array = 255.0 - img_array

    # --- 3. Find tight bounding box around drawn pixels ---
    threshold = 20  # ignore very faint pixels
    rows = np.any(img_array > threshold, axis=1)
    cols = np.any(img_array > threshold, axis=0)

    if not rows.any() or not cols.any():
        return None  # nothing was drawn

    r_min, r_max = np.where(rows)[0][[0, -1]]
    c_min, c_max = np.where(cols)[0][[0, -1]]

    # Add padding so the digit doesn't touch the edges
    pad = 20
    r_min = max(0, r_min - pad)
    r_max = min(img_array.shape[0] - 1, r_max + pad)
    c_min = max(0, c_min - pad)
    c_max = min(img_array.shape[1] - 1, c_max + pad)

    cropped = img_array[r_min : r_max + 1, c_min : c_max + 1]

    # --- 4. Pad to square then resize to 8×8 ---
    h, w = cropped.shape
    side = max(h, w)
    square = np.zeros((side, side), dtype=np.float64)
    y_off = (side - h) // 2
    x_off = (side - w) // 2
    square[y_off : y_off + h, x_off : x_off + w] = cropped

    img_pil = Image.fromarray(square.astype(np.uint8))
    img_resized = img_pil.resize((8, 8), Image.LANCZOS)

    # --- 5. Normalize to 0–16 (digits dataset scale) ---
    features = np.array(img_resized, dtype=np.float64) / 255.0 * 16.0
    return features.flatten()


# Train once at startup
model = train_model()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/web")
def web_version():
    """Serve the standalone client-side digit recognizer (no server needed)."""
    html_path = Path(__file__).parent / "digit_web.html"
    return send_file(html_path)


@app.route("/predict", methods=["POST"])
def predict():
    """Receive a canvas image, preprocess it, and return the predicted digit."""
    data = request.get_json()
    if not data or "image" not in data:
        return jsonify({"error": "No image data received"}), 400

    features = preprocess_image(data["image"])
    if features is None:
        return jsonify({"error": "No digit detected — please draw something"}), 400

    digit = int(model.predict([features])[0])
    probs = model.predict_proba([features])[0]
    confidence = round(float(probs[digit]) * 100, 1)

    # Return top-3 candidates for display
    top3_idx = np.argsort(probs)[::-1][:3]
    top3 = [{"digit": int(i), "prob": round(float(probs[i]) * 100, 1)} for i in top3_idx]

    return jsonify({"digit": digit, "confidence": confidence, "top3": top3})


if __name__ == "__main__":
    app.run(debug=False, port=5000)
