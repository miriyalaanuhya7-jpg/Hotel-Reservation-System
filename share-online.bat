@echo off
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
cd /d "%~dp0"
echo ========================================================
echo Starting High-Speed Cloudflare Tunnel for Aura Stays
echo ========================================================
echo.
"%LOCALAPPDATA%\Programs\nodejs\cloudflared.exe" tunnel --url http://localhost:3000
pause
