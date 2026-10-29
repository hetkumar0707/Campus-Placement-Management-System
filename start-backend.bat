@echo off
cd /d "%~dp0backend"
echo Starting CPMS backend on http://localhost:5000
call npm start
pause
