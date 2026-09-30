import { describe, expect, it } from "vitest";
import { canTransition, countByStatus, filterCollabs, SAMPLE_COLLABS, sortPipeline, transition, validateNew } from "./collabs";

describe("transitions", () => {
  it("allows only pipeline moves", () => {
    expect(canTransition("proposed", "negotiating")).toBe(true);
    expect(canTransition("proposed", "completed")).toBe(false);
    expect(canTransition("completed", "active")).toBe(false);
    expect(canTransition("declined", "proposed")).toBe(true);
  });
  it("updates status and date immutably", () => {
    const c = SAMPLE_COLLABS[2];
    const next = transition(c, "negotiating", "2025-07-01");
    expect(next).toMatchObject({ status: "negotiating", updatedAt: "2025-07-01" });
    expect(c.status).toBe("proposed");
    expect(() => transition(c, "completed", "2025-07-01")).toThrow(/Cannot move/);
  });
});

describe("lists", () => {
  it("counts by status", () => {
    expect(countByStatus(SAMPLE_COLLABS)).toEqual({ proposed: 1, negotiating: 1, active: 1, completed: 1, declined: 1 });
  });
  it("sorts in pipeline order", () => {
    expect(sortPipeline(SAMPLE_COLLABS).map((c) => c.id)).toEqual(["k3", "k2", "k1", "k4", "k5"]);
  });
  it("filters by status and text (including notes)", () => {
    expect(filterCollabs(SAMPLE_COLLABS, { status: "active" }).map((c) => c.id)).toEqual(["k1"]);
    expect(filterCollabs(SAMPLE_COLLABS, { query: "scope" }).map((c) => c.id)).toEqual(["k5"]);
    expect(filterCollabs(SAMPLE_COLLABS, { query: "PLOY" }).map((c) => c.id)).toEqual(["k2"]);
  });
});

describe("validateNew", () => {
  it("requires partner and project", () => {
    expect(validateNew("A", "B")).toBeNull();
    expect(validateNew(" ", "B")).toMatch(/Partner/);
    expect(validateNew("A", "")).toMatch(/Project/);
    expect(validateNew("A".repeat(61), "B")).toMatch(/≤/);
  });
});

describe("pass 3 edge cases", () => {
  it("rejects a duplicate partner + project despite case, spacing and zero-width characters", () => {
    expect(validateNew("studio  lumen", "Brand refresh video\u200B", SAMPLE_COLLABS)).toMatch(/already/);
    expect(validateNew("Studio Lumen", "Another project", SAMPLE_COLLABS)).toBeNull();
  });
  it("counts emoji as one character in length limits", () => {
    expect(validateNew("🎨".repeat(40), "Mural")).toBeNull();
    expect(validateNew("🎨".repeat(61), "Mural")).toMatch(/≤ 60/);
  });
  it("treats invisible-only input as blank", () => {
    expect(validateNew("\u200B", "x")).toBe("Partner is required");
  });
  it("search ignores Unicode form and full-width letters", () => {
    const items = [{ ...SAMPLE_COLLABS[0], id: "z", partner: "Café Studio" }];
    expect(filterCollabs(items, { query: "cafe\u0301" })).toHaveLength(1);
    expect(filterCollabs(items, { query: "\uFF43\uFF41\uFF46\uFF45\u0301" })).toHaveLength(1);
  });
});
