from app.rate_limit import RateLimiter


def test_rate_limiter_releases_attempts_after_the_window():
    limiter = RateLimiter()
    assert limiter.allow("client", 2, 60, now=0)
    assert limiter.allow("client", 2, 60, now=1)
    assert not limiter.allow("client", 2, 60, now=2)
    assert limiter.allow("client", 2, 60, now=61)


def test_rate_limiter_keeps_clients_independent():
    limiter = RateLimiter()
    assert limiter.allow("first", 1, 60, now=0)
    assert not limiter.allow("first", 1, 60, now=1)
    assert limiter.allow("second", 1, 60, now=1)
