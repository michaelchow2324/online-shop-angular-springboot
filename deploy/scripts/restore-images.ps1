# Replace the local MinIO volume from a tarball. Stop MinIO during extract.
#   $env:CONFIRM='YES'; .\deploy\scripts\restore-images.ps1 backups\minio-YYYYMMDD-HHMMSS.tar.gz
$ErrorActionPreference = "Stop"

if ($env:CONFIRM -ne "YES") {
    throw "Refusing: this replaces MinIO files. Re-run with `$env:CONFIRM='YES'"
}

if ($args.Count -lt 1) {
    throw "usage: restore-images.ps1 path\to\minio-YYYYMMDD-HHMMSS.tar.gz"
}

$File = Resolve-Path $args[0]
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Resolve-Path (Join-Path $ScriptDir "..\..")
$ComposeFile = if ($env:COMPOSE_FILE) { $env:COMPOSE_FILE } else {
    Join-Path $Root "backend\online-store-api\docker-compose.yml"
}
$MinioService = if ($env:MINIO_SERVICE) { $env:MINIO_SERVICE } else { "minio" }
$composeDir = Split-Path -Parent $ComposeFile
$defaultProject = Split-Path -Leaf $composeDir
$project = if ($env:COMPOSE_PROJECT_NAME) { $env:COMPOSE_PROJECT_NAME } else { $defaultProject }
$volume = if ($env:MINIO_VOLUME) { $env:MINIO_VOLUME } else { "${project}_minio-data" }

docker volume inspect $volume | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw "MinIO volume $volume not found. Nothing to restore (prod images are on R2)."
}

$backupDir = Split-Path -Parent $File.Path
$archive = Split-Path -Leaf $File.Path

docker compose -f $ComposeFile stop $MinioService

docker run --rm `
    -v "${volume}:/data" `
    -v "${backupDir}:/backup" `
    alpine:3.20 `
    sh -c "find /data -mindepth 1 -maxdepth 1 -exec rm -rf {} + && tar xzf /backup/$archive -C /data"
if ($LASTEXITCODE -ne 0) {
    docker compose -f $ComposeFile start $MinioService
    throw "MinIO restore failed with exit code $LASTEXITCODE"
}

docker compose -f $ComposeFile start $MinioService
Write-Host "Restored $volume from $File"
