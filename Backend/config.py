# config.py

# Available models for selection
AVAILABLE_MODELS = ["gemini", "mistral", "llama"]

# Default model
DEFAULT_MODEL = "gemini"

# Gemini model name
GEMINI_MODEL_NAME = "gemini-3-flash-preview"

# OpenRouter model mapping
OPENROUTER_MODEL_MAP = {
    "mistral": "mistralai/mistral-small-3.1-24b-instruct:free",
    "llama": "meta-llama/llama-3.3-70b-instruct:free"
}

# Database
DATABASE_URL = "sqlite:///./promptiva.db"

# JWT
SECRET_KEY = "your-secret-key-change-this"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
