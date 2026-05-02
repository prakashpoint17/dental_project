import os
from pathlib import Path

from dotenv import load_dotenv

# Always load `.env` from the backend package root (not the process cwd — important for uvicorn/GitHub setups).
_BACKEND_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(_BACKEND_ROOT / ".env")


class Settings:
    LLM_API_KEYS = [
        k.strip()
        for k in (os.getenv("LLM_API_KEY_1"), os.getenv("LLM_API_KEY_2"))
        if k and str(k).strip()
    ]

settings = Settings()
    