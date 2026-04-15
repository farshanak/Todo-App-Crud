"""Integration tests for GET /todos?sort=...&order=... query parameters."""

import time


def _create(client, title: str) -> dict:
    return client.post("/todos", json={"title": title}).json()


class TestSortByCreatedAt:
    def test_default_sort_is_stable_ascending_by_id(self, client):
        a = _create(client, "a")
        b = _create(client, "b")
        ids = [t["id"] for t in client.get("/todos").json()]
        assert ids == [a["id"], b["id"]]

    def test_sort_created_at_desc_returns_newest_first(self, client):
        a = _create(client, "a")
        time.sleep(1.05)
        b = _create(client, "b")
        listed = client.get("/todos?sort=created_at&order=desc").json()
        assert [t["id"] for t in listed] == [b["id"], a["id"]]

    def test_sort_created_at_asc_returns_oldest_first(self, client):
        a = _create(client, "a")
        time.sleep(1.05)
        b = _create(client, "b")
        listed = client.get("/todos?sort=created_at&order=asc").json()
        assert [t["id"] for t in listed] == [a["id"], b["id"]]


class TestSortByUpdatedAt:
    def test_sort_updated_at_desc_puts_recently_updated_first(self, client):
        a = _create(client, "a")
        b = _create(client, "b")
        time.sleep(1.05)
        client.put(f"/todos/{a['id']}", json={"title": "a", "done": True})
        listed = client.get("/todos?sort=updated_at&order=desc").json()
        assert [t["id"] for t in listed] == [a["id"], b["id"]]


class TestTimestampFieldsExposed:
    def test_list_response_contains_created_at_and_updated_at(self, client):
        _create(client, "expose me")
        [item] = client.get("/todos").json()
        assert "created_at" in item
        assert "updated_at" in item

    def test_create_response_contains_timestamps(self, client):
        body = _create(client, "new")
        assert "created_at" in body
        assert "updated_at" in body


class TestInvalidSortParams:
    def test_invalid_sort_field_returns_422(self, client):
        assert client.get("/todos?sort=bogus").status_code == 422

    def test_invalid_order_returns_422(self, client):
        assert client.get("/todos?sort=created_at&order=sideways").status_code == 422
