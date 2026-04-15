export function createTodoListSkeleton(count = 1): HTMLElement {
  const root = document.createElement("ul");
  root.className = "todo-skeleton";
  root.setAttribute("role", "status");
  root.setAttribute("aria-busy", "true");
  root.setAttribute("aria-label", "Loading todos");

  const reduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) root.className += " todo-skeleton--reduced";

  for (let i = 0; i < count; i++) {
    const row = document.createElement("li");
    row.className = "todo-skeleton__row";
    const box = document.createElement("span");
    box.className = "todo-skeleton__box";
    const bar = document.createElement("span");
    bar.className = "todo-skeleton__bar";
    row.append(box, bar);
    root.append(row);
  }

  return root as unknown as HTMLElement;
}
