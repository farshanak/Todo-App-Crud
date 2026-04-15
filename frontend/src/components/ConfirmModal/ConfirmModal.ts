export interface ConfirmModalOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}
export interface ConfirmModalAPI {
  element: HTMLElement;
  isOpen(): boolean;
  confirm(opts: ConfirmModalOptions): Promise<boolean>;
}
export function createConfirmModal(): ConfirmModalAPI {
  const mk = (tag: string, cls = "") => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  };
  const backdrop = mk("div", "confirm-modal-backdrop");
  backdrop.setAttribute("role", "dialog");
  backdrop.setAttribute("aria-modal", "true");
  backdrop.hidden = true;
  const panel = mk("div", "confirm-modal-panel");
  const titleEl = mk("h2", "confirm-modal-title");
  const msgEl = mk("p", "confirm-modal-message");
  const actions = mk("div", "confirm-modal-actions");
  const cancelBtn = mk("button") as HTMLButtonElement;
  cancelBtn.setAttribute("type", "button");
  const confirmBtn = mk("button") as HTMLButtonElement;
  confirmBtn.setAttribute("type", "button");
  actions.append(cancelBtn, confirmBtn);
  panel.append(titleEl, msgEl, actions);
  backdrop.appendChild(panel);

  let open = false;
  let resolver: ((v: boolean) => void) | null = null;
  let prev: HTMLElement | null = null;
  let onKey: ((e: KeyboardEvent) => void) | null = null;
  function close(result: boolean): void {
    if (!open) return;
    open = false;
    backdrop.hidden = true;
    if (onKey) { document.removeEventListener("keydown", onKey); onKey = null; }
    const r = resolver; resolver = null;
    prev?.focus?.(); prev = null;
    r?.(result);
  }
  cancelBtn.addEventListener("click", () => close(false));
  confirmBtn.addEventListener("click", () => close(true));
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(false); });

  return {
    element: backdrop,
    isOpen: () => open,
    confirm(opts) {
      titleEl.textContent = opts.title;
      msgEl.textContent = opts.message;
      cancelBtn.textContent = opts.cancelLabel ?? "Cancel";
      confirmBtn.textContent = opts.confirmLabel ?? "Confirm";
      confirmBtn.className = "confirm-modal-confirm" + (opts.danger ? " confirm-modal-confirm--danger" : "");
      prev = (document.activeElement as HTMLElement | null) ?? null;
      open = true;
      backdrop.hidden = false;
      confirmBtn.focus();
      onKey = (e: KeyboardEvent) => {
        if (e.key === "Enter") { e.preventDefault(); close(true); return; }
        if (e.key === "Escape") { e.preventDefault(); close(false); return; }
        if (e.key === "Tab") {
          e.preventDefault();
          const a = document.activeElement;
          if (e.shiftKey) (a === cancelBtn ? confirmBtn : cancelBtn).focus();
          else (a === confirmBtn ? cancelBtn : confirmBtn).focus();
        }
      };
      document.addEventListener("keydown", onKey);
      return new Promise<boolean>((res) => { resolver = res; });
    },
  };
}
