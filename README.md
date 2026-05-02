# Dental AI — Radiograph Diagnosis Dashboard

Full-stack demo that runs **YOLO-based dental radiograph detection** (Ultralytics) and optional **clinical-style reports** via **Google Gemini** (vision + optional audio). The web UI is a React (Vite) + Material UI dashboard served on **http://localhost:5173**; the API is **FastAPI** on **http://localhost:8000**.

> **Disclaimer:** This software is for research and demonstration only. It is **not** a medical device and must not replace professional diagnosis or treatment.

---

## Repository structure

```
dental_project/
├── README.md                    # This file (project overview)
├── .gitignore
├── backend/
│   ├── pyproject.toml           # Python project + dependencies (UV / pip-compatible)
│   ├── requirements.txt         # Pip alternative lock of core deps
│   ├── uv.lock                  # Locked deps when using `uv`
│   ├── .python-version          # Recommends Python 3.11
│   ├── .env                     # Create locally — NOT committed (see below)
│   ├── notebook/
│   │   └── dental_app.ipynb      # Jupyter experiments
│   └── app/
│       ├── main.py              # FastAPI app, routes, CORS, YOLO load
│       ├── model/
│       │   └── best.pt          # YOLO weights — YOU MUST ADD (ignored by git)
│       ├── core/
│       │   └── security.py      # Loads LLM_API_KEY_* from .env
│       └── services/
│           ├── detection.py     # OpenCV + YOLO inference
│           ├── report.py       # Gemini text/vision report
│           └── audio.py        # Gemini report with optional audio note
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── routes/AppRoutes.jsx  # SPA route: "/" → diagnosis page
        ├── pages/DiagnosisPage.jsx
        ├── api/detectionApi.js   # Legacy helper (not used by main UI)
        └── components/            # Upload, filters, PDF, hero, etc.
```

---

## Prerequisites

| Requirement | Notes |
|------------|------|
| **Python** | 3.11–3.13 (`pyproject.toml`: `>=3.11,<3.14`; repo pins **3.11** in `.python-version`) |
| **Node.js** | 18+ recommended (matches Vite 8 toolchain) |
| **YOLO weights** | File **`backend/app/model/best.pt`** required before the API starts |

Optional:

- **[uv](https://docs.astral.sh/uv/)** — fast installs using `pyproject.toml` / `uv.lock`
- **NVIDIA CUDA** — speeds up PyTorch inference if configured; CPU works but is slower for large batches

---

## 1. Clone the repository

```bash
git clone <your-remote-url-or-path-to-repo> dental_project
cd dental_project
```

Replace `<your-remote-url-or-path-to-repo>` with your Git remote (for example `https://github.com/your-org/dental_project.git`).

---

## 2. Install the detection model weights

The server **loads YOLO at startup** from a fixed path. If `best.pt` is missing, the process exits with **FileNotFoundError**.

1. Obtain your trained **`best.pt`** (Ultrantics YOLO format compatible with the project version).
2. Place it here:

```
backend/app/model/best.pt
```

Create `backend/app/model/` if needed. Weight files (`*.pt`) and this folder are **gitignored** on purpose.

---

## 3. Backend: environment variables

Create **`backend/.env`** (this file is not committed):

```env
# At least one Google Gemini API key (used by report/audio features)
LLM_API_KEY_1=your_gemini_api_key_here

# Optional second key — used as fallback when quota or errors occur
# LLM_API_KEY_2=another_key_here
```

Keys are read in [`backend/app/core/security.py`](backend/app/core/security.py). Without keys, **`/report` and `/report-audio`** return an error object (detection **`/diagnose`** still works if the model file is present).

---

## 4. Backend: install dependencies

From the **`backend`** directory:

### Option A — `uv` (recommended if `uv.lock` is present)

```bash
cd backend
uv sync
```

### Option B — `pip` + virtual environment

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

*(If pip conflicts with Ultralytics/Torch pins, align versions with [`pyproject.toml`](backend/pyproject.toml).)*

---

## 5. Backend: run the API server

Still in **`backend`**, with the virtual environment activated if you use pip:

```bash
cd backend
source .venv/bin/activate   # if using venv

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Expected:

- **API base:** http://localhost:8000  
- **Interactive docs (Swagger UI):** http://localhost:8000/docs  
- **OpenAPI JSON:** http://localhost:8000/openapi.json  

CORS is configured for the Vite dev origin **`http://localhost:5173`** in [`backend/app/main.py`](backend/app/main.py).

---

## 6. Frontend: install dependencies

Open a **second terminal**:

```bash
cd dental_project/frontend
npm install
```

---

## 7. Frontend: development server

```bash
cd dental_project/frontend
npm run dev
```

Vite prints a local URL (default **http://localhost:5173**). Open that address in your browser — you should see the **Dental AI** dashboard (hero, upload area, sticky header).

**Keep both processes running:** terminal 1 = FastAPI (`8000`), terminal 2 = Vite (`5173`).

---

## 8. Using the web app (UI flow)

1. **Dark / light mode** — Toggle the sun/moon icon in the top app bar.
2. **Upload a radiograph** — Use **Upload Radiograph**; supported types follow the file input / browser rules (typically PNG, JPEG).
3. **Run detection** — Click **Predict Detections**. The app POSTs to `http://localhost:8000/diagnose` and shows:
   - Annotated image (bounding boxes),
   - **Summary** counts per condition class,
   - **Anomaly list** and **FILTER ANOMALIES** checkboxes.
4. **Filter by class** — Toggle checkboxes to restrict which YOLO classes are drawn; the UI re-runs diagnosis with **`selected_classes`**.
5. **Optional audio note** — After detections exist, you can attach **MP3, WAV, WebM, or OGG** (see allowed MIME normalization in [`backend/app/main.py`](backend/app/main.py)).
6. **Clinical AI report** — Click **Generate Clinical AI Report**.  
   - Without audio → `POST /report`  
   - With audio → `POST /report-audio`  
   Response is rendered in **Report Panel**; you can export with **PDF** (jsPDF) when a report exists.

---

## HTTP API overview

| Method | Path | Purpose |
|--------|------|--------|
| `POST` | `/diagnose` | Multipart `file`, form `selected_classes` (JSON array of class ids). Returns base64 annotated image + anomaly metadata. |
| `POST` | `/report` | Multipart `file` + form `detections` (JSON). Gemini-generated structured report JSON. |
| `POST` | `/report-audio` | Same as `/report` plus multipart `audio` for multimodal reasoning. |

All details and “Try it out” are easiest from **http://localhost:8000/docs** while the backend is running.

---

## Production / static build (optional)

```bash
cd frontend
npm run build
npm run preview    # serves the production build locally for smoke tests
```

For production deployment you would typically serve **`frontend/dist`** behind nginx or similar and configure the SPA to hit your real API base URL (today the dashboard hardcodes **`http://localhost:8000`** in [`frontend/src/pages/DiagnosisPage.jsx`](frontend/src/pages/DiagnosisPage.jsx)).

---

## Jupyter notebook

Exploratory workflow: [`backend/notebook/dental_app.ipynb`](backend/notebook/dental_app.ipynb) (expects paths relative to the notebook; refers to `../app/model/best.pt`).

---

## Troubleshooting

| Issue | What to check |
|------|----------------|
| `Model not found at .../best.pt` | Copy weights to `backend/app/model/best.pt`. |
| CORS errors in browser | Frontend must be **`http://localhost:5173`** or update `allow_origins` in FastAPI CORS middleware. |
| `No API keys configured` | Add `LLM_API_KEY_1` in **`backend/.env`**; restart uvicorn. |
| Torch / CUDA failures | Ensure Python version matches; install CPU wheels or matching CUDA builds per [PyTorch](https://pytorch.org/). |
| Port already in use | Change `--port` for uvicorn or Vite (`npm run dev -- --port 5174` etc.). |

---

## License / attribution

Add your preferred license and attribute third-party stacks: **Ultralytics YOLO**, **FastAPI**, **React**, **Vite**, **MUI**, **Google Gemini**.
