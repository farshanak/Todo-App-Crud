import type { ShortcutBinding } from "../../hooks/useKeyboardShortcuts";

export interface CheatsheetAPI {
  element: HTMLElement;
  open(): void;
  close(): void;
  toggle(): void;
  isOpen(): boolean;
}

export function createCheatsheet(bindings: readonly ShortcutBinding[]): CheatsheetAPI {
  const backdrop = document.createElement("div");
  backdrop.className = "cheatsheet-backdrop";
  backdrop.setAttribute("role", "dialog");
  backdrop.setAttribute("aria-modal", "true");
  backdrop.setAttribute("aria-label", "Keyboard shortcuts");
  backdrop.hidden = true;

  const panel = document.createElement("div");
  panel.className = "cheatsheet-panel";
  const title = document.createElement("h2");
  title.textContent = "Keyboard shortcuts";
  panel.appendChild(title);

  const dl = document.createElement("dl");
  for (const b of bindings) {
    const dt = document.createElement("dt");
    const kbd = document.createElement("kbd");
    kbd.textContent = b.key === " " ? "Space" : b.key;
    dt.appendChild(kbd);
    const dd = document.createElement("dd");
    dd.textContent = b.description;
    dl.append(dt, dd);
  }
  panel.appendChild(dl);
  backdrop.appendChild(panel);

  const api: CheatsheetAPI = {
    element: backdrop,
    isOpen: () => !backdrop.hidden,
    open: () => { backdrop.hidden = false; },
    close: () => { backdrop.hidden = true; },
    toggle: () => { backdrop.hidden = !backdrop.hidden; },
  };
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) api.close(); });
  return api;
}
