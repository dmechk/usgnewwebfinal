@echo off
title Ubumwe SACCO - System Launcher
echo ========================================================
echo   UBUMWE SACCO - STARTING BACKEND AND FRONTEND
echo ========================================================
echo.
echo Starting Backend API (Port 5000)...
start "Ubumwe Backend API (:5000)" cmd /k "cd /d "%~dp0webusgbackend" && npm start"

timeout /t 3 /nobreak >nul

echo Starting Frontend Web Portal (Port 3000)...
start "Ubumwe Frontend (:3000)" cmd /k "cd /d "%~dp0usgweb-main" && npm run dev"

echo.
echo ========================================================
echo   Services are running!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo ========================================================
pause
