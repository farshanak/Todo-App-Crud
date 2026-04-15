// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { formatRelativeTime, createTodoItem } from "./TodoItem";

describe("formatRelativeTime", () => {
  it("returns a human-readable suffix for recent timestamps", () => {
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const result = formatRelativeTime(oneMinuteAgo);
    expect(result).toMatch(/ago$/);
  });

  it("returns a human-readable prefix for future timestamps", () => {
    const inOneHour = new Date(Date.now() + 60 * 60_000).toISOString();
    const result = formatRelativeTime(inOneHour);
    expect(result).toMatch(/^in /);
  });
});

describe("createTodoItem", () => {
  it("renders the todo title and a relative timestamp", () => {
    const todo = {
      id: 1,
      title: "Buy milk",
      done: false,
      created_at: new Date(Date.now() - 2 * 60_000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60_000).toISOString(),
    };
    const li = createTodoItem({
      todo,
      onToggle: () => {},
      onDelete: () => {},
      selected: false,
    });
    expect(li.textContent).toContain("Buy milk");
    const time = li.querySelector("time") as HTMLTimeElement;
    expect(time).not.toBeNull();
    expect(time.getAttribute("datetime")).toBe(todo.created_at);
    expect(time.textContent).toMatch(/ago$/);
  });

  it("applies the selected class when selected", () => {
    const todo = {
      id: 1,
      title: "x",
      done: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const li = createTodoItem({ todo, onToggle: () => {}, onDelete: () => {}, selected: true });
    expect(li.classList.contains("todo-selected")).toBe(true);
  });
});
