#!/bin/bash
set -euo pipefail

# Directory to store backups
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H-%M)

# Docker container name
CONTAINER_NAME="take-a-seat-database"
DATABASE_NAME="take-a-seat"

# Backup filename
BACKUP_FILE="$BACKUP_DIR/$DATABASE_NAME-$DATE-$TIME.dump"

mkdir -p "$BACKUP_DIR"

# Create backup inside Docker container using pg_dump (RO env vars expected in container)
docker exec -t "$CONTAINER_NAME" sh -c 'export PGUSER="$DATABASE_USERNAME_RO" PGPASSWORD="$DATABASE_PASSWORD_RO"; pg_dump -U "$DATABASE_USERNAME_RO" -F c "$DATABASE_NAME"' > "$BACKUP_FILE"

# --- Retention policy ---
# 1) Delete anything older than 14 days
find "$BACKUP_DIR" -type f -name "$DATABASE_NAME-*.dump" -mtime +14 -exec rm -f {} \;

# 2) From day 5 to day 14 (i.e., older than 3 days, not older than 14), keep only the newest per calendar day
#    Keep all files from the last 4 days as-is.
#    We rely on filename format: <db>-YYYY-MM-DD-HH-MM.dump
mapfile -t candidates < <(find "$BACKUP_DIR" -type f -name "$DATABASE_NAME-*.dump" -mtime +3 -mtime -14 -printf '%p\n' | sort -r)

declare -A seen_by_date
for f in "${candidates[@]}"; do
  base="$(basename "$f")"
  # strip "<db>-" prefix
  date_part="${base#"$DATABASE_NAME-"}"
  # take the calendar date (YYYY-MM-DD)
  day="${date_part:0:10}"

  if [[ -n "${seen_by_date[$day]:-}" ]]; then
    rm -f "$f"
  else
    seen_by_date["$day"]=1   # keep the first (newest for that day due to sort -r)
  fi
done

echo "Backup completed for $DATABASE_NAME on $DATE at $TIME -> $BACKUP_FILE"
