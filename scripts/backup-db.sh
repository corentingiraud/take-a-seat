#!/bin/bash

# Directory to store backups
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +\%Y-\%m-\%d)

# Docker container name
CONTAINER_NAME="take-a-seat-database"
DATABASE_NAME="take-a-seat"

# Backup filename
BACKUP_FILE="$BACKUP_DIR/$DATABASE_NAME-$DATE.dump"

# Create backup inside Docker container using pg_dump
docker exec -t $CONTAINER_NAME sh -c 'export PGUSER=$DATABASE_USERNAME_RO && export PGPASSWORD=$DATABASE_PASSWORD_RO && pg_dump -U $DATABASE_USERNAME_RO -F c $DATABASE_NAME' > $BACKUP_FILE

# Delete backups older than 14 days
find $BACKUP_DIR -type f -name "*.dump" -mtime +14 -exec rm {} \;

echo "Backup completed for $DATABASE_NAME on $DATE"
