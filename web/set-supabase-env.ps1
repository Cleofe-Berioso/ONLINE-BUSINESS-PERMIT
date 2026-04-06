# Supabase Environment Variables for Prisma
# Copy these to your PowerShell session or add to your profile

$env:DATABASE_URL = "postgresql://postgres.xxqqxicusvhmtubjchft:ISCAPSTONE2026@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
$env:DIRECT_URL = "postgresql://postgres.xxqqxicusvhmtubjchft:ISCAPSTONE2026@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"

Write-Host "✅ Supabase environment variables loaded!" -ForegroundColor Green
Write-Host "   DATABASE_URL: Set" -ForegroundColor Gray
Write-Host "   DIRECT_URL: Set" -ForegroundColor Gray
Write-Host ""
Write-Host "You can now run:" -ForegroundColor Cyan
Write-Host "  • npx prisma db push" -ForegroundColor Yellow
Write-Host "  • npx prisma migrate dev" -ForegroundColor Yellow
Write-Host "  • npx prisma studio" -ForegroundColor Yellow
