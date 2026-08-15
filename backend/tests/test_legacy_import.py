import sqlite3

from sqlalchemy import func, select

from app.legacy_import import import_legacy
from app.models import Client, Job, Submission


def create_legacy_database(path, vault):
    connection = sqlite3.connect(path)
    connection.execute(
        """
        CREATE TABLE submissions (
            id TEXT PRIMARY KEY, name TEXT, email TEXT, projectType TEXT,
            material TEXT, description TEXT, fileName TEXT, filePath TEXT,
            createdAt TEXT, googleDriveId TEXT, googleSheetStatus TEXT,
            googleDriveStatus TEXT, printTimeSeconds INTEGER,
            filamentGrams REAL, slicerStatus TEXT
        )
        """
    )
    model = vault / "legacy_part.stl"
    model.write_bytes(b"solid legacy")
    connection.execute(
        "INSERT INTO submissions VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        (
            "legacy-1", "Legacy Maker", "Maker@Example.com", "parts", "pla",
            "Imported part", "part.stl", str(model), "2026-01-02T03:04:05",
            None, "pending", "pending", 120, 4.5, "completed",
        ),
    )
    connection.commit()
    connection.close()


def test_legacy_import_is_repeatable_and_copies_files(app, tmp_path):
    source_vault = tmp_path / "legacy-vault"
    source_vault.mkdir()
    source_database = tmp_path / "legacy.db"
    create_legacy_database(source_database, source_vault)

    with app.state.session_factory() as db:
        first = import_legacy(source_database, source_vault, app.state.settings.vault_path, db)
        second = import_legacy(source_database, source_vault, app.state.settings.vault_path, db)
        submission = db.get(Submission, "legacy-1")
        assert first.imported_submissions == first.imported_clients == first.copied_files == 1
        assert second.skipped_existing == 1
        assert submission.client.email == "maker@example.com"
        assert submission.slicer_status == "complete"
        assert (app.state.settings.vault_path / submission.stored_file_key).read_bytes() == b"solid legacy"
        assert db.scalar(select(func.count()).select_from(Client)) == 1
        assert db.scalar(select(func.count()).select_from(Job)) == 1
