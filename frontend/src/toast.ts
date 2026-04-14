type ToastKind = "success" | "error" | "info";
const MAX_STACK = 3;
const DISMISS_MS = 3000;

function container(): HTMLElement {
  let el = document.getElementById("toast-container");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast-container";
    document.body.appendChild(el);
  }
  return el;
}

function show(kind: ToastKind, message: string): void {
  const c = container();
  while (c.children.length >= MAX_STACK) c.firstElementChild?.remove();
  const el = document.createElement("div");
  el.className = `toast toast--${kind}`;
  el.setAttribute("role", kind === "error" ? "alert" : "status");
  el.textContent = message;
  c.appendChild(el);
  window.setTimeout(() => el.remove(), DISMISS_MS);
}

export const toast = {
  success: (m: string) => show("success", m),
  error: (m: string) => show("error", m),
  info: (m: string) => show("info", m),
};
