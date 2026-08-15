import logging
import socket
import time
import uuid

from .config import get_settings
from .database import create_database_engine, create_session_factory
from .google_integration import GoogleConfig, GoogleIntegration
from .jobs import claim_next_job, complete_job, fail_or_retry_job
from .processor import SubmissionProcessor
from .slicing import CuraSlicer


logger = logging.getLogger("taraforge.worker")


def build_processor():
    settings = get_settings()
    google = None
    if (
        settings.google_service_account_key_path
        and settings.google_drive_folder_id
        and settings.google_sheet_id
    ):
        google = GoogleIntegration.from_config(
            GoogleConfig(
                settings.google_service_account_key_path,
                settings.google_drive_folder_id,
                settings.google_sheet_id,
            )
        )
    return SubmissionProcessor(
        settings.vault_path,
        CuraSlicer(settings.cura_engine_binary, settings.slicer_definition_path),
        google,
    )


def run_once(factory, processor, worker_id: str, lease_seconds: int) -> bool:
    with factory() as db:
        job = claim_next_job(db, worker_id, lease_seconds)
        if not job:
            return False
        try:
            processor.process(db, job)
            complete_job(db, job)
        except Exception as exc:
            logger.exception("Job %s failed", job.id)
            fail_or_retry_job(db, job, exc)
        return True


def run_forever() -> None:
    settings = get_settings()
    factory = create_session_factory(create_database_engine(settings.database_url))
    processor = build_processor()
    worker_id = f"{socket.gethostname()}-{uuid.uuid4().hex[:8]}"
    logger.info("Worker %s started", worker_id)
    while True:
        if not run_once(factory, processor, worker_id, settings.worker_lease_seconds):
            time.sleep(settings.worker_poll_seconds)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_forever()
