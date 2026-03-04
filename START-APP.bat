@echo off
title Online Business Permit System
color 0A

echo ============================================================
echo   ONLINE BUSINESS PERMIT SYSTEM - STARTING...
echo ============================================================
echo.

REM Reset .env to localhost (in case ngrok URL was set before)
powershell -Command "(Get-Content 'C:\Users\Administrator\Desktop\ONLINE-BUSINESS-PERMIT\web\.env') -replace 'NEXTAUTH_URL=\".*\"', 'NEXTAUTH_URL=\"http://localhost:3000\"' -replace 'NEXT_PUBLIC_APP_URL=\".*\"', 'NEXT_PUBLIC_APP_URL=\"http://localhost:3000\"' | Set-Content 'C:\Users\Administrator\Desktop\ONLINE-BUSINESS-PERMIT\web\.env'"

echo [OK] Environment reset to localhost.
echo [INFO] Starting app...
echo.
echo App will open at: http://localhost:3000
echo.
echo Test accounts (password: Password123!):
echo   Admin:    admin@lgu.gov.ph
echo   Staff:    staff@lgu.gov.ph
echo   Reviewer: reviewer@lgu.gov.ph
echo   Applicant: juan@example.com
echo.
echo Press Ctrl+C to stop the server.
echo ============================================================
echo.

REM Open browser after 8 seconds
start "" timeout /t 8 /nobreak >nul && start "" "http://localhost:3000"

cd /d C:\Users\Administrator\Desktop\ONLINE-BUSINESS-PERMIT\web
npm run dev
