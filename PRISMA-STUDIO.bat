@echo off
REM Prisma Studio with Supabase Environment Variables  
echo.
echo ================================================
echo   Opening Prisma Studio (Supabase Database)
echo ================================================
echo.

cd /d "%~dp0web"

set "DATABASE_URL=postgresql://postgres.xxqqxicusvhmtubjchft:ISCAPSTONE2026@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
set "DIRECT_URL=postgresql://postgres.xxqqxicusvhmtubjchft:ISCAPSTONE2026@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"

echo Opening Prisma Studio at http://localhost:5555
echo Press Ctrl+C to stop
echo.

npx prisma studio

pause
