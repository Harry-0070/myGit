# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repo is a collection of independent Python desktop/web tools, each in its own folder. There is no shared package or build system across them.

| Location | What it is |
|---|---|
| `app.py` + `templates/` | Flask web app — handwritten digit recognition |
| `PDF/` | PDF page extractor (CLI + Tkinter GUI) |
| `크롤링/` | Musinsa ranking scraper (crawler + Tkinter GUI) |
| `tetris.html` | Standalone browser Tetris game |

---

## Running Each Tool

### Digit Recognizer (root)
```bash
# Auto-installs deps and opens browser at http://localhost:5000
run.bat

# Or manually
pip install flask numpy pillow scikit-learn
python app.py
```

### PDF Extractor (`PDF/`)
```bash
pip install -r PDF/requirements.txt

# CLI: extract pages 1-5 from default PDF
python PDF/pdf_extract.py 1-5
python PDF/pdf_extract.py 1,3,5 --input myfile.pdf --output out.pdf

# GUI (drag-and-drop, extracts to TXT)
python PDF/pdf_extract_gui.py
```

### Musinsa Crawler (`크롤링/`)
```bash
# Auto-installs deps and launches GUI
크롤링/run.bat

# Or manually
pip install -r 크롤링/requirements.txt
python 크롤링/musinsa_ranking_gui.py
```

### Building PDF GUI to EXE
```bash
# Requires pyinstaller (not in requirements.txt by default)
pip install pyinstaller
# See PDF/pdf_extract_gui.spec and PDF/빌드 방법.txt for build instructions
pyinstaller PDF/pdf_extract_gui.spec
# Output: PDF/dist/PDF텍스트추출.exe
```

---

## Architecture Notes

### Digit Recognizer (`app.py`)
- Trains an SVM (RBF kernel) on scikit-learn's built-in 8×8 digits dataset **at server startup** — no external model file.
- `/predict` endpoint receives a base64-encoded canvas PNG, preprocesses it (invert → crop bounding box → pad to square → resize to 8×8 → normalize 0–16), and returns `{digit, confidence, top3}`.
- The canvas in `templates/index.html` sends JSON to `/predict` via `fetch`.

### PDF Extractor (`PDF/`)
- `pdf_extract.py` is a pure CLI module; `pdf_extract_gui.py` imports `parse_page_range` from it directly (`from pdf_extract import parse_page_range`) with an inline fallback if the import fails.
- The GUI extracts text to TXT; the CLI extracts pages to a new PDF.
- Drag-and-drop is provided by `tkinterdnd2`; if it's not installed the GUI degrades to click-to-browse only.

### Musinsa Crawler (`크롤링/`)
- `musinsa_ranking_crawler.py` is the engine; `musinsa_ranking_gui.py` is the UI layer — they are separate files in the same folder and the GUI imports the crawler by name.
- Crawling strategy: **requests → Selenium fallback → backup URLs**. Selenium uses headless Chrome via `webdriver-manager` (auto-downloads ChromeDriver).
- Multiple CSS selector candidates are tried in order to handle Musinsa's page structure changes.
- Results are exported to `.xlsx` using `openpyxl` with styled headers.

---

## Language Convention
All source code and comments are written in **English**. UI-facing strings (labels, messages) are in Korean.
