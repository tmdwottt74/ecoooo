#!/bin/bash
echo "Starting Frontend Server..."

# Deactivate conda if active
conda deactivate 2>/dev/null

# Install/update npm dependencies
echo "Installing Node.js dependencies..."
cd frontend
npm install

# Start frontend server
echo "Starting React development server..."
npm start


