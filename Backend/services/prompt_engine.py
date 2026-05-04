from Core.model_router import generate_response
from config import AVAILABLE_MODELS

async def generate_prompt(user_input: str, intent: dict, params: dict):

    meta_prompt = f"""
You are an expert prompt engineer.

Create a high-quality prompt that will instruct an AI model to generate content.

User request:
{user_input}

Content format: {intent['format']}
Purpose: {intent['purpose']}

Parameters:
Tone: {params['tone']}
Use emojis: {params['emojis']}
Target length: {params['length']} words

Write a detailed prompt that ensures high-quality output.
Only return the prompt.
"""

    # --- Fallback Mechanism ---
    for model in AVAILABLE_MODELS:
        try:
            print(f"Attempting to build meta-prompt with: {model.upper()}...")
            prompt = await generate_response(model, meta_prompt)
            
            if prompt:
                print(f"Meta-prompt successfully built by: {model.upper()}")
                return prompt
                
        except Exception as e:
            print(f"Meta-prompt failed with {model.upper()}: {e}")
            continue # Skip to the next model in the list

    # If the loop finishes and all models failed
    raise Exception("Critical Failure: All available models failed to generate the meta-prompt.")