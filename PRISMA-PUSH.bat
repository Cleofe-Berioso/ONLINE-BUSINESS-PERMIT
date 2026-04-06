@echo off
REM Prisma DB Push with Supabase Environment Variables
echo.
echo ================================================
echo   Pushing Prisma Schema to Supabase
echo ================================================
echo.

cd /d "%~dp0web"

set "DATABASE_URL=postgresql://postgres.xxqqxicusvhmtubjchft:ISCAPSTONE2026@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
set "DIRECT_URL=postgresql://postgres.xxqqxicusvhmtubjchft:ISCAPSTONE2026@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"

npx prisma db push %*

echo.
echo ================================================
echo   Done!
echo ================================================
pause
