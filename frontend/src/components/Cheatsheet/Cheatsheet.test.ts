import { describe, it, expect, beforeAll } from "vitest";

interface FakeEl {
  tagName: string; children: FakeEl[]; attrs: Record<string, string>;
  hidden: boolean; textContent: string; className: string;
  appendChild(c: FakeEl): FakeEl; append(...c: FakeEl[]): void;
  setAttribute(k: string, v: string): void; addEventListener(): void;
}
const el = (tag: string): FakeEl => ({
  tagName: tag.toUpperCase(), children: [], attrs: {}, hidden: false,
  textContent: "", className: "",
  appendChild(c) { this.children.push(c); return c; },
  append(...c) { this.children.push(...c); },
  setAttribute(k, v) { this.attrs[k] = v; },
  addEventListener() {},
});

beforeAll(() => {
  (globalThis as unknown as { document: { createElement: (t: string) => FakeEl } })
    .document = { createElement: el };
});

const { createCheatsheet } = await import("./Cheatsheet");
const bindings = [
  { key: "n", description: "new", handler: () => {} },
  { key: "?", description: "help", handler: () => {} },
];

describe("createCheatsheet", () => {
  it("open/close/toggle flip visibility; renders dialog with one row per binding", () => {
    const cs = createCheatsheet(bindings);
    expect(cs.isOpen()).toBe(false);
    cs.open();
    expect(cs.isOpen()).toBe(true);
    cs.close();
    expect(cs.isOpen()).toBe(false);
    cs.toggle();
    expect(cs.isOpen()).toBe(true);
    const root = cs.element as unknown as FakeEl;
    expect(root.attrs["role"]).toBe("dialog");
    const dl = root.children[0].children.find((c) => c.tagName === "DL")!;
    expect(dl.children.filter((c) => c.tagName === "DT").length).toBe(bindings.length);
  });
});
