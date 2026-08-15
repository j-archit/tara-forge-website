#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PYTHON="$PROJECT_ROOT/backend/.venv/bin/python"
SKIP_BUILD=false

if [[ "${1:-}" == "--skip-build" ]]; then
  SKIP_BUILD=true
elif [[ $# -gt 0 ]]; then
  echo "Usage: $0 [--skip-build]" >&2
  exit 2
fi

if [[ ! -x "$PYTHON" ]]; then
  echo "Backend virtual environment not found at backend/.venv." >&2
  exit 1
fi

cd "$PROJECT_ROOT"
npm test
npm run lint
npm run typecheck
if [[ "$SKIP_BUILD" == false ]]; then
  npm run build
fi
(cd backend && "$PYTHON" -m pytest --cov=app --cov-report=term-missing)
