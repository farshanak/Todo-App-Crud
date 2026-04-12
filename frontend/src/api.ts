export interface Todo {
  id: number;
  title: string;
  done: boolean;
}

const BASE = "http://localhost:8000";

export async function listTodos(): Promise<Todo[]> {
  const res = await fetch(`${BASE}/todos`);
  if (!res.ok) throw new Error("Failed to load todos");
  return res.json();
}

export async function createTodo(title: string): Promise<Todo> {
  const res = await fetch(`${BASE}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, done: false }),
  });
  if (!res.ok) throw new Error("Failed to create todo");
  return res.json();
}

export async function updateTodo(todo: Todo): Promise<Todo> {
  const res = await fetch(`${BASE}/todos/${todo.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: todo.title, done: todo.done }),
  });
  if (!res.ok) throw new Error("Failed to update todo");
  return res.json();
}

export async function deleteTodo(id: number): Promise<void> {
  const res = await fetch(`${BASE}/todos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete todo");
}
