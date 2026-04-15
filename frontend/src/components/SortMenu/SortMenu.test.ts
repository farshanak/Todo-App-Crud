// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { createSortMenu, SORT_OPTIONS } from "./SortMenu";

describe("SortMenu", () => {
  it("renders all sort options", () => {
    const { element } = createSortMenu({ onChange: () => {} });
    const select = element.querySelector("select") as HTMLSelectElement;
    expect(select).not.toBeNull();
    expect(select.options.length).toBe(SORT_OPTIONS.length);
    expect(SORT_OPTIONS.map((o) => o.label)).toEqual([
      "Newest",
      "Oldest",
      "Recently updated",
    ]);
  });

  it("invokes onChange with sort and order on selection", () => {
    const onChange = vi.fn();
    const { element } = createSortMenu({ onChange });
    const select = element.querySelector("select") as HTMLSelectElement;

    select.value = "oldest";
    select.dispatchEvent(new Event("change"));
    expect(onChange).toHaveBeenCalledWith({ sort: "created_at", order: "asc" });

    select.value = "recent";
    select.dispatchEvent(new Event("change"));
    expect(onChange).toHaveBeenCalledWith({ sort: "updated_at", order: "desc" });
  });

  it("defaults to newest (created_at desc)", () => {
    const { getValue } = createSortMenu({ onChange: () => {} });
    expect(getValue()).toEqual({ sort: "created_at", order: "desc" });
  });
});
