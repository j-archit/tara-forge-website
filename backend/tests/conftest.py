from pathlib import Path
import os

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.database import Base
from app.main import create_app
from app.models import Admin
from app.security import hash_password


@pytest.fixture
def settings(tmp_path: Path) -> Settings:
    database_url = os.environ.get("TEST_DATABASE_URL", f"sqlite:///{tmp_path / 'test.db'}")
    return Settings(
        environment="test",
        database_url=database_url,
        vault_path=tmp_path / "vault",
        max_upload_bytes=64,
        secure_cookies=False,
        allowed_origins=["http://testserver"],
    )


@pytest.fixture
def app(settings: Settings):
    application = create_app(settings, create_schema=True)
    yield application
    Base.metadata.drop_all(application.state.engine)
    application.state.engine.dispose()


@pytest.fixture
def client(app):
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def admin(app) -> Admin:
    with app.state.session_factory() as db:
        record = Admin(email="admin@taraforge.in", password_hash=hash_password("correct-horse-battery"))
        db.add(record)
        db.commit()
        db.refresh(record)
        return record


@pytest.fixture
def authenticated_client(client: TestClient, admin: Admin) -> TestClient:
    response = client.post(
        "/api/auth/login",
        json={"email": admin.email, "password": "correct-horse-battery"},
    )
    assert response.status_code == 200
    return client


@pytest.fixture
def csrf_headers(authenticated_client: TestClient) -> dict[str, str]:
    token = authenticated_client.cookies.get("tf_admin_csrf")
    assert token
    return {"X-CSRF-Token": token}


@pytest.fixture
def intake_payload() -> dict[str, str]:
    return {
        "name": "Ada Maker",
        "email": "ADA@example.com",
        "projectType": "parts",
        "material": "pla",
        "description": "A replacement control knob.",
        "hp_id": "",
    }
