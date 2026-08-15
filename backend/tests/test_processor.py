import json

from sqlalchemy import func, select

from app.jobs import claim_next_job, complete_job
from app.models import Job, SlicerProfile, SlicerRun, Submission
from app.processor import SubmissionProcessor
from app.slicing import SliceEstimate, SlicingError


class SuccessfulSlicer:
    def estimate(self, model_path, profile):
        assert model_path.exists()
        assert profile["settings"]["layer_height"] == 0.2
        return SliceEstimate(3600, 9.5, "Print time: 3600")


class FailedSlicer:
    def estimate(self, model_path, profile):
        raise SlicingError("fixture failure")


class FakeGoogle:
    def __init__(self):
        self.uploads = []
        self.sheet_rows = []

    def upload_once(self, *args):
        self.uploads.append(args)
        return "drive-id"

    def upsert_sheet_row(self, values, submission_id):
        self.sheet_rows.append((values, submission_id))


def create_submission(client, app, intake_payload):
    response = client.post(
        "/api/intake",
        data=intake_payload,
        files={"file": ("part.stl", b"solid part", "model/stl")},
    )
    with app.state.session_factory() as db:
        db.add(
            SlicerProfile(
                material="PLA",
                name="standard",
                version=1,
                config_json=json.dumps({"settings": {"layer_height": 0.2}}),
            )
        )
        db.commit()
    return response.json()["id"]


def test_processor_persists_slice_estimate(client, app, intake_payload):
    submission_id = create_submission(client, app, intake_payload)
    with app.state.session_factory() as db:
        job = claim_next_job(db, "worker", 60)
        SubmissionProcessor(app.state.settings.vault_path, SuccessfulSlicer()).process(db, job)
        complete_job(db, job)
        submission = db.get(Submission, submission_id)
        assert submission.status == "complete"
        assert submission.slicer_status == "complete"
        assert submission.drive_status == "disabled"
        assert submission.print_time_seconds == 3600
        assert db.scalar(select(SlicerRun).where(SlicerRun.submission_id == submission_id))


def test_processor_records_slice_failure_without_losing_submission(client, app, intake_payload):
    submission_id = create_submission(client, app, intake_payload)
    with app.state.session_factory() as db:
        job = db.scalar(select(Job).where(Job.submission_id == submission_id))
        SubmissionProcessor(app.state.settings.vault_path, FailedSlicer()).process(db, job)
        submission = db.get(Submission, submission_id)
        run = db.scalar(select(SlicerRun).where(SlicerRun.submission_id == submission_id))
        assert submission.status == "partial"
        assert submission.slicer_status == "failed"
        assert run.error == "fixture failure"


def test_processor_syncs_drive_and_sheet_once(client, app, intake_payload):
    submission_id = create_submission(client, app, intake_payload)
    google = FakeGoogle()
    with app.state.session_factory() as db:
        job = db.scalar(select(Job).where(Job.submission_id == submission_id))
        processor = SubmissionProcessor(app.state.settings.vault_path, SuccessfulSlicer(), google)
        processor.process(db, job)
        submission = db.get(Submission, submission_id)
        assert submission.google_drive_id == "drive-id"
        assert submission.drive_status == "complete"
        assert submission.sheets_status == "complete"
        assert google.uploads[0][-1] == submission_id
        assert google.sheet_rows[0][0][8] == submission_id

        processor.process(db, job)
        assert len(google.uploads) == 1
        assert len(google.sheet_rows) == 2
        assert db.scalar(select(func.count()).select_from(SlicerRun)) == 1


def test_processor_skips_slicing_and_drive_without_file(client, app, intake_payload):
    submission_id = client.post("/api/intake", data=intake_payload).json()["id"]
    google = FakeGoogle()
    with app.state.session_factory() as db:
        job = db.scalar(select(Job).where(Job.submission_id == submission_id))
        SubmissionProcessor(app.state.settings.vault_path, SuccessfulSlicer(), google).process(db, job)
        submission = db.get(Submission, submission_id)
        assert submission.slicer_status == "skipped"
        assert submission.drive_status == "skipped"
        assert submission.sheets_status == "complete"
        assert not google.uploads


def test_processor_marks_missing_profile_as_partial(client, app, intake_payload):
    submission_id = client.post(
        "/api/intake",
        data=intake_payload,
        files={"file": ("part.stl", b"solid part", "model/stl")},
    ).json()["id"]
    with app.state.session_factory() as db:
        job = db.scalar(select(Job).where(Job.submission_id == submission_id))
        SubmissionProcessor(app.state.settings.vault_path, SuccessfulSlicer()).process(db, job)
        submission = db.get(Submission, submission_id)
        assert submission.slicer_status == "missing_profile"
        assert submission.status == "partial"
