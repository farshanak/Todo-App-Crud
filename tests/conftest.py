"""Shared pytest fixtures for the Todo-App-Crud backend.

Rules:
1. All mocks use create_autospec — never bare Mock().
2. Fixtures are the SINGLE SOURCE OF TRUTH for test dependencies.
3. Add new fixtures here, not in individual test files.
"""

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client() -> Iterator[TestClient]:
    """Fresh FastAPI TestClient with a clean in-memory store per test."""
    import main as main_module

    main_module._todos.clear()
    with TestClient(app) as test_client:
        yield test_client
