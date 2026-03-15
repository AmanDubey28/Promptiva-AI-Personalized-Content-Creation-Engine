#!/bin/bash
# Quick Start Script for Promptiva AI Engine

echo "======================================="
echo "Promptiva - AI Personal Content Creation Engine"
echo "======================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}[STEP 1/5] Installing Backend Dependencies${NC}"
cd Backend
pip install -r requirements.txt
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

echo -e "${YELLOW}[STEP 2/5] Configuring Environment${NC}"
echo "📝 Make sure to add your API keys to Backend/.env:"
echo "   - GEMINI_API_KEY"
echo "   - OPENROUTER_API_KEY"
echo ""
read -p "Press Enter once you've added your API keys to Backend/.env..."
echo -e "${GREEN}✓ Environment configured${NC}"
echo ""

echo -e "${YELLOW}[STEP 3/5] Starting Backend Server${NC}"
echo "🚀 Backend starting on http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Starting in background... (Press Ctrl+C to stop)"
uvicorn app:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
sleep 3
echo -e "${GREEN}✓ Backend running (PID: $BACKEND_PID)${NC}"
echo ""

echo -e "${YELLOW}[STEP 4/5] Installing Frontend Dependencies${NC}"
cd ../frontend
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
echo ""

echo -e "${YELLOW}[STEP 5/5] Starting Frontend Development Server${NC}"
echo "🌐 Frontend starting on http://localhost:5173"
echo ""
echo "Starting in background..."
npm run dev &
FRONTEND_PID=$!
sleep 3
echo -e "${GREEN}✓ Frontend running (PID: $FRONTEND_PID)${NC}"
echo ""

echo "======================================="
echo -e "${GREEN}✅ Promptiva is Ready!${NC}"
echo "======================================="
echo ""
echo "🌐 Frontend:  http://localhost:5173"
echo "🚀 Backend:   http://localhost:8000"
echo "📚 API Docs:  http://localhost:8000/docs"
echo ""
echo "1. Open http://localhost:5173 in your browser"
echo "2. Register a new account"
echo "3. Start creating amazing content!"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

wait
