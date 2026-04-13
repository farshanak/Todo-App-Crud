"""SQLite engine + session factory for the Todo app.

`init_db()` is called from `main` at import time and from tests after they
inject a fresh `DATABASE_URL`. It (re)builds a module-level engine + session
factory and ensures the schema exists. `get_session` is the FastAPI dependency
that yields a request-scoped Session.
"""

from collections.abc import Iterator
from pathlib import Path

from config import settings
from models import Base
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

_engine = None
_SessionLocal: sessionmaker[Session] | None = None


def _ensure_parent_dir(url: str) -> None:
    """Create the parent directory for a file-backed SQLite URL if missing."""
    if not url.startswith("sqlite:///"):
        return
    raw = url[len("sqlite:///") :]
    if not raw or raw == ":memory:":
        return
    Path(raw).parent.mkdir(parents=True, exist_ok=True)


def init_db() -> None:
    """(Re)build the engine + session factory and create tables if missing."""
    global _engine, _SessionLocal
    url = settings.database_url
    _ensure_parent_dir(url)
    _engine = create_engine(url, connect_args={"check_same_thread": False})
    _SessionLocal = sessionmaker(bind=_engine, autoflush=False, expire_on_commit=False)
    Base.metadata.create_all(_engine)


def get_session() -> Iterator[Session]:
    """FastAPI dependency yielding a SQLAlchemy Session."""
    if _SessionLocal is None:
        init_db()
    assert _SessionLocal is not None
    session = _SessionLocal()
    try:
        yield session
    finally:
        session.close()
