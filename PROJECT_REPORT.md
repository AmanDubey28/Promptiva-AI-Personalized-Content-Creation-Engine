# Promptiva Project Report

## 1. Executive Summary

Promptiva is a full-stack AI content creation application. It lets users register, log in, describe the content they want, and receive AI-generated output from a backend that can call multiple language models. The project is organized as a React/Vite frontend and a FastAPI backend, with SQLAlchemy persistence, JWT authentication, and Docker-based deployment support.

The product goal is clear: provide a personalized content creation assistant for formats such as blog posts, LinkedIn posts, Instagram captions, Twitter/X content, emails, and ad copy. The project already includes substantial documentation, UI work, authentication, history management, and model orchestration logic. The main areas needing attention are production hardening, test coverage, API contract cleanup, dependency alignment, and a few implementation mismatches between documentation and code.

## 2. Project Identity

- Project name: Promptiva - AI Personal Content Creation Engine
- Previous name: SmartChat
- Application type: AI-powered content generation web app
- Architecture: Full-stack web application
- Frontend: React 19 with Vite
- Backend: FastAPI with Python
- Database: SQLite by default, PostgreSQL in Docker/production guidance
- AI providers: Google Gemini and OpenRouter-hosted models
- Authentication: JWT access tokens with password hashing

## 3. Repository Structure

```text
.
+-- Backend/
|   +-- app.py
|   +-- auth.py
|   +-- config.py
|   +-- database.py
|   +-- models.py
|   +-- requirements.txt
|   +-- api/
|   |   +-- auth_routes.py
|   |   +-- routes.py
|   +-- Core/
|   |   +-- comparator.py
|   |   +-- inference.py
|   |   +-- intent.py
|   |   +-- model_router.py
|   |   +-- prompt_builder.py
|   |   +-- response_store.py
|   +-- services/
|       +-- comparison_engine.py
|       +-- history_manager.py
|       +-- prompt_engine.py
+-- frontend/
|   +-- package.json
|   +-- vite.config.js
|   +-- Dockerfile
|   +-- src/
|       +-- App.jsx
|       +-- main.jsx
|       +-- components/
|       +-- pages/
|       +-- services/
|       +-- styles/
+-- docker-compose.yml
+-- README.md
+-- ARCHITECTURE.md
+-- SETUP_GUIDE.md
+-- PRODUCTION_CHECKLIST.md
+-- additional setup, deployment, checklist, and UI documentation
```

Approximate source size in active backend/frontend areas:

| Type | Files | Lines |
|---|---:|---:|
| Python | 21 | 977 |
| JSX | 15 | 2,284 |
| JavaScript | 1 | 84 |
| CSS | 8 | 2,435 |

## 4. Functional Overview

Promptiva supports the following user-facing flow:

1. User opens the landing page.
2. User registers or logs in.
3. Frontend stores the JWT token and user profile in localStorage.
4. Authenticated user enters a direct prompt or answers guided content questions.
5. Frontend sends the prompt to the backend.
6. Backend detects intent and infers generation parameters.
7. Backend builds or enhances the prompt.
8. Backend runs configured AI models.
9. Backend selects a winning response or compares responses when comparison is enabled.
10. Backend stores the generation in the database.
11. Frontend displays the result and makes prior generations available through the sidebar history.

## 5. Backend Report

### 5.1 Backend Entry Point

The backend starts from `Backend/app.py`. It:

- Loads environment variables with `python-dotenv`.
- Creates database tables on startup with `Base.metadata.create_all(bind=engine)`.
- Initializes a FastAPI app titled `Promptiva - AI Personal Content Creation Engine`.
- Configures CORS from the `FRONTEND_URL` environment variable.
- Registers the generation routes and authentication routes.
- Exposes a root health/status-style endpoint at `/`.

### 5.2 Backend Dependencies

The backend depends on:

- `fastapi`
- `uvicorn`
- `sqlalchemy`
- `python-dotenv`
- `python-jose[cryptography]`
- `passlib[bcrypt]`
- `pydantic`
- `httpx`
- `google-genai`
- `openai`
- `streamlit`

Important note: `auth.py` uses Argon2 via `CryptContext(schemes=["argon2"])`, but `requirements.txt` lists `passlib[bcrypt]` and does not explicitly list `argon2-cffi`. This can cause runtime password hashing failures unless Argon2 support is installed indirectly.

### 5.3 Configuration

`Backend/config.py` defines:

- `AVAILABLE_MODELS = ["gemini", "mistral", "llama"]`
- `DEFAULT_MODEL = "gemini"`
- `GEMINI_MODEL_NAME = "gemini-3-flash-preview"`
- OpenRouter model mappings for Mistral and LLaMA
- SQLite default database URL
- JWT defaults

Runtime settings are partly read from environment variables in `database.py`, `auth.py`, `app.py`, and `model_router.py`. This is good for deployment, but the hardcoded fallback secret key should not be used in production.

### 5.4 Database Layer

The database layer uses SQLAlchemy.

Main files:

- `Backend/database.py`: engine, session factory, `Base`, and `get_db()` dependency.
- `Backend/models.py`: ORM models.

Tables:

#### users

- `id`
- `email`
- `username`
- `hashed_password`
- `created_at`
- `updated_at`

#### generations

- `id`
- `user_id`
- `prompt`
- `model_responses`
- `comparison`
- `winner_model`
- `winner_response`
- `created_at`

The relationship is one user to many generations. Generations are cascade-deleted when a user is deleted.

### 5.5 Authentication

Authentication is implemented in `Backend/auth.py` and `Backend/api/auth_routes.py`.

Implemented endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify`

The current login API expects `username` and `password`, not email and password. Some documentation still describes email-based login, so docs and implementation should be aligned.

Token payload contains:

- `user_id`
- `email`
- `username`
- `exp`

Strengths:

- Passwords are hashed instead of stored directly.
- JWT tokens expire.
- Protected API routes validate bearer tokens.

Risks:

- Token verification endpoint accepts the token as a request parameter instead of the Authorization header.
- Tokens and user data are stored in localStorage, which is convenient but vulnerable if XSS exists.
- Default fallback secret key is unsafe for production.
- Password requirements are minimal.

### 5.6 Generation API

Main file: `Backend/api/routes.py`

Implemented endpoints:

- `POST /api/generate`
- `GET /api/history`
- `GET /api/history/{generation_id}`
- `PATCH /api/history/{generation_id}`
- `DELETE /api/history/{generation_id}`

Generation request shape:

```json
{
  "user_input": "Write a LinkedIn post about AI productivity",
  "compare": false
}
```

Generation response shape:

```json
{
  "id": 1,
  "responses": {
    "gemini": "...",
    "mistral": "...",
    "llama": "..."
  },
  "comparison": null,
  "winner": {
    "model": "gemini",
    "response": "..."
  }
}
```

### 5.7 AI Logic

The AI pipeline is spread across `Backend/Core` and `Backend/services`.

Key modules:

- `Core/intent.py`: rule-based content format and purpose detection.
- `Core/inference.py`: derives tone, emoji preference, and target length.
- `services/prompt_engine.py`: asks available AI models to create an enhanced meta-prompt, with fallback across models.
- `Core/model_router.py`: calls Gemini directly and Mistral/LLaMA through OpenRouter.
- `services/comparison_engine.py`: asks an evaluator model to compare responses.
- `Core/comparator.py`: formats model responses for comparison.

Current behavior:

- `POST /api/generate` first generates a meta-prompt.
- Then it runs all configured models concurrently with `asyncio.gather`.
- It filters failed model responses.
- It stores all responses and a selected winner in the database.

Important issue:

`compare_responses()` currently returns a string, but `api/routes.py` treats the comparison as a dictionary by calling `comparison.get("winner")`. This can break comparison mode. The comparison engine should return structured JSON/dict, or the route should parse the evaluator output safely.

### 5.8 Legacy or Unused Backend Code

`Backend/services/history_manager.py` stores history in `data/history.json`, but the current API route saves history through the SQLAlchemy `Generation` model. This file appears to be legacy or secondary functionality.

`Backend/Core/prompt_builder.py` contains a deterministic prompt builder, but the active route uses `services/prompt_engine.py` to build a meta-prompt through an AI model.

## 6. Frontend Report

### 6.1 Frontend Stack

The frontend is a Vite React app.

Main dependencies:

- `react`
- `react-dom`
- `react-router-dom`
- `axios`

Main scripts:

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

The project uses React 19 and a Vite 8 beta version. That may be acceptable for experimentation, but production projects usually benefit from stable tooling versions unless beta features are required.

### 6.2 Routing

Main routing file: `frontend/src/App.jsx`

Routes:

- `/landing`: public landing page
- `/login`: login page
- `/register`: registration page
- `/`: protected chat app
- `*`: redirects based on authentication state

Protected route logic checks whether an access token exists in localStorage.

### 6.3 API Client

Main file: `frontend/src/services/api.js`

Responsibilities:

- Sets base URL from `VITE_API_URL`, defaulting to `http://localhost:8000/api`.
- Adds `Authorization: Bearer <token>` to requests.
- Provides helper functions for auth, generation, history, rename, and delete operations.
- Stores and clears auth tokens.

The API client is aligned with the active FastAPI routes.

### 6.4 Active UI Flow

The active chat page is `frontend/src/pages/Chat.jsx`, because `App.jsx` routes `/` to that file.

Major UI features:

- Sidebar with history.
- New chat action.
- Theme toggle.
- Guided content type selection.
- Progressive questions for tone, length, audience, and style.
- Direct prompt option.
- Split-screen generation and response display.
- Loading quote display.
- Copy response button.
- Rename/delete history items from the sidebar.

### 6.5 Other Frontend Components

Reusable or supporting components include:

- `Sidebar.jsx`
- `ThemeToggle.jsx`
- `QuoteDisplay.jsx`
- `QuoteCarousel.jsx`
- `ResponseCard.jsx`
- `ModelSelector.jsx`
- `Header.jsx`

There is also `frontend/src/components/Chat.jsx`, which appears to be an older chat implementation. It posts directly to `http://localhost:8000/api/generate` with a request body that does not match the active backend contract. Since it is not the routed chat page, it is probably legacy code and should be removed or updated to avoid confusion.

### 6.6 UI/UX Notes

The UI has a strong dark-mode-first visual identity with Promptiva branding, animated backgrounds, guided generation steps, and a persistent sidebar. CSS files are separated by component/page area, which keeps styling easier to locate.

Potential UI issues:

- Several files show mojibake/encoding artifacts where emoji characters are displayed incorrectly.
- Some UI text and docs mention features that do not fully match the current implementation.
- The application uses browser `alert()` for copy confirmation in the active chat page; a non-blocking toast would feel more polished.
- The active chat page does not expose comparison mode even though the backend supports a `compare` parameter.

## 7. Docker and Deployment

### 7.1 Docker Compose

`docker-compose.yml` defines:

- `db`: PostgreSQL 15 Alpine
- `backend`: FastAPI service on port 8000
- `frontend`: Vite/served frontend on port 5173
- shared bridge network
- persistent PostgreSQL volume

The compose file is useful for local production-like testing.

### 7.2 Backend Dockerfile

The backend Dockerfile:

- Uses `python:3.12-slim`.
- Installs `gcc`.
- Installs Python dependencies.
- Copies backend source.
- Exposes port 8000.
- Runs Uvicorn.
- Includes a health check against `/`.

### 7.3 Frontend Dockerfile

The frontend Dockerfile:

- Uses Node 20 Alpine for build.
- Runs `npm ci`.
- Builds the frontend.
- Uses `serve` to host the static `dist` folder.
- Exposes port 5173.
- Includes a health check.

### 7.4 Deployment Readiness

The repository contains extensive deployment documentation, including Docker and production checklists. Recommended production stack in the docs is:

- Frontend: Vercel or Netlify
- Backend: Railway, Render, or Heroku
- Database: PostgreSQL

Production concerns still to address:

- Replace default secrets.
- Confirm `.env` files are ignored.
- Add rate limiting.
- Add structured logging.
- Add monitoring/error reporting.
- Add CI checks.
- Use stable dependency versions.
- Fix comparison mode.
- Resolve password hashing dependency mismatch.

## 8. Documentation Quality

The repository has unusually broad documentation coverage:

- `README.md`
- `ARCHITECTURE.md`
- `SETUP_GUIDE.md`
- `IMPLEMENTATION_SUMMARY.md`
- `DEPLOYMENT_SUMMARY.md`
- `DOCKER_DEPLOYMENT_GUIDE.md`
- `PRODUCTION_CHECKLIST.md`
- `DOCUMENTATION_INDEX.md`
- backend and frontend README files
- UI redesign and testing guides

Strengths:

- Clear intent and setup guidance.
- Architecture diagrams and data flow explanations.
- Production deployment thinking is already present.
- Manual UI testing checklists exist.

Issues:

- Many documentation files contain mojibake/encoding artifacts.
- Some docs mention files that are not present in the current repository, such as `POSTGRESQL_MIGRATION.md`.
- Some docs say bcrypt while code uses Argon2.
- Some docs describe email login while code uses username login.
- Some docs describe comparison behavior that may fail because of the string/dict mismatch.

## 9. Testing Status

Current visible test-related files:

- `Backend/test_registration.py`
- `Backend/create_test_user.py`
- `Backend/add_test_user.py`
- `QUICK_START_UI_TESTING.md`

`Backend/test_registration.py` is more of a smoke script than a formal automated test. It validates registration request construction, password hashing, and token creation.

There is no clear pytest suite, frontend test suite, CI workflow, or end-to-end automation in the current file list.

Recommended tests:

- Backend unit tests for auth helpers.
- Backend integration tests for register/login/generate/history.
- Mocked model-router tests so AI APIs are not called during CI.
- Frontend component or route tests for auth and chat flows.
- End-to-end tests for registration, login, generation, history rename, and delete.

## 10. Security Assessment

Strengths:

- JWT authentication is implemented.
- Passwords are hashed.
- Protected routes validate bearer tokens.
- SQLAlchemy reduces SQL injection risk.
- CORS origins are configurable.
- Secrets are expected through environment variables.

Risks:

- Fallback secret key is insecure.
- `docker-compose.yml` includes default database credentials and a placeholder secret.
- Token storage in localStorage increases XSS impact.
- No rate limiting is visible.
- No request size limit is visible.
- No security headers middleware is currently implemented.
- Password rules are weak.
- AI prompt inputs are sent directly to model providers without visible moderation, quota checks, or abuse controls.
- The generation endpoint can fan out to multiple paid/external model calls per request.

## 11. Maintainability Assessment

Strengths:

- Backend has a reasonable separation between API routes, core logic, services, models, config, and auth.
- Frontend separates pages, components, services, and styles.
- Docker files and documentation support onboarding.
- The overall product flow is understandable.

Risks:

- Some legacy files remain alongside active implementations.
- Documentation and code have drifted.
- Encoding issues make docs and UI source harder to read.
- The model comparison contract is inconsistent.
- There is no strong automated test safety net.
- Config is split between `config.py` and direct environment reads, which can become confusing.

## 12. Key Bugs and Gaps

| Area | Issue | Impact | Priority |
|---|---|---|---|
| Backend comparison | `compare_responses()` returns string, route expects dict | Compare mode can fail | High |
| Auth dependency | Code uses Argon2, requirements list bcrypt extra | Password hashing may fail in a clean environment | High |
| Docs/API mismatch | Docs describe email login, code uses username login | User/developer confusion | Medium |
| Frontend legacy code | `components/Chat.jsx` uses old API body | Maintenance confusion if reused | Medium |
| Active UI | Compare mode is not exposed in active `pages/Chat.jsx` | Backend feature not available to users | Medium |
| Encoding | Mojibake across docs/source strings | Poor presentation and readability | Medium |
| Testing | Minimal automated testing | Higher regression risk | High |
| Security | No visible rate limiting or abuse controls | Cost and availability risk | High |

## 13. Recommended Improvement Plan

### Phase 1: Stabilize Core Functionality

1. Fix comparison mode by returning structured JSON from `compare_responses()`.
2. Align password hashing dependencies with implementation.
3. Decide whether login should use username or email, then update docs and UI consistently.
4. Remove or update legacy `frontend/src/components/Chat.jsx`.
5. Add backend tests for auth and generation with mocked AI calls.

### Phase 2: Clean Up Product Experience

1. Add compare mode control to the active chat UI if it remains a product feature.
2. Replace blocking `alert()` copy confirmation with inline feedback.
3. Fix mojibake/encoding issues in UI strings and documentation.
4. Make history refresh after a new generation without requiring manual sidebar refresh.
5. Improve empty, loading, error, and partial-model-failure states.

### Phase 3: Production Hardening

1. Replace all placeholder secrets and credentials.
2. Add rate limiting to auth and generation endpoints.
3. Add structured logging and error tracking.
4. Add request timeouts for model calls.
5. Add deployment-specific CORS configuration.
6. Add CI for backend tests, frontend lint, and frontend build.
7. Add a proper migration strategy instead of only `create_all`.

### Phase 4: Scale and Product Expansion

1. Add prompt templates.
2. Add export to Markdown/PDF.
3. Add user profile/preferences.
4. Add pagination for history.
5. Add analytics for model quality and latency.
6. Add usage quotas by user.

## 14. Overall Assessment

Promptiva is a strong prototype-to-MVP project. It has a clear product idea, functional full-stack structure, meaningful AI orchestration, user authentication, persistent history, and a designed frontend experience. The codebase is already organized enough to continue evolving.

The project is not yet production-ready despite having production-oriented documentation. The biggest blockers are comparison-mode correctness, dependency alignment, lack of automated tests, security hardening, and documentation drift. Once those are addressed, the project can become a much more reliable AI content generation platform.
