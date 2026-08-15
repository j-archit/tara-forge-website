from datetime import timedelta

from app.models import Job, JobStatus, utcnow
from app.worker import run_once


class Processor:
    def __init__(self, error=None):
        self.error = error
        self.jobs = []

    def process(self, db, job):
        self.jobs.append(job.id)
        if self.error:
            raise self.error


def add_job(app):
    with app.state.session_factory() as db:
        job = Job(type="test", available_at=utcnow() - timedelta(seconds=1))
        db.add(job)
        db.commit()
        return job.id


def test_worker_runs_and_completes_one_job(app):
    job_id = add_job(app)
    processor = Processor()
    assert run_once(app.state.session_factory, processor, "worker", 60) is True
    assert processor.jobs == [job_id]
    with app.state.session_factory() as db:
        assert db.get(Job, job_id).status == JobStatus.COMPLETE.value
    assert run_once(app.state.session_factory, processor, "worker", 60) is False


def test_worker_schedules_failure_for_retry(app):
    job_id = add_job(app)
    processor = Processor(RuntimeError("integration unavailable"))
    assert run_once(app.state.session_factory, processor, "worker", 60) is True
    with app.state.session_factory() as db:
        job = db.get(Job, job_id)
        assert job.status == JobStatus.PENDING.value
        assert job.last_error == "integration unavailable"
