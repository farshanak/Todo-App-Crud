from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_create_list_update_delete_todo():
    created = client.post("/todos", json={"title": "buy milk"}).json()
    assert created["title"] == "buy milk"
    assert created["done"] is False

    listed = client.get("/todos").json()
    assert any(t["id"] == created["id"] for t in listed)

    updated = client.put(
        f"/todos/{created['id']}",
        json={"title": "buy milk", "done": True},
    ).json()
    assert updated["done"] is True

    assert client.delete(f"/todos/{created['id']}").status_code == 204
    assert client.get("/todos").json() == [
        t for t in listed if t["id"] != created["id"]
    ]


def test_update_missing_todo_returns_404():
    assert client.put("/todos/999999", json={"title": "x"}).status_code == 404


def test_delete_missing_todo_returns_404():
    assert client.delete("/todos/999999").status_code == 404
