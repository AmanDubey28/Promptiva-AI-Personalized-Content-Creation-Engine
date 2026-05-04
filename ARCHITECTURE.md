# 🏗️ Promptiva Architecture Documentation

## System Overview

Promptiva is a full-stack, production-ready AI content creation engine with:
- **Frontend**: React 19 with React Router for client-side routing
- **Backend**: FastAPI with async/concurrent operations
- **Database**: SQLite (dev) / PostgreSQL (production)
- **Authentication**: JWT tokens with Bcrypt hashing
- **AI Integration**: 3 concurrent LLM models (Gemini, Mistral, LLaMA)

---

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Login      │  │  Register    │  │    Home      │          │
│  │   Pages      │  │   Pages      │  │   (Main)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            │                                    │
│         ┌──────────────────┴──────────────────┐                │
│         │   React Router Protected Routes     │                │
│         │   + Auth Interceptors               │                │
│         └──────────────────┬──────────────────┘                │
└─────────────────────────────┼──────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   AXIOS HTTP      │
                    │   (with Bearer    │
                    │    token)         │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────┼──────────────────────────────────┐
│                    API GATEWAY LAYER                           │
│  (FastAPI - Port 8000)                                        │
│                              │                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              CORS Middleware                            │ │
│  │              Error Handling Middleware                  │ │
│  └──────────────────┬───────────────────────────────────────┘ │
│                     │                                          │
│  ┌──────────────────▼───────────────────────────────────────┐ │
│  │          Route Layer (/api/auth, /api)                  │ │
│  └──────────────────┬───────────────────────────────────────┘ │
└─────────────────────┼──────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   ┌────▼────┐  ┌────▼────┐  ┌────▼────┐
   │ AUTH    │  │ CORE    │  │ DATA    │
   │ROUTES   │  │ LOGIC   │  │ROUTES   │
   └────┬────┘  └────┬────┘  └────┬────┘
        │             │             │
   ┌────▼─────────────▼─────────────▼────┐
   │    Business Logic Layer              │
   │  ┌─────────────────────────────────┐ │
   │  │ Auth Module                    │ │
   │  │ - JWT creation/validation      │ │
   │  │ - Password hashing             │ │
   │  └─────────────────────────────────┘ │
   │  ┌─────────────────────────────────┐ │
   │  │ Generation Module              │ │
   │  │ - Intent detection             │ │
   │  │ - Prompt enhancement           │ │
   │  │ - Concurrent model execution   │ │
   │  │ - Response comparison          │ │
   │  └─────────────────────────────────┘ │
   │  ┌─────────────────────────────────┐ │
   │  │ History Module                 │ │
   │  │ - Data persistence             │ │
   │  │ - Query operations             │ │
   │  └─────────────────────────────────┘ │
   └────┬──────────────────────────────────┘
        │
   ┌────▼──────────────────────────────────┐
   │    Data Layer (SQLAlchemy ORM)        │
   │  ┌──────────────────────────────────┐ │
   │  │ User Model                      │ │
   │  │ Generation Model                │ │
   │  │ Session Management              │ │
   │  └──────────────────────────────────┘ │
   └────┬──────────────────────────────────┘
        │
   ┌────▼──────────────────────────────────┐
   │    Database Layer                     │
   │  ┌──────────────────────────────────┐ │
   │  │ SQLite (Development)             │ │
   │  │ PostgreSQL (Production)          │ │
   │  └──────────────────────────────────┘ │
   └───────────────────────────────────────┘
```

---

## 📂 Folder Structure & Responsibilities

### Backend Structure

```
Backend/
├── .env                    # Environment variables (API keys, secrets)
├── app.py                  # FastAPI app initialization & setup
├── database.py             # SQLAlchemy engine & session
├── models.py               # ORM models (User, Generation)
├── auth.py                 # JWT & password utilities
├── config.py               # Configuration constants
├── requirements.txt        # Python dependencies
├── .gitignore
│
├── api/                    # API Route Handlers
│   ├── __init__.py
│   ├── auth_routes.py      # /api/auth/* endpoints
│   └── routes.py           # /api/* generation endpoints
│
├── Core/                   # AI/ML Business Logic
│   ├── intent.py           # Intent detection
│   ├── inference.py        # Parameter inference
│   ├── prompt_builder.py   # Prompt enhancement
│   ├── model_router.py     # Model selection & execution
│   ├── comparator.py       # Response comparison
│   ├── response_store.py   # Response storage
│   └── __init__.py
│
└── services/               # Supporting Services
    ├── prompt_engine.py    # Async prompt generation
    ├── comparison_engine.py # Comparison logic
    ├── history_manager.py  # History operations
    └── __init__.py
```

### Frontend Structure

```
frontend/
├── .env                    # Frontend config (API URL)
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite bundler config
├── eslint.config.js        # Code linting rules
│
├── public/                 # Static assets
│   └── ...
│
└── src/
    ├── main.jsx            # React entry point
    ├── App.jsx             # Root component with routing
    ├── index.css           # Global styles
    │
    ├── pages/              # Page Components
    │   ├── Login.jsx       # Authentication page
    │   ├── Register.jsx    # Registration page
    │   └── Home.jsx        # Main app interface
    │
    ├── components/         # Reusable Components
    │   ├── ModelSelector.jsx
    │   ├── ResponseCard.jsx
    │   └── QuoteCarousel.jsx
    │
    └── services/           # API & Utilities
        └── api.js          # Axios API client with interceptors
```

---

## 🔄 Data Flow

### Registration Flow
```
User Input (email, username, password)
    ↓
React Form Validation
    ↓
POST /api/auth/register
    ↓
Backend Validation (email unique, username unique)
    ↓
Bcrypt Hash Password
    ↓
Create User Record (Database)
    ↓
Generate JWT Token
    ↓
Return Token + User Data
    ↓
Store Token in localStorage
    ↓
Redirect to Home
```

### Content Generation Flow
```
User enters Prompt + Chooses Compare Mode
    ↓
Frontend Validation
    ↓
POST /api/generate (with JWT token)
    ↓
Backend: Authenticate User (JWT validation)
    ↓
Intent Detection (analyze prompt intent)
    ↓
Parameter Inference (extract tone, audience, etc)
    ↓
Prompt Enhancement (create better prompt)
    ↓
Parallel Model Execution (async)
    ├─ Call Gemini API
    ├─ Call Mistral API (via OpenRouter)
    └─ Call LLaMA API (via OpenRouter)
    ↓
Gather All Responses
    ↓
If Compare Mode Enabled:
    ├─ Compare responses quality
    ├─ Select best response
    └─ Store comparison metadata
Else:
    └─ Select first available response
    ↓
Save to Database (Generation record)
    ↓
Return Results to Frontend
    ↓
Display Winner (with 🏆 badge)
    ↓
Show Optional: All model responses
    ↓
Update History in Sidebar
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
);
```

### Generations Table
```sql
CREATE TABLE generations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    prompt TEXT NOT NULL,
    model_responses JSON NOT NULL,
    comparison JSON,
    winner_model VARCHAR(50),
    winner_response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🔐 Authentication Flow

```
Login Request
    ↓
POST /api/auth/login (email, password)
    ↓
Find User by Email
    ↓
Bcrypt Compare Password
    ↓
Password Valid? → Generate JWT Token
    ↓
JWT Token Structure:
{
  "user_id": 123,
  "email": "user@example.com",
  "username": "username",
  "exp": 1705000000,
  "iat": 1704000000
}
    ↓
Return Token to Frontend
    ↓
Frontend: Store in localStorage
    ↓
Frontend: Add to All Auth requests
    Header: "Authorization: Bearer {token}"
    ↓
Backend: Verify Token on Protected Routes
    ↓
Extract user_id from token
    ↓
Load User from Database
    ↓
Proceed with Request
```

---

## 🤖 AI Model Execution

### Concurrent Execution
```
3 Models Run in Parallel (Async)
├─ Gemini (via Google API)
├─ Mistral (via OpenRouter)
└─ LLaMA (via OpenRouter)

All responses gathered simultaneously
Compare (if enabled)
Select Winner
Return Results
```

### Model Configuration
```python
AVAILABLE_MODELS = ["gemini", "mistral", "llama"]

# Gemini - Google DeepMind
GEMINI_API_KEY = "AIzaSy..."
GEMINI_MODEL_NAME = "gemini-3-flash-preview"

# Mistral & LLaMA - via OpenRouter
OPENROUTER_API_KEY = "sk-or-v1-..."
MISTRAL_MODEL = "mistralai/mistral-small-3.1-24b-instruct:free"
LLAMA_MODEL = "meta-llama/llama-3.3-70b-instruct:free"
```

---

## 🔌 API Contract

### Request/Response Examples

**Register**
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

**Generate Content**
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
  "responses": {
    "gemini": "Dear...",
    "mistral": "Hello...",
    "llama": "Hi..."
  },
  "comparison": {
    "winner": "gemini",
    "reasoning": "Most professional tone..."
  },
  "winner": {
    "model": "gemini",
    "response": "Dear..."
  }
}
```

---

## 🚀 Deployment Architecture

### Development
```
localhost:5173 (React)
    ↓
localhost:8000 (FastAPI)
    ↓
sqlite:///./promptiva.db
```

### Production
```
Vercel (Frontend)
    ↓
Railway/Render (Backend)
    ↓
PostgreSQL (Cloud Database)
```

---

## 📝 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | React 19 | UI components |
| Frontend Routing | React Router v6 | Client-side routing |
| Frontend HTTP | Axios | API calls |
| Backend Framework | FastAPI | REST API |
| Async Runtime | Asyncio | Concurrent operations |
| ORM | SQLAlchemy | Database abstractions |
| Database | SQLite/PostgreSQL | Data persistence |
| Authentication | JWT (Python-Jose) | Token auth |
| Password | Bcrypt (Passlib) | Secure hashing |
| Environment | Python-dotenv | Config management |
| AI APIs | Google Gemini, OpenRouter | LLM access |

---

## 🔄 Component Interactions

### Request Flow Example
```
1. User clicks "Generate" button
   ↓
2. React component collects form data
   ↓
3. Axios interceptor adds Authorization header
   ↓
4. POST request to /api/generate
   ↓
5. FastAPI receives request
   ↓
6. Validates JWT token via get_current_user()
   ↓
7. Retrieves User from database via SQLAlchemy
   ↓
8. Calls business logic (Intent, Inference, Prompt Builder)
   ↓
9. Launches 3 concurrent model calls
   ↓
10. Gathers responses
   ↓
11. Calls Comparison Engine if enabled
   ↓
12. Creates Generation record in database
   ↓
13. Returns JSON response
   ↓
14. Frontend receives response
   ↓
15. React state updates
   ↓
16. UI re-renders with results
```

---

## 🎯 Key Design Decisions

### Why Async/Concurrent?
- Multiple API calls happen simultaneously
- Reduces overall response time
- Improves user experience

### Why JWT Tokens?
- Stateless authentication
- Scalable (no session storage needed)
- Works well for distributed systems

### Why SQLAlchemy ORM?
- Database-agnostic (easy to switch DB)
- Prevents SQL injection
- Type hints and validation

### Why Separated API Routes?
- Clean separation of concerns
- Auth routes isolated from generation routes
- Easy to add new routes in future

### Why Database over JSON?
- Scalable for many users
- Indexed queries for fast retrieval
- Transactions guarantee data integrity

---

## 📊 Performance Considerations

### Optimization Points
1. **Concurrent Model Execution** - All 3 models run at once
2. **Database Indexing** - Faster queries on user_id, created_at
3. **Async/Await** - Non-blocking I/O operations
4. **JWT Validation** - Fast token verification
5. **Connection Pooling** - Database connection reuse

### Load Limits (Current)
- Single instance: ~1000 concurrent connections
- Database: Depends on PostgreSQL configuration
- Model APIs: Rate limits from Google/OpenRouter

---

## 🔒 Security Layers

1. **CORS Middleware** - Only allow frontend origin
2. **Input Validation** - Pydantic models validate all input
3. **Password Hashing** - Bcrypt with salt
4. **JWT Tokens** - Expiring tokens with signature
5. **Database** - ID-based queries prevent injection
6. **HTTPS** - Enable in production
7. **Environment Variables** - Secrets not in code

---

## 📈 Scalability Strategy

### Horizontal Scaling
- Deploy multiple API instances
- Load balancer distributes requests
- PostgreSQL behind cloud proxy
- Redis for caching (future)

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Cache expensive operations

---

## 🧪 Testing Strategy

### Unit Tests (Future)
```python
# Test auth functions
test_password_hashing()
test_jwt_creation()
test_jwt_validation()

# Test business logic
test_intent_detection()
test_response_comparison()
```

### Integration Tests (Future)
```python
# Test full flows
test_registration_flow()
test_generation_flow()
test_invalid_token_rejection()
```

### E2E Tests (Future)
```javascript
// Test user workflows
test_complete_user_journey()
test_login_to_generation()
```

---

## 🚀 Deployment Checklist

- [ ] Switch to PostgreSQL
- [ ] Set production environment variables
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Configure error logging
- [ ] Set up monitoring/alerting
- [ ] Implement rate limiting
- [ ] Enable GZIP compression
- [ ] Set up CDN for static files

---

This architecture is designed to be:
✅ Scalable - Can handle growth
✅ Maintainable - Clear separation of concerns
✅ Secure - Multiple security layers
✅ Performant - Async operations, optimized queries
✅ Extensible - Easy to add new features
