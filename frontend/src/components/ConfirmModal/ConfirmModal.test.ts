import { describe, it, expect, beforeEach } from "vitest";

type L = (e: unknown) => void;
interface FakeEl {
  tagName: string; children: FakeEl[]; attrs: Record<string, string>;
  className: string; textContent: string; hidden: boolean; focused: boolean;
  listeners: Record<string, L[]>;
  appendChild(c: FakeEl): FakeEl; append(...c: FakeEl[]): void;
  setAttribute(k: string, v: string): void;
  addEventListener(t: string, f: L): void;
  removeEventListener(t: string, f: L): void;
  focus(): void;
}
let active: FakeEl | null = null;
let docL: Record<string, L[]> = {};
function mk(tag: string): FakeEl {
  const el: FakeEl = {
    tagName: tag.toUpperCase(), children: [], attrs: {}, className: "",
    textContent: "", hidden: false, focused: false, listeners: {},
    appendChild(c) { this.children.push(c); return c; },
    append(...c) { this.children.push(...c); },
    setAttribute(k, v) { this.attrs[k] = v; },
    addEventListener(t, f) { (this.listeners[t] ||= []).push(f); },
    removeEventListener(t, f) {
      const l = this.listeners[t] || []; const i = l.indexOf(f); if (i >= 0) l.splice(i, 1);
    },
    focus() { if (active && active !== el) active.focused = false; el.focused = true; active = el; },
  };
  return el;
}
function install() {
  active = null; docL = {};
  (globalThis as unknown as { document: unknown }).document = {
    createElement: mk,
    addEventListener: (t: string, f: L) => { (docL[t] ||= []).push(f); },
    removeEventListener: (t: string, f: L) => {
      const l = docL[t] || []; const i = l.indexOf(f); if (i >= 0) l.splice(i, 1);
    },
    get activeElement() { return active; },
  };
}
function key(k: string, shift = false): boolean {
  let p = false;
  (docL["keydown"] || []).slice().forEach((h) => h({ key: k, shiftKey: shift, preventDefault: () => { p = true; } }));
  return p;
}
function btns(el: FakeEl, a: FakeEl[] = []): FakeEl[] {
  if (el.tagName === "BUTTON") a.push(el);
  el.children.forEach((c) => btns(c, a));
  return a;
}

describe("createConfirmModal", () => {
  beforeEach(() => install());
  it("renders hidden dialog with aria attrs", async () => {
    const { createConfirmModal } = await import("./ConfirmModal");
    const m = createConfirmModal();
    const r = m.element as unknown as FakeEl;
    expect(r.attrs["role"]).toBe("dialog");
    expect(r.attrs["aria-modal"]).toBe("true");
    expect(r.hidden).toBe(true);
    expect(m.isOpen()).toBe(false);
  });
  it("Enter resolves true; Escape resolves false", async () => {
    const { createConfirmModal } = await import("./ConfirmModal");
    const m = createConfirmModal();
    const p1 = m.confirm({ title: "t", message: "m" });
    expect(m.isOpen()).toBe(true);
    expect(key("Enter")).toBe(true);
    await expect(p1).resolves.toBe(true);
    const p2 = m.confirm({ title: "t", message: "m" });
    key("Escape");
    await expect(p2).resolves.toBe(false);
  });
  it("Tab traps focus between cancel and confirm", async () => {
    const { createConfirmModal } = await import("./ConfirmModal");
    const m = createConfirmModal();
    const p = m.confirm({ title: "t", message: "m" });
    const [cancel, ok] = btns(m.element as unknown as FakeEl);
    cancel.focus(); key("Tab");
    expect(ok.focused).toBe(true);
    ok.focus(); key("Tab", true);
    expect(cancel.focused).toBe(true);
    key("Escape"); await p;
  });
  it("focus returns to previously active element on close", async () => {
    const { createConfirmModal } = await import("./ConfirmModal");
    const trigger = mk("button");
    trigger.focus();
    const m = createConfirmModal();
    const p = m.confirm({ title: "t", message: "m" });
    expect(trigger.focused).toBe(false);
    key("Escape"); await p;
    expect(trigger.focused).toBe(true);
  });
});
