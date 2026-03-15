import asyncio
from fastapi import APIRouter, HTTPException, Depends, Header, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from Core.intent import detect_intent
from Core.inference import infer_parameters
from services.prompt_engine import generate_prompt
from Core.model_router import generate_response
from services.comparison_engine import compare_responses
from services.history_manager import save_history
from database import get_db
from models import User, Generation
from auth import decode_access_token
from config import AVAILABLE_MODELS

router = APIRouter(prefix="/api", tags=["generation"])


class GenerateRequest(BaseModel):
    user_input: str
    compare: bool = False


class HistoryResponse(BaseModel):
    id: int
    prompt: str
    model_responses: dict
    comparison: Optional[dict]
    winner_model: Optional[str]
    winner_response: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from token"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme"
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header"
        )
    
    token_data = decode_access_token(token)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user


@router.post("/generate")
async def generate(
    request: GenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate content using all available models and optionally compare them"""
    try:
        # 1. Sync operations
        intent = detect_intent(request.user_input)
        params = infer_parameters(intent, request.user_input)

        # 2. Async Meta-Prompt Generation
        final_prompt = await generate_prompt(request.user_input, intent, params)

        # 3. Parallel Async Model Execution - Run ALL models
        async def fetch_model_response(model: str):
            try:
                result = await generate_response(model, final_prompt)
                return model, result
            except Exception as e:
                print(f"Model {model} failed:", e)
                return model, {"status": "error", "message": str(e)}

        # Run all model requests concurrently
        tasks = [fetch_model_response(model) for model in AVAILABLE_MODELS]
        results = await asyncio.gather(*tasks)
        
        # Convert list of tuples back into a dictionary
        responses = dict(results)

        # 4. Handle comparison - either auto-select winner or compare all responses
        winner_model = None
        winner_response = None
        comparison = None
        valid_responses = {k: v for k, v in responses.items() if not isinstance(v, dict) or "error" not in v}
        
        if len(valid_responses) > 0:
            if request.compare and len(valid_responses) > 1:
                # Do full comparison
                comparison = await compare_responses(valid_responses)
                winner_model = comparison.get("winner")
                winner_response = valid_responses.get(winner_model)
            elif len(valid_responses) == 1:
                # Only one valid response
                winner_model = list(valid_responses.keys())[0]
                winner_response = valid_responses[winner_model]
            else:
                # Multiple responses but not comparing - select the first available
                winner_model = list(valid_responses.keys())[0]
                winner_response = valid_responses[winner_model]

        # 5. Save to database
        generation = Generation(
            user_id=current_user.id,
            prompt=request.user_input,
            model_responses=responses,
            comparison=comparison,
            winner_model=winner_model,
            winner_response=str(winner_response) if winner_response else None
        )
        db.add(generation)
        db.commit()
        db.refresh(generation)

        return {
            "id": generation.id,
            "responses": responses,
            "comparison": comparison,
            "winner": {
                "model": winner_model,
                "response": winner_response
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's generation history"""
    generations = db.query(Generation).filter(
        Generation.user_id == current_user.id
    ).order_by(Generation.created_at.desc()).all()
    
    return [
        {
            "id": g.id,
            "prompt": g.prompt,
            "model_responses": g.model_responses,
            "comparison": g.comparison,
            "winner_model": g.winner_model,
            "winner_response": g.winner_response,
            "created_at": g.created_at.isoformat()
        }
        for g in generations
    ]


@router.get("/history/{generation_id}")
async def get_generation(
    generation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific generation"""
    generation = db.query(Generation).filter(
        (Generation.id == generation_id) & (Generation.user_id == current_user.id)
    ).first()
    
    if not generation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Generation not found"
        )
    
    return {
        "id": generation.id,
        "prompt": generation.prompt,
        "model_responses": generation.model_responses,
        "comparison": generation.comparison,
        "winner_model": generation.winner_model,
        "winner_response": generation.winner_response,
        "created_at": generation.created_at.isoformat()
    }
