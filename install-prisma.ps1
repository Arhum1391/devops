# Install Prisma and Generate Client
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing Prisma..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Install Prisma packages
Write-Host "Step 1: Installing @prisma/client and prisma..." -ForegroundColor Yellow
npm install @prisma/client --save
npm install prisma --save-dev

Write-Host ""
Write-Host "Step 2: Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Prisma installation complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure you have DATABASE_URL in .env.local" -ForegroundColor White
Write-Host "2. Run: npm run prisma:migrate" -ForegroundColor White
Write-Host ""
