"""Pure unit tests for the SQLAlchemy Todo model — no FastAPI, no I/O beyond in-memory SQLite."""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models import Base, Todo


@pytest.fixture
def session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine, expire_on_commit=False)
    with Session() as s:
        yield s


class TestTodoModel:
    def test_insert_assigns_autoincrement_id(self, session):
        todo = Todo(title="first", done=False)
        session.add(todo)
        session.commit()
        assert todo.id == 1

    def test_done_defaults_to_false_when_omitted(self, session):
        todo = Todo(title="no done flag")
        session.add(todo)
        session.commit()
        assert todo.done is False

    def test_query_returns_all_inserted_rows(self, session):
        session.add_all([Todo(title="a"), Todo(title="b"), Todo(title="c")])
        session.commit()
        rows = session.query(Todo).order_by(Todo.id).all()
        assert [r.title for r in rows] == ["a", "b", "c"]

    def test_update_persists_field_change(self, session):
        todo = Todo(title="task", done=False)
        session.add(todo)
        session.commit()
        todo.done = True
        session.commit()
        refetched = session.get(Todo, todo.id)
        assert refetched.done is True

    def test_delete_removes_row(self, session):
        todo = Todo(title="goodbye")
        session.add(todo)
        session.commit()
        session.delete(todo)
        session.commit()
        assert session.query(Todo).count() == 0
