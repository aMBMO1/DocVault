@echo off
setlocal

title GestionDocuments - React Frontend

echo ==========================================
echo     GestionDocuments - REACT FRONTEND
echo ==========================================
echo.

cd /d "%~dp0frontend"

if not exist "package.json" (
    echo [ERROR] package.json not found.
    echo Expected folder:
    echo %~dp0frontend
    echo.
    pause
    exit /b 1
)

echo [INFO] Checking Node.js...
node --version

if errorlevel 1 (
    echo.
    echo [ERROR] Node.js is not installed or not in PATH.
    echo.
    pause
    exit /b 1
)

echo.
echo [INFO] Checking npm...
npm --version

if errorlevel 1 (
    echo.
    echo [ERROR] npm is not available.
    echo.
    pause
    exit /b 1
)

echo.
if not exist "node_modules" (
    echo [INFO] node_modules not found.
    echo [INFO] Installing dependencies...
    echo.

    npm install

    if errorlevel 1 (
        echo.
        echo [ERROR] npm install failed.
        echo.
        pause
        exit /b 1
    )
)

echo.
echo ==========================================
echo       Starting React / Vite...
echo ==========================================
echo.
echo Frontend:
echo http://localhost:5173/
echo.
echo Press CTRL+C to stop the server.
echo.

npm run dev

echo.
echo ==========================================
echo React server stopped.
echo ==========================================
pause