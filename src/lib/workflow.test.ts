import { describe, expect, it } from "vitest";
import { steps } from "./demo-data";
import { compileWorkflow, defaultAnswers, documentChecklist, personalizedSteps, stepStatus, supportsDemoGoal, toggleStep, workflowSchema, workflowSummary } from "./workflow";

describe("local workflow execution", () => {
  it("preserves all eight original steps and applies clarification answers", () => {
    const workflow = compileWorkflow({ premises: "commercial", activity: "package", existingRegistration: true });
    expect(personalizedSteps(workflow.answers).map((step) => step.id)).toEqual(steps.map((step) => step.id));
    expect(workflow.completed).toEqual(["scope", "fssai"]);
    expect(personalizedSteps(workflow.answers).find((step) => step.id === "premises")?.title).toContain("commercial");
    expect(workflowSummary(workflow).next?.id).toBe("premises");
  });
  it("keeps blocked steps incomplete and unlocks shared documents only after both branches", () => {
    let workflow = compileWorkflow(defaultAnswers);
    expect(toggleStep(workflow, "docs")).toBe(workflow);
    workflow = toggleStep(workflow, "fssai");
    expect(stepStatus(steps.find((step) => step.id === "docs")!, workflow.completed)).toBe("blocked");
    workflow = toggleStep(workflow, "premises");
    expect(stepStatus(steps.find((step) => step.id === "docs")!, workflow.completed)).toBe("ready");
  });
  it("counts required steps only, including after optional completion", () => {
    let workflow = compileWorkflow(defaultAnswers);
    for (const id of ["udyam", "premises", "fssai", "docs", "gst", "apply", "ready"]) workflow = toggleStep(workflow, id);
    expect(workflowSummary(workflow)).toMatchObject({ done: 7, required: 7, progress: 100, next: undefined });
  });
  it("reopens descendants without invalidating an independent parallel branch", () => {
    let workflow = compileWorkflow(defaultAnswers);
    for (const id of ["premises", "fssai", "docs", "gst", "apply", "ready"]) workflow = toggleStep(workflow, id);
    workflow = toggleStep(workflow, "premises");
    expect(workflow.completed).toEqual(["scope", "fssai", "gst"]);
    expect(workflowSummary(workflow).progress).toBe(43);
    expect(workflowSummary(workflow).next?.id).toBe("premises");
  });
  it("aggregates document reuse across steps instead of fixed counters", () => {
    const checklist = documentChecklist(compileWorkflow(defaultAnswers));
    expect(checklist.find((document) => document.name === "Premises proof")?.usedBy).toHaveLength(3);
    expect(checklist.every((document) => !document.ready)).toBe(true);
  });
  it("rejects unknown step IDs in persisted state", () => {
    expect(workflowSchema.safeParse({ ...compileWorkflow(defaultAnswers), completed: ["invented"] }).success).toBe(false);
  });
  it("does not silently substitute an unrelated task or another known city", () => {
    expect(supportsDemoGoal("Get a birth certificate")).toBe(false);
    expect(supportsDemoGoal("Start a food business in Pune")).toBe(false);
    expect(supportsDemoGoal("Start a cloud kitchen in Mumbai")).toBe(true);
  });
});
