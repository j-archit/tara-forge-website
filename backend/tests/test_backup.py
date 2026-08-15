import sqlite3
import zipfile
from pathlib import Path

import pytest

from app.backup import create_backup, prune_backups, restore_backup, sqlite_path


def test_sqlite_path_supports_relative_and_absolute_urls():
    assert sqlite_path("sqlite:///./data/app.db").as_posix() == "data/app.db"
    assert sqlite_path("sqlite:////data/app.db").as_posix() == "/data/app.db"
    with pytest.raises(ValueError):
        sqlite_path("postgresql://localhost/app")


def test_backup_and_restore_round_trip(tmp_path):
    database = tmp_path / "data" / "taraforge.db"
    database.parent.mkdir()
    with sqlite3.connect(database) as connection:
        connection.execute("CREATE TABLE sample (value TEXT)")
        connection.execute("INSERT INTO sample VALUES ('before')")
    vault = tmp_path / "vault"
    vault.mkdir()
    (vault / "model.stl").write_text("solid original")

    archive = create_backup(database, vault, tmp_path / "backups")
    with sqlite3.connect(database) as connection:
        connection.execute("UPDATE sample SET value = 'after'")
    (vault / "model.stl").write_text("changed")
    sidecars = [Path(f"{database}-wal"), Path(f"{database}-shm")]
    for sidecar in sidecars:
        sidecar.write_bytes(b"stale")
    safety = restore_backup(archive, database, vault, tmp_path / "safety")

    with sqlite3.connect(database) as connection:
        assert connection.execute("SELECT value FROM sample").fetchone()[0] == "before"
    assert (vault / "model.stl").read_text() == "solid original"
    assert not any(sidecar.exists() for sidecar in sidecars)
    assert safety and safety.is_file()


def test_restore_rejects_unsafe_archive_paths(tmp_path):
    archive = tmp_path / "unsafe.zip"
    with zipfile.ZipFile(archive, "w") as bundle:
        bundle.writestr("../escape", "bad")
    with pytest.raises(ValueError, match="unsafe path"):
        restore_backup(archive, tmp_path / "missing.db", tmp_path / "vault", tmp_path / "safety")


def test_backup_retention_removes_only_old_archives(tmp_path):
    archives = []
    for index in range(3):
        archive = tmp_path / f"taraforge-backup-{index}.zip"
        archive.write_bytes(b"backup")
        archive.touch()
        archives.append(archive)
    unrelated = tmp_path / "keep-me.zip"
    unrelated.write_bytes(b"other")

    removed = prune_backups(tmp_path, keep=2)

    assert len(removed) == 1
    assert len(list(tmp_path.glob("taraforge-backup-*.zip"))) == 2
    assert unrelated.exists()
    with pytest.raises(ValueError):
        prune_backups(tmp_path, keep=0)
