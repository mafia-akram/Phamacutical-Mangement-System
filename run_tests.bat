@echo off
title PMS - Automated DBMS Test Suite Runner
color 0a
echo =========================================================================
echo    PHARMACEUTICAL MANAGEMENT SYSTEM - DBMS INTEGRITY TEST SUITE
echo =========================================================================
echo.

cd /d "%~dp0"

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
    echo [!] Python is not found in PATH. Please install Python to run automated tests.
    pause
    exit /b
)

%PYCMD% tests\run_tests.py

echo.
pause
