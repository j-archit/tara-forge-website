#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKIP_PULL=false
SKIP_BACKUP=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-pull) SKIP_PULL=true ;;
    --skip-backup) SKIP_BACKUP=true ;;
    -h|--help)
      echo "Usage: $0 [--skip-pull] [--skip-backup]"
      exit 0
      ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
  shift
done

cd "$PROJECT_ROOT"
[[ -f .env ]] || { echo ".env is required before deployment. Copy and configure .env.example." >&2; exit 1; }
docker compose config --quiet

if [[ "$SKIP_PULL" == false ]] && [[ -n "$(git status --porcelain --untracked-files=normal)" ]]; then
  echo "The Git worktree must be clean before deployment." >&2
  exit 1
fi

if [[ "$SKIP_BACKUP" == false ]]; then
  mapfile -t running_services < <(docker compose ps --status running --services)
  if printf '%s\n' "${running_services[@]}" | grep -Fxq backend; then
    "$PROJECT_ROOT/scripts/backup.sh"
  else
    echo "Backend is not running; skipping the pre-deploy backup."
  fi
fi

if [[ "$SKIP_PULL" == false ]]; then
  git pull --ff-only
fi

docker compose build
docker compose up -d --remove-orphans --wait --wait-timeout 120
docker compose ps
