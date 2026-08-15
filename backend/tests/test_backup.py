import subprocess
import zipfile
from pathlib import Path

import pytest

from app.backup import create_backup, postgres_connection, prune_backups, restore_backup


DATABASE_URL = "postgresql+psycopg://forge:secret@database:5432/taraforge"


class FakePostgres:
    def __init__(self) -> None:
        self.commands: list[list[str]] = []
        self.environments: list[dict[str, str]] = []

    def __call__(self, command, *, check, env):
        assert check is True
        self.commands.append(command)
        self.environments.append(env)
        if command[0] == "pg_dump":
            Path(command[command.index("--file") + 1]).write_bytes(b"postgres-dump")
        return subprocess.CompletedProcess(command, 0)


def test_postgres_connection_keeps_password_out_of_arguments():
    options, environment = postgres_connection(DATABASE_URL)
    assert options == [
        "--username", "forge", "--dbname", "taraforge", "--host", "database", "--port", "5432"
    ]
    assert "secret" not in " ".join(options)
    assert environment["PGPASSWORD"] == "secret"
    with pytest.raises(ValueError):
        postgres_connection("sqlite:///data/app.db")


def test_backup_and_restore_round_trip_bundle(tmp_path):
    vault = tmp_path / "vault"
    vault.mkdir()
    (vault / "model.stl").write_text("solid original")
    runner = FakePostgres()

    archive = create_backup(DATABASE_URL, vault, tmp_path / "backups", runner=runner)
    with zipfile.ZipFile(archive) as bundle:
        assert set(bundle.namelist()) == {"database/taraforge.dump", "vault/model.stl"}

    (vault / "model.stl").write_text("changed")
    safety = restore_backup(archive, DATABASE_URL, vault, tmp_path / "safety", runner=runner)

    assert (vault / "model.stl").read_text() == "solid original"
    assert safety.is_file()
    assert [command[0] for command in runner.commands] == ["pg_dump", "pg_dump", "pg_restore"]
    assert {"--clean", "--if-exists", "--exit-on-error"} <= set(runner.commands[-1])


def test_restore_rejects_unsafe_or_incomplete_archives(tmp_path):
    unsafe = tmp_path / "unsafe.zip"
    with zipfile.ZipFile(unsafe, "w") as bundle:
        bundle.writestr("../escape", "bad")
    with pytest.raises(ValueError, match="unsafe path"):
        restore_backup(unsafe, DATABASE_URL, tmp_path / "vault", tmp_path / "safety", runner=FakePostgres())

    incomplete = tmp_path / "incomplete.zip"
    with zipfile.ZipFile(incomplete, "w") as bundle:
        bundle.writestr("vault/model.stl", "solid")
    with pytest.raises(ValueError, match="PostgreSQL snapshot"):
        restore_backup(incomplete, DATABASE_URL, tmp_path / "vault", tmp_path / "safety", runner=FakePostgres())


def test_backup_retention_removes_only_old_archives(tmp_path):
    for index in range(3):
        archive = tmp_path / f"taraforge-backup-{index}.zip"
        archive.write_bytes(b"backup")
        archive.touch()
    unrelated = tmp_path / "keep-me.zip"
    unrelated.write_bytes(b"other")
    removed = prune_backups(tmp_path, keep=2)
    assert len(removed) == 1
    assert len(list(tmp_path.glob("taraforge-backup-*.zip"))) == 2
    assert unrelated.exists()
    with pytest.raises(ValueError):
        prune_backups(tmp_path, keep=0)
