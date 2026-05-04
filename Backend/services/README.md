# Backend Services - Supporting Services

This directory contains high-level service modules that orchestrate operations across multiple layers. Services abstract complex operations into simple, reusable functions.

---

## 📋 Services Overview

### `prompt_engine.py` - Prompt Generation Service

**Purpose:** Orchestrate entire prompt enhancement pipeline

**Main Functions:**
- `generate_enhanced_prompt(user_input: str) -> str`
  - Combines intent detection, parameter inference, and prompt building
  - Single entry point for prompt enhancement
  
  **Process:**
  ```
  user_input
    ↓
  detect_intent()
    ↓
  infer_parameters()
    ↓
  build_prompt()
    ↓
  enhanced_prompt
  ```

- `generate_model_responses(enhanced_prompt: str) -> dict`
  - Calls all 3 models concurrently
  - Handles API errors gracefully
  
  **Returns:**
  ```python
  {
    "gemini": "Response from Gemini...",
    "mistral": "Response from Mistral...",
    "llama": "Response from LLaMA..."
  }
  ```

- `process_generation_request(user_input: str, compare: bool) -> dict`
  - Complete end-to-end processing
  - Handles exceptions, retries
  
  **Returns:**
  ```python
  {
    "prompt": "...",
    "responses": { ... },
    "winner": { "model": "...", "response": "..." },
    "comparison": { ... }
  }
  ```

**Error Handling:**
```python
# Gracefully handles API failures
if gemini_fails:
    use_fallback_response()

if all_models_fail:
    return error_response()
```

**Usage:**
```python
from services.prompt_engine import process_generation_request

result = await process_generation_request(
  user_input="Write a professional email",
  compare=True
)

print(result["winner"]["response"])
```

---

### `comparison_engine.py` - Response Comparison Service

**Purpose:** Evaluate and rank model responses

**Main Functions:**
- `run_comparison(responses: dict, context: dict) -> dict`
  - Complete comparison analysis
  - Takes into account user context
  
  **Returns:**
  ```python
  {
    "winner": "gemini",
    "scores": {
      "gemini": 9.2,
      "mistral": 8.8,
      "llama": 8.1
    },
    "metrics": {
      "gemini": {
        "quality": 9.2,
        "relevance": 9.0,
        "clarity": 9.5,
        "tone_match": 9.0
      },
      ...
    },
    "reasoning": "..."
  }
  ```

- `quick_compare(responses: dict) -> dict`
  - Fast comparison without detailed analysis
  - Uses heuristics instead of full evaluation
  
  **Returns:**
  ```python
  {
    "winner": "gemini",
    "reason": "Longest response"  # Simple heuristic
  }
  ```

- `detailed_compare(responses: dict) -> dict`
  - Thorough analysis with multiple factors
  - Used for critical decisions
  
  **Factors Analyzed:**
  - Response length
  - Sentence structure
  - Word choice complexity
  - Tone analysis
  - Grammar score
  - Relevance to prompt

**Usage:**
```python
from services.comparison_engine import run_comparison

comparison = run_comparison(
  responses={
    "gemini": "...",
    "mistral": "...",
    "llama": "..."
  },
  context={
    "intent": "professional",
    "tone": "formal"
  }
)

best_model = comparison["winner"]  # "gemini"
```

---

### `history_manager.py` - History Management Service

**Purpose:** Handle all history-related operations

**Main Functions:**
- `save_generation(user_id: int, generation_data: dict) -> int`
  - Save new generation to database
  - Returns generation ID
  
  **Input:**
  ```python
  {
    "prompt": "...",
    "responses": { ... },
    "winner": { ... },
    "comparison": { ... }
  }
  ```

- `get_user_history(user_id: int, limit: int = 50, offset: int = 0) -> list`
  - Retrieve user's generations with pagination
  
  **Returns:**
  ```python
  [
    {
      "id": 1,
      "prompt": "...",
      "winner": "gemini",
      "created_at": "2024-03-15T10:30:00"
    },
    ...
  ]
  ```

- `get_generation(generation_id: int, user_id: int) -> dict`
  - Get full details of specific generation
  - Verifies user ownership
  
  **Returns:**
  ```python
  {
    "id": 1,
    "prompt": "...",
    "responses": { ... },
    "winner": { ... },
    "comparison": { ... },
    "created_at": "2024-03-15T10:30:00"
  }
  ```

- `delete_generation(generation_id: int, user_id: int) -> bool`
  - Delete specific generation
  - Verifies user ownership

- `clear_user_history(user_id: int) -> int`
  - Delete all user generations
  - Returns number of deleted records

- `search_history(user_id: int, query: str) -> list`
  - Search user's history by prompt keywords
  
  **Returns:** List of matching generations

- `get_statistics(user_id: int) -> dict`
  - Get user's usage statistics
  
  **Returns:**
  ```python
  {
    "total_generations": 42,
    "favorite_model": "gemini",
    "avg_comparisons": 0.95,
    "total_tokens_used": 50000,
    "first_generation": "2024-01-01T00:00:00",
    "last_generation": "2024-03-15T10:30:00"
  }
  ```

**Usage:**
```python
from services.history_manager import (
  save_generation,
  get_user_history,
  get_generation
)

# Save result
gen_id = save_generation(
  user_id=1,
  generation_data={...}
)

# Retrieve history
history = get_user_history(user_id=1, limit=10)

# Get specific generation
gen = get_generation(generation_id=1, user_id=1)
```

---

## 🔄 Service Layer Architecture

```
API Routes
    ↓
Services
├─ prompt_engine.py
├─ comparison_engine.py
└─ history_manager.py
    ↓
Core Modules
├─ intent.py
├─ inference.py
├─ prompt_builder.py
├─ model_router.py
└─ comparator.py
    ↓
Database & APIs
```

**Service Benefits:**
- Encapsulates complex logic
- Single responsibility principle
- Easy to test
- Reusable across routes
- Clear dependencies

---

## 💻 Integration Example

```python
# In api/routes.py
from services.prompt_engine import process_generation_request
from services.history_manager import (
  save_generation,
  get_user_history
)

@router.post("/generate")
async def generate_content(
    request: GenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Process request using service
    result = await process_generation_request(
        request.user_input,
        request.compare
    )
    
    # 2. Save using service
    gen_id = save_generation(
        current_user.id,
        result,
        db
    )
    
    # 3. Return result
    return result

@router.get("/history")
async def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Use service to retrieve
    history = get_user_history(
        current_user.id,
        limit=50,
        db=db
    )
    
    return history
```

---

## 🧪 Testing Services

### Test Prompt Engine

```python
def test_prompt_engine():
    result = process_generation_request(
        "Write an email",
        compare=True
    )
    
    assert "prompt" in result
    assert "responses" in result
    assert "winner" in result
    assert result["winner"]["model"] in ["gemini", "mistral", "llama"]
    print("✓ Prompt engine working")
```

### Test Comparison Engine

```python
def test_comparison():
    comparison = run_comparison({
        "gemini": "This is a response",
        "mistral": "This is another response",
        "llama": "Third response"
    })
    
    assert "winner" in comparison
    assert "scores" in comparison
    assert len(comparison["scores"]) == 3
    print("✓ Comparison engine working")
```

### Test History Manager

```python
def test_history_manager():
    # Save
    gen_id = save_generation(user_id=1, data={...})
    assert gen_id is not None
    
    # Retrieve
    gen = get_generation(gen_id, user_id=1)
    assert gen["id"] == gen_id
    
    # Delete
    deleted = delete_generation(gen_id, user_id=1)
    assert deleted is True
    
    print("✓ History manager working")
```

---

## 📊 Service Dependencies

| Service | Depends On | Used By |
|---------|-----------|---------|
| prompt_engine.py | Core/* | routes.py |
| comparison_engine.py | Core/comparator.py | prompt_engine.py |
| history_manager.py | models.py, database.py | routes.py |

---

## ⚙️ Configuration

### Service Configuration

```python
# In Backend/config.py
SERVICE_CONFIG = {
    "prompt_engine": {
        "cache_enabled": True,
        "cache_timeout": 3600,
        "retry_attempts": 3
    },
    "comparison_engine": {
        "comparison_mode": "detailed",  # quick, standard, detailed
        "weights": {
            "quality": 0.3,
            "relevance": 0.3,
            "clarity": 0.2,
            "tone": 0.2
        }
    },
    "history_manager": {
        "max_history_items": 1000,
        "pagination_size": 50,
        "retention_days": 365
    }
}
```

---

## 🚀 Performance Tips

### 1. Use Caching
```python
from functools import lru_cache

@lru_cache(maxsize=128)
def get_user_history(user_id: int):
    # Result cached for 1 hour
    pass
```

### 2. Batch Operations
```python
# Bad: Save each item separately
for item in items:
    save_generation(item)

# Good: Save all at once
save_generations_batch(items)
```

### 3. Async Operations
```python
# All API calls happen concurrently
responses = await asyncio.gather(
    fetch_gemini_response(prompt),
    fetch_mistral_response(prompt),
    fetch_llama_response(prompt)
)
```

---

## 🔐 Security Considerations

### User Ownership Verification

```python
# Always verify user owns the resource
def get_generation(generation_id: int, user_id: int):
    generation = db.query(Generation).filter(
        Generation.id == generation_id,
        Generation.user_id == user_id  # Ensure ownership!
    ).first()
```

### Input Validation

```python
# Validate inputs before processing
def save_generation(user_id: int, data: dict):
    assert user_id > 0
    assert "prompt" in data
    assert "responses" in data
    # ... proceed
```

---

## 📚 Related Documentation

- [Backend README](../README.md) - Backend overview
- [Core README](../Core/README.md) - Core business logic
- [API README](../api/README.md) - API routes
- [ARCHITECTURE.md](../../ARCHITECTURE.md) - System architecture

---

**Last Updated**: March 2024  
**Status**: ✅ Production Ready
