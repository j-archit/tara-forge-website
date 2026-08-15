from datetime import timedelta

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from .models import Job, JobStatus, utcnow


def claim_next_job(db: Session, worker_id: str, lease_seconds: int) -> Job | None:
    now = utcnow()
    candidate = db.scalar(
        select(Job)
        .where(
            Job.available_at <= now,
            or_(
                Job.status == JobStatus.PENDING.value,
                (Job.status == JobStatus.RUNNING.value) & (Job.lease_expires_at < now),
            ),
        )
        .order_by(Job.available_at.asc(), Job.id.asc())
        .limit(1)
        .with_for_update(skip_locked=True)
    )
    if candidate is None:
        return None

    candidate.status = JobStatus.RUNNING.value
    candidate.lease_owner = worker_id
    candidate.lease_expires_at = now + timedelta(seconds=lease_seconds)
    candidate.started_at = now
    candidate.attempt_count += 1
    db.commit()
    db.refresh(candidate)
    return candidate


def complete_job(db: Session, job: Job) -> None:
    job.status = JobStatus.COMPLETE.value
    job.completed_at = utcnow()
    job.lease_owner = None
    job.lease_expires_at = None
    job.last_error = None
    db.commit()


def fail_or_retry_job(db: Session, job: Job, error: Exception) -> None:
    job.last_error = str(error)[:4000]
    job.lease_owner = None
    job.lease_expires_at = None
    if job.attempt_count >= job.max_attempts:
        job.status = JobStatus.FAILED.value
        job.completed_at = utcnow()
    else:
        job.status = JobStatus.PENDING.value
        delay_seconds = min(3600, 30 * (2 ** max(0, job.attempt_count - 1)))
        job.available_at = utcnow() + timedelta(seconds=delay_seconds)
    db.commit()
