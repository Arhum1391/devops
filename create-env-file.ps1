# Create .env file for Prisma
Write-Host "Creating .env file..." -ForegroundColor Yellow

$envContent = @'
# PostgreSQL Connection String
# Note: Password contains @ symbol, URL-encoded as %40
DATABASE_URL="postgresql://postgres:Changezi%40123@localhost:5432/inspired_analyst?schema=public"
'@

Set-Content -Path ".env" -Value $envContent

Write-Host "✓ .env file created!" -ForegroundColor Green
Write-Host ""
Write-Host "File contents:" -ForegroundColor Cyan
Get-Content .env
Write-Host ""
Write-Host "Now try running: npm run prisma:migrate" -ForegroundColor Yellow
