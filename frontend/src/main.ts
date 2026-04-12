import { listTodos, createTodo, updateTodo, deleteTodo, Todo } from "./api";

const list = document.getElementById("todo-list") as HTMLUListElement;
const form = document.getElementById("new-todo-form") as HTMLFormElement;
const input = document.getElementById("new-todo-input") as HTMLInputElement;

let todos: Todo[] = [];

function render() {
  list.innerHTML = "";
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
  render();
})();
