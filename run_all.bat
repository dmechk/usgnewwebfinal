@echo off
title Ubumwe SACCO - System Launcher
echo ========================================================
echo   UBUMWE SACCO - STARTING SYSTEM SERVICES
echo ========================================================
echo.
if not exist "%~dp0webusgbackend\data\db" mkdir "%~dp0webusgbackend\data\db"
echo Starting MongoDB Server (:27017)...
start "Ubumwe MongoDB (:27017)" cmd /k ""C:\Program Files\MongoDB\Server\9.0\bin\mongod.exe" --dbpath "%~dp0webusgbackend\data\db" --bind_ip 127.0.0.1"

timeout /t 3 /nobreak >nul

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
echo   Database: 127.0.0.1:27017
echo ========================================================
pause
