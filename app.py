from fastapi import FastAPI
from pydantic import BaseModel
from Core.intent import detect_intent
from Core.inference import infer_parameters
from Core.prompt_builder import build_prompt
from Core.model_router import generate_response

app = FastAPI()

class GenerateRequest(BaseModel):
    model: str
    user_input: str

@app.post("/generate")
def generate(request: GenerateRequest):

    intent = detect_intent(request.user_input)
    params = infer_parameters(intent, request.user_input)
    final_prompt = build_prompt(request.user_input, intent, params)

    response = generate_response(request.model, final_prompt)

    return {
        "model": request.model,
        "response": response
    }