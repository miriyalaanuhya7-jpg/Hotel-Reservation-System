@echo off
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
cd /d "%~dp0"
echo ========================================================
echo Starting Aura Stays Hotel Reservation Management System
echo URL: http://localhost:3000
echo ========================================================
pnpm dev
pause

