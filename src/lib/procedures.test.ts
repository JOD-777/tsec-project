import { describe, expect, it } from "vitest";
import { validateGraph } from "./graph";
import { defaultProfile, procedureSources, procedures, resolveProcedure } from "./procedures";
import { compileProcedure, documentChecklist, stepStatus, toggleStep, workflowGraph, workflowSchema, workflowSummary } from "./workflow";

describe("service procedures", () => {
  for (const procedure of procedures) {
    const variants = procedure.questions.reduce<Record<string, string>[]>((profiles, question) =>
      profiles.flatMap((profile) => question.options.map(([value]) => ({ ...profile, [question.id]: value }))), [{}]);
    for (const profile of variants) it(`${procedure.id} ${JSON.stringify(profile)} has an executable dependency graph`, () => {
      let workflow = compileProcedure(procedure.id, profile);
      const { items, edges } = workflowGraph(workflow);
      const ids = items.map((step) => step.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(validateGraph(ids, edges)).toEqual({ valid: true, errors: [] });
      expect(items.every((step) => procedureSources.some((source) => source.id === step.sourceId))).toBe(true);
      const blocked = items.find((step) => stepStatus(step, workflow.completed, edges) === "blocked")!;
      expect(toggleStep(workflow, blocked.id)).toBe(workflow);
      // Follow only available required actions; this proves there are no stranded requirements.
      for (let count = 0; count < items.length; count++) {
        const next = workflowSummary(workflow).next;
        if (!next) break;
        workflow = toggleStep(workflow, next.id);
      }
      expect(workflowSummary(workflow).progress).toBe(100);
      expect(workflowSchema.safeParse(workflow).success).toBe(true);
      workflow = toggleStep(workflow, items[0].id);
      expect(workflow.completed).toEqual([]);
      expect(documentChecklist(workflow).every((document) => document.usedBy.length > 0)).toBe(true);
    });
  }
  it("selects the ward branch when the birth record is unknown", () => {
    const graph = workflowGraph(compileProcedure("birth-certificate", { record: "unknown", channel: "online" }));
    expect(graph.items.some((step) => step.id === "birth-ward")).toBe(true);
    expect(graph.items.some((step) => step.id === "birth-search")).toBe(false);
  });
  it("uses separate procedure IDs for all six existing service cards", () => {
    for (const procedure of procedures) {
      expect(resolveProcedure(procedure.title)?.id).toBe(procedure.id);
      expect(resolveProcedure(procedure.id)?.id).toBe(procedure.id);
      expect(compileProcedure(procedure.id).procedureId).toBe(procedure.id);
    }
    expect(resolveProcedure("Get a birth certificate in Delhi")).toBeUndefined();
    expect(resolveProcedure("Get a passport")).toBeUndefined();
  });
  it("rejects invalid profiles and steps from a different service", () => {
    const workflow = compileProcedure("small-business", defaultProfile(procedures[2]));
    expect(workflowSchema.safeParse({ ...workflow, completed: ["fssai"] }).success).toBe(false);
    expect(workflowSchema.safeParse({ ...workflow, profile: { registration: "invented" } }).success).toBe(false);
  });
});
