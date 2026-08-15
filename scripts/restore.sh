#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARCHIVE=""
FORCE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force) FORCE=true; shift ;;
    -h|--help)
      echo "Usage: $0 BACKUP_FILENAME --force"
      exit 0
      ;;
    -*) echo "Unknown option: $1" >&2; exit 2 ;;
    *)
      [[ -z "$ARCHIVE" ]] || { echo "Only one archive may be specified" >&2; exit 2; }
      ARCHIVE="$1"
      shift
      ;;
  esac
done

[[ "$FORCE" == true ]] || {
  echo "Restore replaces live data. Rerun with --force after verifying the archive." >&2
  exit 2
}
[[ "$ARCHIVE" =~ ^taraforge-backup-[A-Za-z0-9_-]+\.zip$ ]] || {
  echo "Archive must be a TaraForge backup filename from the application-backups volume." >&2
  exit 2
}

cd "$PROJECT_ROOT"
docker compose config --quiet
echo "Stopping the public site and all database writers for restore."
docker compose stop gateway web backend worker

if ! docker compose --profile tools run --rm backup \
  python -m app.backup restore "/backups/$ARCHIVE" --force; then
  echo "Restore failed. Services remain stopped; inspect the error before restarting." >&2
  exit 1
fi

docker compose up -d --remove-orphans --wait --wait-timeout 120
