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
