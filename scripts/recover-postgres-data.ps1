# Recover team and analysts data from old PostgreSQL data directory
# Usage: .\scripts\recover-postgres-data.ps1 -DataPath "C:\path\to\postgres\data"
# Example: .\scripts\recover-postgres-data.ps1 -DataPath "C:\Program Files\PostgreSQL\16\data"

param(
    [Parameter(Mandatory=$true)]
    [string]$DataPath,
    
    [string]$PostgresVersion = "16"
)

$DataPath = $DataPath.TrimEnd('\')
if (-not (Test-Path $DataPath)) {
    Write-Host "Error: Data directory not found: $DataPath" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== PostgreSQL Data Recovery ===" -ForegroundColor Cyan
Write-Host "Data path: $DataPath"
Write-Host "PostgreSQL version: $PostgresVersion`n" -ForegroundColor Gray

# Stop current postgres container to free port 5432 (optional - we'll use 5433 to avoid conflict)
Write-Host "Starting recovery container on port 5433 (your Docker postgres can stay on 5432)..." -ForegroundColor Yellow

# Remove any existing recovery container
docker rm -f postgres-recovery 2>$null

# Run PostgreSQL with the OLD data directory
# Use same major version as the data was created with
$image = "postgres:$PostgresVersion"
Write-Host "Running: docker run -d --name postgres-recovery -v `"${DataPath}:/var/lib/postgresql/data`" -p 5433:5432 -e POSTGRES_HOST_AUTH_METHOD=trust $image"
docker run -d --name postgres-recovery -v "${DataPath}:/var/lib/postgresql/data" -p 5433:5432 -e POSTGRES_HOST_AUTH_METHOD=trust $image

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nFailed to start recovery container." -ForegroundColor Red
    Write-Host "Try a different PostgresVersion: 14, 15, or 16 (must match the version that created the data)" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nWaiting for PostgreSQL to start (15 seconds)..." -ForegroundColor Gray
Start-Sleep -Seconds 15

# Check if inspired_analyst database exists
$dbCheck = docker exec postgres-recovery psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='inspired_analyst'" 2>&1
if ($dbCheck -notmatch "1") {
    Write-Host "`nDatabase 'inspired_analyst' not found in the old data." -ForegroundColor Red
    Write-Host "Available databases:" -ForegroundColor Yellow
    docker exec postgres-recovery psql -U postgres -c "\l"
    docker rm -f postgres-recovery 2>$null
    exit 1
}

# Export team and analysts
$outputDir = Join-Path (Split-Path $PSScriptRoot -Parent) "database-backup"
$recoveryFile = Join-Path $outputDir "recovered_team_analysts_$(Get-Date -Format 'yyyy-MM-dd_HH-mm').sql"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

Write-Host "`nExporting team and analysts data..." -ForegroundColor Green
docker exec postgres-recovery pg_dump -U postgres -d inspired_analyst -t team -t analysts --data-only --column-inserts 2>&1 | Out-File -FilePath $recoveryFile -Encoding utf8

# Get row counts
$teamCount = docker exec postgres-recovery psql -U postgres -d inspired_analyst -tAc "SELECT COUNT(*) FROM team"
$analystsCount = docker exec postgres-recovery psql -U postgres -d inspired_analyst -tAc "SELECT COUNT(*) FROM analysts"

Write-Host "`n--- Recovery complete ---" -ForegroundColor Green
Write-Host "Team rows: $teamCount"
Write-Host "Analysts rows: $analystsCount"
Write-Host "Exported to: $recoveryFile"
Write-Host "`nStopping recovery container..." -ForegroundColor Gray
docker rm -f postgres-recovery 2>$null
Write-Host "`nTo import into Docker PostgreSQL:"
Write-Host "  Get-Content `"$recoveryFile`" | docker exec -i postgres-inspired psql -U postgres -d inspired_analyst" -ForegroundColor Yellow
Write-Host "`nOr run the migration script to copy to MongoDB (after adding team data to PostgreSQL first)." -ForegroundColor Cyan
