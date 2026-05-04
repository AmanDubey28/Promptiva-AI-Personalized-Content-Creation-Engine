# Backend Core - Business Logic

This directory contains the core AI/ML business logic for Promptiva. These modules handle intent detection, prompt optimization, model routing, and response comparison.

---

## 📋 Modules Overview

### `intent.py` - Intent Detection

**Purpose:** Analyze user intent from the input prompt

**Main Functions:**
- `detect_intent(prompt: str) -> str`
  - Analyzes prompt text
  - Returns intent category: "creative", "technical", "professional", "educational", etc.
  - Used to customize prompt enhancement

**Example:**
```python
intent = detect_intent("Write a funny poem about cats")
# Returns: "creative"

intent = detect_intent("Fix my SQL query")
# Returns: "technical"
```

**Use Cases:**
- Customize tone based on intent
- Select appropriate model
- Adjust comparison criteria

---

### `inference.py` - Parameter Inference

**Purpose:** Extract implicit parameters from user input

**Main Functions:**
- `infer_tone(prompt: str) -> str`
  - Detects desired tone: "formal", "casual", "professional", "humorous"
  
- `infer_audience(prompt: str) -> str`
  - Detects target audience: "general", "technical", "children", "expert"
  
- `infer_style(prompt: str) -> str`
  - Detects style preference: "concise", "detailed", "poetic", "technical"
  
- `infer_parameters(prompt: str) -> dict`
  - Returns all inferred parameters
  ```python
  {
    "tone": "professional",
    "audience": "technical",
    "style": "detailed",
    "length": "medium"
  }
  ```

**Example:**
```python
params = infer_parameters("Write a funny email to my boss")
# Returns: {
#   "tone": "humorous",
#   "audience": "professional",
#   "style": "casual",
#   "length": "short"
# }
```

---

### `prompt_builder.py` - Prompt Enhancement

**Purpose:** Transform user prompt into optimized prompt for AI models

**Main Functions:**
- `build_prompt(user_input: str, intent: str, params: dict) -> str`
  - Creates enhanced prompt with context
  - Includes tone, audience, style information
  - Adds relevant instructions for models
  
**Example:**
```python
enhanced = build_prompt(
  "Write an email",
  "professional",
  {"tone": "formal", "audience": "manager"}
)

# Returns something like:
# "You are a professional email writer.
#  Write an email with a formal tone for a manager.
#  The email should be clear, concise, and professional.
#  User request: Write an email"
```

**Why This Matters:**
- Better quality responses from models
- Consistent results across models
- Clear expectations for AI models

---

### `model_router.py` - Model Routing & Execution

**Purpose:** Route prompts to appropriate AI models and handle API calls

**Main Functions:**
- `get_available_models() -> list`
  - Returns: ["gemini", "mistral", "llama"]
  
- `fetch_gemini_response(prompt: str) -> str`
  - Calls Google Gemini API
  - Returns generated text
  
- `fetch_mistral_response(prompt: str) -> str`
  - Calls Mistral via OpenRouter
  - Returns generated text
  
- `fetch_llama_response(prompt: str) -> str`
  - Calls LLaMA via OpenRouter
  - Returns generated text

**Configuration:**
```python
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

MODELS = {
    "gemini": {
        "name": "gemini-3-flash-preview",
        "api": "google"
    },
    "mistral": {
        "name": "mistralai/mistral-small-3.1-24b-instruct:free",
        "api": "openrouter"
    },
    "llama": {
        "name": "meta-llama/llama-3.3-70b-instruct:free",
        "api": "openrouter"
    }
}
```

---

### `comparator.py` - Response Comparison

**Purpose:** Evaluate and compare AI model responses to select the best one

**Main Functions:**
- `compare_responses(responses: dict, criteria: str = "quality") -> dict`
  - Compares all model responses
  - Returns winner with scores
  
  **Returns:**
  ```python
  {
    "winner": "gemini",
    "scores": {
      "gemini": 9.2,
      "mistral": 8.8,
      "llama": 8.5
    },
    "reasoning": "Gemini provided the most professional and complete response..."
  }
  ```

- `calculate_quality_score(response: str, criteria: dict) -> float`
  - Evaluates single response
  - Returns score 1-10
  
  **Scoring Factors:**
  - Relevance to prompt (30%)
  - Grammar & clarity (25%)
  - Completeness (20%)
  - Tone match (15%)
  - Length appropriateness (10%)

**Comparison Metrics:**
```python
{
  "quality": 8.5,           # Overall quality (1-10)
  "relevance": 9.0,         # How well answers the question
  "clarity": 8.2,           # Grammatical correctness
  "completeness": 8.8,      # Covers all aspects
  "tone_match": 8.0,        # Matches requested tone
  "length": 7.5             # Appropriate length
}
```

---

### `response_store.py` - Response Serialization

**Purpose:** Convert response objects to JSON-storable format

**Main Functions:**
- `serialize_response(response: str, model: str) -> dict`
  - Converts model response to standard format
  
  **Returns:**
  ```python
  {
    "model": "gemini",
    "response": "Generated text...",
    "length": 250,
    "timestamp": "2024-03-15T10:30:00"
  }
  ```

- `serialize_responses(responses_dict: dict) -> str`
  - Converts all responses to JSON
  - Used for database storage

- `deserialize_responses(json_str: str) -> dict`
  - Converts JSON back to dict
  - Used when reading from database

**Database Storage:**
```python
# In database (JSON string)
"model_responses": "{
  \"gemini\": \"Generated text...\",
  \"mistral\": \"Generated text...\",
  \"llama\": \"Generated text...\"
}"

# In memory (Python dict)
model_responses = {
  "gemini": "Generated text...",
  "mistral": "Generated text...",
  "llama": "Generated text..."
}
```

---

## 🔄 Module Interaction Flow

```
User Input (prompt)
    ↓
intent.py: detect_intent()
    ↓
inference.py: infer_parameters()
    ↓
prompt_builder.py: build_prompt()
    ↓
model_router.py: fetch_*_response() [All 3 concurrent]
    │
    ├─ fetch_gemini_response()
    ├─ fetch_mistral_response()
    └─ fetch_llama_response()
    ↓
Gather all responses
    ↓
response_store.py: serialize_responses()
    ↓
comparator.py: compare_responses() [If enabled]
    ↓
Final Response {
  "responses": {...},
  "winner": {...},
  "comparison": {...}
}
```

---

## 💻 Code Examples

### Example 1: Using Individual Modules

```python
from Core.intent import detect_intent
from Core.inference import infer_parameters
from Core.prompt_builder import build_prompt
from Core.model_router import fetch_gemini_response
from Core.comparator import compare_responses

# User input
user_input = "Write a professional email to a client"

# 1. Detect intent
intent = detect_intent(user_input)
# "professional"

# 2. Infer parameters
params = infer_parameters(user_input)
# {"tone": "formal", "audience": "business", "style": "concise"}

# 3. Build enhanced prompt
enhanced_prompt = build_prompt(user_input, intent, params)
# "You are a professional business email writer..."

# 4. Get response from Gemini
response = fetch_gemini_response(enhanced_prompt)
# "Dear Client, I hope this email finds you well..."

# 5. Compare with other models (if needed)
all_responses = {
  "gemini": response,
  "mistral": fetch_mistral_response(enhanced_prompt),
  "llama": fetch_llama_response(enhanced_prompt)
}

comparison = compare_responses(all_responses)
# {"winner": "gemini", "scores": {...}}
```

### Example 2: Used in API Route

```python
# In api/routes.py
@router.post("/generate")
async def generate_content(
    request: GenerationRequest,
    current_user: User = Depends(get_current_user)
):
    # Import all modules
    from Core.intent import detect_intent
    from Core.inference import infer_parameters
    from Core.prompt_builder import build_prompt
    from Core.model_router import (
        fetch_gemini_response,
        fetch_mistral_response,
        fetch_llama_response
    )
    from Core.comparator import compare_responses
    
    # Process
    intent = detect_intent(request.user_input)
    params = infer_parameters(request.user_input)
    enhanced = build_prompt(request.user_input, intent, params)
    
    # Concurrent execution
    responses = await asyncio.gather(
        fetch_gemini_response(enhanced),
        fetch_mistral_response(enhanced),
        fetch_llama_response(enhanced)
    )
    
    response_dict = {
        "gemini": responses[0],
        "mistral": responses[1],
        "llama": responses[2]
    }
    
    # Compare if needed
    if request.compare:
        comparison = compare_responses(response_dict)
        winner = comparison["winner"]
    else:
        winner = "gemini"  # Default
    
    # Save and return
    # ...
```

---

## 🧪 Testing Core Modules

### Test Intent Detection

```python
def test_intent_detection():
    assert detect_intent("Write a funny poem") == "creative"
    assert detect_intent("Debug my code") == "technical"
    assert detect_intent("Write a letter") == "professional"
    print("✓ Intent detection working")
```

### Test Parameter Inference

```python
def test_parameter_inference():
    params = infer_parameters("Write a casual email to a friend")
    assert params["tone"] == "casual"
    assert params["audience"] == "informal"
    print("✓ Parameter inference working")
```

### Test Prompt Building

```python
def test_prompt_building():
    enhanced = build_prompt(
        "Write an email",
        "professional",
        {"tone": "formal"}
    )
    assert "professional" in enhanced.lower()
    assert "email" in enhanced.lower()
    print("✓ Prompt building working")
```

---

## ⚙️ Configuration

### API Keys Required

```python
# In .env file
GEMINI_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
```

### Model Parameters

```python
# In model_router.py
TEMPERATURE = 0.7          # Creativity (0-1)
MAX_TOKENS = 2000          # Response length
TOP_P = 0.95               # Diversity
TOP_K = 40                 # Token filtering
```

---

## 🚀 Performance Optimization

### Concurrent Execution

All 3 models run simultaneously (not sequentially):
```python
# Bad (Sequential - takes 15 seconds total)
gemini_resp = await fetch_gemini_response(prompt)      # 5s
mistral_resp = await fetch_mistral_response(prompt)    # 5s
llama_resp = await fetch_llama_response(prompt)        # 5s

# Good (Concurrent - takes ~5 seconds total)
responses = await asyncio.gather(
    fetch_gemini_response(prompt),
    fetch_mistral_response(prompt),
    fetch_llama_response(prompt)
)
```

### Caching (Future)

```python
# Cache enhanced prompts to avoid re-computation
@cache.cached(timeout=3600)
def build_prompt(user_input, intent, params):
    # This result will be reused for 1 hour
    pass
```

---

## 📚 Related Documentation

- [Backend README](../README.md) - Backend overview
- [API README](../api/README.md) - API routes
- [Services README](../services/README.md) - Supporting services
- [ARCHITECTURE.md](../../ARCHITECTURE.md) - System architecture

---

**Last Updated**: March 2024  
**Status**: ✅ Production Ready
