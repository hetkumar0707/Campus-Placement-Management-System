@echo off
setlocal
cd /d "%~dp0backend"
echo CPMS database initialization
echo Make sure backend\.env has the correct MySQL password.
call npm run db:init
if errorlevel 1 (
  echo.
  echo Database initialization failed. Check MySQL is running and backend\.env is correct.
)
pause
