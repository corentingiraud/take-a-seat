#!/usr/bin/env bash
# Dump a Postgres database from the docker container to ./db-dumps/
# Usage: ./scripts/dev/dump-db.sh [database_name]
set -euo pipefail

# --- paths
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$REPO_ROOT/backend/.env"
DUMPS_DIR="$REPO_ROOT/db-dumps"

# --- load env (.env must be KEY=VALUE lines)
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE" >&2
  exit 1
fi
set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

CONTAINER="take-a-seat-database"
DB_NAME="${1:-${DATABASE_NAME:-}}"

if [[ -z "${DB_NAME:-}" ]]; then
  echo "Database name not provided and DATABASE_NAME not set in .env" >&2
  exit 1
fi
if ! docker ps --format '{{.Names}}' | grep -qw "$CONTAINER"; then
  echo "Container '$CONTAINER' is not running." >&2
  exit 1
fi

mkdir -p "$DUMPS_DIR"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_FILE="$DUMPS_DIR/${DB_NAME}_${STAMP}.dump"

echo "→ Dumping '$DB_NAME' to $OUT_FILE"
# Use the app user for dump
: "${DATABASE_USERNAME:?DATABASE_USERNAME missing in .env}"
: "${DATABASE_PASSWORD:?DATABASE_PASSWORD missing in .env}"

# Dump in custom format (-Fc) to stdout, capture to local file
set -o pipefail
docker exec -e PGPASSWORD="$DATABASE_PASSWORD" "$CONTAINER" \
  pg_dump -U "$DATABASE_USERNAME" -d "$DB_NAME" -Fc \
  > "$OUT_FILE"

echo "✓ Done: $OUT_FILE"
