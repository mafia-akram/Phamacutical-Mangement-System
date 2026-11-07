@echo off
title Pharmaceutical Management System (PMS)
color 0b
echo =========================================================================
echo    PHARMACEUTICAL MANAGEMENT SYSTEM (PMS) - ONE-CLICK LAUNCHER
echo =========================================================================
echo.

cd /d "%~dp0"

:: 1. Detect Python
set PYCMD=
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set PYCMD=python
) else (
    where py >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        set PYCMD=py
    )
)

if "%PYCMD%"=="" (
    echo [!] Python is not detected in your Windows PATH.
    echo [+] Opening the Standalone Web Interface directly in your default browser...
    echo.
    start "" "frontend\index.html"
    echo [OK] The system is running in browser simulation mode with full features!
    pause
    exit /b
)

echo [+] Python environment detected: %PYCMD%
echo.
echo [1/3] Initializing SQLite database (Schema, Views, Triggers, Sample Data)...
%PYCMD% database\init_db.py
if %ERRORLEVEL% NEQ 0 (
    echo [!] Database initialization encountered a notice. Continuing...
)

echo.
echo [2/3] Launching web browser at http://localhost:5000...
timeout /t 2 /nobreak >nul
start "" "http://localhost:5000"

echo.
echo [3/3] Starting Python REST API Server on port 5000...
echo.
echo =========================================================================
echo   PMS Server is ACTIVE and running!
echo   Open in browser: http://localhost:5000
echo   To shut down the server, press Ctrl+C in this terminal window.
echo =========================================================================
echo.
%PYCMD% backend\server.py

pause
