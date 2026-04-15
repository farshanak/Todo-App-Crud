import { describe, it, expect, beforeEach } from "vitest";

interface FakeEl {
  tagName: string; children: FakeEl[]; attrs: Record<string, string>;
  className: string; textContent: string;
  appendChild(c: FakeEl): FakeEl; append(...c: FakeEl[]): void;
  setAttribute(k: string, v: string): void;
}
const el = (tag: string): FakeEl => ({
  tagName: tag.toUpperCase(), children: [], attrs: {}, className: "", textContent: "",
  appendChild(c) { this.children.push(c); return c; },
  append(...c) { this.children.push(...c); },
  setAttribute(k, v) { this.attrs[k] = v; },
});
function installDom(reduced: boolean): void {
  (globalThis as unknown as { document: { createElement: (t: string) => FakeEl } })
    .document = { createElement: el };
  (globalThis as unknown as { window: { matchMedia: (q: string) => { matches: boolean } } })
    .window = { matchMedia: (q) => ({ matches: reduced && q.includes("prefers-reduced-motion") }) };
}

describe("TodoListSkeleton", () => {
  beforeEach(() => installDom(false));

  it("renders `count` rows with a11y attrs", async () => {
    const { createTodoListSkeleton } = await import("./TodoListSkeleton");
    const root = createTodoListSkeleton(5) as unknown as FakeEl;
    expect(root.className).toContain("todo-skeleton");
    expect(root.attrs["aria-busy"]).toBe("true");
    expect(root.attrs["role"]).toBe("status");
    expect(root.children).toHaveLength(5);
    expect(root.children[0].className).toContain("todo-skeleton__row");
  });

  it("marks reduced-motion when the media query matches", async () => {
    installDom(true);
    const { createTodoListSkeleton } = await import("./TodoListSkeleton");
    const root = createTodoListSkeleton(3) as unknown as FakeEl;
    expect(root.className).toContain("todo-skeleton--reduced");
  });
});
