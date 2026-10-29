@echo off
cd /d "%~dp0frontend"
echo Starting CPMS frontend. Open http://localhost:5173 in your browser.
call npm run dev
pause
