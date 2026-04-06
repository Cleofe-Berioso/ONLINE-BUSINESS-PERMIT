@echo off
REM Prisma Migrate with Supabase Environment Variables
echo.
echo ================================================
echo   Running Prisma Migrations on Supabase
echo ================================================
echo.

cd /d "%~dp0web"

set "DATABASE_URL=postgresql://postgres.xxqqxicusvhmtubjchft:ISCAPSTONE2026@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
set "DIRECT_URL=postgresql://postgres.xxqqxicusvhmtubjchft:ISCAPSTONE2026@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"

npx prisma migrate dev %*

echo.
echo ================================================
echo   Done!
echo ================================================
pause
