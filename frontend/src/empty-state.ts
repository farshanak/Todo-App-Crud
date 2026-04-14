export function createEmptyState(onAdd: () => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "empty-state";
  root.setAttribute("role", "status");

  root.innerHTML = `
    <svg class="empty-state__svg" width="96" height="96" viewBox="0 0 96 96"
         fill="none" stroke="currentColor" stroke-width="3"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="18" y="14" width="60" height="72" rx="6"/>
      <path d="M30 36h36M30 50h36M30 64h20"/>
    </svg>
    <h2 class="empty-state__title">No todos yet</h2>
    <p class="empty-state__hint">Your list is empty. Add your first todo to get started.</p>
    <button type="button" class="empty-state__cta">Add your first todo</button>
  `;

  const cta = root.querySelector<HTMLButtonElement>(".empty-state__cta");
  cta?.addEventListener("click", onAdd);

  return root;
}
