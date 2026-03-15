# Backend - Promptiva API

This is the FastAPI-based REST API backend for Promptiva, handling authentication, content generation, and user data persistence.

---

## 📋 Quick Start

### Prerequisites
- Python 3.10+
- pip or conda

### Installation

1. **Navigate to Backend folder**
   ```bash
   cd Backend
   ```

2. **Create virtual environment (optional but recommended)**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   # Copy .env template and fill in your API keys
   # On Windows
   copy .env.example .env
   
   # On Mac/Linux
   cp .env.example .env
   ```
   
   Edit `.env` and add:
   ```
   GEMINI_API_KEY=your_gemini_key_here
   OPENROUTER_API_KEY=your_openrouter_key_here
   DATABASE_URL=sqlite:///./promptiva.db  # or postgresql://...
   SECRET_KEY=your_secret_key_here
   ```

5. **Start the server**
   ```bash
   python app.py
   # or
   uvicorn app:app --reload --port 8000
   ```

Server runs at: `http://localhost:8000`

---

## 📁 Project Structure

### Root Files

| File | Purpose |
|------|---------|
| `app.py` | FastAPI app initialization, database setup, router registration |
| `database.py` | SQLAlchemy engine, session factory, dependency injection |
| `models.py` | SQLAlchemy ORM models (User, Generation) |
| `auth.py` | JWT token utilities, password hashing functions |
| `config.py` | Configuration constants, environment variables |
| `requirements.txt` | Python dependencies |
| `.env` | Secrets and API keys (**NEVER commit this**) |
| `.gitignore` | Files to ignore in git |

### `/api` Directory - Route Handlers

```
api/
├── auth_routes.py    # Authentication endpoints
│   ├── POST /register
│   ├── POST /login
│   └── POST /verify
└── routes.py         # Content generation endpoints
    ├── POST /generate
    ├── GET /history
    └── GET /history/{id}
```

**auth_routes.py**
- `register()` - Create new user account
- `login()` - Authenticate and get JWT token
- `verify()` - Validate token legitimacy

**routes.py**
- `generate()` - Auto run 3 models, optional comparison
- `get_history()` - Get all generations for current user
- `get_generation()` - Get specific generation details

### `/Core` Directory - Business Logic

```
Core/
├── intent.py          # Detect user intent from prompt
├── inference.py       # Infer tone, audience, style
├── prompt_builder.py  # Enhance and refine prompts
├── model_router.py    # Route prompts to models
├── comparator.py      # Compare and score responses
└── response_store.py  # Serialize responses to JSON
```

**Key Functions:**
- `detect_intent()` - Analyzes prompt language
- `infer_parameters()` - Extracts style parameters
- `enhance_prompt()` - Creates optimized prompt
- `get_best_response()` - Selects winner
- `compare_responses()` - Detailed quality comparison

### `/services` Directory - Supporting Services

```
services/
├── prompt_engine.py      # Service to call models
├── comparison_engine.py  # Service to compare results
└── history_manager.py    # Service for history CRUD
```

---

## 🔐 Authentication System

### How It Works

1. **User registers** with email, username, password
2. **Password hashed** with Bcrypt (one-way, salted)
3. **User stored** in database
4. **On login**, credentials verified
5. **JWT token generated** with user info
6. **Token returned** to frontend
7. **Frontend adds token** to all requests
8. **Backend validates token** on protected routes

### Token Structure

```python
{
  "user_id": 123,
  "email": "user@example.com",
  "username": "newuser",
  "exp": 1705000000,  # Expiration time
  "iat": 1704000000   # Issued at time
}
```

### Protected Routes

All routes in `routes.py` require valid JWT token in header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 🤖 Content Generation Flow

### Step 1: Receive Request
```python
POST /api/generate
{
  "user_input": "Write a professional email",
  "compare": true
}
```

### Step 2: Validate User
```python
current_user = get_current_user(token)
# Extracts user_id from JWT token
```

### Step 3: Enhance Prompt
```python
intent = detect_intent(user_input)
tone = infer_tone(user_input)
enhanced_prompt = build_prompt(user_input, intent, tone)
```

### Step 4: Call Models (Concurrent)
```python
# All 3 at the same time!
gemini_response = await fetch_gemini(enhanced_prompt)
mistral_response = await fetch_mistral(enhanced_prompt)
llama_response = await fetch_llama(enhanced_prompt)
```

### Step 5: Select Winner
```python
if compare:
    winner = compare_responses(responses)
else:
    winner = responses[0]  # First available
```

### Step 6: Save to Database
```python
generation = Generation(
    user_id=current_user.id,
    prompt=user_input,
    model_responses=json.dumps(responses),
    winner_model=winner['model'],
    winner_response=winner['response']
)
db.add(generation)
db.commit()
```

### Step 7: Return Results
```json
{
  "id": 1,
  "responses": {
    "gemini": "...",
    "mistral": "...",
    "llama": "..."
  },
  "winner": {
    "model": "gemini",
    "response": "..."
  }
}
```

---

## 🗄️ Database Models

### User Model

```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    generations = relationship("Generation", back_populates="user")
```

### Generation Model

```python
class Generation(Base):
    __tablename__ = "generations"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    prompt = Column(String)
    model_responses = Column(String)  # JSON
    comparison = Column(String)  # JSON
    winner_model = Column(String)
    winner_response = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    user = relationship("User", back_populates="generations")
```

---

## 🔌 API Endpoints

### Authentication

**Register New User**
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "myusername",
  "password": "SecurePass123",
  "password_confirm": "SecurePass123"
}

Response 201:
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "myusername"
  }
}
```

**Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response 200:
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": { ... }
}
```

**Verify Token**
```
POST /api/auth/verify
Authorization: Bearer eyJhbGc...

Response 200:
{
  "valid": true,
  "user_id": 1
}
```

### Content Generation

**Generate Content (Auto-Compare)**
```
POST /api/generate
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "user_input": "Write a professional email",
  "compare": true
}

Response 200:
{
  "id": 1,
  "prompt": "Write a professional email",
  "responses": {
    "gemini": "...response...",
    "mistral": "...response...",
    "llama": "...response..."
  },
  "winner": {
    "model": "gemini",
    "response": "...best response..."
  },
  "comparison": {
    "scores": { "gemini": 9.2, "mistral": 8.8, "llama": 8.5 },
    "winner": "gemini"
  }
}
```

**Get All Generations**
```
GET /api/history
Authorization: Bearer eyJhbGc...

Response 200:
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

**Get Specific Generation**
```
GET /api/history/1
Authorization: Bearer eyJhbGc...

Response 200:
{
  "id": 1,
  "prompt": "...",
  "responses": { ... },
  "winner": { ... },
  "created_at": "2024-03-15T10:30:00"
}
```

---

## 🛠️ Configuration

### Environment Variables (`.env`)

```bash
# API Keys
GEMINI_API_KEY=AIzaSy...          # From Google Cloud Console
OPENROUTER_API_KEY=sk-or-v1-...   # From OpenRouter

# Database
DATABASE_URL=sqlite:///./promptiva.db

# JWT
SECRET_KEY=your_secret_key_12345   # Random string for token signing
ALGORITHM=HS256
TOKEN_EXPIRE_MINUTES=30

# CORS
FRONTEND_URL=http://localhost:5173

# Logging (optional)
LOG_LEVEL=INFO
```

### Models Definition

**From Google** (via GEMINI_API_KEY)
```
Model: "gemini-3-flash-preview"
Free tier: 15 requests per minute
```

**From OpenRouter** (via OPENROUTER_API_KEY)
```
Mistral: mistralai/mistral-small-3.1-24b-instruct:free
LLaMA: meta-llama/llama-3.3-70b-instruct:free
```

---

## 📊 Dependency Management

### Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | ^0.104.0 | Web framework |
| uvicorn | ^0.24.0 | ASGI server |
| sqlalchemy | ^2.0.0 | ORM |
| python-dotenv | ^1.0.0 | Environment config |
| python-jose | ^3.3.0 | JWT tokens |
| passlib | ^1.7.4 | Password hashing |
| bcrypt | ^4.1.0 | Bcrypt algorithm |
| httpx | ^0.25.0 | Async HTTP client |
| pydantic | ^2.5.0 | Data validation |

### Update Dependencies

```bash
# Check for outdated packages
pip list --outdated

# Upgrade a package
pip install --upgrade package_name

# Regenerate requirements.txt
pip freeze > requirements.txt
```

---

## 🧪 Testing (Manual)

### Test Routes with cURL or Postman

**Test 1: Register**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test123456",
    "password_confirm": "Test123456"
  }'
```

**Test 2: Login**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

**Test 3: Generate Content**
```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "user_input": "Write a professional email",
    "compare": true
  }'
```

---

## 🚀 Deployment

### Deploy to Railway/Render

1. **Prepare for production** (see PRODUCTION_CHECKLIST.md)
2. **Switch to PostgreSQL** (see POSTGRESQL_MIGRATION.md)
3. **Push to GitHub**
4. **Connect to deployment platform**
5. **Set environment variables** on platform
6. **Deploy and monitor**

### Environment Variables for Production

```
BACKEND_URL=https://api.yourapp.com
DATABASE_URL=postgresql://user:pass@host:5432/dbname
FRONTEND_URL=https://yourapp.com
SECRET_KEY=generate_new_secret_key
CORS_ENABLED=true
LOG_LEVEL=ERROR
```

---

## 📚 Additional Documentation

- [ARCHITECTURE.md](../ARCHITECTURE.md) - System architecture
- [PRODUCTION_CHECKLIST.md](../PRODUCTION_CHECKLIST.md) - Production readiness
- [POSTGRESQL_MIGRATION.md](../POSTGRESQL_MIGRATION.md) - Database migration
- [api/auth_routes.py](./api/auth_routes.py) - Authentication endpoints code
- [api/routes.py](./api/routes.py) - Generation endpoints code

---

## 🐛 Troubleshooting

### Server won't start
```
Error: Address already in use
Solution: Change port with uvicorn app:app --port 8001
```

### Database errors
```
Error: database locked
Solution: Delete promptiva.db and restart (starts fresh)
```

### JWT token errors
```
Error: Invalid token
Solution: Regenerate SECRET_KEY in .env
```

### API rate limiting
```
Error: 429 Too Many Requests
Solution: Wait or upgrade API plan (Gemini, OpenRouter)
```

---

## 📝 Notes

- All responses are in JSON format
- Timestamps are in ISO 8601 format
- Errors include detailed error messages
- HTTPS should be enabled in production
- Database backups recommended for production

---

**Status**: ✅ Production Ready (with PostgreSQL setup)  
**Last Updated**: March 2024
