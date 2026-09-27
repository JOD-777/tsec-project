import { describe, expect, it } from "vitest";
import { procedures } from "./procedures";
import { compareScenario, previewScenario, scenarioInput } from "./scenarios";
import { compileProcedure, compileWorkflow, defaultAnswers, documentChecklist, stepDocumentReadiness, toggleStep, workflowGraph, workflowSummary } from "./workflow";

describe("non-destructive scenarios", () => {
  it("previews and applies only supported profile choices without mutating the source", () => {
    let current = compileWorkflow(defaultAnswers);
    for (const id of ["premises", "fssai", "docs", "gst", "apply", "ready"]) current = toggleStep(current, id);
    current = { ...current, documents: ["Premises proof"], notes: { premises: "Keep this note", apply: "Receipt checked" } };
    const original = structuredClone(current);
    const input = scenarioInput(current); input.answers.premises = "commercial";
    const preview = previewScenario(current, input);
    expect(current).toEqual(original);
    expect(preview.completed).toEqual(["scope", "fssai", "gst"]);
    expect(preview.documents).toEqual(current.documents);
    expect(preview.notes).toEqual(current.notes);
    expect(preview.notes).not.toBe(current.notes);
    expect(compareScenario(current, preview).reopened.map((step) => step.id)).toEqual(["premises", "docs", "apply", "ready"]);
    expect(compareScenario(current, preview).preserved.map((step) => step.id)).toEqual(["scope", "fssai", "gst"]);
  });
  it("reports replaced birth-certificate branches and preserves an independent completed action", () => {
    let current = compileProcedure("birth-certificate");
    for (const id of ["birth-search", "birth-details", "birth-apply", "birth-receipt", "birth-ready"]) current = toggleStep(current, id);
    const input = scenarioInput(current); input.profile.record = "unknown";
    const preview = previewScenario(current, input), comparison = compareScenario(current, preview);
    expect(comparison.added.map((step) => step.id)).toEqual(["birth-ward"]);
    expect(comparison.removed.map((step) => step.id)).toEqual(["birth-search"]);
    expect(preview.completed).toEqual(["birth-scope", "birth-details"]);
    expect(workflowSummary(preview).next?.id).toBe("birth-ward");
  });
  for (const procedure of procedures) it(`preserves all progress in an unchanged ${procedure.id} scenario`, () => {
    let current = compileProcedure(procedure.id);
    for (let count = 0; count < 30; count++) {
      const next = workflowSummary(current).next;
      if (!next) break;
      current = toggleStep(current, next.id);
    }
    expect(previewScenario(current, scenarioInput(current))).toEqual(current);
    expect(compareScenario(current, previewScenario(current, scenarioInput(current))).reopened).toEqual([]);
  });
  for (const procedure of procedures) it(`reuses the compiler for each ${procedure.id} alternative`, () => {
    const current = compileProcedure(procedure.id), input = scenarioInput(current);
    if (procedure.id === "home-food-business") input.answers.existingRegistration = true;
    else for (const question of procedure.questions) input.profile[question.id] = question.options.at(-1)![0];
    const preview = previewScenario(current, input);
    for (let count = 0, workflow = preview; count < 30; count++) {
      const next = workflowSummary(workflow).next;
      if (!next) { expect(workflowSummary(workflow).progress).toBe(100); break; }
      workflow = toggleStep(workflow, next.id);
    }
    expect(workflowGraph(preview).items.length).toBeGreaterThanOrEqual(6);
  });
  it("rejects unsupported profile values", () => {
    const current = compileProcedure("birth-certificate"), input = scenarioInput(current);
    input.profile.record = "invented";
    expect(() => previewScenario(current, input)).toThrow();
  });
});
describe("document readiness", () => {
  it("aggregates reuse and updates each affected step without changing completion", () => {
    const current = compileWorkflow(defaultAnswers);
    const document = documentChecklist(current).find((item) => item.name === "Premises proof")!;
    expect(document.stepIds).toEqual(["premises", "fssai", "docs"]);
    const prepared = { ...current, documents: ["Premises proof"] };
    expect(stepDocumentReadiness(prepared, "fssai")).toEqual({ required: 3, prepared: 1, missing: ["Identity proof", "Food activity details"] });
    expect(stepDocumentReadiness(prepared, "scope")).toEqual({ required: 0, prepared: 0, missing: [] });
    expect(prepared.completed).toEqual(current.completed);
  });
});
