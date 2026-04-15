import { listTodos, createTodo, updateTodo, deleteTodo, Todo } from "./api";
import { createEmptyState } from "./empty-state";
import { toast } from "./toast";
import {
  useKeyboardShortcuts,
  SHORTCUT_KEYS,
  type ShortcutBinding,
} from "./hooks/useKeyboardShortcuts";
import { createCheatsheet } from "./components/Cheatsheet/Cheatsheet";
import "./theme.css";

function errMsg(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

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
let selectedIndex = 0;

function moveSelection(delta: number): void {
  if (todos.length === 0) return;
  selectedIndex = Math.max(0, Math.min(todos.length - 1, selectedIndex + delta));
  render();
}

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
      try {
        const updated = await updateTodo({ ...todo, done: checkbox.checked });
        todos = todos.map((t) => (t.id === updated.id ? updated : t));
        render();
        toast.success("Todo updated");
      } catch (e) {
        checkbox.checked = todo.done;
        toast.error(errMsg(e, "Failed to update todo"));
      }
    });

    const label = document.createElement("span");
    label.textContent = todo.title;
    if (todo.done) label.style.textDecoration = "line-through";

    const del = document.createElement("button");
    del.textContent = "Delete";
    del.addEventListener("click", async () => {
      try {
        await deleteTodo(todo.id);
        todos = todos.filter((t) => t.id !== todo.id);
        render();
        toast.success("Todo deleted");
      } catch (e) {
        toast.error(errMsg(e, "Failed to delete todo"));
      }
    });

    li.append(checkbox, label, del);
    if (todo === todos[selectedIndex]) li.classList.add("todo-selected");
    list.append(li);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  try {
    const created = await createTodo(title);
    todos.push(created);
    input.value = "";
    render();
    toast.success("Todo added");
  } catch (err) {
    toast.error(errMsg(err, "Failed to add todo"));
  }
});

const shortcuts: ShortcutBinding[] = [
  { key: SHORTCUT_KEYS.NEW, description: "New todo", handler: () => input.focus() },
  { key: SHORTCUT_KEYS.SEARCH, description: "Focus search",
    handler: () => (document.getElementById("search-input") as HTMLInputElement | null)?.focus() ?? input.focus() },
  { key: SHORTCUT_KEYS.NEXT, description: "Next todo", handler: () => moveSelection(1) },
  { key: SHORTCUT_KEYS.PREV, description: "Previous todo", handler: () => moveSelection(-1) },
  { key: SHORTCUT_KEYS.HELP, description: "Show shortcuts", handler: () => cheatsheet.toggle() },
  { key: SHORTCUT_KEYS.CLOSE, description: "Close dialog", handler: () => cheatsheet.close() },
];

const cheatsheet = createCheatsheet(shortcuts);
document.body.appendChild(cheatsheet.element);
useKeyboardShortcuts(shortcuts);

(async () => {
  todos = await listTodos();
  loading = false;
  render();
})();
