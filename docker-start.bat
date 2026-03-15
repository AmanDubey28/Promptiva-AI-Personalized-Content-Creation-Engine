@echo off
REM Quick Docker startup script for Promptiva

echo.
echo ================================================
echo   Promptiva - Docker Quick Start
echo ================================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed!
    echo Please download Docker Desktop: https://www.docker.com/products/docker-desktop
    exit /b 1
)

echo ✓ Docker found
echo.

REM Check if docker-compose.yml exists
if not exist "docker-compose.yml" (
    echo ERROR: docker-compose.yml not found!
    echo Make sure you're in the project root directory.
    exit /b 1
)

echo ✓ docker-compose.yml found
echo.

REM Check for .env file
if not exist "Backend\.env" (
    echo WARNING: Backend\.env not found!
    echo Please create it by copying from Backend\.env.example
    echo and adding your API keys.
    echo.
)

echo Starting containers...
echo.

REM Build and start containers
docker-compose up --build

echo.
echo ================================================
echo   Services Started!
echo ================================================
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:8000
echo   Database:  localhost:5432
echo ================================================
echo.
echo Press Ctrl+C to stop
