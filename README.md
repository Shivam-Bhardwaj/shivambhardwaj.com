# Shivam Bhardwaj Website (shivambhardwaj.com)

Rust monorepo Leptos fullstack app with robotics simulations (EKF, D*, boids via robotics_lib).

## Architecture
- `app/`: Leptos routes/UI/canvas sim.
- `server/`: Axum SSR/WS host.
- `robotics_lib/`: Math/physics algos.
- Dockerized prod build.

## Local Development
**Hot reload dev:**
1. `rustup default nightly`
2. `cargo install --locked cargo-leptos` (use recent nightly for edition2024 compat)
3. `cp .env.example .env` & edit (LEPTOS_*)
4. `cargo leptos watch` → http://localhost:3000

**Prod-like test:**
`docker compose up -d` → localhost:3000 (pulls latest image)

Tailwind/PostCSS: `npm run build-css` if changes.

## Production Deployment
- Push `main` → [.github/workflows/deploy.yml](.github/workflows/deploy.yml) :
  1. Build/push `ghcr.io/shivam-bhardwaj/shivambhardwaj.com:latest`
  2. SSH server (secrets), `docker pull & restart antimony-labs -p 3000:3000`
- Cloudflare tunnel proxies shivambhardwaj.com → server:3000

## Server (144.126.146.39)
Multi-site? Check `docker ps`. Current: single antimony-labs:3000.

## Changes Made
- Removed dev/mixed files (compose.dev.yaml, server-setup/, deploy_key*, scripts)
- Updated .gitignore, added .env.example
- Clean Docker Compose for local/prod test

Ready for development!