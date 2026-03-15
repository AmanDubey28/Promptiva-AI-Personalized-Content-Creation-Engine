from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from database import engine, Base
from models import User, Generation
from api.routes import router
from api.auth_routes import router as auth_router

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Promptiva - AI Personal Content Creation Engine", version="1.0.0")

# CORS configuration - allow development and production
frontend_urls = os.getenv("FRONTEND_URL", "http://localhost:5173,http://localhost:5174").split(",")
app.add_middleware(
    CORSMiddleware, 
    allow_origins=frontend_urls,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router)
app.include_router(auth_router)


@app.get("/")
async def root():
    return {
        "message": "Welcome to Promptiva - AI Personal Content Creation Engine",
        "version": "1.0.0",
        "status": "running"
    }