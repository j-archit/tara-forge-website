#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_ROOT="$PROJECT_ROOT/backend"
PYTHON="$BACKEND_ROOT/.venv/bin/python"
INSTALL=false

if [[ "${1:-}" == "--install" ]]; then
  INSTALL=true
elif [[ $# -gt 0 ]]; then
  echo "Usage: $0 [--install]" >&2
  exit 2
fi

if [[ ! -x "$PYTHON" ]]; then
  echo "Backend virtual environment not found. Run: python3 -m venv backend/.venv" >&2
  exit 1
fi

if [[ "$INSTALL" == true ]]; then
  "$PYTHON" -m pip install --disable-pip-version-check -r "$BACKEND_ROOT/requirements-dev.txt"
  (cd "$PROJECT_ROOT" && npm install)
fi

(cd "$PROJECT_ROOT" && docker compose up -d --wait database)

(cd "$BACKEND_ROOT" && "$PYTHON" -m alembic upgrade head)
(cd "$BACKEND_ROOT" && "$PYTHON" -m app.cli seed-defaults)

backend_pid=""
frontend_pid=""
cleanup() {
  trap - EXIT INT TERM
  [[ -n "$backend_pid" ]] && kill "$backend_pid" 2>/dev/null || true
  [[ -n "$frontend_pid" ]] && kill "$frontend_pid" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

(cd "$BACKEND_ROOT" && exec "$PYTHON" -m uvicorn app.main:app --reload --port 8000) &
backend_pid=$!
(cd "$PROJECT_ROOT" && exec npm run dev) &
frontend_pid=$!

echo "TaraForge3D development services are running."
echo "Website: http://localhost:3000"
echo "Backend: http://127.0.0.1:8000"
echo "Press Ctrl+C to stop both services."
wait -n "$backend_pid" "$frontend_pid"
