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

echo "Starting backend (foreground, logs below)..."
cd "$ROOT/backend"
if [ ! -d venv ]; then
  (unset VIRTUAL_ENV; python3 -m venv venv)
  venv/bin/pip install -r requirements.txt
fi
set -a
source .env
set +a
exec venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000
