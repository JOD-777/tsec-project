import { describe, expect, it, vi } from "vitest";
import { catalogueInventory, evaluateCatalogue } from "./catalogue";
import { procedures } from "./procedures";

describe("admin catalogue diagnostics", () => {
  it("includes all six published sample procedures", () => {
    const inventory = catalogueInventory();
    expect(inventory.map((entry) => entry.procedure.id)).toEqual(procedures.map((procedure) => procedure.id));
    expect(inventory.reduce((total, entry) => total + entry.items.length, 0)).toBe(42);
  });
  it("actually compiles and completes all 34 supported intake combinations", () => {
    const evaluation = evaluateCatalogue();
    expect(evaluation).toMatchObject({ valid: true, sourceLinksValid: true, totalVariants: 34 });
    expect(evaluation.results.find((result) => result.id === "home-food-business")?.variants).toBe(12);
    expect(evaluation.results.every((result) => result.errors.length === 0)).toBe(true);
  });
  it("reports a broken source reference and graph instead of a fixed pass result", () => {
    const procedure = procedures.find((item) => item.id === "birth-certificate")!;
    const original = procedure.build;
    const mock = vi.spyOn(procedure, "build").mockImplementation((profile) => {
      const graph = original(profile);
      return { items: graph.items.map((step, index) => index === 0 ? { ...step, sourceId: "missing-source" } : step), edges: [...graph.edges, ["birth-ready", "birth-scope"]] };
    });
    try {
      const evaluation = evaluateCatalogue();
      expect(evaluation.valid).toBe(false);
      expect(evaluation.results.find((result) => result.id === procedure.id)?.errors).toContain("Missing source reference");
      expect(evaluation.results.find((result) => result.id === procedure.id)?.errors.some((error) => error.includes("Cycle"))).toBe(true);
    } finally { mock.mockRestore(); }
  });
});
