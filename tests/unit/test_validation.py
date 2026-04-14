"""Unit tests for TodoIn Pydantic request validation (empty-title rejection)."""

import importlib

import pytest
from pydantic import ValidationError


@pytest.fixture
def TodoIn(tmp_path, monkeypatch):
    """Reload main against a throwaway DB so TodoIn is isolated from host state."""
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{tmp_path}/v.db")
    import config
    import db
    import main

    importlib.reload(config)
    importlib.reload(db)
    importlib.reload(main)
    return main.TodoIn


class TestTodoInTitleValidation:
    def test_empty_title_rejected(self, TodoIn):
        with pytest.raises(ValidationError):
            TodoIn(title="")

    def test_whitespace_only_title_rejected(self, TodoIn):
        with pytest.raises(ValidationError):
            TodoIn(title="   ")

    def test_tab_and_newline_only_title_rejected(self, TodoIn):
        with pytest.raises(ValidationError):
            TodoIn(title="\t\n ")

    def test_surrounding_whitespace_is_stripped(self, TodoIn):
        assert TodoIn(title="  hello  ").title == "hello"

    def test_valid_title_accepted(self, TodoIn):
        assert TodoIn(title="buy milk").title == "buy milk"
