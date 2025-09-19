#!/bin/bash
echo "Starting Ecooo Application..."

# Deactivate conda if active
conda deactivate 2>/dev/null

# Activate venv
source ./venv/bin/activate

# Install/update Python requirements
echo "Installing Python dependencies..."
pip install -r backend/requirements.txt

# Install/update npm dependencies
echo "Installing Node.js dependencies..."
cd frontend
npm install
cd ..

# Start backend in background
echo "Starting Backend Server..."
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting Frontend Server..."
cd frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "Both servers are starting..."
echo "Backend: http://127.0.0.1:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait


