# AI Platform

Run the **backend** (API + Postgres + Redis) and **frontend** (Next.js) together for local development.

---

## Prerequisites

- **Docker & Docker Compose** (for backend, Postgres, Redis)
- **Node.js 18+** and npm (for frontend)
- **OpenAI API key** (for the chat/agent backend)

---

## Environment variables

### Backend (Docker)

The backend is configured via `backend/docker-compose.yml`. These are set inside the stack; you only need to provide one from the host:

| Variable           | Required | Description |
|--------------------|----------|-------------|
| `OPENAI_API_KEY`   | Yes      | Your OpenAI API key (set on host when running `docker compose up`) |

The rest are fixed in `docker-compose.yml` for local dev:

- `DATABASE_URL` → `postgresql+asyncpg://app:app@postgres:5432/app`
- `REDIS_URL` → `redis://redis:6379`

### Frontend

Create a `.env.local` in the **frontend** directory:

| Variable                 | Required | Description |
|--------------------------|----------|-------------|
| `NEXT_PUBLIC_API_URL`    | Yes      | Backend API base URL (e.g. `http://localhost:8000`) |

Example:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Run backend and frontend together

### 1. Start the backend (API + Postgres + Redis)

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

In a **second terminal**, from the **project root**:

```bash
cd frontend
cp .env.example .env.local   # if you use the example below
# Edit .env.local and set NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev
```

- App: **http://localhost:3000**

### 3. Use the app

- **Chat:** http://localhost:3000/chat  
- **Dashboard:** http://localhost:3000/dashboard  

The frontend will call the backend at `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:8000`).

---

## Quick reference

| Service   | URL / Port        | Env (host)      |
|-----------|-------------------|-----------------|
| Backend   | http://localhost:8000 | `OPENAI_API_KEY` |
| Frontend  | http://localhost:3000 | `NEXT_PUBLIC_API_URL` (in `frontend/.env.local`) |

**Minimal setup:**

```bash
# Terminal 1 – backend
cd backend && OPENAI_API_KEY=sk-... docker compose up --build

# Terminal 2 – frontend (after backend is up)
cd frontend && echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local && npm install && npm run dev
```

For more on the platform and architecture, see [docs/README.md](docs/README.md).
