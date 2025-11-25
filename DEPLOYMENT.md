# Deployment Guide

## Architecture

- **Cloudflare Tunnel**: Routes traffic from domain → localhost ports (no exposed ports needed)
- **Docker**: Containers run on `127.0.0.1:PORT` (localhost only, not exposed externally)
- **Docker Networks**: Isolated network for service communication

## Benefits

✅ **No port conflicts** - Each service uses different localhost port  
✅ **No exposed ports** - Only Cloudflare Tunnel connects to localhost  
✅ **Better security** - Services not accessible from internet directly  
✅ **Easy scaling** - Add services by adding new Cloudflare Tunnel ingress rules  

## Current Setup

### Single Service (antimony-labs)
- Container: `antimony-labs` on `127.0.0.1:3000`
- Cloudflare Tunnel: `shivambhardwaj.com` → `localhost:3000`

### Adding More Services

1. **Add service to docker-compose.yml:**
```yaml
services:
  other-service:
    image: ghcr.io/user/other-service:latest
    container_name: other-service
    ports:
      - "127.0.0.1:3001:3000"  # Different host port
    networks:
      - web
```

2. **Update Cloudflare Tunnel config.yml:**
```yaml
ingress:
  - hostname: shivambhardwaj.com
    service: http://localhost:3000
  - hostname: other-site.com
    service: http://localhost:3001  # New service
  - service: http_status:404
```

3. **Deploy:**
```bash
docker compose up -d
cloudflared tunnel restart  # Reload tunnel config
```

## Advanced: Cloudflare Tunnel in Docker

For even better isolation, run Cloudflare Tunnel in Docker:

```yaml
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    command: tunnel run
    volumes:
      - ./config.yml:/etc/cloudflared/config.yml:ro
      - ~/.cloudflared:/home/nonroot/.cloudflared:ro
    network_mode: "host"  # Or use same network as services
    restart: always
```

## Deployment

GitHub Actions automatically:
1. Builds image locally (fast)
2. Pushes to GHCR
3. Pulls on server
4. Restarts container via docker-compose

Manual deploy:
```bash
./build-and-push.sh
git push  # Triggers deploy
```

