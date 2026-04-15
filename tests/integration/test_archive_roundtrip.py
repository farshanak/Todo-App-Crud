"""Integration tests for archive / restore soft-delete endpoints."""


def _make(client, title: str) -> dict:
    return client.post("/todos", json={"title": title}).json()


class TestArchiveRestoreRoundtrip:
    def test_archive_hides_todo_from_default_list(self, client):
        a = _make(client, "keep")
        b = _make(client, "archive")
        assert client.post(f"/todos/{b['id']}/archive").status_code == 200
        ids = [t["id"] for t in client.get("/todos").json()]
        assert ids == [a["id"]]

    def test_archive_then_list_archived_only(self, client):
        a = _make(client, "keep")
        b = _make(client, "archive")
        client.post(f"/todos/{b['id']}/archive")
        archived = client.get("/todos?archived=true").json()
        assert [t["id"] for t in archived] == [b["id"]]
        assert archived[0]["archived_at"] is not None
        active = client.get("/todos").json()
        assert [t["id"] for t in active] == [a["id"]]

    def test_restore_brings_todo_back_into_default_list(self, client):
        b = _make(client, "archive me")
        client.post(f"/todos/{b['id']}/archive")
        assert client.get("/todos").json() == []
        assert client.post(f"/todos/{b['id']}/restore").status_code == 200
        restored = client.get("/todos").json()
        assert [t["id"] for t in restored] == [b["id"]]
        assert restored[0]["archived_at"] is None

    def test_archive_missing_returns_404(self, client):
        assert client.post("/todos/999999/archive").status_code == 404

    def test_restore_missing_returns_404(self, client):
        assert client.post("/todos/999999/restore").status_code == 404

    def test_archive_response_includes_archived_at_timestamp(self, client):
        b = _make(client, "x")
        body = client.post(f"/todos/{b['id']}/archive").json()
        assert body["id"] == b["id"]
        assert body["archived_at"] is not None
