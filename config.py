# config.py

# Available models for selection
AVAILABLE_MODELS = ["gemini", "mistral", "llama"]

# Default model
DEFAULT_MODEL = "gemini"

# Gemini model name
GEMINI_MODEL_NAME = "gemini-3-flash-preview"

# OpenRouter model mapping
OPENROUTER_MODEL_MAP = {
    "mistral": "mistralai/mistral-7b-instruct",
    "llama": "meta-llama/llama-3-8b-instruct"
}