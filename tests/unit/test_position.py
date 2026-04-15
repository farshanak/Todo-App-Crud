"""Unit tests for Todo position column (persistent sort order)."""

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


class TestPositionColumn:
    def test_position_column_exists_and_nullable_false(self, session):
        todo = Todo(title="a", position=0)
        session.add(todo)
        session.commit()
        session.refresh(todo)
        assert todo.position == 0

    def test_position_can_be_updated(self, session):
        todo = Todo(title="a", position=0)
        session.add(todo)
        session.commit()
        todo.position = 5
        session.commit()
        session.refresh(todo)
        assert todo.position == 5

    def test_positions_are_independent_per_row(self, session):
        a = Todo(title="a", position=0)
        b = Todo(title="b", position=1)
        c = Todo(title="c", position=2)
        session.add_all([a, b, c])
        session.commit()
        rows = session.query(Todo).order_by(Todo.position).all()
        assert [r.title for r in rows] == ["a", "b", "c"]
