#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KEEP=14

while [[ $# -gt 0 ]]; do
  case "$1" in
    --keep)
      [[ $# -ge 2 ]] || { echo "--keep requires a value" >&2; exit 2; }
      KEEP="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [--keep COUNT]"
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 2
      ;;
  esac
done

[[ "$KEEP" =~ ^[0-9]+$ ]] && (( KEEP >= 1 && KEEP <= 365 )) || {
  echo "--keep must be an integer from 1 to 365" >&2
  exit 2
}

cd "$PROJECT_ROOT"
docker compose config --quiet
docker compose --profile tools run --rm backup \
  python -m app.backup create /backups --keep "$KEEP"
