# Full local restore backup: Postgres dump + MinIO volume (when present).
#   .\deploy\scripts\backup-all.ps1
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& (Join-Path $ScriptDir "backup-db.ps1")
& (Join-Path $ScriptDir "backup-images.ps1")
