import { describe, expect, it } from "vitest";

describe("smoke", () => {
  it("arithmetic works", () => {
    expect(2 + 2).toBe(4);
  });

  it("Todo shape compiles", () => {
    const t: { id: number; title: string; done: boolean } = {
      id: 1,
      title: "test",
      done: false,
    };
    expect(t.title).toBe("test");
  });
});
