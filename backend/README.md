# TaraForge3D Backend

The backend is a private FastAPI service used by the TaraForge3D Next.js application. It owns durable intake data, file metadata, administrator sessions, jobs, slicer runs, and integrations. It is not intended to be exposed as a second public product.

## Local setup

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
$env:DATABASE_URL = "postgresql+psycopg://taraforge:local-dev-only@localhost:5432/taraforge"
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m app.cli seed-defaults
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Create or reset the initial administrator after applying migrations. The prompt keeps the password out of shell history and requires at least 12 characters:

```powershell
.\.venv\Scripts\python.exe -m app.cli create-admin admin@taraforge.in
```

## Verification

```powershell
.\.venv\Scripts\python.exe -m pytest --cov=app --cov-report=term-missing
.\.venv\Scripts\python.exe -m compileall -q app tests migrations
```

Tests use isolated temporary SQLite databases and vault directories. They do not read or modify production data.
