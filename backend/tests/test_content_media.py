from pathlib import Path


PNG = b"\x89PNG\r\n\x1a\n" + b"image-data"


def test_admin_uploads_and_public_serves_content_image(authenticated_client, csrf_headers, app):
    uploaded = authenticated_client.post(
        "/api/admin/content/media",
        files={"file": ("prior-print.png", PNG, "image/png")},
        headers=csrf_headers,
    )
    assert uploaded.status_code == 201
    assert uploaded.json()["url"].startswith("/api/content/media/")
    response = authenticated_client.get(uploaded.json()["url"])
    assert response.status_code == 200
    assert response.content == PNG
    assert response.headers["cache-control"] == "public, max-age=31536000, immutable"
    assert (app.state.settings.vault_path / "content" / Path(uploaded.json()["url"]).name).is_file()


def test_content_image_upload_rejects_invalid_type_content_and_size(authenticated_client, csrf_headers, app):
    unsupported = authenticated_client.post(
        "/api/admin/content/media",
        files={"file": ("notes.txt", b"hello", "text/plain")},
        headers=csrf_headers,
    )
    fake = authenticated_client.post(
        "/api/admin/content/media",
        files={"file": ("fake.png", b"not an image", "image/png")},
        headers=csrf_headers,
    )
    app.state.settings.content_image_max_bytes = 4
    oversized = authenticated_client.post(
        "/api/admin/content/media",
        files={"file": ("large.png", PNG, "image/png")},
        headers=csrf_headers,
    )
    assert unsupported.status_code == 422
    assert fake.status_code == 422
    assert oversized.status_code == 413


def test_content_media_rejects_missing_and_unsafe_keys(client):
    assert client.get("/api/content/media/missing.png").status_code == 404
    assert client.get("/api/content/media/%2E%2E%2Fsecret").status_code == 404
