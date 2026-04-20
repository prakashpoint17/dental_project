import os
from dotenv import load_dotenv

load_dotenv()

class Settings():
    LLM_API_KEYS = [
        key for key in [
            os.getenv("LLM_API_KEY_1"),
            os.getenv("LLM_API_KEY_2")
        ] if key is not None
    ]

settings = Settings()
    