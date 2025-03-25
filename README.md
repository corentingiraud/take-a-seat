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
