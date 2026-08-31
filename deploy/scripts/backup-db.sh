#!/usr/bin/env bash
# Full Postgres dump (products, orders, users, …).
# Local (from repo root):
#   bash deploy/scripts/backup-db.sh
# Prod (VPS):
#   COMPOSE_FILE=/home/deploy/my-online-shop/deploy/docker-compose.prod.yml \
#   COMPOSE_ENV_FILE=/home/deploy/my-online-shop/deploy/.env.prod \
#   POSTGRES_USER=… POSTGRES_DB=… \
#   bash /home/deploy/my-online-shop/deploy/scripts/backup-db.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$ROOT/backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT/backend/online-store-api/docker-compose.yml}"
COMPOSE_ENV_FILE="${COMPOSE_ENV_FILE:-}"
DB_SERVICE="${DB_SERVICE:-db}"
POSTGRES_USER="${POSTGRES_USER:-store}"
POSTGRES_DB="${POSTGRES_DB:-storedb}"

mkdir -p "$BACKUP_DIR"
stamp="$(date +%Y%m%d-%H%M%S)"
outfile="$BACKUP_DIR/storedb-$stamp.sql.gz"

compose=(docker compose -f "$COMPOSE_FILE")
if [[ -n "$COMPOSE_ENV_FILE" ]]; then
  compose+=(--env-file "$COMPOSE_ENV_FILE")
fi

"${compose[@]}" exec -T "$DB_SERVICE" \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-acl \
  | gzip -c > "$outfile"

echo "Wrote $outfile"

if [[ "$KEEP_DAYS" -gt 0 ]]; then
  find "$BACKUP_DIR" -name 'storedb-*.sql.gz' -mtime +"$KEEP_DAYS" -delete 2>/dev/null || true
fi
