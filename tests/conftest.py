"""Shared pytest fixtures for the Todo-App-Crud backend.

Rules:
1. All mocks use create_autospec — never bare Mock().
2. Fixtures are the SINGLE SOURCE OF TRUTH for test dependencies.
3. Add new fixtures here, not in individual test files.
"""

import importlib
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client(tmp_path, monkeypatch) -> Iterator[TestClient]:
    """FastAPI TestClient bound to a per-test SQLite file.

    Each test gets a fresh on-disk database under tmp_path so state never
    leaks between tests, while exercising the same persistence code path
    used in production.
    """
    db_file = tmp_path / "test.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_file}")

    import config
    import db
    import main

    importlib.reload(config)
    importlib.reload(db)
    importlib.reload(main)

    with TestClient(main.app) as test_client:
        yield test_client
