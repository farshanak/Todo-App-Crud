"""CSV export for active todos."""

import csv
import io
from collections.abc import Iterable, Iterator

from models import Todo as TodoModel

CSV_HEADER = ["id", "title", "done", "created_at", "due_date"]


def _row(todo: TodoModel) -> list[str]:
    created_at = todo.created_at.isoformat() if todo.created_at else ""
    due_date = ""
    return [str(todo.id), todo.title, str(todo.done).lower(), created_at, due_date]


def stream_todos_csv(todos: Iterable[TodoModel]) -> Iterator[str]:
    """Yield CSV lines for the given todos, starting with the header row."""
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(CSV_HEADER)
    yield buffer.getvalue()
    for todo in todos:
        buffer.seek(0)
        buffer.truncate()
        writer.writerow(_row(todo))
        yield buffer.getvalue()
