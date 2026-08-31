#!/usr/bin/env bash
# Local MinIO volume tarball. Skips when the volume is missing (prod images live on R2).
#   bash deploy/scripts/backup-images.sh
# Override volume name:
#   MINIO_VOLUME=online-store-api_minio-data bash deploy/scripts/backup-images.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$ROOT/backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT/backend/online-store-api/docker-compose.yml}"

if [[ "${SKIP_MINIO:-}" == "1" ]]; then
  echo "Skip MinIO backup (SKIP_MINIO=1)"
  exit 0
fi

compose_dir="$(cd "$(dirname "$COMPOSE_FILE")" && pwd)"
default_project="$(basename "$compose_dir")"
VOLUME="${MINIO_VOLUME:-${COMPOSE_PROJECT_NAME:-$default_project}_minio-data}"

if ! docker volume inspect "$VOLUME" >/dev/null 2>&1; then
  echo "Skip MinIO backup: volume $VOLUME not found (prod images are on R2)"
  exit 0
fi

mkdir -p "$BACKUP_DIR"
stamp="$(date +%Y%m%d-%H%M%S)"
outfile="minio-$stamp.tar.gz"

docker run --rm \
  -v "$VOLUME":/data:ro \
  -v "$BACKUP_DIR":/backup \
  alpine:3.20 \
  tar czf "/backup/$outfile" -C /data .

echo "Wrote $BACKUP_DIR/$outfile"

if [[ "$KEEP_DAYS" -gt 0 ]]; then
  find "$BACKUP_DIR" -name 'minio-*.tar.gz' -mtime +"$KEEP_DAYS" -delete 2>/dev/null || true
fi
