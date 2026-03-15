import os
from google import genai
from openai import AsyncOpenAI
from config import OPENROUTER_MODEL_MAP, GEMINI_MODEL_NAME

# --- Initialize Clients Once ---

# Gemini Client
gemini_client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# OpenRouter Async Client
openrouter_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

async def generate_response(model_name: str, prompt: str) -> str:
    model_name = model_name.lower()

    # ---- Gemini ----
    if model_name == "gemini":
        response = await gemini_client.aio.models.generate_content(
            model=GEMINI_MODEL_NAME,
            contents=prompt
        )
        return response.text

    # ---- OpenRouter Models ----
    elif model_name in OPENROUTER_MODEL_MAP:
        response = await openrouter_client.chat.completions.create(
            model=OPENROUTER_MODEL_MAP[model_name],
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=400
        )
        return response.choices[0].message.content

    else:
        raise ValueError(f"Unsupported model: {model_name}")