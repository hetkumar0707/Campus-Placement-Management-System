@echo off
setlocal
cd /d "%~dp0"
echo =============================================
echo CPMS - Installing backend dependencies
echo =============================================
cd backend
call npm install
if errorlevel 1 goto failed
cd ..\frontend
echo =============================================
echo CPMS - Installing frontend dependencies
echo =============================================
call npm install
if errorlevel 1 goto failed
echo.
echo Dependencies installed successfully.
echo Next: configure backend\.env, then run initialize-database.bat.
pause
exit /b 0
:failed
echo.
echo Installation failed. Confirm Node.js and npm are installed and check the error above.
pause
exit /b 1
