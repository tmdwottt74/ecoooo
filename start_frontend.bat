@echo off
echo Starting Frontend Server...

REM Deactivate conda if active
call conda deactivate 2>nul

REM Install/update npm dependencies
echo Installing Node.js dependencies...
cd frontend
npm install

REM Start frontend server
echo Starting React development server...
npm start

pause


