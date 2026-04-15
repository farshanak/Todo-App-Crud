import { formatDistanceToNow } from "date-fns";
import type { Todo } from "../../api";

export function formatRelativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export interface TodoItemProps {
  todo: Todo;
  onToggle: (checked: boolean) => void;
  onDelete: () => void;
  selected: boolean;
}

export function createTodoItem(props: TodoItemProps): HTMLLIElement {
  const { todo, onToggle, onDelete, selected } = props;
  const li = document.createElement("li");
  li.className = "todo-item";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.done;
  checkbox.addEventListener("change", () => onToggle(checkbox.checked));

  const label = document.createElement("span");
  label.className = "todo-item__title";
  label.textContent = todo.title;
  if (todo.done) label.style.textDecoration = "line-through";

  const time = document.createElement("time");
  time.className = "todo-item__time";
  time.setAttribute("datetime", todo.created_at);
  time.textContent = formatRelativeTime(todo.created_at);

  const del = document.createElement("button");
  del.textContent = "Delete";
  del.addEventListener("click", () => onDelete());

  li.append(checkbox, label, time, del);
  if (selected) li.classList.add("todo-selected");
  return li;
}
