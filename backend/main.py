from typing import Annotated

from config import settings
from db import get_session, init_db
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import Todo as TodoModel
from pydantic import BaseModel, ConfigDict, StringConstraints
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

TodoTitle = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]

app = FastAPI(title="Todo API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

DbSession = Depends(get_session)


class TodoIn(BaseModel):
    title: TodoTitle
    done: bool = False


class Todo(TodoIn):
    id: int

    model_config = ConfigDict(from_attributes=True)


@app.get("/health")
def health():
    return {"status": "ok", "version": app.version}


@app.get("/ready")
def ready(session: Session = DbSession):
    try:
        session.execute(text("SELECT 1"))
    except OperationalError as exc:
        raise HTTPException(503, "database unavailable") from exc
    return {"status": "ready"}


@app.get("/todos", response_model=list[Todo])
def list_todos(session: Session = DbSession):
    return session.query(TodoModel).order_by(TodoModel.id).all()


@app.post("/todos", response_model=Todo, status_code=201)
def create_todo(payload: TodoIn, session: Session = DbSession):
    todo = TodoModel(title=payload.title, done=payload.done)
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo


@app.put("/todos/{todo_id}", response_model=Todo)
def update_todo(todo_id: int, payload: TodoIn, session: Session = DbSession):
    todo = session.get(TodoModel, todo_id)
    if todo is None:
        raise HTTPException(404, "Todo not found")
    todo.title = payload.title
    todo.done = payload.done
    session.commit()
    session.refresh(todo)
    return todo


@app.delete("/todos/{todo_id}", status_code=204)
def delete_todo(todo_id: int, session: Session = DbSession):
    todo = session.get(TodoModel, todo_id)
    if todo is None:
        raise HTTPException(404, "Todo not found")
    session.delete(todo)
    session.commit()
