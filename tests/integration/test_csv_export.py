"""Integration tests for GET /todos/export.csv."""

import csv
import io

import pytest


@pytest.mark.integration
def test_csv_export_header_and_content_type(client):
    client.post("/todos", json={"title": "Buy milk"})
    client.post("/todos", json={"title": "Walk dog", "done": True})

    response = client.get("/todos/export.csv")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert "attachment" in response.headers.get("content-disposition", "")

    rows = list(csv.reader(io.StringIO(response.text)))
    assert rows[0] == ["id", "title", "done", "created_at", "due_date"]
    assert len(rows) == 3  # header + 2 todos


@pytest.mark.integration
def test_csv_export_excludes_archived(client):
    r1 = client.post("/todos", json={"title": "Active"}).json()
    r2 = client.post("/todos", json={"title": "Archived"}).json()
    client.post(f"/todos/{r2['id']}/archive")

    response = client.get("/todos/export.csv")

    assert response.status_code == 200
    rows = list(csv.reader(io.StringIO(response.text)))
    assert len(rows) == 2  # header + 1 active
    titles = [row[1] for row in rows[1:]]
    assert titles == ["Active"]
    assert str(r1["id"]) == rows[1][0]


@pytest.mark.integration
def test_csv_export_empty(client):
    response = client.get("/todos/export.csv")

    assert response.status_code == 200
    rows = list(csv.reader(io.StringIO(response.text)))
    assert rows == [["id", "title", "done", "created_at", "due_date"]]
