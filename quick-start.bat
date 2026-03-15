@echo off
REM Quick Start Script for Promptiva AI Engine (Windows)

color 0A
echo.
echo =======================================
echo Promptiva - AI Personal Content Creation Engine
echo =======================================
echo.

echo [STEP 1/5] Installing Backend Dependencies
cd Backend
pip install -r requirements.txt
echo Successfully installed backend dependencies
echo.

echo [STEP 2/5] Configuring Environment
echo Make sure to add your API keys to Backend\.env:
echo    - GEMINI_API_KEY
echo    - OPENROUTER_API_KEY
pause
echo.

echo [STEP 3/5] Starting Backend Server
echo Backend starting on http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
start cmd /k "cd Backend && python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000"
echo Backend launched in new window
timeout /t 3
echo.

echo [STEP 4/5] Installing Frontend Dependencies
cd ..\frontend
call npm install
echo Frontend dependencies installed
echo.

echo [STEP 5/5] Starting Frontend Development Server
echo Frontend starting on http://localhost:5173
echo.
start cmd /k "npm run dev"
echo Frontend launched in new window
timeout /t 3
echo.

color 0A
echo =======================================
echo Promptiva is Ready!
echo =======================================
echo.
echo Frontend:  http://localhost:5173
echo Backend:   http://localhost:8000
echo API Docs:  http://localhost:8000/docs
echo.
echo 1. Open http://localhost:5173 in your browser
echo 2. Register a new account
echo 3. Start creating amazing content!
echo.
echo Both servers are running in separate windows
echo.
pause
