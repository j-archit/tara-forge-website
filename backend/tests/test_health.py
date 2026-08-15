def test_health_and_readiness(client):
    assert client.get("/health").json() == {"status": "ok", "service": "taraforge-api"}
    assert client.get("/ready").json() == {"status": "ready"}


def test_readiness_reports_low_storage(client, app):
    app.state.settings.minimum_free_bytes = 10**30
    response = client.get("/ready")
    assert response.status_code == 503
    assert response.json()["detail"] == "Insufficient storage space"
