import cv2
import numpy as np
import base64
import json

def run_detection(img_bytes, selected_classes_str, model):

    # 1. Decode image
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # 2. Parse selected classes
    try:
        active_ids = json.loads(selected_classes_str)
    except:
        active_ids = []

    # 3. Predict
    results = model.predict(
        source=img,
        classes=active_ids if active_ids else None,
        conf=0.25
    )

    result = results[0]

    # 🔥 IMPORTANT: Full detections list
    all_detections = []

    for i in range(len(result.boxes)):
        cls_id = int(result.boxes.cls[i])
        conf = float(result.boxes.conf[i])

        all_detections.append({
            "id": cls_id,
            "name": model.names[cls_id],
            "confidence": round(conf, 2)
        })

    # 🔥 UNIQUE classes for checkbox UI
    unique_ids = list(set([d["id"] for d in all_detections]))

    anomalies = [
        {"id": i, "name": model.names[i]}
        for i in unique_ids
    ]

    # 5. Plot image
    annotated_img = result.plot()
    _, buffer = cv2.imencode('.png', annotated_img)
    encoded_img = base64.b64encode(buffer).decode('utf-8')

    return {
        "image": f"data:image/png;base64,{encoded_img}",
        "anomalies": anomalies,             # for checkbox
        "all_detections": all_detections    # 🔥 for summary
    }