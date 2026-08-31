# Local MinIO volume tarball for Windows + Docker Desktop.
# Skips when the volume is missing (prod images live on R2).
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Resolve-Path (Join-Path $ScriptDir "..\..")
$BackupDir = if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else { Join-Path $Root "backups" }
$KeepDays = if ($env:KEEP_DAYS) { [int]$env:KEEP_DAYS } else { 14 }
$ComposeFile = if ($env:COMPOSE_FILE) { $env:COMPOSE_FILE } else {
    Join-Path $Root "backend\online-store-api\docker-compose.yml"
}

if ($env:SKIP_MINIO -eq "1") {
    Write-Host "Skip MinIO backup (SKIP_MINIO=1)"
    exit 0
}

$composeDir = Split-Path -Parent $ComposeFile
$defaultProject = Split-Path -Leaf $composeDir
$project = if ($env:COMPOSE_PROJECT_NAME) { $env:COMPOSE_PROJECT_NAME } else { $defaultProject }
$volume = if ($env:MINIO_VOLUME) { $env:MINIO_VOLUME } else { "${project}_minio-data" }

docker volume inspect $volume | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Skip MinIO backup: volume $volume not found (prod images are on R2)"
    exit 0
}

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$archive = "minio-$stamp.tar.gz"

docker run --rm `
    -v "${volume}:/data:ro" `
    -v "${BackupDir}:/backup" `
    alpine:3.20 `
    tar czf "/backup/$archive" -C /data .
if ($LASTEXITCODE -ne 0) {
    throw "MinIO backup failed with exit code $LASTEXITCODE"
}

Write-Host "Wrote $(Join-Path $BackupDir $archive)"

if ($KeepDays -gt 0) {
    Get-ChildItem $BackupDir -Filter "minio-*.tar.gz" |
        Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$KeepDays) } |
        Remove-Item -Force
}
