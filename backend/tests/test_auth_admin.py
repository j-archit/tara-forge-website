from sqlalchemy import select

from app.defaults import seed_defaults
from app.models import Job, Submission


def test_admin_routes_require_authentication(client):
    assert client.get("/api/admin/submissions").status_code == 401
    assert client.get("/api/admin/clients").status_code == 401


def test_login_rejects_invalid_credentials(client, admin):
    response = client.post(
        "/api/auth/login",
        json={"email": admin.email, "password": "wrong-password"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_login_rate_limit(client, admin, app):
    app.state.settings.login_rate_limit = 1
    payload = {"email": admin.email, "password": "wrong-password"}
    assert client.post("/api/auth/login", json=payload).status_code == 401
    limited = client.post("/api/auth/login", json=payload)
    assert limited.status_code == 429
    assert limited.headers["retry-after"] == "60"


def test_authenticated_admin_can_list_intake(authenticated_client, intake_payload):
    created = authenticated_client.post("/api/intake", data=intake_payload)
    assert created.status_code == 202

    submissions = authenticated_client.get("/api/admin/submissions")
    clients = authenticated_client.get("/api/admin/clients")

    assert submissions.status_code == clients.status_code == 200
    assert submissions.json()[0]["email"] == "ada@example.com"
    assert clients.json()[0]["name"] == "Ada Maker"


def test_logout_requires_csrf_and_revokes_session(authenticated_client, csrf_headers):
    assert authenticated_client.post("/api/auth/logout").status_code == 403
    assert authenticated_client.post("/api/auth/logout", headers=csrf_headers).status_code == 204
    assert authenticated_client.get("/api/auth/session").status_code == 401


def test_admin_submission_and_client_details(authenticated_client, intake_payload):
    submission_id = authenticated_client.post("/api/intake", data=intake_payload).json()["id"]
    submission = authenticated_client.get(f"/api/admin/submissions/{submission_id}")
    clients = authenticated_client.get("/api/admin/clients").json()
    client = authenticated_client.get(f"/api/admin/clients/{clients[0]['id']}")
    missing = authenticated_client.get("/api/admin/submissions/does-not-exist")

    assert submission.status_code == client.status_code == 200
    assert client.json()["submissions"][0]["id"] == submission_id
    assert missing.status_code == 404


def test_profile_versioning_and_soft_delete(authenticated_client, app, csrf_headers):
    with app.state.session_factory() as db:
        seed_defaults(db)
    profiles = authenticated_client.get("/api/admin/slicer/profiles")
    assert {item["material"] for item in profiles.json()} == {"PLA", "PETG", "TPU"}

    updated = authenticated_client.put(
        "/api/admin/slicer/profiles/PLA/standard",
        json={"config": {"settings": {"layer_height": 0.12}}},
        headers=csrf_headers,
    )
    assert updated.status_code == 201
    assert updated.json()["version"] == 2
    assert authenticated_client.get("/api/admin/slicer/profiles/PLA/standard").json()["version"] == 2
    assert authenticated_client.delete(
        "/api/admin/slicer/profiles/PLA/standard", headers=csrf_headers
    ).status_code == 204
    assert authenticated_client.get("/api/admin/slicer/profiles/PLA/standard").status_code == 404


def test_template_email_and_job_controls(authenticated_client, app, intake_payload, csrf_headers):
    with app.state.session_factory() as db:
        seed_defaults(db)
    submission_id = authenticated_client.post("/api/intake", data=intake_payload).json()["id"]
    with app.state.session_factory() as db:
        submission = db.get(Submission, submission_id)
        submission.print_time_seconds = 3600
        submission.filament_grams = 12.5
        db.commit()

    generated = authenticated_client.get(f"/api/admin/email/{submission_id}")
    assert generated.status_code == 200
    assert "60 minutes" in generated.json()["body"]

    updated = authenticated_client.put(
        "/api/admin/templates/estimate",
        json={"subject": "Estimate for {name}", "body": "Material: {material}"},
        headers=csrf_headers,
    )
    assert updated.status_code == 200
    assert updated.json()["version"] == 2

    authenticated_client.put(
        "/api/admin/templates/estimate",
        json={"subject": "Broken {missing}", "body": "Material: {material}"},
        headers=csrf_headers,
    )
    invalid_template = authenticated_client.get(f"/api/admin/email/{submission_id}")
    assert invalid_template.status_code == 422

    queued = authenticated_client.post(
        f"/api/admin/submissions/{submission_id}/slice", headers=csrf_headers
    )
    assert queued.status_code == 202
    assert authenticated_client.get(f"/api/admin/submissions/{submission_id}/runs").json() == []

    jobs = authenticated_client.get("/api/admin/jobs").json()
    retried = authenticated_client.post(
        f"/api/admin/jobs/{jobs[0]['id']}/retry", headers=csrf_headers
    )
    assert retried.status_code == 202
    with app.state.session_factory() as db:
        assert db.scalar(select(Job).where(Job.id == jobs[0]["id"])).attempt_count == 0
