from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import json
import os
import urllib.request
# Import the service function
from app.services.detection import run_detection
from app.services.report import generate_dental_report
from app.services.audio import generate_report_with_audio

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once at startup
# model = YOLO("app/model/best.pt")

MODEL_URL = "https://huggingface.co/prakash1702/dental-yolo-model/blob/main/best.pt"
MODEL_PATH = "best.pt"

def download_model():
    if not os.path.exists(MODEL_PATH):
        print("Downloading model...")
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        print("Done")

download_model()

model = YOLO("best.pt")

@app.post("/diagnose")
async def diagnose(file: UploadFile = File(...), selected_classes: str = Form("[]")):
    # 1. Read the file bytes here (asynchronous)
    img_bytes = await file.read()
    
    # 2. Call the service function (synchronous logic)
    result_data = run_detection(img_bytes, selected_classes, model)
    
    
    return JSONResponse(content=result_data)

@app.post("/report")
async def report(file:UploadFile = File(...), detections:str = Form("[]")):

    # Generate AI report (Gemini)
    # Return response
    img_bytes = await file.read()
    
    try:
        parsed_detections = json.loads(detections)
    except:
        parsed_detections=[]
    
    try:
        report = generate_dental_report(
            img_bytes,
            parsed_detections
        )
    except Exception as e:
        report = {"error":str(e)}
        
    return JSONResponse(content=report)

@app.post("/report-audio")
async def report_audio(file: UploadFile = File(...),audio: UploadFile = File(...),detections: str = Form("[]")):
    
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
        report = generate_report_with_audio(
            img_bytes,
            parsed,
            audio_bytes,
            mime_type
        )
    except Exception as e:
        report = {"error":str(e)}
        
    return JSONResponse(content=report)