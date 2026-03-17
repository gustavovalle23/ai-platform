# AI Platform

Run the **backend** (API + Postgres + Redis) and **frontend** (Next.js) together for local development.

You can either run **everything in Docker** (backend + DBs) or **only the databases in Docker** and run the backend in a Python venv.

---

## Prerequisites

- **Docker & Docker Compose** (at least for Postgres + Redis)
- **Node.js 18+** and npm (for frontend)
- **Python 3.11+** (if you run backend outside Docker)
- **OpenAI API key** (for the chat/agent backend)

---

## Environment variables

### Backend (when running in Docker)

The full stack is configured via `backend/docker-compose.yml`. From the host you only need:

| Variable           | Required | Description |
|--------------------|----------|-------------|
| `OPENAI_API_KEY`   | Yes      | Your OpenAI API key (set when running `docker compose up`) |

Inside the stack: `DATABASE_URL` and `REDIS_URL` point at the `postgres` and `redis` services.

### Backend (when running on host with venv)

Use a `.env` in **backend** (e.g. copy from `backend/.env.example`). Required when only DBs run in Docker:

| Variable           | Required | Description |
|--------------------|----------|-------------|
| `DATABASE_URL`     | Yes      | e.g. `postgresql+asyncpg://app:app@localhost:5432/app` |
| `REDIS_URL`        | Yes      | e.g. `redis://localhost:6379` |
| `OPENAI_API_KEY`   | Yes      | Your OpenAI API key |

### Frontend

Create a `.env.local` in the **frontend** directory:

| Variable                 | Required | Description |
|--------------------------|----------|-------------|
| `NEXT_PUBLIC_API_URL`    | Yes      | Backend API base URL (e.g. `http://localhost:8000`) |

Example: `NEXT_PUBLIC_API_URL=http://localhost:8000`

---

## Option A: Full stack in Docker (backend + DBs)

### 1. Start backend, Postgres, and Redis

From the **project root**:

```bash
cd backend
export OPENAI_API_KEY=sk-your-openai-key-here
docker compose up --build
```

- API: **http://localhost:8000**
- Postgres: `localhost:5432` (user `app`, password `app`, db `app`)
- Redis: `localhost:6379`

Leave this terminal running.

### 2. Start the frontend

In a **second terminal**:

```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000 in .env.local
npm install
npm run dev
```

- App: **http://localhost:3000**

---

## Option B: Only databases in Docker (backend in venv)

Run Postgres and Redis in Docker; run the backend locally in a Python venv and the frontend with npm.

### 1. Start only Postgres and Redis

From the **project root**:

```bash
cd backend
docker compose -f docker-compose.databases.yml up -d
```

Postgres: `localhost:5432` · Redis: `localhost:6379`

### 2. Backend in a virtualenv

In a **second terminal**:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env: set OPENAI_API_KEY and keep DATABASE_URL / REDIS_URL for localhost
```

Load env and run the API (from `backend/` with venv active):

```bash
export $(grep -v '^#' .env | xargs)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API: **http://localhost:8000**

Leave this terminal running (or run in background).

### 3. Start the frontend

In a **third terminal**:

```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000 in .env.local
npm install
npm run dev
```

- App: **http://localhost:3000**

### 4. Stop databases when done

```bash
cd backend
docker compose -f docker-compose.databases.yml down
```

---

## Quick reference

| Service   | URL / Port        | Env (host)      |
|-----------|-------------------|-----------------|
| Backend   | http://localhost:8000 | `OPENAI_API_KEY`; with venv also `DATABASE_URL`, `REDIS_URL` |
| Frontend  | http://localhost:3000 | `NEXT_PUBLIC_API_URL` (in `frontend/.env.local`) |

**Option A – minimal (all in Docker):**

```bash
cd backend && OPENAI_API_KEY=sk-... docker compose up --build
# Second terminal:
cd frontend && echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local && npm install && npm run dev
```

**Option B – minimal (DBs in Docker, backend in venv):**

```bash
cd backend && docker compose -f docker-compose.databases.yml up -d
# Second terminal:
cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && cp .env.example .env
# Edit .env, then:
export $(grep -v '^#' .env | xargs) && uvicorn main:app --reload --host 0.0.0.0 --port 8000
# Third terminal:
cd frontend && echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local && npm install && npm run dev
```

---

For more on the platform and architecture, see [docs/README.md](docs/README.md).
