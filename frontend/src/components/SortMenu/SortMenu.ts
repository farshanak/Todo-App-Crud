export type SortField = "id" | "created_at" | "updated_at";
export type SortOrder = "asc" | "desc";

export interface SortValue {
  sort: SortField;
  order: SortOrder;
}

export interface SortOption {
  key: string;
  label: string;
  value: SortValue;
}

export const SORT_OPTIONS: SortOption[] = [
  { key: "newest", label: "Newest", value: { sort: "created_at", order: "desc" } },
  { key: "oldest", label: "Oldest", value: { sort: "created_at", order: "asc" } },
  { key: "recent", label: "Recently updated", value: { sort: "updated_at", order: "desc" } },
];

export interface SortMenuHandle {
  element: HTMLElement;
  getValue(): SortValue;
}

export function createSortMenu(opts: { onChange: (value: SortValue) => void }): SortMenuHandle {
  const wrap = document.createElement("div");
  wrap.className = "sort-menu";

  const label = document.createElement("label");
  label.className = "sort-menu__label";
  label.textContent = "Sort";

  const select = document.createElement("select");
  select.className = "sort-menu__select";
  select.setAttribute("aria-label", "Sort todos");
  for (const opt of SORT_OPTIONS) {
    const el = document.createElement("option");
    el.value = opt.key;
    el.textContent = opt.label;
    select.append(el);
  }
  select.value = SORT_OPTIONS[0].key;

  select.addEventListener("change", () => {
    const match = SORT_OPTIONS.find((o) => o.key === select.value);
    if (match) opts.onChange(match.value);
  });

  label.append(select);
  wrap.append(label);

  return {
    element: wrap,
    getValue: () =>
      (SORT_OPTIONS.find((o) => o.key === select.value) ?? SORT_OPTIONS[0]).value,
  };
}
