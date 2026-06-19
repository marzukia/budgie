# Budgie — Deployment Guide

## Architecture

```
nginx (:3000)           — serves frontend static files, proxies /api/* to uvicorn
└── uvicorn (:8000)     — Django Ninja API (ASGI)
    └── PostgreSQL      — on hydrogen host (192.168.1.80:5432)

DNS:
  budgie.junkyard.sh     → prod  (122.199.31.95)
  budgie-dev.junkyard.sh → dev   (122.199.31.95)

Traefik:
  ┌── budgie.junkyard.sh      → container budgie   (:3000)
  └── budgie-dev.junkyard.sh  → container budgie-dev (:3000)
```

## Infrastructure (Hydrogen)

### PostgreSQL

Three databases, one user:

```
databases: budgie_dev, budgie_test, budgie_prod
user:      budgie / (set via env var)
host:      192.168.1.80:5432 (also localhost)
pg_hba:    10.0.7.0/24 subnet allowed for Docker containers
```

### Containers

| Name | Domain | Status | Env |
|------|--------|--------|-----|
| `budgie-dev` | budgie-dev.junkyard.sh | dev | DEBUG=True, DB=budgie_dev |
| `budgie`     | budgie.junkyard.sh     | prod | DEBUG=False, DB=budgie_prod |

Both on `traefik-public` network, restart policy `unless-stopped`.

### DNS

A records at Cloudflare:

```
budgie.junkyard.sh      → 122.199.31.95
budgie-dev.junkyard.sh  → 122.199.31.95
```

Managed via CF DNS API token (in traefik container env).

## Docker Build

### Dockerfile

Multi-stage:
1. **frontend-builder** — bun install + vite build
2. **backend-builder** — uv sync (requires `libpq-dev` + `gcc` for psycopg-c), collectstatic
3. **runtime** — python:3.14-slim + nginx + libpq5

Build on hydrogen:
```bash
cd ~/projects/budgie
docker build -t budgie-app:latest .
```

### Docker Compose

Three compose files:

- **docker-compose.yml** — dev with local Postgres container (for local dev)
- **docker-compose.dev.yml** — dev instance on hydrogen (uses host Postgres at 192.168.1.80, traefik labels)
- **docker-compose.prod.yml** — prod instance (uses host Postgres at 192.168.1.80, traefik labels, env secrets from `.env.prod`)

### Container Names

- Dev: `budgie-dev`
- Prod: `budgie-prod`

Both started via `docker compose` with separate project names (`-p budgie-dev`, `-p budgie-prod`) to avoid service name conflicts:

```bash
# Build + redeploy (one-liner)
ssh hydrogen "cd ~/projects/budgie && scripts/redeploy.sh"
```

Or manually:

```bash
# Build
cd ~/projects/budgie
docker build -t budgie-app:latest .

# Dev
docker compose -p budgie-dev -f docker-compose.dev.yml up -d

# Prod
docker compose -p budgie-prod --env-file .env.prod -f docker-compose.prod.yml up -d
```

There's a script at `~/projects/budgie/scripts/redeploy.sh` that does pull → build → redeploy → verify in one shot.

### Entrypoint

`scripts/entrypoint.sh`:
1. Starts nginx in background
2. Runs `manage.py migrate --noinput`
3. Starts uvicorn via venv Python

## CI/CD

### GitHub Actions (`.github/workflows/ci.yml`)

Jobs:
- `backend-lint` — ruff check
- `backend-test` — uv pytest
- `backend-build` — uv build
- `frontend-lint` — biome check
- `frontend-test` — vitest
- `frontend-build` — bun run build
- `docker-build` — build + push to Docker Hub (on main push or workflow_dispatch)

**Docker push requires secrets:** `DOCKER_USERNAME`, `DOCKER_PASSWORD`

### Promotion Workflow

1. PR merges to `main` → CI runs docker-build → pushes to Docker Hub
2. On hydrogen: `docker pull <username>/budgie:latest`
3. Restart prod container: `docker restart budgie`

Or rebuild locally:
```bash
cd ~/projects/budgie && docker build -t budgie-app:latest .
docker rm -f budgie && docker run -d --name budgie ... budgie-app:latest
```

## Running Locally

```bash
# Backend
cd backend
DJANGO_SETTINGS_MODULE=budgie.settings .venv/bin/uvicorn budgie.asgi:application --reload --port 8000

# Frontend
cd frontend
bun run dev  # proxies /api to localhost:8000

# Tests
cd backend && DJANGO_SETTINGS_MODULE=budgie.settings .venv/bin/python -m pytest tests/ -v
```

## Configuration

All settings via env vars:

| Variable | Default | Description |
|----------|---------|-------------|
| `BUDGIE_SECRET_KEY` | dev-secret-key | Django secret key |
| `BUDGIE_DEBUG` | True | Django DEBUG mode |
| `BUDGIE_ALLOWED_HOSTS` | * | Comma-separated hosts |
| `BUDGIE_DB_ENGINE` | sqlite3 | `django.db.backends.postgresql` for PG |
| `BUDGIE_DB_NAME` | db.sqlite3 | Database name |
| `BUDGIE_DB_USER` | "" | Postgres user |
| `BUDGIE_DB_PASSWORD` | "" | Postgres password |
| `BUDGIE_DB_HOST` | "" | Postgres host |
| `BUDGIE_DB_PORT` | "" | Postgres port |

When `ENGINE=postgresql` and no values are set, defaults to:
`budgie_dev` / `budgie` / `budgie_password` / `localhost` / `5432`

## Healthcheck

`GET /api/health` → `{"status": "ok"}` — no auth required. Used by Docker HEALTHCHECK.

## API Docs

Auto-generated OpenAPI at `/api/openapi.json`, Swagger UI at `/api/docs`.
