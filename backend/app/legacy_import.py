import hashlib
import shutil
import sqlite3
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Client, Job, Submission, SubmissionStatus
from .security import normalize_email


@dataclass
class MigrationReport:
    source_rows: int = 0
    imported_submissions: int = 0
    imported_clients: int = 0
    skipped_existing: int = 0
    copied_files: int = 0
    missing_files: int = 0

    def to_dict(self) -> dict[str, int]:
        return asdict(self)


def parse_datetime(value) -> datetime | None:
    if not value:
        return None
    if isinstance(value, datetime):
        return value
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None


def file_digest(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def resolve_legacy_file(file_path: str | None, source_vault: Path) -> Path | None:
    if not file_path:
        return None
    candidate = Path(file_path)
    if candidate.is_file():
        return candidate
    fallback = source_vault / candidate.name
    return fallback if fallback.is_file() else None


def import_legacy(
    source_database: Path,
    source_vault: Path,
    destination_vault: Path,
    db: Session,
) -> MigrationReport:
    report = MigrationReport()
    destination_vault.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(f"file:{source_database.resolve()}?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row
    try:
        rows = connection.execute("SELECT * FROM submissions ORDER BY createdAt, id").fetchall()
    finally:
        connection.close()
    report.source_rows = len(rows)

    for row in rows:
        if db.get(Submission, row["id"]):
            report.skipped_existing += 1
            continue
        email = normalize_email(row["email"])
        client = db.scalar(select(Client).where(Client.email == email))
        if not client:
            client = Client(email=email, name=row["name"])
            db.add(client)
            db.flush()
            report.imported_clients += 1

        source_file = resolve_legacy_file(row["filePath"], source_vault)
        stored_key = None
        checksum = None
        byte_size = None
        if source_file:
            suffix = source_file.suffix.casefold()
            stored_key = f"{uuid.uuid4()}{suffix}"
            destination = destination_vault / stored_key
            shutil.copy2(source_file, destination)
            checksum = file_digest(destination)
            byte_size = destination.stat().st_size
            report.copied_files += 1
        elif row["filePath"]:
            report.missing_files += 1

        drive_status = row["googleDriveStatus"] or "pending"
        sheets_status = row["googleSheetStatus"] or "pending"
        slicer_status = row["slicerStatus"] or "pending"
        complete = drive_status == "completed" and sheets_status == "completed"
        submission = Submission(
            id=row["id"],
            client_id=client.id,
            project_type=row["projectType"] or "other",
            material=(row["material"] or "PLA").upper(),
            description=row["description"] or "",
            original_filename=row["fileName"],
            stored_file_key=stored_key,
            byte_size=byte_size,
            file_checksum=checksum,
            status=SubmissionStatus.COMPLETE.value if complete else SubmissionStatus.QUEUED.value,
            slicer_status="complete" if slicer_status == "completed" else slicer_status,
            drive_status="complete" if drive_status == "completed" else drive_status,
            sheets_status="complete" if sheets_status == "completed" else sheets_status,
            google_drive_id=row["googleDriveId"],
            print_time_seconds=row["printTimeSeconds"],
            filament_grams=row["filamentGrams"],
            created_at=parse_datetime(row["createdAt"]) or datetime.now(),
        )
        db.add(submission)
        db.flush()
        if not complete:
            db.add(Job(type="process_submission", submission_id=submission.id))
        report.imported_submissions += 1
    db.commit()
    return report
