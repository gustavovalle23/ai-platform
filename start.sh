#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if [ -f backend/.env ]; then
  set -a
  source backend/.env
  set +a
fi

if [ -z "${OPENAI_API_KEY:-}" ]; then
  echo "Error: OPENAI_API_KEY is not set. Set it or add it to backend/.env"
  exit 1
fi

echo "Starting backend (Docker, detached)..."
cd backend
docker-compose up -d --build
cd "$ROOT"

echo "Starting frontend (detached)..."
cd frontend
[ ! -d node_modules ] && npm install
nohup npm run dev > ../.frontend.log 2>&1 &
echo $! > ../.frontend.pid
cd "$ROOT"

echo "Done."
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo "  Frontend log: .frontend.log"
echo "  Stop backend: cd backend && docker-compose down"
echo "  Stop frontend: kill \$(cat .frontend.pid)"
