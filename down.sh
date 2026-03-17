#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "Stopping frontend..."
if [ -f .frontend.pid ]; then
  PID=$(cat .frontend.pid)
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID"
    echo "  Frontend (PID $PID) stopped."
  else
    echo "  Frontend process not running."
  fi
  rm -f .frontend.pid
else
  echo "  No .frontend.pid found."
fi

echo "Stopping backend (Docker)..."
cd backend
docker compose down
cd "$ROOT"

echo "Done."
