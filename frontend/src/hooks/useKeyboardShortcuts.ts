export interface ShortcutBinding {
  key: string;
  description: string;
  handler: () => void;
}

export interface ShortcutOptions {
  target?: EventTarget;
  isEditable?: (el: EventTarget | null) => boolean;
}

export const SHORTCUT_KEYS = {
  NEW: "n",
  SEARCH: "/",
  NEXT: "j",
  PREV: "k",
  TOGGLE: "x",
  DELETE: "Delete",
  HELP: "?",
  CLOSE: "Escape",
} as const;

function defaultIsEditable(el: EventTarget | null): boolean {
  if (typeof HTMLElement === "undefined") return false;
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return true;
  if (el.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts(
  bindings: readonly ShortcutBinding[],
  options: ShortcutOptions = {},
): () => void {
  const target = options.target ?? (typeof document !== "undefined" ? document : null);
  if (!target) return () => {};
  const isEditable = options.isEditable ?? defaultIsEditable;

  const handler = (e: Event) => {
    const ke = e as KeyboardEvent;
    if (isEditable(ke.target)) return;
    const match = bindings.find((b) => b.key === ke.key);
    if (!match) return;
    if (typeof ke.preventDefault === "function") ke.preventDefault();
    match.handler();
  };

  target.addEventListener("keydown", handler);
  return () => target.removeEventListener("keydown", handler);
}
