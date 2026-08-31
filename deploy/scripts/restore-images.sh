#!/usr/bin/env bash
# Replace the local MinIO volume from a tarball. Stop MinIO during extract.
#   CONFIRM=YES bash deploy/scripts/restore-images.sh backups/minio-YYYYMMDD-HHMMSS.tar.gz
set -euo pipefail

if [[ "${CONFIRM:-}" != "YES" ]]; then
  echo "Refusing: this replaces MinIO files. Re-run with CONFIRM=YES"
  exit 1
fi

FILE="${1:?usage: restore-images.sh path/to/minio-YYYYMMDD-HHMMSS.tar.gz}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT/backend/online-store-api/docker-compose.yml}"
COMPOSE_ENV_FILE="${COMPOSE_ENV_FILE:-}"
MINIO_SERVICE="${MINIO_SERVICE:-minio}"
compose_dir="$(cd "$(dirname "$COMPOSE_FILE")" && pwd)"
default_project="$(basename "$compose_dir")"
VOLUME="${MINIO_VOLUME:-${COMPOSE_PROJECT_NAME:-$default_project}_minio-data}"

if [[ ! -f "$FILE" ]]; then
  echo "File not found: $FILE"
  exit 1
fi

if ! docker volume inspect "$VOLUME" >/dev/null 2>&1; then
  echo "MinIO volume $VOLUME not found. Nothing to restore (prod images are on R2)."
  exit 1
fi

compose=(docker compose -f "$COMPOSE_FILE")
if [[ -n "$COMPOSE_ENV_FILE" ]]; then
  compose+=(--env-file "$COMPOSE_ENV_FILE")
fi

BACKUP_DIR="$(cd "$(dirname "$FILE")" && pwd)"
ARCHIVE="$(basename "$FILE")"

"${compose[@]}" stop "$MINIO_SERVICE" || true

docker run --rm \
  -v "$VOLUME":/data \
  -v "$BACKUP_DIR":/backup \
  alpine:3.20 \
  sh -c "find /data -mindepth 1 -maxdepth 1 -exec rm -rf {} + && tar xzf /backup/$ARCHIVE -C /data"

"${compose[@]}" start "$MINIO_SERVICE" || true
echo "Restored $VOLUME from $FILE"
