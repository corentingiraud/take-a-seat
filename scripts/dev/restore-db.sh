#!/usr/bin/env bash
# Restore a Postgres database dump into the docker container.
# Usage:
#   ./scripts/dev/restore-db.sh [-f dump_file] [-d database_name] [--recreate]
#
# If -f is omitted, restores the latest ./db-dumps/<db>_*.dump

set -euo pipefail

# --- paths
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$REPO_ROOT/backend/.env"
DUMPS_DIR="$REPO_ROOT/db-dumps"

# --- load env
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE" >&2
  exit 1
fi
set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

CONTAINER="take-a-seat-database"

# --- parse args
DUMP_FILE=""
DB_NAME="${DATABASE_NAME:-}"
RECREATE="false"

while (( "$#" )); do
  case "${1:-}" in
    -f|--file) DUMP_FILE="${2:-}"; shift 2;;
    -d|--db) DB_NAME="${2:-}"; shift 2;;
    --recreate) RECREATE="true"; shift;;
    -h|--help)
      echo "Usage: $0 [-f dump_file] [-d database_name] [--recreate]"
      exit 0;;
    *) echo "Unknown arg: $1" >&2; exit 1;;
  esac
done

if [[ -z "${DB_NAME:-}" ]]; then
  echo "Database name not provided and DATABASE_NAME not set in .env" >&2
  exit 1
fi
if ! docker ps --format '{{.Names}}' | grep -qw "$CONTAINER"; then
  echo "Container '$CONTAINER' is not running." >&2
  exit 1
fi

# Find latest dump if not provided
if [[ -z "${DUMP_FILE:-}" ]]; then
  if [[ ! -d "$DUMPS_DIR" ]]; then
    echo "No dumps directory: $DUMPS_DIR" >&2
    exit 1
  fi
  DUMP_FILE="$(ls -1t "$DUMPS_DIR/${DB_NAME}"_*.dump 2>/dev/null | head -n1 || true)"
  if [[ -z "${DUMP_FILE:-}" ]]; then
    echo "No dump files found for '$DB_NAME' in $DUMPS_DIR" >&2
    exit 1
  fi
fi
if [[ ! -f "$DUMP_FILE" ]]; then
  echo "Dump file not found: $DUMP_FILE" >&2
  exit 1
fi

# --- sanity: required envs
: "${DATABASE_USERNAME:?DATABASE_USERNAME missing in .env}"
: "${DATABASE_PASSWORD:?DATABASE_PASSWORD missing in .env}"
: "${DATABASE_ROOT_USERNAME:?DATABASE_ROOT_USERNAME missing in .env}"
: "${DATABASE_ROOT_PASSWORD:?DATABASE_ROOT_PASSWORD missing in .env}"

echo "→ Restoring '$DB_NAME' from $(basename "$DUMP_FILE")"

if [[ "$RECREATE" == "true" ]]; then
  echo "→ Recreating database '$DB_NAME' (terminate connections, drop, create, set owner)"
  docker exec -e PGPASSWORD="$DATABASE_ROOT_PASSWORD" "$CONTAINER" \
    psql -U "$DATABASE_ROOT_USERNAME" -d postgres -v ON_ERROR_STOP=1 \
    -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${DB_NAME}' AND pid <> pg_backend_pid();"

  docker exec -e PGPASSWORD="$DATABASE_ROOT_PASSWORD" "$CONTAINER" \
    dropdb -U "$DATABASE_ROOT_USERNAME" --if-exists "$DB_NAME"

  docker exec -e PGPASSWORD="$DATABASE_ROOT_PASSWORD" "$CONTAINER" \
    createdb -U "$DATABASE_ROOT_USERNAME" -O "$DATABASE_USERNAME" "$DB_NAME"
fi

# --- restore via STDIN inside the container (fix for "could not open input file '-'")
# Note: dump was created with pg_dump -Fc (custom format). pg_restore auto-detects format.
docker exec -i -e PGPASSWORD="$DATABASE_PASSWORD" "$CONTAINER" \
  sh -c "pg_restore -U '$DATABASE_USERNAME' -d '$DB_NAME' --no-owner --no-privileges --clean --if-exists -v" \
  < "$DUMP_FILE"

echo "✓ Restore complete for '$DB_NAME'"
