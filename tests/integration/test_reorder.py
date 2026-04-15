"""Integration tests for PUT /todos/reorder and position persistence."""


def _create(client, title: str) -> int:
    response = client.post("/todos", json={"title": title})
    assert response.status_code == 201
    return response.json()["id"]


class TestCreateAppendsPosition:
    def test_new_todos_append_to_end(self, client):
        a = _create(client, "a")
        b = _create(client, "b")
        c = _create(client, "c")
        items = client.get("/todos").json()
        assert [t["id"] for t in items] == [a, b, c]


class TestReorderEndpoint:
    def test_reorder_rewrites_positions(self, client):
        a = _create(client, "a")
        b = _create(client, "b")
        c = _create(client, "c")

        response = client.put("/todos/reorder", json={"ids": [c, a, b]})
        assert response.status_code == 200

        items = client.get("/todos").json()
        assert [t["id"] for t in items] == [c, a, b]

    def test_reorder_persists_across_reload(self, client):
        a = _create(client, "a")
        b = _create(client, "b")
        c = _create(client, "c")

        client.put("/todos/reorder", json={"ids": [b, c, a]})
        # fetch twice to confirm order is stable (not a fluke of caching)
        first = [t["id"] for t in client.get("/todos").json()]
        second = [t["id"] for t in client.get("/todos").json()]
        assert first == second == [b, c, a]

    def test_reorder_rejects_mismatched_ids(self, client):
        a = _create(client, "a")
        b = _create(client, "b")

        response = client.put("/todos/reorder", json={"ids": [a, b, 999]})
        assert response.status_code == 400

    def test_reorder_requires_all_ids(self, client):
        a = _create(client, "a")
        _create(client, "b")

        response = client.put("/todos/reorder", json={"ids": [a]})
        assert response.status_code == 400
