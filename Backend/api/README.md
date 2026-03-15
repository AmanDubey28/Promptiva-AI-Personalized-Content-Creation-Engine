# Backend API Routes

This directory contains all REST API route handlers for Promptiva.

---

## 📋 Files Overview

### `auth_routes.py` - Authentication Endpoints

Handles user registration, login, and token verification.

**Endpoints:**

1. **POST `/api/auth/register`**
   - Create new user account
   - Validates email uniqueness, password strength
   - Returns JWT token on success
   - Returns: `{access_token, token_type, user}`

2. **POST `/api/auth/login`**
   - Authenticate user with credentials
   - Validates email exists and password correct
   - Returns JWT token
   - Returns: `{access_token, token_type, user}`

3. **POST `/api/auth/verify`**
   - Verify JWT token validity
   - Protected route (requires token)
   - Returns: `{valid: bool, user_id: int}`

**Request Models:**
```python
class UserRegister(BaseModel):
    email: str          # Must be valid email format
    username: str       # 3-50 characters
    password: str       # Min 6 characters
    password_confirm: str  # Must match password

class UserLogin(BaseModel):
    email: str
    password: str
```

**Response Models:**
```python
class Token(BaseModel):
    access_token: str
    token_type: str    # Always "bearer"
    user: dict

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
```

---

### `routes.py` - Generation Endpoints

Handles content generation, model execution, and history management.

**Endpoints:**

1. **POST `/api/generate`**
   - Generate content using multiple models
   - Auto-runs all 3 models concurrently (Gemini, Mistral, LLaMA)
   - Optional comparison of responses
   - Saves to database
   - Protected route (requires JWT token)
   
   **Request:**
   ```json
   {
     "user_input": "Write a professional email",
     "compare": true
   }
   ```
   
   **Response:**
   ```json
   {
     "id": 1,
     "prompt": "Write a professional email",
     "responses": {
       "gemini": "Dear...",
       "mistral": "Hello...",
       "llama": "Hi..."
     },
     "winner": {
       "model": "gemini",
       "response": "Dear..."
     },
     "comparison": {
       "scores": { "gemini": 9.2, "mistral": 8.8, "llama": 8.5 },
       "winner": "gemini"
     },
     "created_at": "2024-03-15T10:30:00"
   }
   ```

2. **GET `/api/history`**
   - Retrieve all generations for current user
   - Sorted by creation date (newest first)
   - Protected route (requires JWT token)
   
   **Response:**
   ```json
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

3. **GET `/api/history/{id}`**
   - Retrieve specific generation details
   - Includes all model responses
   - Protected route (requires JWT token)
   
   **Response:**
   ```json
   {
     "id": 1,
     "prompt": "...",
     "responses": { "gemini": "...", ... },
     "winner": { "model": "gemini", "response": "..." },
     "comparison": { ... },
     "created_at": "2024-03-15T10:30:00"
   }
   ```

**Request Models:**
```python
class GenerationRequest(BaseModel):
    user_input: str      # The user's prompt
    compare: bool = True # Enable comparison

class GenerationResponse(BaseModel):
    id: int
    prompt: str
    responses: dict
    winner: dict
    comparison: dict
    created_at: str
```

---

## 🔐 Protected Routes

All routes in this module require authentication:

```python
# In routes.py
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    # Validates JWT token
    # Extracts user_id
    # Returns User from database
    # Raises HTTPException if invalid
```

**Adding Authorization Header:**

```bash
# Using curl
curl -X GET http://localhost:8000/api/history \
  -H "Authorization: Bearer eyJhbGc..."

# Using JavaScript
fetch('http://localhost:8000/api/history', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## 🤖 Model Execution Details

### Concurrent Execution

```python
async def generate_content(user_input: str):
    # Create tasks for all models
    tasks = [
        fetch_model_response("gemini", enhanced_prompt),
        fetch_model_response("mistral", enhanced_prompt),
        fetch_model_response("llama", enhanced_prompt)
    ]
    
    # Run all at the same time
    responses = await asyncio.gather(*tasks)
    
    # Returns [gemini_response, mistral_response, llama_response]
```

### Response Structure

```python
responses = {
    "gemini": "Generated text from Gemini...",
    "mistral": "Generated text from Mistral...",
    "llama": "Generated text from LLaMA..."
}
```

### Winner Selection

**If compare=true:**
- Calls comparison engine
- Evaluates quality metrics
- Selects best response

**If compare=false:**
- Takes first available response
- Faster response time

---

## 📊 Error Handling

All endpoints use consistent error responses:

```json
{
  "detail": "Error message description"
}
```

**Common Errors:**

| Code | Message | Cause |
|------|---------|-------|
| 401 | Not authenticated | Missing/invalid token |
| 404 | User not found | Token user doesn't exist |
| 422 | Validation error | Invalid request format |
| 500 | Internal server error | Unexpected error |

---

## 🗄️ Database Operations

### Creating Generation Record

```python
generation = Generation(
    user_id=current_user.id,
    prompt=user_input,
    model_responses=json.dumps(responses),
    winner_model=winner["model"],
    winner_response=winner["response"],
    comparison=json.dumps(comparison) if compare else None
)
db.add(generation)
db.commit()
db.refresh(generation)  # Get the ID
```

### Retrieving Generations

```python
# Get all user generations
generations = db.query(Generation).filter(
    Generation.user_id == user_id
).order_by(Generation.created_at.desc()).all()

# Get specific generation
generation = db.query(Generation).filter(
    Generation.id == generation_id,
    Generation.user_id == user_id  # Verify ownership
).first()
```

---

## 🚀 Performance Considerations

1. **Concurrent Execution** - All 3 models run simultaneously
   - Total time ≈ time of slowest model (~2-5 seconds)
   
2. **Database Indexing** - Queries optimized with indexes
   - `user_id` indexed for fast filtering
   - `created_at` indexed for sorting
   
3. **JSON Storage** - Responses stored as JSON
   - Flexible schema for different response formats
   - Can add metadata without schema changes

---

## 📝 Usage Examples

### Example 1: Complete Flow

```bash
# 1. Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "myusername",
    "password": "SecurePass123",
    "password_confirm": "SecurePass123"
  }'

# Response contains: access_token

# 2. Generate Content
curl -X POST http://localhost:8000/api/generate \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "user_input": "Write a professional email",
    "compare": true
  }'

# 3. Get History
curl -X GET http://localhost:8000/api/history \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 🔌 Integration with Core Modules

**Routes → Core/Services**

```
POST /generate
  ↓
get_current_user() [auth.py]
  ↓
detect_intent() [Core/intent.py]
  ↓
infer_parameters() [Core/inference.py]
  ↓
build_prompt() [Core/prompt_builder.py]
  ↓
fetch_model_response() [Core/model_router.py]
  ↓
compare_responses() [Core/comparator.py]
  ↓
Generation.create() [models.py]
  ↓
return response
```

---

## 🧪 Testing

### Manual Testing with Postman

1. Create collection "Promptiva API"
2. Add requests:
   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/generate
   - GET /api/history
   - GET /api/history/{{generation_id}}

3. Set variables:
   - base_url = http://localhost:8000
   - token = (from login response)

---

## 📚 Related Documentation

- [Backend README](../README.md) - Backend overview
- [Core README](../Core/README.md) - Business logic
- [ARCHITECTURE.md](../../ARCHITECTURE.md) - System architecture

---

**Last Updated**: March 2024
