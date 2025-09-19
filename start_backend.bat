@echo off
echo Starting Backend Server...

REM Deactivate conda if active
call conda deactivate 2>nul

REM Activate venv
call .\venv\Scripts\activate.bat

REM Install/update requirements
echo Installing Python dependencies...
pip install -r backend\requirements.txt

REM Start backend server
echo Starting FastAPI server...
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

pause


