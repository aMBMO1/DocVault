@echo off
setlocal

title GestionDocuments - Django Backend

echo ==========================================
echo     GestionDocuments - DJANGO BACKEND
echo ==========================================
echo.

cd /d "%~dp0backend"

if not exist "manage.py" (
    echo [ERROR] manage.py not found.
    echo Expected folder:
    echo %~dp0backend
    echo.
    pause
    exit /b 1
)

if not exist "venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found.
    echo.
    echo Please create it with:
    echo python -m venv venv
    echo.
    pause
    exit /b 1
)

echo [INFO] Using local virtual environment...
echo.

echo [INFO] Django version:
venv\Scripts\python.exe -m django --version

echo.
echo [INFO] Checking Django configuration...
venv\Scripts\python.exe manage.py check

if errorlevel 1 (
    echo.
    echo [ERROR] Django check failed.
    echo.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo       Starting Django server...
echo ==========================================
echo.
echo API:
echo http://127.0.0.1:8000/api/
echo.
echo Admin:
echo http://127.0.0.1:8000/admin/
echo.
echo Press CTRL+C to stop the server.
echo.

venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000

echo.
echo ==========================================
echo Django server stopped.
echo ==========================================
pause