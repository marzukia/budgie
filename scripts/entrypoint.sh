#!/bin/sh
set -e

cd /app/backend
export DJANGO_SETTINGS_MODULE=budgie.settings

# Run migrations
.venv/bin/python manage.py migrate --noinput

# Start uvicorn in background
.venv/bin/python -m uvicorn budgie.asgi:application --host 127.0.0.1 --port 8000 --no-access-log &
UVICORN_PID=$!

# Wait for uvicorn to be ready
for i in $(seq 1 30); do
    if wget -qO- --timeout=1 http://127.0.0.1:8000/api/health >/dev/null 2>&1; then
        break
    fi
    sleep 1
done

# Start nginx in foreground (container keeps running via nginx)
exec nginx -c /etc/nginx/nginx.conf
