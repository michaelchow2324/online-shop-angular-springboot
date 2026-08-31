#!/usr/bin/env bash
# Replace the database with a pg_dump file. Stop the API first.
#   CONFIRM=YES bash deploy/scripts/restore-db.sh backups/storedb-YYYYMMDD-HHMMSS.sql.gz
set -euo pipefail

if [[ "${CONFIRM:-}" != "YES" ]]; then
  echo "Refusing: this drops and recreates the database. Re-run with CONFIRM=YES"
  exit 1
fi

FILE="${1:?usage: restore-db.sh path/to/storedb-YYYYMMDD-HHMMSS.sql.gz}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT/backend/online-store-api/docker-compose.yml}"
COMPOSE_ENV_FILE="${COMPOSE_ENV_FILE:-}"
DB_SERVICE="${DB_SERVICE:-db}"
POSTGRES_USER="${POSTGRES_USER:-store}"
POSTGRES_DB="${POSTGRES_DB:-storedb}"

compose=(docker compose -f "$COMPOSE_FILE")
if [[ -n "$COMPOSE_ENV_FILE" ]]; then
  compose+=(--env-file "$COMPOSE_ENV_FILE")
fi

echo "Dropping $POSTGRES_DB"
"${compose[@]}" exec -T "$DB_SERVICE" \
  psql -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$POSTGRES_DB' AND pid <> pg_backend_pid();" \
  -c "DROP DATABASE IF EXISTS $POSTGRES_DB;" \
  -c "CREATE DATABASE $POSTGRES_DB OWNER $POSTGRES_USER;"

echo "Restoring $FILE"
if [[ "$FILE" == *.gz ]]; then
  gunzip -c "$FILE" | "${compose[@]}" exec -T "$DB_SERVICE" \
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1
else
  "${compose[@]}" exec -T "$DB_SERVICE" \
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 < "$FILE"
fi

echo "Restored $POSTGRES_DB"
