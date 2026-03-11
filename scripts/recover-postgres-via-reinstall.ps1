# Recover PostgreSQL data by reinstalling and using old data directory
# Run this script in two phases - see instructions below

param(
    [ValidateSet("backup", "restore-and-dump")]
    [string]$Phase = "backup",
    [string]$Password = "Changezi@123"  # Match your .env DATABASE_URL - change if different
)

$OldDataPath = "C:\Program Files\PostgreSQL\17\data"
$BackupDataPath = "C:\Users\HP\Desktop\Projects\Uni\Web Project\project\database-backup\postgres17_data_backup"
$OutputFile = "C:\Users\HP\Desktop\Projects\Uni\Web Project\project\database-backup\recovered_team_analysts.sql"

if ($Phase -eq "backup") {
    Write-Host "`n=== PHASE 1: Backup old data directory ===" -ForegroundColor Cyan
    
    if (-not (Test-Path $OldDataPath)) {
        Write-Host "Error: Old data not found at $OldDataPath" -ForegroundColor Red
        exit 1
    }

    Write-Host "Copying $OldDataPath to $BackupDataPath ..." -ForegroundColor Yellow
    Write-Host "(This may take a few minutes)" -ForegroundColor Gray
    
    if (Test-Path $BackupDataPath) {
        Remove-Item $BackupDataPath -Recurse -Force
    }
    Copy-Item -Path $OldDataPath -Destination $BackupDataPath -Recurse -Force

    Write-Host "`nBackup complete!" -ForegroundColor Green
    Write-Host "`n--- NEXT STEP: Reinstall PostgreSQL 17 ---" -ForegroundColor Cyan
    Write-Host "1. Download: https://www.postgresql.org/download/windows/"
    Write-Host "2. Run the installer (choose same install path: C:\Program Files\PostgreSQL\17)"
    Write-Host "3. Set a password for postgres user (you can use: Changezi@123 to match your .env)"
    Write-Host "4. After install completes, run this script again with -Phase restore-and-dump"
    Write-Host "`n   .\scripts\recover-postgres-via-reinstall.ps1 -Phase restore-and-dump" -ForegroundColor Yellow
    exit 0
}

if ($Phase -eq "restore-and-dump") {
    Write-Host "`n=== PHASE 2: Restore old data and export ===" -ForegroundColor Cyan

    if (-not (Test-Path $BackupDataPath)) {
        Write-Host "Error: Backup not found at $BackupDataPath" -ForegroundColor Red
        Write-Host "Run Phase 1 first: .\scripts\recover-postgres-via-reinstall.ps1 -Phase backup" -ForegroundColor Yellow
        exit 1
    }

    # Find PostgreSQL service
    $pgService = Get-Service | Where-Object { $_.Name -like "*postgres*17*" -or $_.Name -eq "postgresql-x64-17" }
    if (-not $pgService) {
        $pgService = Get-Service | Where-Object { $_.DisplayName -like "*PostgreSQL*17*" }
    }
    if (-not $pgService) {
        Write-Host "Error: PostgreSQL 17 service not found. Is it installed?" -ForegroundColor Red
        Get-Service | Where-Object { $_.Name -like "*postgres*" } | Format-Table Name, Status, DisplayName
        exit 1
    }

    Write-Host "Found service: $($pgService.Name)" -ForegroundColor Gray

    # Stop service
    Write-Host "`nStopping PostgreSQL service..." -ForegroundColor Yellow
    Stop-Service $pgService.Name -Force
    Start-Sleep -Seconds 3

    # Replace data directory
    $NewDataPath = "C:\Program Files\PostgreSQL\17\data"
    if (-not (Test-Path $NewDataPath)) {
        Write-Host "Error: PostgreSQL data path not found: $NewDataPath" -ForegroundColor Red
        Start-Service $pgService.Name
        exit 1
    }

    Write-Host "Replacing new data with your old data..." -ForegroundColor Yellow
    Remove-Item $NewDataPath -Recurse -Force
    Copy-Item -Path $BackupDataPath -Destination $NewDataPath -Recurse -Force

    # Start service
    Write-Host "Starting PostgreSQL service..." -ForegroundColor Yellow
    Start-Service $pgService.Name
    Start-Sleep -Seconds 5

    # Run pg_dump
    $pgDump = "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe"
    if (-not (Test-Path $pgDump)) {
        Write-Host "Error: pg_dump not found at $pgDump" -ForegroundColor Red
        exit 1
    }

    Write-Host "`nExporting team and analysts data..." -ForegroundColor Green
    $env:PGPASSWORD = $Password
    & $pgDump -U postgres -h localhost -d inspired_analyst -t team -t analysts --data-only --column-inserts -f $OutputFile 2>&1

    if ($LASTEXITCODE -eq 0) {
        $lineCount = (Get-Content $OutputFile | Measure-Object -Line).Lines
        Write-Host "`n--- Recovery complete ---" -ForegroundColor Green
        Write-Host "Exported to: $OutputFile ($lineCount lines)"
        Write-Host "`nTo import into Docker PostgreSQL:"
        Write-Host "  Get-Content `"$OutputFile`" | docker exec -i postgres-inspired psql -U postgres -d inspired_analyst" -ForegroundColor Yellow
        Write-Host "`nThen run migrate:postgres-to-mongo to copy to MongoDB." -ForegroundColor Cyan
    } else {
        Write-Host "`npg_dump may have failed. Check if database 'inspired_analyst' exists." -ForegroundColor Red
    }

    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    exit 0
}
