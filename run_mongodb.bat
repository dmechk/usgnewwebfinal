@echo off
title Ubumwe SACCO - MongoDB Server
echo ========================================================
echo   UBUMWE SACCO - STARTING MONGODB (Port 27017)
echo ========================================================
echo.
if not exist "%~dp0webusgbackend\data\db" mkdir "%~dp0webusgbackend\data\db"
"C:\Program Files\MongoDB\Server\9.0\bin\mongod.exe" --dbpath "%~dp0webusgbackend\data\db" --bind_ip 127.0.0.1
pause
