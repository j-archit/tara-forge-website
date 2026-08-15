# TaraForge3D

TaraForge3D is a single-origin full-stack website for public project intake and private production administration. The existing Next.js UI is backed by a private FastAPI service, SQLite, durable model storage, a leased background worker, CuraEngine slicing, and optional Google Drive/Sheets synchronization.

## Local development

Frontend:

```powershell
npm install
npm run dev
```

Backend (from `backend`):

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m app.cli seed-defaults
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Set `BACKEND_URL=http://127.0.0.1:8000` in `.env.local` for the Next.js server. The public browser only talks to Next.js routes under `/api`; the FastAPI service remains private.

## Verification

```powershell
npm test
npm run lint
npm run typecheck
npm run build
cd backend
.\.venv\Scripts\python.exe -m pytest --cov=app --cov-report=term-missing
```

## Deployment

The production stack is defined in `compose.yaml`: Caddy exposes the single public site, Next.js serves UI and same-origin API routes, FastAPI owns data and authentication, and a worker handles durable jobs. Copy `.env.example` to `.env`, update the domain and integrations, then follow `docs/DEPLOYMENT.md`.

The previous GitHub Pages workflow has been removed because a static host cannot run authentication, uploads, SQLite, or background processing.
