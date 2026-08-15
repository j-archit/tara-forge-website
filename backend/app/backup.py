import argparse
import os
import shutil
import subprocess
import tempfile
import zipfile
from datetime import UTC, datetime
from pathlib import Path
from typing import Callable

from sqlalchemy.engine import make_url

from .config import get_settings


Runner = Callable[..., subprocess.CompletedProcess]


def postgres_connection(database_url: str) -> tuple[list[str], dict[str, str]]:
    url = make_url(database_url)
    if not url.drivername.startswith("postgresql"):
        raise ValueError("Backup tooling requires a PostgreSQL database URL")
    if not url.database or not url.username:
        raise ValueError("PostgreSQL database URL must include a database and username")
    options = ["--username", url.username, "--dbname", url.database]
    if url.host:
        options.extend(["--host", url.host])
    if url.port:
        options.extend(["--port", str(url.port)])
    environment = os.environ.copy()
    if url.password:
        environment["PGPASSWORD"] = url.password
    return options, environment


def create_backup(
    database_url: str,
    vault: Path,
    destination: Path,
    *,
    runner: Runner = subprocess.run,
) -> Path:
    destination.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    archive = destination / f"taraforge-backup-{stamp}.zip"
    suffix = 1
    while archive.exists():
        archive = destination / f"taraforge-backup-{stamp}-{suffix}.zip"
        suffix += 1

    options, environment = postgres_connection(database_url)
    with tempfile.TemporaryDirectory() as temporary:
        snapshot = Path(temporary) / "taraforge.dump"
        runner(
            ["pg_dump", "--format=custom", "--no-owner", "--no-privileges", "--file", str(snapshot), *options],
            check=True,
            env=environment,
        )
        if not snapshot.is_file():
            raise RuntimeError("pg_dump completed without creating a snapshot")
        with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as bundle:
            bundle.write(snapshot, "database/taraforge.dump")
            if vault.exists():
                for item in sorted(path for path in vault.rglob("*") if path.is_file()):
                    bundle.write(item, Path("vault") / item.relative_to(vault))
    return archive


def prune_backups(destination: Path, keep: int) -> list[Path]:
    if keep < 1:
        raise ValueError("Backup retention must keep at least one archive")
    archives = sorted(
        destination.glob("taraforge-backup-*.zip"),
        key=lambda item: item.stat().st_mtime,
        reverse=True,
    )
    removed = archives[keep:]
    for archive in removed:
        archive.unlink()
    return removed


def _extract_verified(archive: Path, destination: Path) -> Path:
    if not archive.is_file():
        raise FileNotFoundError(f"Backup does not exist: {archive}")
    with zipfile.ZipFile(archive) as bundle:
        for member in bundle.infolist():
            member_path = Path(member.filename)
            if member_path.is_absolute() or ".." in member_path.parts:
                raise ValueError("Backup contains an unsafe path")
        bundle.extractall(destination)
    snapshot = destination / "database" / "taraforge.dump"
    if not snapshot.is_file():
        raise ValueError("Backup does not contain a PostgreSQL snapshot")
    return snapshot


def restore_backup(
    archive: Path,
    database_url: str,
    vault: Path,
    safety_backups: Path,
    *,
    runner: Runner = subprocess.run,
) -> Path:
    options, environment = postgres_connection(database_url)
    with tempfile.TemporaryDirectory() as temporary:
        extracted = Path(temporary)
        snapshot = _extract_verified(archive, extracted)
        safety_archive = create_backup(database_url, vault, safety_backups, runner=runner)
        runner(
            [
                "pg_restore", "--clean", "--if-exists", "--no-owner", "--no-privileges",
                "--exit-on-error", *options, str(snapshot),
            ],
            check=True,
            env=environment,
        )
        restored_vault = extracted / "vault"
        if vault.exists():
            shutil.rmtree(vault)
        if restored_vault.exists():
            shutil.copytree(restored_vault, vault)
        else:
            vault.mkdir(parents=True, exist_ok=True)
    return safety_archive


def main() -> None:
    parser = argparse.ArgumentParser(description="Create or restore TaraForge3D PostgreSQL backups")
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

    if args.command == "create":
        archive = create_backup(settings.database_url, settings.vault_path, args.destination)
        prune_backups(args.destination, args.keep)
        print(archive)
    elif args.command == "restore":
        if not args.force:
            parser.error("restore requires --force and must be run while backend services are stopped")
        safety = restore_backup(args.archive, settings.database_url, settings.vault_path, args.safety_backups)
        print(f"Pre-restore safety backup: {safety}")


if __name__ == "__main__":
    main()
