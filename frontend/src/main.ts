import { listTodos, createTodo, updateTodo, deleteTodo, Todo } from "./api";
import { createEmptyState } from "./empty-state";
import "./theme.css";

const THEME_KEY = "todo-app-theme";
type Theme = "light" | "dark";

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
}

function initTheme(): void {
  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(stored ?? (prefersDark ? "dark" : "light"));
  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    const next: Theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });
}

initTheme();

const list = document.getElementById("todo-list") as HTMLUListElement;
const form = document.getElementById("new-todo-form") as HTMLFormElement;
const input = document.getElementById("new-todo-input") as HTMLInputElement;

let todos: Todo[] = [];
let loading = true;

function render() {
  list.innerHTML = "";
  if (!loading && todos.length === 0) {
    const empty = createEmptyState(() => input.focus());
    const li = document.createElement("li");
    li.className = "empty-state__wrap";
    li.append(empty);
    list.append(li);
    return;
  }
  for (const todo of todos) {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", async () => {
      const updated = await updateTodo({ ...todo, done: checkbox.checked });
      todos = todos.map((t) => (t.id === updated.id ? updated : t));
      render();
    });

    const label = document.createElement("span");
    label.textContent = todo.title;
    if (todo.done) label.style.textDecoration = "line-through";

    const del = document.createElement("button");
    del.textContent = "Delete";
    del.addEventListener("click", async () => {
      await deleteTodo(todo.id);
      todos = todos.filter((t) => t.id !== todo.id);
      render();
    });

    li.append(checkbox, label, del);
    list.append(li);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  const created = await createTodo(title);
  todos.push(created);
  input.value = "";
  render();
});

(async () => {
  todos = await listTodos();
  loading = false;
  render();
})();
