from unittest.mock import MagicMock

import pytest
from sqlalchemy.exc import OperationalError


@pytest.mark.integration
def test_health_and_ready_happy_path(client):
    h = client.get("/health")
    assert h.status_code == 200
    assert h.json()["status"] == "ok"
    assert h.json().get("version")
    r = client.get("/ready")
    assert r.status_code == 200
    assert r.json() == {"status": "ready"}


@pytest.mark.integration
def test_ready_503_when_db_unreachable(client):
    from db import get_session

    def broken():
        session = MagicMock()
        session.execute.side_effect = OperationalError("SELECT 1", {}, Exception("down"))
        yield session

    client.app.dependency_overrides[get_session] = broken
    try:
        assert client.get("/ready").status_code == 503
    finally:
        client.app.dependency_overrides.clear()
