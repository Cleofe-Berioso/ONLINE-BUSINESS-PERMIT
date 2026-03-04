@echo off
title Update ngrok URL in .env
color 0B

echo ============================================================
echo   UPDATE NGROK URL IN .ENV
echo ============================================================
echo.
echo Paste your ngrok URL below (e.g. https://abc123.ngrok-free.app)
echo DO NOT include a trailing slash.
echo.
set /p NGROK_URL="Ngrok URL: "

if "%NGROK_URL%"=="" (
    echo ERROR: No URL entered. Exiting.
    pause
    exit /b
)

echo.
echo [INFO] Updating web\.env with: %NGROK_URL%

REM Backup the current .env
copy "C:\Users\Administrator\Desktop\ONLINE-BUSINESS-PERMIT\web\.env" "C:\Users\Administrator\Desktop\ONLINE-BUSINESS-PERMIT\web\.env.backup" >nul

REM Use PowerShell to replace the values
powershell -Command "(Get-Content 'C:\Users\Administrator\Desktop\ONLINE-BUSINESS-PERMIT\web\.env') -replace 'NEXTAUTH_URL=\".*\"', 'NEXTAUTH_URL=\"%NGROK_URL%\"' -replace 'NEXT_PUBLIC_APP_URL=\".*\"', 'NEXT_PUBLIC_APP_URL=\"%NGROK_URL%\"' | Set-Content 'C:\Users\Administrator\Desktop\ONLINE-BUSINESS-PERMIT\web\.env'"

echo [OK] .env updated successfully!
echo.
echo ============================================================
echo   NEXT STEPS:
echo   1. Stop the dev server (go to that terminal, press Ctrl+C)
echo   2. Restart it:
echo      cd C:\Users\Administrator\Desktop\ONLINE-BUSINESS-PERMIT\web
echo      npm run dev
echo   3. Share this URL with anyone: %NGROK_URL%
echo ============================================================
echo.
pause
