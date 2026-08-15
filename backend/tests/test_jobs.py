from datetime import timedelta

from sqlalchemy import select

from app.jobs import claim_next_job, complete_job, fail_or_retry_job
from app.models import Job, JobStatus, utcnow


def add_job(app, *, attempts=0, max_attempts=3, status=JobStatus.PENDING.value):
    with app.state.session_factory() as db:
        job = Job(
            type="test",
            status=status,
            attempt_count=attempts,
            max_attempts=max_attempts,
            available_at=utcnow() - timedelta(seconds=1),
        )
        db.add(job)
        db.commit()
        return job.id


def test_claim_and_complete_job(app):
    job_id = add_job(app)
    with app.state.session_factory() as db:
        claimed = claim_next_job(db, "worker-a", 60)
        assert claimed.id == job_id
        assert claimed.status == JobStatus.RUNNING.value
        assert claimed.attempt_count == 1
        assert claim_next_job(db, "worker-b", 60) is None
        complete_job(db, claimed)
        assert db.get(Job, job_id).status == JobStatus.COMPLETE.value


def test_expired_lease_is_reclaimed(app):
    job_id = add_job(app, status=JobStatus.RUNNING.value)
    with app.state.session_factory() as db:
        job = db.get(Job, job_id)
        job.lease_owner = "dead-worker"
        job.lease_expires_at = utcnow() - timedelta(seconds=5)
        db.commit()
        claimed = claim_next_job(db, "replacement", 60)
        assert claimed.id == job_id
        assert claimed.lease_owner == "replacement"


def test_failure_retries_then_becomes_terminal(app):
    job_id = add_job(app, max_attempts=2)
    with app.state.session_factory() as db:
        first = claim_next_job(db, "worker", 60)
        fail_or_retry_job(db, first, RuntimeError("temporary"))
        retried = db.get(Job, job_id)
        assert retried.status == JobStatus.PENDING.value
        assert retried.last_error == "temporary"
        retried.available_at = utcnow() - timedelta(seconds=1)
        db.commit()
        second = claim_next_job(db, "worker", 60)
        fail_or_retry_job(db, second, RuntimeError("permanent"))
        terminal = db.scalar(select(Job).where(Job.id == job_id))
        assert terminal.status == JobStatus.FAILED.value
        assert terminal.completed_at is not None
