import { describe, it, expect, vi } from "vitest";
import { useKeyboardShortcuts, SHORTCUT_KEYS } from "./useKeyboardShortcuts";

function press(target: EventTarget, key: string) {
  const e = new Event("keydown");
  Object.defineProperty(e, "key", { value: key });
  target.dispatchEvent(e);
}

describe("useKeyboardShortcuts", () => {
  it("fires matching key, ignores others, dispose detaches, editable target is skipped", () => {
    const target = new EventTarget();
    const onNew = vi.fn();
    const editable = { v: false };
    const dispose = useKeyboardShortcuts(
      [{ key: "n", description: "new", handler: onNew }],
      { target, isEditable: () => editable.v },
    );
    press(target, "n");
    press(target, "z");
    expect(onNew).toHaveBeenCalledTimes(1);
    editable.v = true;
    press(target, "n");
    expect(onNew).toHaveBeenCalledTimes(1);
    editable.v = false;
    dispose();
    press(target, "n");
    expect(onNew).toHaveBeenCalledTimes(1);
  });

  it("exports all documented shortcut keys", () => {
    expect(SHORTCUT_KEYS).toMatchObject({
      NEW: "n", SEARCH: "/", NEXT: "j", PREV: "k",
      TOGGLE: "x", DELETE: "Delete", HELP: "?", CLOSE: "Escape",
    });
  });
});
