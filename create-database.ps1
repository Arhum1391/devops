# Script to create the database
# Run this AFTER PostgreSQL is installed

Write-Host "Creating database 'inspired_analyst'..." -ForegroundColor Yellow

# Try to find psql
$psqlPaths = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\16\bin\psql.exe"
)

$psqlPath = $null
foreach ($path in $psqlPaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        Write-Host "Found PostgreSQL at: $path" -ForegroundColor Green
        break
    }
}

if (-not $psqlPath) {
    Write-Host "Could not find psql.exe. Please create the database manually using pgAdmin." -ForegroundColor Red
    Write-Host "Database name: inspired_analyst" -ForegroundColor Yellow
    exit
}

$password = Read-Host "Enter PostgreSQL 'postgres' user password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

$env:PGPASSWORD = $plainPassword

# Check if database exists
$exists = & $psqlPath -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='inspired_analyst'" 2>&1

if ($exists -eq "1") {
    Write-Host "Database 'inspired_analyst' already exists!" -ForegroundColor Green
} else {
    & $psqlPath -U postgres -d postgres -c "CREATE DATABASE inspired_analyst;"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database 'inspired_analyst' created successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to create database. Please check your password." -ForegroundColor Red
    }
}

Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
