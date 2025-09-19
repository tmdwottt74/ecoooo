@echo off
echo Starting Ecooo Application...

REM Deactivate conda if active
call conda deactivate 2>nul

REM Activate venv
call .\venv\Scripts\activate.bat

REM Install/update Python requirements
echo Installing Python dependencies...
pip install -r backend\requirements.txt

REM Install/update npm dependencies
echo Installing Node.js dependencies...
cd frontend
npm install
cd ..

REM Start backend in new window
echo Starting Backend Server...
start "Backend Server" cmd /k "call .\venv\Scripts\activate.bat && cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul


