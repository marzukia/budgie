#!/bin/bash
set -e
cd ~/projects/budgie

echo "=== Pulling latest ==="
git stash -u 2>/dev/null
git checkout main
git pull origin main
git stash drop 2>/dev/null

# .env.prod is not tracked in git — recreate after pull
cat > .env.prod << 'EOF'
BUDGIE_SECRET_KEY=prod-secret-key-110e562563475eefae21926a0c94c06cd387642794096f98ac213faf80ec64d7
BUDGIE_DB_PASSWORD=budgie_password
BUDGIE_DB_HOST=192.168.1.80
BUDGIE_ALLOWED_HOSTS=budgie.junkyard.sh,localhost,127.0.0.1
EOF

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
