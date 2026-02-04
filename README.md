# Take a seat

## Build

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/corentingiraud/take-a-seat:backend-latest \
  --push \
  .

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/corentingiraud/take-a-seat:frontend-latest \
  --push \
  .
```

## Deploy

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker image prune -f
```

Mode maintenance :

```bash
cd /etc/caddy
sudo cp Caddyfile.maintenance Caddyfile
sudo systemctl restart caddy
```

Retour au mode normal :

```bash
cd /etc/caddy
sudo cp Caddyfile.prod Caddyfile
sudo systemctl restart caddy
```


## Restore database

Restore a dump into the local Docker Postgres container:

```bash
# Restore a specific dump (with full db recreate)
./scripts/dev/restore-db.sh -f db-dumps/<dump_file>.dump --recreate

# Restore the latest dump for the database defined in .env
./scripts/dev/restore-db.sh --recreate
```

Options:
- `-f <file>` : path to the `.dump` file (default: latest in `db-dumps/`)
- `-d <name>` : database name (default: `DATABASE_NAME` from `backend/.env`)
- `--recreate` : drop and recreate the database before restoring

Requires the container `take-a-seat-database` to be running and `backend/.env` to be configured.

## Default credentials in dev env

**Standart users (http://localhost:3000/)**

- Admin account
```
Admin1@fake.com
Admin1@fake.com
```

- Coworker 1
```
Coworker1@fake.com
Coworker1@fake.com
```

- Coworker 2
```
Coworker2@fake.com
Coworker2@fake.com
```

**Strapi user (http://localhost:1337/)**

- Admin
```
Admin1@fake.com
Admin1@fake.com
```
