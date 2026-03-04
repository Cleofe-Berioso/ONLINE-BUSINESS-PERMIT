@echo off
title Online Business Permit System - Launcher
color 0A

echo ============================================================
echo   ONLINE BUSINESS PERMIT SYSTEM - ONLINE LAUNCHER
echo ============================================================
echo.

REM ── Step 1: Check if ngrok is installed ─────────────────────
where ngrok >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] ngrok not found. Installing via winget...
    winget install ngrok.ngrok --silent
    echo [INFO] Please restart this script after installation.
    pause
    exit /b
)

echo [OK] ngrok is installed.

REM ── Step 2: Check if npm dev is running ─────────────────────
curl -s http://localhost:3000 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Starting Next.js app on port 3000...
    start "Next.js Dev Server" cmd /k "cd /d C:\Users\Administrator\Desktop\ONLINE-BUSINESS-PERMIT\web && npm run dev"
    echo [INFO] Waiting 10 seconds for app to start...
    timeout /t 10 /nobreak >nul
) else (
    echo [OK] App is already running on port 3000.
)

REM ── Step 3: Check for ngrok authtoken ───────────────────────
echo.
echo ============================================================
echo   IMPORTANT: You need a FREE ngrok account to proceed.
echo   If you haven't done this yet:
echo   1. Go to: https://dashboard.ngrok.com/signup
echo   2. Sign up for a free account
echo   3. Copy your Authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken
echo   4. Run this command in a NEW terminal window:
echo      ngrok config add-authtoken YOUR_TOKEN_HERE
echo   5. Then run this script again.
echo ============================================================
echo.
set /p CONTINUE="Have you already added your authtoken? (Y/N): "
if /i "%CONTINUE%" NEQ "Y" (
    echo Opening ngrok signup page...
    start "" "https://dashboard.ngrok.com/signup"
    echo.
    echo After signing up and adding your authtoken, run this script again.
    pause
    exit /b
)

REM ── Step 4: Start ngrok tunnel ───────────────────────────────
echo.
echo [INFO] Starting ngrok tunnel on port 3000...
echo [INFO] A new window will open showing your public URL.
echo.
echo ============================================================
echo   AFTER NGROK STARTS:
echo   1. Look for the "Forwarding" URL in the ngrok window
echo      Example: https://abc123.ngrok-free.app
echo   2. Update web\.env with that URL:
echo      NEXTAUTH_URL="https://abc123.ngrok-free.app"
echo      NEXT_PUBLIC_APP_URL="https://abc123.ngrok-free.app"
echo   3. Restart the dev server (Ctrl+C then npm run dev)
echo   4. Share the URL with anyone to access your app!
echo ============================================================
echo.

start "ngrok Tunnel" cmd /k "ngrok http 3000"

echo [OK] ngrok started! Check the ngrok window for your public URL.
echo.
pause
