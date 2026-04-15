"""Unit tests for Todo archive (soft-delete) behavior on the ORM model."""

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


class TestArchivedAtColumn:
    def test_new_todo_has_null_archived_at(self, session):
        todo = Todo(title="fresh")
        session.add(todo)
        session.commit()
        session.refresh(todo)
        assert todo.archived_at is None

    def test_can_set_and_clear_archived_at(self, session):
        from datetime import datetime

        todo = Todo(title="archive me")
        session.add(todo)
        session.commit()
        todo.archived_at = datetime(2026, 1, 1, 12, 0, 0)
        session.commit()
        session.refresh(todo)
        assert todo.archived_at is not None
        todo.archived_at = None
        session.commit()
        session.refresh(todo)
        assert todo.archived_at is None
