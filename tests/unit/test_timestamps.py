"""Unit tests for Todo model timestamps (created_at / updated_at)."""

import time
from datetime import datetime

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


class TestTodoTimestamps:
    def test_created_at_and_updated_at_populated_on_insert(self, session):
        todo = Todo(title="stamped")
        session.add(todo)
        session.commit()
        session.refresh(todo)
        assert isinstance(todo.created_at, datetime)
        assert isinstance(todo.updated_at, datetime)

    def test_created_at_and_updated_at_equal_at_insert(self, session):
        todo = Todo(title="equal stamps")
        session.add(todo)
        session.commit()
        session.refresh(todo)
        assert todo.created_at == todo.updated_at

    def test_update_bumps_updated_at_without_touching_created_at(self, session):
        todo = Todo(title="task", done=False)
        session.add(todo)
        session.commit()
        session.refresh(todo)
        original_created = todo.created_at
        original_updated = todo.updated_at
        time.sleep(1.05)
        todo.done = True
        session.commit()
        session.refresh(todo)
        assert todo.created_at == original_created
        assert todo.updated_at > original_updated
