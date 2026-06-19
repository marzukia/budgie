#!/bin/bash
set -e
cd ~/projects/budgie

echo "=== Pulling latest ==="
git stash -u 2>/dev/null
git checkout main
git pull origin main
git stash drop 2>/dev/null

echo "=== Building image ==="
docker build -t budgie-app:latest .

echo "=== Redeploying ==="
docker rm -f budgie-dev budgie-prod 2>/dev/null

docker compose -p budgie-dev -f docker-compose.dev.yml up -d
docker compose -p budgie-prod --env-file .env.prod -f docker-compose.prod.yml up -d

echo "=== Waiting for health ==="
sleep 10
docker exec budgie-dev wget -qO- --timeout=3 http://localhost:3000/api/health 2>/dev/null
docker exec budgie-prod wget -qO- --timeout=3 http://localhost:3000/api/health 2>/dev/null
curl -sS -o /dev/null -w "dev: HTTP %{http_code}\n" https://budgie-dev.junkyard.sh/
curl -sS -o /dev/null -w "prod: HTTP %{http_code}\n" https://budgie.junkyard.sh/

echo "=== Done ==="
