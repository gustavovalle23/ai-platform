#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if [ ! -f backend/.env ]; then
  echo "Error: backend/.env not found. Copy backend/.env.example to backend/.env and set OPENAI_API_KEY, DATABASE_URL, REDIS_URL."
  exit 1
fi

echo "Starting databases (Docker, detached)..."
cd backend
docker-compose -f docker-compose.databases.yml up -d
cd "$ROOT"

echo "Starting backend (venv, detached)..."
cd backend
if [ ! -d .venv ]; then
  python3 -m venv .venv
  .venv/bin/pip install -r requirements.txt
fi
set -a
source .env
set +a
nohup .venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 > ../.backend.log 2>&1 &
echo $! > ../.backend.pid
cd "$ROOT"

echo "Starting frontend (detached)..."
cd frontend
[ ! -d node_modules ] && npm install
nohup npm run dev > ../.frontend.log 2>&1 &
echo $! > ../.frontend.pid
cd "$ROOT"

echo "Done (local apps, DBs in Docker)."
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo "  Logs: .backend.log, .frontend.log"
echo "  Stop: ./down-local.sh"
