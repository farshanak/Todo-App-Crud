"""Integration test: todos created via the HTTP API survive a process restart.

We simulate "restart" by reloading the `db` and `main` modules with the same
SQLite file URL — both runs hit the same on-disk database.
"""

import importlib

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def tmp_db_url(tmp_path, monkeypatch):
    db_file = tmp_path / "persist.db"
    url = f"sqlite:///{db_file}"
    monkeypatch.setenv("DATABASE_URL", url)
    yield url


def _fresh_app():
    """Re-import config + db + main so they pick up DATABASE_URL from env."""
    import config
    import db
    import main

    importlib.reload(config)
    importlib.reload(db)
    importlib.reload(main)
    return main.app


def test_created_todo_survives_process_restart(tmp_db_url):
    app1 = _fresh_app()
    with TestClient(app1) as c1:
        created = c1.post("/todos", json={"title": "persist me"}).json()
        assert created["title"] == "persist me"
        todo_id = created["id"]

    app2 = _fresh_app()
    with TestClient(app2) as c2:
        listed = c2.get("/todos").json()
        assert any(
            t["id"] == todo_id and t["title"] == "persist me" for t in listed
        ), f"todo {todo_id} did not survive restart; got {listed}"


def test_update_then_restart_preserves_change(tmp_db_url):
    app1 = _fresh_app()
    with TestClient(app1) as c1:
        created = c1.post("/todos", json={"title": "task"}).json()
        c1.put(f"/todos/{created['id']}", json={"title": "task", "done": True})

    app2 = _fresh_app()
    with TestClient(app2) as c2:
        listed = c2.get("/todos").json()
        match = next(t for t in listed if t["id"] == created["id"])
        assert match["done"] is True


def test_delete_then_restart_keeps_row_deleted(tmp_db_url):
    app1 = _fresh_app()
    with TestClient(app1) as c1:
        created = c1.post("/todos", json={"title": "delete me"}).json()
        assert c1.delete(f"/todos/{created['id']}").status_code == 204

    app2 = _fresh_app()
    with TestClient(app2) as c2:
        listed = c2.get("/todos").json()
        assert all(t["id"] != created["id"] for t in listed)
