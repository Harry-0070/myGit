"""
Handwritten Text Recognition Web App
Uses EasyOCR (free, offline) to recognize handwritten Korean/English text from canvas.
"""

import base64
import io

import easyocr
import numpy as np
from flask import Flask, jsonify, render_template, request
from PIL import Image

app = Flask(__name__)

# Load model once at startup (downloads on first run ~100MB)
print("EasyOCR 모델 로딩 중... (최초 실행 시 모델 다운로드, 잠시 기다려주세요)")
reader = easyocr.Reader(['ko', 'en'], gpu=False)
print("모델 로딩 완료!")


def is_blank_canvas(image_data_url: str) -> bool:
    """Return True if the canvas contains only white pixels (nothing drawn)."""
    _, encoded = image_data_url.split(",", 1)
    image_bytes = base64.b64decode(encoded)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    arr = np.array(image)
    return bool(np.all(arr >= 250))


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/recognize", methods=["POST"])
def recognize():
    """Receive a canvas image and return recognized text via EasyOCR."""
    data = request.get_json()
    if not data or "image" not in data:
        return jsonify({"error": "이미지 데이터가 없습니다"}), 400

    image_data_url = data["image"]

    if is_blank_canvas(image_data_url):
        return jsonify({"error": "아무것도 그려지지 않았습니다"}), 400

    try:
        _, encoded = image_data_url.split(",", 1)
        image_bytes = base64.b64decode(encoded)

        results = reader.readtext(image_bytes, detail=0, paragraph=True)
        text = '\n'.join(results).strip()

        if not text:
            return jsonify({"error": "텍스트를 인식하지 못했습니다. 더 크고 선명하게 써보세요."}), 400

        return jsonify({"text": text})

    except Exception as e:
        return jsonify({"error": f"인식 오류: {e}"}), 500


if __name__ == "__main__":
    app.run(debug=False, port=5000)
