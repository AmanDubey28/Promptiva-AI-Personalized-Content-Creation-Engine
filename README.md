# 🚀 Promptiva - AI Personal Content Creation Engine

> **Smart. Fast. Powerful.** Run multiple AI models simultaneously and get the best response automatically!

**Formerly**: SmartChat → **Now**: Promptiva

## ✨ Key Features

### 🤖 **Multi-Model Intelligence**
- Automatically runs **3 AI models in parallel** (Gemini, Mistral, LLaMA)
- No manual model selection needed
- Compare responses and pick the best automatically
- All powered by concurrent async execution

### 🎯 **Smart Content Generation**
- Intent detection
- Tone & parameter inference  
- Personalized content creation
- Email, LinkedIn posts, ads, and more

### 🔐 **Production-Ready Security**
- JWT token authentication
- Bcrypt password hashing
- SQLite database with user history
- Protected API endpoints

### 🎨 **Beautiful Modern UI**
- Redesigned with Promptiva branding
- Dark theme with orange/red accents
- Simple, focused interface
- Recent history tracking
- Responsive design

---

## 🚀 Quick Start

### **Windows:**
```bash
double-click quick-start.bat
```

### **Mac/Linux:**
```bash
bash quick-start.sh
```

### **Manual Setup:**

**Backend:**
```bash
cd Backend
pip install -r requirements.txt
# Add API keys to .env file
uvicorn app:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Visit:
- 🌐 **Frontend**: `http://localhost:5173`
- 🚀 **Backend**: `http://localhost:8000`
- 📚 **API Docs**: `http://localhost:8000/docs`

---

## 📋 What's New

### v2.0 - Complete Overhaul
✅ **Authentication** - Register, login, JWT tokens
✅ **Database** - SQLite with user history
✅ **Auto-Compare** - Runs 3 models, picks best one
✅ **Redesigned UI** - Modern, professional interface
✅ **Branding** - Promptiva (from SmartChat)
✅ **Security** - Bcrypt hashing, token protection
✅ **Production-Ready** - Scalable, maintainable code

---

## 🎯 How It Works

1. **Register/Login** → Get JWT authentication token
2. **Enter Prompt** → Simple text input (no model selection!)
3. **Choose Mode** → Compare all (optional) or just get result
4. **Backend:
   - Analyzes intent
   - Runs all 3 models concurrently
   - Compares if enabled
5. **View Result** → Winner highlighted with 🏆 badge
6. **Done!** → Automatically saved to history

---

## 📦 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database
- **SQLite** - Lightweight database
- **Python-Jose** - JWT authentication
- **Passlib** - Password hashing
- **Async/Await** - Concurrent operations

### Frontend
- **React 19** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS-in-JS** - Inline styles (no build complexity)

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Create account
- `POST /login` - Login & get token
- `POST /verify` - Verify token

### Generation (`/api`)
- `POST /generate` - Generate content
- `GET /history` - Get user's history
- `GET /history/{id}` - Get specific generation

---

## 🗄️ Database

**Users:**
- email (unique)
- username (unique)
- hashed_password
- created_at, updated_at

**Generations:**
- user_id
- prompt
- model_responses (JSON)
- comparison (JSON)
- winner_model
- winner_response
- created_at

---

## 📁 Project Structure

```
Promptiva/
├── Backend/
│   ├── .env (← ADD YOUR API KEYS!)
│   ├── app.py
│   ├── database.py
│   ├── models.py
│   ├── auth.py
│   ├── config.py
│   ├── requirements.txt
│   ├── api/
│   │   ├── auth_routes.py
│   │   └── routes.py
│   ├── Core/
│   └── services/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Home.jsx
│   │   └── services/api.js
│   └── package.json
├── SETUP_GUIDE.md
├── IMPLEMENTATION_SUMMARY.md
├── quick-start.sh
├── quick-start.bat
└── README.md
```

---

## 🔑 Configuration

Add to `Backend/.env`:

```env
GEMINI_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
SECRET_KEY=your_secret_key_here
DATABASE_URL=sqlite:///./promptiva.db
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## 🧪 Test It Out

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -d '{"email":"test@test.com","username":"testuser","password":"test123","password_confirm":"test123"}'

# Login (save the token!)
curl -X POST http://localhost:8000/api/auth/login \
  -d '{"email":"test@test.com","password":"test123"}'

# Generate
curl -X POST http://localhost:8000/api/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"user_input":"Write a poem","compare":true}'
```

---

## 📚 Complete Documentation

### 🏗️ Architecture & Design
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system architecture, data flows, and design decisions
- **[Backend README](./Backend/README.md)** - Backend setup, structure, and API reference
- **[Backend API Routes](./Backend/api/README.md)** - Detailed API endpoint documentation
- **[Backend Core Logic](./Backend/Core/README.md)** - Business logic modules (intent, inference, comparison)
- **[Backend Services](./Backend/services/README.md)** - High-level service layer documentation
- **[Frontend README](./frontend/README.md)** - Frontend structure, components, and services

### 🚀 Getting Started
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Step-by-step local setup instructions
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What was built and why
- **[CHECKLIST.md](./CHECKLIST.md)** - Implementation verification checklist (for GitHub)
- Quick-start scripts: `quick-start.sh` (Mac/Linux) or `quick-start.bat` (Windows)

### 📦 Production & Deployment
- **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)** - Complete production readiness checklist
- **[POSTGRESQL_MIGRATION.md](./POSTGRESQL_MIGRATION.md)** - Migrate from SQLite to PostgreSQL for production
- **Interactive API Docs**: `http://localhost:8000/docs` (Swagger UI)
- **API Redoc**: `http://localhost:8000/redoc` (Alternative docs)

---

## 🌐 Deployment Guide

### For Production (GitHub Upload)

**Before uploading to GitHub:**

1. ✅ **Security Check**
   ```bash
   # Remove API keys from git history
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch Backend/.env' \
     --prune-empty --tag-name-filter cat -- --all
   
   # Verify .env is ignored
   cat .gitignore | grep ".env"
   ```

2. ✅ **Database Upgrade**
   - Follow [POSTGRESQL_MIGRATION.md](./POSTGRESQL_MIGRATION.md)
   - Switch from SQLite to PostgreSQL for production
   - Ensures scalability and persistence

3. ✅ **Complete Checklist**
   - Use [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
   - Verify all security, performance, and deployment requirements
   - 50+ items to ensure production-readiness

### Deployment Platforms

**Recommended Setup:**
- **Backend**: Railway, Render, or Heroku
- **Frontend**: Vercel, Netlify, or Railway
- **Database**: PostgreSQL on Railway/Render/AWS RDS

**Quick Deploy (Railway):**
```bash
# 1. Create Railway account
# 2. Connect GitHub
# 3. Add PostgreSQL plugin (automatic)
# 4. Environment variables auto-configured
# 5. Deploy on git push
```

**See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) for:**
- Railway deployment steps
- Vercel frontend deployment
- Environment variable configuration
- SSL/HTTPS setup
- Custom domain configuration
- Monitoring and alerting setup

---

## ✅ Features Implemented

- [x] User authentication (register/login)
- [x] JWT token management
- [x] Database persistence
- [x] Auto-run all models
- [x] Auto-comparison feature
- [x] Generation history
- [x] Beautiful UI redesign
- [x] Promptiva branding
- [x] Protected API routes
- [x] Error handling
- [x] Form validation
- [x] Responsive design

---

## 🚀 Performance

- ⚡ **Parallel execution** - All 3 models run at once
- 🔄 **Async operations** - Non-blocking I/O
- 💾 **Database caching** - History prevents re-fetching
- 📱 **Responsive** - Works on all devices

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection refused | Start both servers |
| No API response | Check API keys in `.env` |
| Auth failed | Clear localStorage, re-login |
| Database error | Delete `promptiva.db`, restart |

---

## 📖 Next Steps

- [ ] Deploy to Vercel (frontend) + Railway (backend)
- [ ] Add more AI models
- [ ] Implement user profiles
- [ ] Add export (PDF, Markdown)
- [ ] Create prompt templates
- [ ] Analytics dashboard

---

## 💝 Support

For issues:
1. Check `SETUP_GUIDE.md`
2. Review browser console (F12)
3. Check backend terminal
4. Verify `.env` configuration

---

**Built with FastAPI + React** ❤️

*Ready to transform your content? Let's go! 🚀*
