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
