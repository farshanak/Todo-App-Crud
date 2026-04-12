"""Integration tests for the Todo CRUD API via FastAPI TestClient."""


def test_list_starts_empty(client):
    assert client.get("/todos").json() == []


def test_create_returns_201_with_id(client):
    response = client.post("/todos", json={"title": "buy milk"})
    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "buy milk"
    assert body["done"] is False
    assert isinstance(body["id"], int)


def test_create_then_list_includes_new_todo(client):
    created = client.post("/todos", json={"title": "walk dog"}).json()
    listed = client.get("/todos").json()
    assert any(t["id"] == created["id"] for t in listed)


def test_update_marks_done(client):
    created = client.post("/todos", json={"title": "task"}).json()
    updated = client.put(
        f"/todos/{created['id']}",
        json={"title": "task", "done": True},
    ).json()
    assert updated["done"] is True
    assert updated["id"] == created["id"]


def test_delete_removes_todo(client):
    created = client.post("/todos", json={"title": "delete me"}).json()
    assert client.delete(f"/todos/{created['id']}").status_code == 204
    assert client.get("/todos").json() == []


def test_update_missing_returns_404(client):
    assert client.put("/todos/999999", json={"title": "x"}).status_code == 404


def test_delete_missing_returns_404(client):
    assert client.delete("/todos/999999").status_code == 404
