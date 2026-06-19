# Stage 1: Build frontend
FROM oven/bun:1.3-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen
COPY frontend/ .
RUN bun run build

# Stage 2: Build backend
FROM python:3.14-slim AS backend-builder
RUN apt-get update -qq && apt-get install -y -qq libpq-dev gcc && rm -rf /var/lib/apt/lists/*
WORKDIR /app/backend
COPY backend/pyproject.toml backend/uv.lock ./
RUN pip install uv && uv sync --no-dev --no-install-project
COPY backend/ .
ENV DJANGO_SETTINGS_MODULE=budgie.settings
RUN mkdir -p static && .venv/bin/python manage.py collectstatic --noinput

# Stage 3: Final image — use Python slim + install nginx
FROM python:3.14-slim AS runtime
RUN apt-get update -qq && apt-get install -y -qq nginx wget libpq5 && rm -rf /var/lib/apt/lists/*

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy backend with venv
COPY --from=backend-builder /app/backend /app/backend

# Copy static files
COPY --from=backend-builder /app/backend/static /usr/share/nginx/html/static

# Copy nginx config
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint
COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
    CMD wget -qO- --timeout=3 http://localhost:3000/api/health || exit 1
ENTRYPOINT ["/entrypoint.sh"]
