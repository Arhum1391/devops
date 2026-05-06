# PostgreSQL Setup Script for Inspired Analyst Project
# This script helps you set up PostgreSQL step by step

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Setup for Inspired Analyst" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if PostgreSQL is installed
Write-Host "Step 1: Checking PostgreSQL installation..." -ForegroundColor Yellow

$pgService = Get-Service | Where-Object {$_.Name -like "*postgres*" -or $_.DisplayName -like "*postgres*"}
$pgPath = Test-Path "C:\Program Files\PostgreSQL"

if ($pgService -or $pgPath) {
    Write-Host "✓ PostgreSQL appears to be installed!" -ForegroundColor Green
    if ($pgService) {
        Write-Host "  Service found: $($pgService.DisplayName)" -ForegroundColor Green
        Write-Host "  Status: $($pgService.Status)" -ForegroundColor $(if ($pgService.Status -eq 'Running') { 'Green' } else { 'Yellow' })
    }
} else {
    Write-Host "✗ PostgreSQL is not installed or not found." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL first:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    Write-Host "2. Run the installer"
    Write-Host "3. Remember the password you set for 'postgres' user"
    Write-Host "4. After installation, run this script again"
    Write-Host ""
    $install = Read-Host "Press Enter to open download page, or 'skip' to continue anyway"
    if ($install -ne 'skip') {
        Start-Process "https://www.postgresql.org/download/windows/"
    }
    exit
}

Write-Host ""

# Step 2: Check if service is running
Write-Host "Step 2: Checking PostgreSQL service status..." -ForegroundColor Yellow

if ($pgService) {
    if ($pgService.Status -ne 'Running') {
        Write-Host "⚠ PostgreSQL service is not running." -ForegroundColor Yellow
        $start = Read-Host "Would you like to start it now? (y/n)"
        if ($start -eq 'y') {
            try {
                Start-Service -Name $pgService.Name
                Write-Host "✓ Service started successfully!" -ForegroundColor Green
            } catch {
                Write-Host "✗ Failed to start service. You may need to run as Administrator." -ForegroundColor Red
                Write-Host "  Error: $_" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "✓ PostgreSQL service is running!" -ForegroundColor Green
    }
}

Write-Host ""

# Step 3: Find psql executable
Write-Host "Step 3: Finding PostgreSQL installation..." -ForegroundColor Yellow

$psqlPath = $null
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\*\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\*\bin\psql.exe"
)

foreach ($path in $possiblePaths) {
    $found = Get-ChildItem -Path $path -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $psqlPath = $found.FullName
        Write-Host "✓ Found PostgreSQL at: $($found.Directory.Parent.FullName)" -ForegroundColor Green
        break
    }
}

if (-not $psqlPath) {
    Write-Host "✗ Could not find psql.exe" -ForegroundColor Red
    Write-Host "  Please ensure PostgreSQL is installed correctly." -ForegroundColor Yellow
    exit
}

Write-Host ""

# Step 4: Test connection
Write-Host "Step 4: Testing PostgreSQL connection..." -ForegroundColor Yellow

$pgPassword = Read-Host "Enter PostgreSQL 'postgres' user password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

$env:PGPASSWORD = $plainPassword

try {
    $testConnection = & $psqlPath -U postgres -d postgres -c "SELECT version();" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Connection successful!" -ForegroundColor Green
    } else {
        Write-Host "✗ Connection failed. Please check your password." -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "✗ Connection failed: $_" -ForegroundColor Red
    exit
}

Write-Host ""

# Step 5: Create database
Write-Host "Step 5: Creating database 'inspired_analyst'..." -ForegroundColor Yellow

$dbExists = & $psqlPath -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='inspired_analyst'" 2>&1

if ($dbExists -eq "1") {
    Write-Host "✓ Database 'inspired_analyst' already exists!" -ForegroundColor Green
} else {
    try {
        & $psqlPath -U postgres -d postgres -c "CREATE DATABASE inspired_analyst;" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Database 'inspired_analyst' created successfully!" -ForegroundColor Green
        } else {
            Write-Host "✗ Failed to create database." -ForegroundColor Red
            exit
        }
    } catch {
        Write-Host "✗ Error creating database: $_" -ForegroundColor Red
        exit
    }
}

Write-Host ""

# Step 6: Create .env.local file
Write-Host "Step 6: Setting up connection string..." -ForegroundColor Yellow

$envFile = ".env.local"
$connectionString = "postgresql://postgres:$plainPassword@localhost:5432/inspired_analyst?schema=public"

if (Test-Path $envFile) {
    Write-Host "⚠ .env.local already exists." -ForegroundColor Yellow
    $content = Get-Content $envFile -Raw
    
    if ($content -match "DATABASE_URL") {
        Write-Host "  DATABASE_URL already exists in .env.local" -ForegroundColor Yellow
        $update = Read-Host "  Would you like to update it? (y/n)"
        if ($update -eq 'y') {
            $content = $content -replace "DATABASE_URL=.*", "DATABASE_URL=`"$connectionString`""
            Set-Content -Path $envFile -Value $content
            Write-Host "✓ DATABASE_URL updated!" -ForegroundColor Green
        }
    } else {
        Add-Content -Path $envFile -Value "`nDATABASE_URL=`"$connectionString`""
        Write-Host "✓ DATABASE_URL added to .env.local!" -ForegroundColor Green
    }
} else {
    Set-Content -Path $envFile -Value "DATABASE_URL=`"$connectionString`""
    Write-Host "✓ Created .env.local with DATABASE_URL!" -ForegroundColor Green
}

Write-Host ""

# Step 7: Install dependencies and generate Prisma client
Write-Host "Step 7: Installing dependencies and generating Prisma client..." -ForegroundColor Yellow

if (Test-Path "package.json") {
    Write-Host "  Running npm install..." -ForegroundColor Cyan
    npm install 2>&1 | Out-Null
    
    Write-Host "  Generating Prisma client..." -ForegroundColor Cyan
    npm run prisma:generate 2>&1 | Out-Null
    
    Write-Host "✓ Dependencies installed and Prisma client generated!" -ForegroundColor Green
} else {
    Write-Host "✗ package.json not found. Please run this script from the project root." -ForegroundColor Red
}

Write-Host ""

# Step 8: Run migrations
Write-Host "Step 8: Ready to run database migrations!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm run prisma:migrate" -ForegroundColor White
Write-Host "2. When prompted, enter migration name: 'init'" -ForegroundColor White
Write-Host "3. Verify with: npm run prisma:studio" -ForegroundColor White
Write-Host ""

# Clean up
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
