from sqlalchemy import select

from app.models import AuditEvent


GALLERY = {
    "title": "Orbital Gearbox",
    "category": "Prior prints",
    "description": "A compact production gearbox used for fit validation.",
    "tags": ["PETG", "Prototype"],
    "imageUrl": "/images/gearbox.jpg",
    "gradient": "from-blue-900 via-slate-950 to-slate-950",
    "accent": "rgba(59,130,246,0.5)",
    "published": True,
    "sortOrder": 4,
}

STORE = {
    "id": "orbital-stand",
    "title": "Orbital Stand",
    "category": "Desk",
    "description": "A balanced display stand printed to order.",
    "pricePaise": 149900,
    "currency": "₹",
    "imageUrl": "https://cdn.example.test/stand.webp",
    "gradient": "from-amber-900 via-slate-950 to-slate-950",
    "accent": "rgba(251,191,36,0.5)",
    "badge": "New",
    "published": True,
    "available": True,
    "sortOrder": 2,
}


def test_public_content_only_returns_published_items(client, authenticated_client, csrf_headers):
    gallery = authenticated_client.post("/api/admin/content/gallery", json=GALLERY, headers=csrf_headers)
    assert gallery.status_code == 201
    assert client.get("/api/content/gallery").json()[0]["title"] == "Orbital Gearbox"

    hidden = {**GALLERY, "title": "Draft print", "published": False}
    assert authenticated_client.post("/api/admin/content/gallery", json=hidden, headers=csrf_headers).status_code == 201
    assert [item["title"] for item in client.get("/api/content/gallery").json()] == ["Orbital Gearbox"]
    assert len(authenticated_client.get("/api/admin/content/gallery").json()) == 2


def test_gallery_crud_is_validated_and_audited(authenticated_client, csrf_headers, app):
    created = authenticated_client.post("/api/admin/content/gallery", json=GALLERY, headers=csrf_headers)
    item_id = created.json()["id"]
    updated = authenticated_client.put(
        f"/api/admin/content/gallery/{item_id}",
        json={**GALLERY, "title": "Updated gearbox", "tags": ["PLA"]},
        headers=csrf_headers,
    )
    assert updated.status_code == 200
    assert updated.json()["tags"] == ["PLA"]
    assert authenticated_client.put(
        f"/api/admin/content/gallery/{item_id}",
        json={**GALLERY, "imageUrl": "http://unsafe.test/image.jpg"},
        headers=csrf_headers,
    ).status_code == 422
    assert authenticated_client.delete(f"/api/admin/content/gallery/{item_id}", headers=csrf_headers).status_code == 204
    assert authenticated_client.delete(f"/api/admin/content/gallery/{item_id}", headers=csrf_headers).status_code == 404
    with app.state.session_factory() as db:
        events = db.scalars(select(AuditEvent.event_type).where(AuditEvent.event_type.like("gallery.%"))).all()
        assert sorted(events) == ["gallery.created", "gallery.deleted", "gallery.updated"]


def test_store_crud_controls_public_availability(authenticated_client, csrf_headers):
    created = authenticated_client.post("/api/admin/content/store", json=STORE, headers=csrf_headers)
    assert created.status_code == 201
    assert created.json()["pricePaise"] == 149900
    assert authenticated_client.post("/api/admin/content/store", json=STORE, headers=csrf_headers).status_code == 409
    assert authenticated_client.get("/api/content/store").json()[0]["available"] is True

    updated = authenticated_client.put(
        "/api/admin/content/store/orbital-stand",
        json={**STORE, "published": False, "available": False},
        headers=csrf_headers,
    )
    assert updated.status_code == 200
    assert authenticated_client.get("/api/content/store").json() == []
    assert authenticated_client.put(
        "/api/admin/content/store/orbital-stand",
        json={**STORE, "id": "renamed"},
        headers=csrf_headers,
    ).status_code == 422
    assert authenticated_client.delete("/api/admin/content/store/orbital-stand", headers=csrf_headers).status_code == 204


def test_content_routes_require_authentication(client):
    assert client.get("/api/admin/content/gallery").status_code == 401
    assert client.post("/api/admin/content/gallery", json=GALLERY).status_code == 401


def test_content_mutations_require_csrf(authenticated_client):
    assert authenticated_client.post("/api/admin/content/store", json=STORE).status_code == 403
