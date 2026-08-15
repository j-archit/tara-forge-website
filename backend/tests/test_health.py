def test_health_and_readiness(client):
    assert client.get("/health").json() == {"status": "ok", "service": "taraforge-api"}
    assert client.get("/ready").json() == {"status": "ready"}
