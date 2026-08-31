# Replace the database with a pg_dump file. Stop the API first.
#   $env:CONFIRM='YES'; .\deploy\scripts\restore-db.ps1 backups\storedb-YYYYMMDD-HHMMSS.sql
$ErrorActionPreference = "Stop"

if ($env:CONFIRM -ne "YES") {
    throw "Refusing: this drops and recreates the database. Re-run with `$env:CONFIRM='YES'"
}

if ($args.Count -lt 1) {
    throw "usage: restore-db.ps1 path\to\storedb-YYYYMMDD-HHMMSS.sql[.gz]"
}

$File = Resolve-Path $args[0]
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Resolve-Path (Join-Path $ScriptDir "..\..")
$ComposeFile = if ($env:COMPOSE_FILE) { $env:COMPOSE_FILE } else {
    Join-Path $Root "backend\online-store-api\docker-compose.yml"
}
$DbService = if ($env:DB_SERVICE) { $env:DB_SERVICE } else { "db" }
$PostgresUser = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "store" }
$PostgresDb = if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { "storedb" }

Write-Host "Dropping $PostgresDb"
docker compose -f $ComposeFile exec -T $DbService `
    psql -U $PostgresUser -d postgres -v ON_ERROR_STOP=1 `
    -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$PostgresDb' AND pid <> pg_backend_pid();" `
    -c "DROP DATABASE IF EXISTS $PostgresDb;" `
    -c "CREATE DATABASE $PostgresDb OWNER $PostgresUser;"
if ($LASTEXITCODE -ne 0) {
    throw "Failed to recreate database"
}

Write-Host "Restoring $File"
if ($File.Path.EndsWith(".gz")) {
    $sql = New-TemporaryFile
    try {
        $in = [System.IO.File]::OpenRead($File.Path)
        $gzip = New-Object System.IO.Compression.GZipStream($in, [System.IO.Compression.CompressionMode]::Decompress)
        $out = [System.IO.File]::OpenWrite($sql.FullName)
        $gzip.CopyTo($out)
        $out.Close()
        $gzip.Close()
        $in.Close()
        Get-Content -Raw $sql.FullName | docker compose -f $ComposeFile exec -T $DbService `
            psql -U $PostgresUser -d $PostgresDb -v ON_ERROR_STOP=1
    } finally {
        Remove-Item -Force $sql.FullName -ErrorAction SilentlyContinue
    }
} else {
    Get-Content -Raw $File.Path | docker compose -f $ComposeFile exec -T $DbService `
        psql -U $PostgresUser -d $PostgresDb -v ON_ERROR_STOP=1
}
if ($LASTEXITCODE -ne 0) {
    throw "psql restore failed with exit code $LASTEXITCODE"
}

Write-Host "Restored $PostgresDb"
