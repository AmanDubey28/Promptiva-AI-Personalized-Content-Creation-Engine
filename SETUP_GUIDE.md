# Promptiva - AI Personal Content Creation Engine

## Setup & Installation Guide

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd Backend
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables**
   - Open `Backend/.env` and add your API keys:
   ```
   GEMINI_API_KEY=your_actual_gemini_key_here
   OPENROUTER_API_KEY=your_actual_openrouter_key_here
   SECRET_KEY=generate-a-secure-random-key-here
   ```

3. **Generate a Secure Secret Key** (for JWT)
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

4. **Run Backend Server**
   ```bash
   uvicorn app:app --reload --host 127.0.0.1 --port 8000
   ```
   - Server will be at: `http://localhost:8000`
   - API docs: `http://localhost:8000/docs`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   - Frontend will be at: `http://localhost:5173`

---

## Key Features Implemented

### ✅ Authentication System
- **Login/Register** pages with form validation
- **JWT Token** based authentication
- **Password hashing** using bcrypt
- **Protected routes** - only authenticated users can access main app

### ✅ Database
- **SQLite database** (can be switched to PostgreSQL/MySQL)
- **User model** - stores email, username, hashed password
- **Generation model** - stores prompts, model responses, comparisons, and winner results
- **Automatic table creation** on server startup

### ✅ Auto-Compare Feature
- User enters prompt once
- **Backend automatically runs all models** (Gemini, Mistral, LLaMA)
- **Optional comparison mode** - AI compares all responses and selects the best one
- **Winner model selection** - shows best performing model's response
- Results saved to database

### ✅ UI/UX Improvements
- **"Promptiva" branding** throughout the app
- **Removed ModelSelector** - no need for users to manually select models
- **Simple prompt input** - just enter what you want
- **Comparison toggle** - checkbox to enable/disable comparison
- **Attractive dark theme** with gradient accents (Orange #FF9500 to Red #FF6B35)
- **Responsive design** - works on desktop and tablet
- **Recent history** - displays past generations

### ✅ Backend API Routes

#### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login and receive JWT token
- `POST /verify` - Verify token validity

#### Generation (`/api`)
- `POST /generate` - Generate content from all models
  ```json
  {
    "user_input": "Your prompt here",
    "compare": true  // Enable comparison
  }
  ```
- `GET /history` - Get user's generation history
- `GET /history/{id}` - Get specific generation details

---

## Project Structure

```
Promptiva-AI-Personalized-Content-Creation-Engine/
├── Backend/
│   ├── .env                          # API keys & config (create this)
│   ├── app.py                        # FastAPI main app
│   ├── database.py                   # Database setup
│   ├── models.py                     # SQLAlchemy models (User, Generation)
│   ├── auth.py                       # JWT & password hashing
│   ├── requirements.txt              # Python dependencies
│   ├── api/
│   │   ├── auth_routes.py            # Authentication endpoints
│   │   └── routes.py                 # Generation endpoints
│   ├── Core/                         # Existing AI logic
│   └── services/                     # Existing services
│
└── frontend/
    ├── package.json                  # Updated with react-router & axios
    ├── src/
    │   ├── App.jsx                   # Routing setup
    │   ├── main.jsx
    │   ├── pages/
    │   │   ├── Login.jsx            # Login form
    │   │   ├── Register.jsx         # Registration form
    │   │   └── Home.jsx             # Main app (redesigned)
    │   ├── services/
    │   │   └── api.js               # API client with auth
    │   └── components/              # Existing components
    └── vite.config.js
```

---

## API Authentication

All requests to protected endpoints must include:
```
Authorization: Bearer {access_token}
```

Example:
```javascript
// This is handled automatically by the api.js interceptor
const response = await generateContent(prompt, compare);
```

---

## Database

### User Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  created_at DATETIME,
  updated_at DATETIME
)
```

### Generation Table
```sql
CREATE TABLE generations (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  prompt TEXT NOT NULL,
  model_responses JSON NOT NULL,      # All model outputs
  comparison JSON,                     # Comparison results
  winner_model VARCHAR(50),           # Best model name
  winner_response TEXT,               # Best response
  created_at DATETIME
)
```

---

## How It Works

### User Flow
1. **Register/Login** → Get JWT token stored in localStorage
2. **Enter prompt** → Submit to backend
3. **Backend processes**:
   - Analyzes intent
   - Generates enhanced prompt
   - Runs 3 models in parallel (Gemini, Mistral, LLaMA)
   - If compare enabled: AI compares and picks winner
4. **Results displayed**:
   - Show winner (highlighted with 🏆)
   - Optionally show all model responses
5. **Save to database** → Available in history

### Model Running Logic
```python
# All 3 models always run in parallel
tasks = [fetch_response(model) for model in AVAILABLE_MODELS]
responses = await asyncio.gather(*tasks)

# Compare only if user enabled it
if compare_enabled:
    best_model = compare_responses(responses)
    winner = responses[best_model]
else:
    winner = responses[first_model]  # Default to first available
```

---

## Environment Variables

```env
# API Keys
GEMINI_API_KEY=your_gemini_key
OPENROUTER_API_KEY=your_openrouter_key

# Database
DATABASE_URL=sqlite:///./promptiva.db

# JWT
SECRET_KEY=your-secure-random-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Server
SERVER_HOST=127.0.0.1
SERVER_PORT=8000
DEBUG=True

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## Testing the Application

### 1. Register a New Account
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "password_confirm": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Generate Content
```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "user_input": "Write a poem about summer",
    "compare": true
  }'
```

---

## Troubleshooting

### "Connection refused" error
- Make sure backend is running on port 8000
- Check: `http://localhost:8000`

### Database errors
- Delete `promptiva.db` to reset database
- Run backend again to create fresh tables

### Auth token issues
- Clear localStorage: `localStorage.clear()` in browser console
- Re-login to get fresh token

### API key errors
- Verify keys in `.env` are correct
- Restart backend after changing `.env`

---

## Next Steps / Future Enhancements

- [ ] Add pagination for history
- [ ] Implement favorites/bookmarks
- [ ] Add export functionality (PDF, Markdown)
- [ ] Create user profile settings
- [ ] Add rate limiting
- [ ] Deploy to cloud (Vercel + Railway/Render)
- [ ] Add more AI models
- [ ] Implement sharing of generations
- [ ] Add prompt templates
- [ ] Analytics dashboard

---

## API Documentation

Visit `http://localhost:8000/docs` for interactive Swagger documentation
