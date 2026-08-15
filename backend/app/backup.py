import argparse
import shutil
import sqlite3
import tempfile
import zipfile
from contextlib import closing
from datetime import UTC, datetime
from pathlib import Path
from urllib.parse import unquote, urlparse

from .config import get_settings


def sqlite_path(database_url: str) -> Path:
    parsed = urlparse(database_url)
    if parsed.scheme != "sqlite":
        raise ValueError("Backup tooling currently supports SQLite databases only")
    return Path(unquote(database_url.removeprefix("sqlite:///")))


def create_backup(database: Path, vault: Path, destination: Path) -> Path:
    if not database.is_file():
        raise FileNotFoundError(f"Database does not exist: {database}")
    destination.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    archive = destination / f"taraforge-backup-{stamp}.zip"
    suffix = 1
    while archive.exists():
        archive = destination / f"taraforge-backup-{stamp}-{suffix}.zip"
        suffix += 1

    with tempfile.TemporaryDirectory() as temporary:
        snapshot = Path(temporary) / "taraforge.db"
        with closing(sqlite3.connect(database)) as source, closing(sqlite3.connect(snapshot)) as target:
            source.backup(target)
        with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as bundle:
            bundle.write(snapshot, "database/taraforge.db")
            if vault.exists():
                for item in sorted(path for path in vault.rglob("*") if path.is_file()):
                    bundle.write(item, Path("vault") / item.relative_to(vault))
    return archive


def prune_backups(destination: Path, keep: int) -> list[Path]:
    if keep < 1:
        raise ValueError("Backup retention must keep at least one archive")
    archives = sorted(destination.glob("taraforge-backup-*.zip"), key=lambda item: item.stat().st_mtime, reverse=True)
    removed = archives[keep:]
    for archive in removed:
        archive.unlink()
    return removed


def restore_backup(archive: Path, database: Path, vault: Path, safety_backups: Path) -> Path | None:
    if not archive.is_file():
        raise FileNotFoundError(f"Backup does not exist: {archive}")
    safety_archive = create_backup(database, vault, safety_backups) if database.is_file() else None

    with tempfile.TemporaryDirectory() as temporary:
        extracted = Path(temporary)
        with zipfile.ZipFile(archive) as bundle:
            for member in bundle.infolist():
                member_path = Path(member.filename)
                if member_path.is_absolute() or ".." in member_path.parts:
                    raise ValueError("Backup contains an unsafe path")
            bundle.extractall(extracted)
        restored_database = extracted / "database" / "taraforge.db"
        if not restored_database.is_file():
            raise ValueError("Backup does not contain a database snapshot")

        database.parent.mkdir(parents=True, exist_ok=True)
        for suffix in ("-wal", "-shm"):
            Path(f"{database}{suffix}").unlink(missing_ok=True)
        shutil.copy2(restored_database, database)
        restored_vault = extracted / "vault"
        if vault.exists():
            shutil.rmtree(vault)
        if restored_vault.exists():
            shutil.copytree(restored_vault, vault)
        else:
            vault.mkdir(parents=True, exist_ok=True)
    return safety_archive


def main() -> None:
    parser = argparse.ArgumentParser(description="Create or restore TaraForge3D backups")
    commands = parser.add_subparsers(dest="command", required=True)
    create = commands.add_parser("create")
    create.add_argument("destination", type=Path)
    create.add_argument("--keep", type=int, default=14)
    restore = commands.add_parser("restore")
    restore.add_argument("archive", type=Path)
    restore.add_argument("--safety-backups", type=Path, default=Path("/backups"))
    restore.add_argument("--force", action="store_true")
    args = parser.parse_args()
    settings = get_settings()
    database = sqlite_path(settings.database_url)

    if args.command == "create":
        archive = create_backup(database, settings.vault_path, args.destination)
        prune_backups(args.destination, args.keep)
        print(archive)
    elif args.command == "restore":
        if not args.force:
            parser.error("restore requires --force and must be run while backend services are stopped")
        safety = restore_backup(args.archive, database, settings.vault_path, args.safety_backups)
        if safety:
            print(f"Pre-restore safety backup: {safety}")


if __name__ == "__main__":
    main()
