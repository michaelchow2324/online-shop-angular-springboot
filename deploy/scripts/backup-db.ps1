# Full Postgres dump for Windows + Docker Desktop.
# Schedule in Task Scheduler: powershell.exe -File "...\deploy\scripts\backup-db.ps1"
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Resolve-Path (Join-Path $ScriptDir "..\..")
$BackupDir = if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else { Join-Path $Root "backups" }
$KeepDays = if ($env:KEEP_DAYS) { [int]$env:KEEP_DAYS } else { 14 }
$ComposeFile = if ($env:COMPOSE_FILE) { $env:COMPOSE_FILE } else {
    Join-Path $Root "backend\online-store-api\docker-compose.yml"
}
$DbService = if ($env:DB_SERVICE) { $env:DB_SERVICE } else { "db" }
$PostgresUser = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "store" }
$PostgresDb = if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { "storedb" }

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outfile = Join-Path $BackupDir "storedb-$stamp.sql"

$dump = docker compose -f $ComposeFile exec -T $DbService `
    pg_dump -U $PostgresUser -d $PostgresDb --no-owner --no-acl
if ($LASTEXITCODE -ne 0) {
    throw "pg_dump failed with exit code $LASTEXITCODE"
}

[System.IO.File]::WriteAllText($outfile, $dump)
Write-Host "Wrote $outfile"

if ($KeepDays -gt 0) {
    Get-ChildItem $BackupDir -Filter "storedb-*.sql*" |
        Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$KeepDays) } |
        Remove-Item -Force
}
