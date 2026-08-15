import json
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from .google_integration import GoogleIntegration
from .models import Job, SlicerProfile, SlicerRun, Submission, SubmissionStatus, utcnow
from .slicing import CuraSlicer, SlicingError


SLICABLE_EXTENSIONS = {".stl", ".obj", ".3mf"}


class SubmissionProcessor:
    def __init__(
        self,
        vault_path: Path,
        slicer: CuraSlicer,
        google: GoogleIntegration | None = None,
    ):
        self.vault_path = vault_path
        self.slicer = slicer
        self.google = google

    def process(self, db: Session, job: Job) -> None:
        if job.type != "process_submission" or not job.submission_id:
            raise ValueError(f"Unsupported job type: {job.type}")
        submission = db.scalar(
            select(Submission)
            .where(Submission.id == job.submission_id)
            .options(selectinload(Submission.client))
        )
        if not submission:
            raise ValueError("Submission no longer exists")
        submission.status = SubmissionStatus.PROCESSING.value
        db.commit()

        self._slice(db, submission)
        self._sync_google(db, submission)
        failures = submission.slicer_status in {"failed", "missing_profile"} or any(
            state == "failed" for state in (submission.drive_status, submission.sheets_status)
        )
        submission.status = SubmissionStatus.PARTIAL.value if failures else SubmissionStatus.COMPLETE.value
        db.commit()

    def _slice(self, db: Session, submission: Submission) -> None:
        if submission.slicer_status == "complete" and submission.print_time_seconds is not None:
            return
        if not submission.stored_file_key:
            submission.slicer_status = "skipped"
            db.commit()
            return
        model_path = self.vault_path / submission.stored_file_key
        if model_path.suffix.casefold() not in SLICABLE_EXTENSIONS:
            submission.slicer_status = "unsupported"
            db.commit()
            return
        profile = db.scalar(
            select(SlicerProfile)
            .where(
                SlicerProfile.material == submission.material,
                SlicerProfile.active.is_(True),
            )
            .order_by(SlicerProfile.version.desc())
        )
        if not profile:
            submission.slicer_status = "missing_profile"
            db.commit()
            return
        try:
            estimate = self.slicer.estimate(model_path, json.loads(profile.config_json))
            run = SlicerRun(
                submission_id=submission.id,
                profile_snapshot_json=profile.config_json,
                print_time_seconds=estimate.print_time_seconds,
                filament_grams=estimate.filament_grams,
                output_summary=estimate.output_summary,
                status="complete",
                completed_at=utcnow(),
            )
            db.add(run)
            submission.print_time_seconds = estimate.print_time_seconds
            submission.filament_grams = estimate.filament_grams
            submission.slicer_status = "complete"
        except (SlicingError, json.JSONDecodeError) as exc:
            db.add(
                SlicerRun(
                    submission_id=submission.id,
                    profile_snapshot_json=profile.config_json,
                    status="failed",
                    error=str(exc)[:4000],
                    completed_at=utcnow(),
                )
            )
            submission.slicer_status = "failed"
        db.commit()

    def _sync_google(self, db: Session, submission: Submission) -> None:
        if not self.google:
            submission.drive_status = "disabled"
            submission.sheets_status = "disabled"
            db.commit()
            return
        if submission.stored_file_key and not submission.google_drive_id:
            file_path = self.vault_path / submission.stored_file_key
            submission.google_drive_id = self.google.upload_once(
                file_path,
                submission.original_filename or file_path.name,
                submission.media_type or "application/octet-stream",
                submission.id,
            )
            submission.drive_status = "complete"
            db.commit()
        elif not submission.stored_file_key:
            submission.drive_status = "skipped"

        drive_link = (
            f"https://drive.google.com/file/d/{submission.google_drive_id}/view"
            if submission.google_drive_id
            else ""
        )
        self.google.upsert_sheet_row(
            [
                submission.created_at.isoformat(),
                submission.client.name,
                submission.client.email,
                submission.project_type,
                submission.material,
                submission.description,
                submission.original_filename or "",
                drive_link,
                submission.id,
                round((submission.print_time_seconds or 0) / 60),
                submission.filament_grams or 0,
            ],
            submission.id,
        )
        submission.sheets_status = "complete"
        db.commit()
