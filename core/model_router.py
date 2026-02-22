import os
from google import genai
from openai import OpenAI

# --- Initialize Clients Once ---

# Gemini Client
gemini_client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# OpenRouter Client
openrouter_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

# --- Model Map for OpenRouter ---
MODEL_MAP = {
    "mistral": "mistralai/mistral-7b-instruct",
    "llama": "meta-llama/llama-3-8b-instruct",
    
}


def generate_response(model_name: str, prompt: str) -> str:

    model_name = model_name.lower()

    # ---- Gemini ----
    if model_name == "gemini":
        response = gemini_client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt
        )
        return response.text

    # ---- OpenRouter Models ----
    elif model_name in MODEL_MAP:
        response = openrouter_client.chat.completions.create(
            model=MODEL_MAP[model_name],
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=400
        )
        return response.choices[0].message.content

    else:
        raise ValueError(f"Unsupported model: {model_name}")