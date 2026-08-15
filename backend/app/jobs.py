from datetime import timedelta

from sqlalchemy import or_, select, update
from sqlalchemy.orm import Session

from .models import Job, JobStatus, utcnow


def claim_next_job(db: Session, worker_id: str, lease_seconds: int) -> Job | None:
    now = utcnow()
    candidate_id = db.scalar(
        select(Job.id)
        .where(
            Job.available_at <= now,
            or_(
                Job.status == JobStatus.PENDING.value,
                (Job.status == JobStatus.RUNNING.value) & (Job.lease_expires_at < now),
            ),
        )
        .order_by(Job.available_at.asc(), Job.id.asc())
        .limit(1)
    )
    if candidate_id is None:
        return None

    claimed = db.execute(
        update(Job)
        .where(
            Job.id == candidate_id,
            or_(
                Job.status == JobStatus.PENDING.value,
                (Job.status == JobStatus.RUNNING.value) & (Job.lease_expires_at < now),
            ),
        )
        .values(
            status=JobStatus.RUNNING.value,
            lease_owner=worker_id,
            lease_expires_at=now + timedelta(seconds=lease_seconds),
            started_at=now,
            attempt_count=Job.attempt_count + 1,
        )
    )
    if claimed.rowcount != 1:
        db.rollback()
        return None
    db.commit()
    return db.get(Job, candidate_id)


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
