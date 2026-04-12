# Todo-App-Crud

A small Todo CRUD app with a Python FastAPI backend and a TypeScript + Vite frontend.

## CI Status
![CI](https://github.com/farshanak/Todo-App-Crud/actions/workflows/ci.yml/badge.svg)

## Stack
- **Backend:** FastAPI (Python 3.11), pydantic-settings, in-memory store
- **Frontend:** Vite + TypeScript, vanilla DOM
- **Containerized:** `docker compose up` runs both with hot reload

## Running locally
```bash
cp .env.example .env
docker compose up --build
```
- Backend: http://localhost:8000
- Frontend: http://localhost:5173
