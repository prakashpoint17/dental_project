from google import genai
from google.genai import types
import PIL.Image
import io
import os
import time
import json
from app.core.security import settings
import re


def get_client(api_key):
    return genai.Client(api_key=api_key)

def generate_dental_report(image_bytes,detections):
    
    
    """
    Generates a professional dental report using vision + detection data.
    Includes a fallback mechanism to handle 503 Service Unavailable errors.
    """
    # 1. Prepare the image for Gemini
    try:
        img = PIL.Image.open(io.BytesIO(image_bytes))
        #convert image properly
        img_buffer = io.BytesIO()
        img.save(img_buffer,format="PNG")
            
        image_part = types.Part.from_bytes(
                data=img_buffer.getvalue(),
                mime_type="image/png"
            )
            
    except Exception as e:
        return {"error":f"Invalid image data: {str(e)}"}
    
    
    # Structure detections
    structured_detections = [
        {
            "condition": d["name"],
            "confidence":d.get("confidence","unknown")
        } for d in detections
    ]
    
    # 2. Construct a professional medical prompt
    
    prompt = f"""
        ROLE:
        You are an Expert Radiologic Dentist specializing in panoramic dental X-ray analysis.

        INPUT DATA:
        The following anomalies are detected by an AI model (use them as guidance, not absolute truth):
        {json.dumps(structured_detections)}

        CLINICAL STANDARDS:
        - Use FDI World Dental Federation notation (11–48)
        - Infer tooth position logically based on image structure (left/right, upper/lower jaw)
        - Use professional dental terminology
        - Also include a simple/common name in parentheses

        Example:
        "Periapical Periodontitis (Infection)"
        "Interproximal Caries (Cavity)"

        TASK:
        Generate a structured dental radiology report.

        For each finding:
        - Assign most probable tooth number
        - Provide anatomical tooth name
        - Describe condition professionally
        - Mention severity (Low / Moderate / High)
        - Include confidence from detection
        - Add precise location notes (mesial, distal, occlusal, apical)

        IMPORTANT RULES:
        - Do NOT hallucinate new conditions
        - Only use provided detections
        - If unsure about tooth number, make best logical estimate
        - Keep output strictly in JSON (no markdown, no explanation)
        - the input structured_detections is for support regardless give accurate report based on x-ray img 

        OUTPUT FORMAT (STRICT JSON):
        {{
            "summary": "Concise clinical overview of oral condition",

            "detailed_findings": [
                {{
                    "tooth_number": "FDI number (e.g., 16)",
                    "tooth_name": "Upper Right First Molar",
                    "condition": "Professional term (simple term)",
                    "severity": "Low/Moderate/High",
                    "confidence": "use detection confidence",
                    "treatment":"suggested Treatment plan",
                    "notes": "Exact anatomical location and radiographic description"
                }}
            ],

            "overall_severity": "Low/Moderate/High",

            "recommendations": [ 
                "Step 1",
                "Step 2"
            ]
            
            "report_Summary": "in very very detailed and explained report and formated as 
                [
                "Point 1",
                "Point 2",
                "Point 3"
                ]
            
            ".
        }}
        """

    api_keys = settings.LLM_API_KEYS
    
    if not api_keys:
        return {"error": "No API keys configured"}
    
    # 3. Model Fallback List (ordered by preference)
    # If one model is busy (503), the code tries the next one.
    
    # Order of preference for models
    models_to_try = [
            "models/gemini-2.0-flash-lite" ,
            "models/gemini-flash-latest",
            "models/gemini-2.0-flash",
            "models/gemini-2.5-flash"
        ]   
    
    # print([m.name for m in client.models.list()])
    for key_index, api_key in enumerate(api_keys):
        
        print(f"\n🔑 Using API KEY {key_index + 1}")
        
        client = get_client(api_key)
        
        quota_exhausted_for_all_models = True  # 🔥 flag
   
        for model_name in models_to_try:
            try:
                
                print(f"Trying {model_name} with KEY {key_index + 1}")
                
                
                print(f"Attempting to reach: {model_name}...")
                
                response = client.models.generate_content(
                    model=model_name,
                    contents=[prompt, image_part],
                    config = types.GenerateContentConfig(
                        temperature=0.1 # Low temperature for more consistent medical reporting
                    )
                )
                
                print("Response retrived")
                
                # Successfully got a response, parse and return
                clean_text = re.sub(r"```json|```", "", response.text).strip()
                
                print(clean_text)
                
                try:
                    return json.loads(clean_text)
                except:
                    return {
                        "error": "Invalid JSON from AI",
                        "raw_response": clean_text
                    }
            
            
            except Exception as e:
                error_msg = str(e).upper()
                print(f"Error: {error_msg[:100]}")
                
                # 🔥 KEY LOGIC
                if "429" in error_msg:
                    print("❌ Quota exhausted for this key → switching key...")
                    continue   # break model loop → go to next API key

                if "404" in error_msg or "503" in error_msg:
                    print("⚠️ Model issue → trying next model")
                    quota_exhausted_for_all_models = False
                    continue
                
                if "400" in error_msg:
                    print("⚠️ Input issue → trying next model")
                    quota_exhausted_for_all_models = False
                    continue

                return {"error": f"API Error: {error_msg}"}
            
        if quota_exhausted_for_all_models:
            print("❌ All models exhausted quota → switching API key")
        else:
            print("⚠️ Models failed due to other reasons → switching key anyway")

    
    return {"error": "All AI models are currently overwhelmed. Please try again in 1 minute."}
