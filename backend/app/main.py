from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import json
import asyncio
# Import the service function
from app.services.detection import run_detection
from app.services.report import generate_dental_report
from app.services.audio import generate_report_with_audio
import torch 

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once at startup (path relative to this file — works from any cwd)
MODEL_PATH = str(Path(__file__).resolve().parent / "model" / "best.pt")

if not Path(MODEL_PATH).is_file():
    raise FileNotFoundError(f"Model not found at {MODEL_PATH}")

model = YOLO(MODEL_PATH)

@app.post("/diagnose")
async def diagnose(file: UploadFile = File(...), selected_classes: str = Form("[]")):
    
    img_bytes = await file.read()

    result_data = run_detection(img_bytes, selected_classes, model)

    return JSONResponse(content=result_data)

@app.post("/report")
async def report(file:UploadFile = File(...), detections:str = Form("[]")):
    
    # Generate AI report (Gemini)
    # Return response
    
    if not file:
        return JSONResponse(content={"error": "No file uploaded"}, status_code=400)
    
    img_bytes = await file.read()
    
    try:
        parsed_detections = json.loads(detections)
    except:
        parsed_detections=[]
    
    try:
        report = await asyncio.to_thread(
            generate_dental_report,
            img_bytes,
            parsed_detections
        )
        
    except Exception as e:
        report = {"error":str(e)}
        
    return JSONResponse(content=report)

@app.post("/report-audio")
async def report_audio(file: UploadFile = File(...),audio: UploadFile = File(...),detections: str = Form("[]")):
    
    if not file:
        return JSONResponse(content={"error": "No file uploaded"}, status_code=400)
    
    img_bytes = await file.read()
    audio_bytes = await audio.read()
    
    try:
        parsed = json.loads(detections)
    except:
        parsed = []
        
    mime_type = audio.content_type

    print("Incoming MIME:", mime_type)  # debug

    # 🔥 normalize first
    if not mime_type:
        mime_type = "audio/mpeg"

    # 🔥 block wrong types
    if "video" in mime_type:
        mime_type = "audio/mpeg"

    # 🔥 allow only supported types
    allowed_types = [
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/x-wav",
        "audio/webm",
        "audio/ogg"
    ]

    if mime_type not in allowed_types:
        mime_type = "audio/mpeg"

    print("Final MIME used:", mime_type)
        
    try:
        report = await asyncio.to_thread(
            generate_report_with_audio,
            img_bytes,
            parsed,
            audio_bytes,
            mime_type
        )
    except Exception as e:
        report = {"error":str(e)}
        
    return JSONResponse(content=report)