#!/usr/bin/env bash
# Full local restore backup: Postgres dump + MinIO volume (when present).
#   bash deploy/scripts/backup-all.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$SCRIPT_DIR/backup-db.sh"
"$SCRIPT_DIR/backup-images.sh"
