from sqlalchemy import func, select

from app.models import Client, Job, Submission


def test_intake_creates_client_submission_and_job(client, app, intake_payload):
    response = client.post(
        "/api/intake",
        data=intake_payload,
        files={"file": ("bracket.stl", b"solid bracket", "model/stl")},
    )

    assert response.status_code == 202
    assert response.json()["status"] == "queued"
    with app.state.session_factory() as db:
        submission = db.get(Submission, response.json()["id"])
        assert submission is not None
        assert submission.material == "PLA"
        assert submission.original_filename == "bracket.stl"
        assert submission.byte_size == 13
        assert db.scalar(select(func.count()).select_from(Client)) == 1
        assert db.scalar(select(func.count()).select_from(Job)) == 1
        assert (app.state.settings.vault_path / submission.stored_file_key).read_bytes() == b"solid bracket"


def test_intake_reuses_normalized_client(client, app, intake_payload):
    first = client.post("/api/intake", data=intake_payload)
    second_payload = {**intake_payload, "email": "ada@EXAMPLE.com", "description": "Another part"}
    second = client.post("/api/intake", data=second_payload)

    assert first.status_code == second.status_code == 202
    with app.state.session_factory() as db:
        assert db.scalar(select(func.count()).select_from(Client)) == 1
        assert db.scalar(select(func.count()).select_from(Submission)) == 2


def test_idempotency_key_returns_original_submission(client, app, intake_payload):
    headers = {"Idempotency-Key": "quote-attempt-123"}
    first = client.post("/api/intake", data=intake_payload, headers=headers)
    second = client.post("/api/intake", data=intake_payload, headers=headers)

    assert first.status_code == second.status_code == 202
    assert first.json()["id"] == second.json()["id"]
    with app.state.session_factory() as db:
        assert db.scalar(select(func.count()).select_from(Submission)) == 1


def test_rejects_unsupported_and_oversized_uploads(client, intake_payload):
    unsupported = client.post(
        "/api/intake",
        data=intake_payload,
        files={"file": ("notes.txt", b"hello", "text/plain")},
    )
    oversized = client.post(
        "/api/intake",
        data=intake_payload,
        files={"file": ("large.stl", b"x" * 65, "model/stl")},
    )

    assert unsupported.status_code == 422
    assert oversized.status_code == 413


def test_honeypot_rejects_bot_submission(client, intake_payload):
    response = client.post("/api/intake", data={**intake_payload, "hp_id": "filled"})
    assert response.status_code == 400
