# 🐳 Docker & Deployment Guide - Promptiva

## Part 1: Local Development with Docker

### Prerequisites
- **Docker Desktop** installed ([Download Here](https://www.docker.com/products/docker-desktop))
- **.env file** with API keys in Backend/ folder
- **No** need to install Python or Node.js locally (Docker handles it)

### Quick Start

#### **Option A: Run Everything with Docker Compose** ⭐ (Recommended)

```bash
# 1. Navigate to project root
cd "c:\Users\Root\Desktop\Smart Chatbot\Promptiva-AI-Personalized-Content-Creation-Engine"

# 2. Build and start all containers
docker-compose up --build

# 3. Open your browser
→ Frontend: http://localhost:5173
→ Backend: http://localhost:8000
→ Database: PostgreSQL on localhost:5432
```

The `docker-compose.yml` will:
- ✅ Start PostgreSQL database
- ✅ Build & run Backend API (Port 8000)
- ✅ Build & run Frontend (Port 5173)
- ✅ Setup networking between all services
- ✅ Create persistent database volume

#### **Option B: Run Individual Containers**

```bash
# Build backend image
docker build -t promptiva-backend ./Backend

# Build frontend image
docker build -t promptiva-frontend ./frontend

# Run backend
docker run -p 8000:8000 \
  -e DATABASE_URL=sqlite:///./promptiva.db \
  -e GEMINI_API_KEY=your_key \
  -e OPENROUTER_API_KEY=your_key \
  promptiva-backend

# Run frontend (in another terminal)
docker run -p 5173:5173 promptiva-frontend
```

---

## Part 2: Production Deployment

### **Deployment Architecture Overview**

```
┌─────────────────┐
│   Your Domain   │
│  (example.com)  │
└────────┬────────┘
         │
    ┌────▼─────┐
    │  Vercel   │ ← Frontend (React app)
    │   CDN     │
    └───────────┘

┌─────────────────────────────────────┐
│      Railway / Render / AWS ECS     │ ← Backend (Docker)
│  - Backend API (FastAPI)            │
│  - Auto-scaling                     │
│  - Health checks                    │
└────────────┬────────────────────────┘
             │
    ┌────────▼──────────┐
    │  Cloud Database   │
    │  (PostgreSQL)     │
    └───────────────────┘
```

### **Option 1: Deploy on Railway (Easiest) ⭐**

Railway automatically detects Docker and deploys it. Perfect for beginners.

#### Steps:

1. **Push to GitHub first** (Railway needs your GitHub repo)
   ```bash
   git add .
   git commit -m "Add Docker support"
   git push origin main
   ```

2. **Sign up at** [Railway.app](https://railway.app)

3. **Connect GitHub repository**
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Choose your Promptiva repository

4. **Railway detects docker-compose.yml automatically** ✓

5. **Add Environment Variables**
   - Go to Project Settings
   - Add variables:
     - `GEMINI_API_KEY=your_key`
     - `OPENROUTER_API_KEY=your_key`
     - `SECRET_KEY=generate_strong_key`

6. **Deploy **
   - Railway automatically builds and deploys on every GitHub push
   - Your backend gets a public URL (e.g., `https://promptiva-api.up.railway.app`)

7. **Update Frontend API URL**
   - In `frontend/.env`:
     ```
     VITE_API_URL=https://promptiva-api.up.railway.app/api
     ```

---

### **Option 2: Deploy on AWS ECS**

More powerful and scalable, but requires more setup.

#### Steps:

1. **Create AWS ECR Repository** (Elastic Container Registry)
   ```bash
   aws ecr create-repository --repository-name promptiva-backend
   aws ecr create-repository --repository-name promptiva-frontend
   ```

2. **Push Docker images to ECR**
   ```bash
   docker tag promptiva-backend:latest YOUR_ECR_URI/promptiva-backend:latest
   docker push YOUR_ECR_URI/promptiva-backend:latest
   ```

3. **Create ECS Cluster**
   - Use AWS ECS Console
   - Create services for backend and frontend
   - Configure load balancer for frontend

4. **Setup RDS PostgreSQL**
   - Create managed PostgreSQL database
   - Update `DATABASE_URL` in ECS task definition

---

### **Option 3: Deploy on Azure Container Instances**

Similar to AWS but integrated with Azure ecosystem.

1. **Create Azure Container Registry**
2. **Push images**
3. **Deploy to ACI or App Service**

---

## Part 3: Database Migration to PostgreSQL for Production

### Before Deploying to Production:

```bash
# 1. Update Backend/.env
DATABASE_URL=postgresql://user:password@db-host:5432/promptiva_db

# 2. Run migration scripts
# See POSTGRESQL_MIGRATION.md for detailed steps

# 3. Test locally with PostgreSQL
docker-compose up -d db  # Start only database
python -m alembic upgrade head  # Run migrations
```

---

## Part 4: CI/CD with GitHub Actions

Automatically build and deploy on every GitHub push.

### Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Build Docker images
      run: |
        docker build -t promptiva-backend ./Backend
        docker build -t promptiva-frontend ./frontend
    
    - name: Push to ECR/Container Registry
      run: |
        # Push to your registry (AWS ECR, Azure, or Railway)
        docker push your-registry/promptiva-backend
        docker push your-registry/promptiva-frontend
    
    - name: Deploy
      run: |
        # Deployment command depends on your platform
        # Railway: Just push to GitHub (auto-deploys)
        # AWS: Update ECS service
        # Azure: Update container instance
```

---

## Part 5: Production Checklist

- [ ] Docker images tested locally with docker-compose
- [ ] .env.example created (no secrets)
- [ ] .env NOT in .gitignore (it should be)
- [ ] Database URL points to PostgreSQL (NOT SQLite)
- [ ] All API keys in environment variables
- [ ] CORS URLs updated with production domain
- [ ] Frontend API URL updated to production backend
- [ ] SSL/HTTPS enabled
- [ ] Monitoring setup (error tracking, logs)
- [ ] Database backups configured
- [ ] Domain name configured with DNS
- [ ] CDN setup for frontend (optional but recommended)

---

## Part 6: Scaling Strategies

### Horizontal Scaling (Multiple Instances)
```yaml
# docker-compose.yml with 3 backend instances + load balancer
services:
  backend-1:
    # ...
  backend-2:
    # ...
  backend-3:
    # ...
  load-balancer:
    # Nginx or AWS Load Balancer
```

### Vertical Scaling (Bigger Servers)
- Increase CPU/RAM allocated to containers
- Available in most cloud platforms

### Database Optimization
- Add database indexing
- Enable query caching (Redis)
- Read replicas for scaling reads

---

## Part 7: Monitoring & Logging

### Essential Tools:
1. **Sentry** - Error tracking
2. **Datadog** - Infrastructure monitoring
3. **CloudWatch** - AWS logs
4. **New Relic** - Performance monitoring
5. **PagerDuty** - Alert management

### Example: Add Sentry to Backend

```python
# Backend/app.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0
)
```

---

## Quick Troubleshooting

### Docker build fails
```bash
# Clean up and rebuild
docker-compose down
docker-compose up --build --no-cache
```

### Cannot connect to database
```bash
# Check database container
docker logs promptiva-db

# Verify network
docker network ls
docker network inspect promptiva-network
```

### Frontend can't reach backend
```bash
# Check backend is running
curl http://localhost:8000/

# Verify CORS settings in Backend/app.py
# Update FRONTEND_URL environment variable
```

---

## Next Steps

1. **Test locally with Docker** (Step 1 above)
2. **Push to GitHub** (Step 2)
3. **Deploy to Railway** (Step 3 - easiest)
4. **Setup CI/CD** (Optional, for automation)
5. **Configure monitoring** (Optional, for production)

---

**Need Help?**
- See PRODUCTION_CHECKLIST.md for detailed production setup
- See GITHUB_UPLOAD_GUIDE.md for GitHub setup
- See POSTGRESQL_MIGRATION.md for database migration
