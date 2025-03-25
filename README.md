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
sudo docker compose -f docker-compose.prod.yml pull
sudo docker compose -f docker-compose.prod.yml up -d
sudo docker image prune -f
```
