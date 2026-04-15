from datetime import UTC, datetime
from typing import Annotated, Literal

from config import settings
from db import get_session, init_db
from fastapi import Body, Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from models import Todo as TodoModel
from pydantic import BaseModel, ConfigDict, StringConstraints
from sqlalchemy import func, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

SortField = Literal["position", "id", "created_at", "updated_at"]
SortOrder = Literal["asc", "desc"]

TodoTitle = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]

app = FastAPI(
    title="Todo API",
    description="Simple CRUD API for managing todos, backed by SQLite.",
    version="0.1.0",
    contact={
        "name": "Todo App",
        "url": "https://github.com/farshanak/Todo-App-Crud",
    },
    openapi_tags=[
        {"name": "todos", "description": "Create, read, update, and delete todos."},
        {"name": "health", "description": "Liveness and readiness probes."},
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

DbSession = Depends(get_session)
CreateBody = Body(..., examples=[{"title": "Buy milk", "done": False}])
UpdateBody = Body(..., examples=[{"title": "Buy oat milk", "done": True}])
ReorderBody = Body(..., examples=[{"ids": [3, 1, 2]}])
SortQuery = Query("position")
OrderQuery = Query("asc")


class TodoIn(BaseModel):
    title: TodoTitle
    done: bool = False


class Todo(TodoIn):
    id: int
    created_at: datetime
    updated_at: datetime
    archived_at: datetime | None = None
    position: int

    model_config = ConfigDict(from_attributes=True)


class ReorderIn(BaseModel):
    ids: list[int]


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "version": app.version}


@app.get("/ready", tags=["health"])
def ready(session: Session = DbSession):
    try:
        session.execute(text("SELECT 1"))
    except OperationalError as exc:
        raise HTTPException(503, "database unavailable") from exc
    return {"status": "ready"}


ArchivedQuery = Query(False)


@app.get("/todos", response_model=list[Todo], tags=["todos"])
def list_todos(
    session: Session = DbSession,
    sort: SortField = SortQuery,
    order: SortOrder = OrderQuery,
    archived: bool = ArchivedQuery,
):
    column = getattr(TodoModel, sort)
    direction = column.desc() if order == "desc" else column.asc()
    query = session.query(TodoModel)
    if archived:
        query = query.filter(TodoModel.archived_at.is_not(None))
    else:
        query = query.filter(TodoModel.archived_at.is_(None))
    return query.order_by(direction, TodoModel.id).all()


@app.post("/todos/{todo_id}/archive", response_model=Todo, tags=["todos"])
def archive_todo(todo_id: int, session: Session = DbSession):
    todo = session.get(TodoModel, todo_id)
    if todo is None:
        raise HTTPException(404, "Todo not found")
    todo.archived_at = datetime.now(UTC).replace(tzinfo=None)
    session.commit()
    session.refresh(todo)
    return todo


@app.post("/todos/{todo_id}/restore", response_model=Todo, tags=["todos"])
def restore_todo(todo_id: int, session: Session = DbSession):
    todo = session.get(TodoModel, todo_id)
    if todo is None:
        raise HTTPException(404, "Todo not found")
    todo.archived_at = None
    session.commit()
    session.refresh(todo)
    return todo


@app.post("/todos", response_model=Todo, status_code=201, tags=["todos"])
def create_todo(
    payload: TodoIn = CreateBody,
    session: Session = DbSession,
):
    next_position = (session.query(func.max(TodoModel.position)).scalar() or -1) + 1
    todo = TodoModel(title=payload.title, done=payload.done, position=next_position)
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo


@app.put("/todos/reorder", tags=["todos"])
def reorder_todos(
    payload: ReorderIn = ReorderBody,
    session: Session = DbSession,
):
    requested = payload.ids
    if len(set(requested)) != len(requested):
        raise HTTPException(400, "Duplicate ids in reorder payload")
    existing = {row.id for row in session.query(TodoModel.id).all()}
    if set(requested) != existing:
        raise HTTPException(400, "Reorder ids must match all existing todos")
    todos = {t.id: t for t in session.query(TodoModel).all()}
    for index, todo_id in enumerate(requested):
        todos[todo_id].position = index
    session.commit()
    return {"status": "ok", "count": len(requested)}


@app.put("/todos/{todo_id}", response_model=Todo, tags=["todos"])
def update_todo(
    todo_id: int,
    payload: TodoIn = UpdateBody,
    session: Session = DbSession,
):
    todo = session.get(TodoModel, todo_id)
    if todo is None:
        raise HTTPException(404, "Todo not found")
    todo.title = payload.title
    todo.done = payload.done
    session.commit()
    session.refresh(todo)
    return todo


@app.delete("/todos/{todo_id}", status_code=204, tags=["todos"])
def delete_todo(todo_id: int, session: Session = DbSession):
    todo = session.get(TodoModel, todo_id)
    if todo is None:
        raise HTTPException(404, "Todo not found")
    session.delete(todo)
    session.commit()
