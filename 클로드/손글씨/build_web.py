"""
build_web.py
Trains a multi-layer perceptron on scikit-learn's built-in digits dataset,
then generates digit_web.html — a fully self-contained web page that runs
digit recognition entirely in the browser (no server required).

Usage:
    python build_web.py
Output:
    digit_web.html  (open directly in any browser)
"""

import json
import sys

import numpy as np
from sklearn.datasets import load_digits
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler

OUTPUT_FILE = "digit_web.html"


# ── 1. Train ───────────────────────────────────────────────────────────────────
print("Loading digits dataset...")
digits = load_digits()
X, y = digits.data, digits.target  # X: (1797, 64), values 0–16

print("Fitting StandardScaler...")
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

print("Training MLP (256 → 128 hidden units, ReLU, Adam)...")
clf = MLPClassifier(
    hidden_layer_sizes=(256, 128),
    activation="relu",
    solver="adam",
    max_iter=500,
    random_state=42,
    verbose=False,
)
clf.fit(X_scaled, y)
acc = clf.score(X_scaled, y) * 100
print(f"Training accuracy: {acc:.1f}%")


# ── 2. Serialise weights ───────────────────────────────────────────────────────
# clf.coefs_[l]       : weight matrix (n_in, n_out) for layer l
# clf.intercepts_[l]  : bias vector   (n_out,)       for layer l
weights = {
    "layers": [
        {"W": W.tolist(), "b": b.tolist()}
        for W, b in zip(clf.coefs_, clf.intercepts_)
    ],
    "scaler_mean": scaler.mean_.tolist(),
    "scaler_scale": scaler.scale_.tolist(),
}

model_json = json.dumps(weights, separators=(",", ":"))
size_kb = len(model_json) // 1024
print(f"Model JSON size: {size_kb} KB")


# ── 3. HTML template (use __MODEL_JSON__ as placeholder) ─────────────────────
HTML_TEMPLATE = r"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Digit Recognizer — Client-side</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #0f0f1a;
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: #e0e0ff;
      gap: 20px;
      padding: 24px;
    }

    h1 {
      font-size: 1.8rem;
      font-weight: 700;
      letter-spacing: .05em;
      background: linear-gradient(135deg, #a78bfa, #60a5fa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .badge {
      font-size: .72rem;
      background: #1e3a2f;
      color: #4ade80;
      border: 1px solid #2d5a42;
      border-radius: 99px;
      padding: 3px 12px;
      letter-spacing: .06em;
    }

    /* ── cards ── */
    .card {
      background: #1a1a2e;
      border: 1px solid #2a2a4a;
      border-radius: 16px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,.4);
    }

    .canvas-label {
      font-size: .82rem;
      color: #9090b0;
      text-transform: uppercase;
      letter-spacing: .1em;
    }

    #drawCanvas {
      border: 2px solid #3a3a6a;
      border-radius: 12px;
      cursor: crosshair;
      background: #fff;
      touch-action: none;
    }

    /* 8×8 preview */
    .preview-row {
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: .78rem;
      color: #6060a0;
    }
    #preview8 {
      image-rendering: pixelated;
      border: 1px solid #3a3a6a;
      border-radius: 4px;
    }

    /* slider */
    .slider-row {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: .82rem;
      color: #9090b0;
    }
    input[type=range] {
      -webkit-appearance: none;
      width: 120px; height: 4px;
      border-radius: 2px;
      background: #3a3a6a;
      outline: none;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px; height: 16px;
      border-radius: 50%;
      background: #a78bfa;
      cursor: pointer;
    }

    /* buttons */
    .btn-row { display: flex; gap: 12px; }
    button {
      padding: 10px 28px;
      border: none; border-radius: 8px;
      font-size: .92rem; font-weight: 600;
      cursor: pointer;
      transition: transform .1s, opacity .15s;
    }
    button:active { transform: scale(.96); }

    #predictBtn {
      background: linear-gradient(135deg, #a78bfa, #60a5fa);
      color: #0f0f1a;
    }
    #predictBtn:hover { opacity: .9; }

    #clearBtn {
      background: #2a2a4a; color: #c0c0e0;
      border: 1px solid #3a3a6a;
    }
    #clearBtn:hover { background: #3a3a6a; }

    /* result panel */
    #result {
      min-height: 160px;
      width: 340px;
      background: #1a1a2e;
      border: 1px solid #2a2a4a;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 8px 32px rgba(0,0,0,.4);
    }

    .placeholder-text { color: #5050a0; font-size: .9rem; }

    .digit-display {
      font-size: 5rem; font-weight: 900; line-height: 1;
      background: linear-gradient(135deg, #a78bfa, #60a5fa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .confidence-text { font-size: .88rem; color: #7070c0; }

    .bar-wrap {
      width: 100%; background: #2a2a4a;
      border-radius: 6px; height: 8px; overflow: hidden;
    }
    .bar {
      height: 100%; border-radius: 6px;
      background: linear-gradient(90deg, #a78bfa, #60a5fa);
      transition: width .5s ease;
    }

    .top3 { display: flex; gap: 10px; margin-top: 2px; }
    .top3-item {
      display: flex; flex-direction: column; align-items: center;
      background: #2a2a4a; border-radius: 8px; padding: 6px 14px;
      font-size: .78rem; color: #9090c0;
    }
    .top3-item .td { font-size: 1.25rem; font-weight: 700; color: #c0c0f0; }

    .instructions {
      font-size: .78rem; color: #5050a0;
      text-align: center; max-width: 340px;
    }
  </style>
</head>
<body>

<h1>✍️ Digit Recognizer</h1>
<span class="badge">No server required — runs in your browser</span>

<div class="card">
  <span class="canvas-label">Draw a digit (0 – 9)</span>
  <canvas id="drawCanvas" width="280" height="280"></canvas>

  <!-- 8×8 model input preview -->
  <div class="preview-row">
    <span>Model input (8×8):</span>
    <canvas id="preview8" width="8" height="8" style="width:40px;height:40px;"></canvas>
  </div>

  <div class="slider-row">
    <span>Brush size:</span>
    <input type="range" id="brushSize" min="8" max="40" value="22"/>
    <span id="brushLabel">22</span>
  </div>

  <div class="btn-row">
    <button id="predictBtn">Recognize</button>
    <button id="clearBtn">Clear</button>
  </div>
</div>

<div id="result">
  <span class="placeholder-text">Draw a digit and press Recognize</span>
</div>

<p class="instructions">
  MLP (256→128, ReLU) trained on scikit-learn's digits dataset.<br/>
  Weights embedded at build time — works fully offline.
</p>

<script>
// ─── Embedded model weights (generated by build_web.py) ─────────────────────
const MODEL = __MODEL_JSON__;

// ─── Neural-network inference ─────────────────────────────────────────────────
function matVecAdd(x, W, b) {
  // x: Float32Array[n], W: Array[n][m], b: Array[m] → Float32Array[m]
  const n = x.length, m = b.length;
  const out = new Float32Array(m);
  for (let j = 0; j < m; j++) {
    let s = b[j];
    for (let i = 0; i < n; i++) s += x[i] * W[i][j];
    out[j] = s;
  }
  return out;
}

function softmax(arr) {
  let mx = arr[0];
  for (const v of arr) if (v > mx) mx = v;
  const ex = new Float32Array(arr.length);
  let sum = 0;
  for (let i = 0; i < arr.length; i++) { ex[i] = Math.exp(arr[i] - mx); sum += ex[i]; }
  for (let i = 0; i < arr.length; i++) ex[i] /= sum;
  return ex;
}

function runModel(features) {
  const { layers, scaler_mean, scaler_scale } = MODEL;

  // StandardScaler transform
  let x = new Float32Array(features.length);
  for (let i = 0; i < features.length; i++) {
    x[i] = (features[i] - scaler_mean[i]) / scaler_scale[i];
  }

  // Hidden layers with ReLU activation
  for (let l = 0; l < layers.length - 1; l++) {
    const z = matVecAdd(x, layers[l].W, layers[l].b);
    x = new Float32Array(z.length);
    for (let i = 0; i < z.length; i++) x[i] = z[i] > 0 ? z[i] : 0; // ReLU
  }

  // Output layer with softmax
  const last = layers[layers.length - 1];
  return softmax(matVecAdd(x, last.W, last.b));
}

// ─── Image preprocessing (mirrors Python's preprocess_image in app.py) ────────
function preprocessCanvas(canvas) {
  const W = canvas.width, H = canvas.height;
  const px = canvas.getContext('2d').getImageData(0, 0, W, H).data;

  // Grayscale + invert (white background → 0, dark ink → bright)
  const gray = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const lum = 0.299 * px[i*4] + 0.587 * px[i*4+1] + 0.114 * px[i*4+2];
    gray[i] = 255.0 - lum;
  }

  // Tight bounding box around drawn pixels
  let r0 = H, r1 = 0, c0 = W, c1 = 0, found = false;
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      if (gray[r * W + c] > 20) {
        if (r < r0) r0 = r; if (r > r1) r1 = r;
        if (c < c0) c0 = c; if (c > c1) c1 = c;
        found = true;
      }
    }
  }
  if (!found) return null;

  // Add padding, clamp to image bounds
  const pad = 20;
  r0 = Math.max(0, r0 - pad); r1 = Math.min(H - 1, r1 + pad);
  c0 = Math.max(0, c0 - pad); c1 = Math.min(W - 1, c1 + pad);

  const ch = r1 - r0 + 1, cw = c1 - c0 + 1;
  const side = Math.max(ch, cw);
  const yr = Math.floor((side - ch) / 2), xr = Math.floor((side - cw) / 2);

  // Write cropped content into a square offscreen canvas (bright digit on black)
  const sqCanvas = document.createElement('canvas');
  sqCanvas.width = side; sqCanvas.height = side;
  const sqCtx = sqCanvas.getContext('2d');
  const sqData = sqCtx.createImageData(side, side);
  for (let r = 0; r < ch; r++) {
    for (let c = 0; c < cw; c++) {
      const v = gray[(r + r0) * W + (c + c0)];
      const idx = ((r + yr) * side + (c + xr)) * 4;
      sqData.data[idx] = v; sqData.data[idx+1] = v;
      sqData.data[idx+2] = v; sqData.data[idx+3] = 255;
    }
  }
  sqCtx.putImageData(sqData, 0, 0);

  // Resize to 8×8 using browser's built-in smoothing (≈bilinear)
  const small = document.createElement('canvas');
  small.width = 8; small.height = 8;
  const sCtx = small.getContext('2d');
  sCtx.imageSmoothingEnabled = true;
  sCtx.imageSmoothingQuality = 'high';
  sCtx.drawImage(sqCanvas, 0, 0, 8, 8);

  // Read pixel values and normalise to 0–16 (digits dataset range)
  const sData = sCtx.getImageData(0, 0, 8, 8).data;
  const features = new Float32Array(64);
  for (let i = 0; i < 64; i++) {
    features[i] = sData[i * 4] / 255.0 * 16.0;
  }

  // Copy 8×8 image to the preview canvas in the UI
  updatePreview(sCtx);

  return features;
}

function updatePreview(srcCtx) {
  const previewCtx = document.getElementById('preview8').getContext('2d');
  previewCtx.drawImage(srcCtx.canvas, 0, 0);
}

// ─── Canvas drawing setup ─────────────────────────────────────────────────────
const canvas = document.getElementById('drawCanvas');
const ctx    = canvas.getContext('2d');
let drawing = false, lx = 0, ly = 0;

function initCanvas() {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Clear preview
  const p = document.getElementById('preview8').getContext('2d');
  p.fillStyle = '#000'; p.fillRect(0, 0, 8, 8);
}
initCanvas();

const brushSlider = document.getElementById('brushSize');
const brushLabel  = document.getElementById('brushLabel');
brushSlider.addEventListener('input', () => { brushLabel.textContent = brushSlider.value; });

function pos(e) {
  const r = canvas.getBoundingClientRect();
  return e.touches
    ? { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top }
    : { x: e.clientX - r.left, y: e.clientY - r.top };
}

function startDraw(e) {
  e.preventDefault(); drawing = true;
  const { x, y } = pos(e); lx = x; ly = y;
  ctx.beginPath();
  ctx.arc(x, y, parseInt(brushSlider.value) / 2, 0, Math.PI * 2);
  ctx.fillStyle = '#111'; ctx.fill();
}

function draw(e) {
  if (!drawing) return; e.preventDefault();
  const { x, y } = pos(e);
  ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(x, y);
  ctx.strokeStyle = '#111'; ctx.lineWidth = parseInt(brushSlider.value);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  lx = x; ly = y;
}

function stopDraw() { drawing = false; }

canvas.addEventListener('mousedown',  startDraw);
canvas.addEventListener('mousemove',  draw);
canvas.addEventListener('mouseup',    stopDraw);
canvas.addEventListener('mouseleave', stopDraw);
canvas.addEventListener('touchstart', startDraw, { passive: false });
canvas.addEventListener('touchmove',  draw,      { passive: false });
canvas.addEventListener('touchend',   stopDraw);

// ─── Clear ────────────────────────────────────────────────────────────────────
document.getElementById('clearBtn').addEventListener('click', () => {
  initCanvas();
  document.getElementById('result').innerHTML =
    '<span class="placeholder-text">Draw a digit and press Recognize</span>';
});

// ─── Recognize ────────────────────────────────────────────────────────────────
document.getElementById('predictBtn').addEventListener('click', () => {
  const features = preprocessCanvas(canvas);
  const result   = document.getElementById('result');

  if (!features) {
    result.innerHTML = '<span style="color:#f87171">⚠️ Nothing drawn — please draw a digit first</span>';
    return;
  }

  const probs = runModel(features);

  // Find best prediction
  let best = 0;
  for (let i = 1; i < 10; i++) if (probs[i] > probs[best]) best = i;
  const conf = (probs[best] * 100).toFixed(1);

  // Top-3
  const sorted = Array.from(probs)
    .map((p, i) => ({ digit: i, prob: p }))
    .sort((a, b) => b.prob - a.prob)
    .slice(0, 3);

  const top3Html = sorted.map(item =>
    `<div class="top3-item">
       <span class="td">${item.digit}</span>
       <span>${(item.prob * 100).toFixed(1)}%</span>
     </div>`
  ).join('');

  result.innerHTML = `
    <div class="digit-display">${best}</div>
    <span class="confidence-text">Confidence: <strong>${conf}%</strong></span>
    <div class="bar-wrap"><div class="bar" style="width:${conf}%"></div></div>
    <span style="font-size:.76rem;color:#5050a0;margin-top:2px">Top 3 candidates</span>
    <div class="top3">${top3Html}</div>
  `;
});
</script>
</body>
</html>"""

# ── 4. Inject model weights and write ─────────────────────────────────────────
html_content = HTML_TEMPLATE.replace("__MODEL_JSON__", model_json)

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write(html_content)

total_kb = len(html_content) // 1024
print(f"\nGenerated: {OUTPUT_FILE}  ({total_kb} KB total)")
print("Open the file directly in any browser — no server needed.")
