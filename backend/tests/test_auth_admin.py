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
