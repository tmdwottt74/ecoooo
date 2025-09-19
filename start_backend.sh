#!/bin/bash
echo "Starting Backend Server..."

# Deactivate conda if active
conda deactivate 2>/dev/null

# Activate venv
source ./venv/bin/activate

# Install/update requirements
echo "Installing Python dependencies..."
pip install -r backend/requirements.txt

# Start backend server
echo "Starting FastAPI server..."
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload


