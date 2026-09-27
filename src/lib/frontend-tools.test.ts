import { describe, expect, it } from "vitest";
import { civicCommands, searchCommands } from "./commands";
import { copilotProcedure, localCopilotAnswer } from "./copilot-context";
import { filterRoadmap } from "./roadmap-filters";
import { compileProcedure, compileWorkflow, defaultAnswers, toggleStep, workflowGraph } from "./workflow";

describe("remaining frontend flows", () => {
  it("does not substitute food context on general or unknown routes", () => {
    for (const route of ["/", "/app", "/admin", "/services", "/app/goals/unknown/roadmap"]) expect(copilotProcedure(route, null)).toBeNull();
    expect(localCopilotAnswer("What should I do next?")).toContain("Choose a service");
    expect(localCopilotAnswer("dfsfsf")).not.toContain("Available samples");
    expect(localCopilotAnswer("I need a birth certificate")).toContain("birth certificate sample");
  });
  it("resolves service details, intake and roadmap tools consistently", () => {
    expect(copilotProcedure("/services/birth-certificate", null)).toBe("birth-certificate");
    expect(copilotProcedure("/demo", "Get a birth certificate")).toBe("birth-certificate");
    expect(copilotProcedure("/demo", "Get a passport")).toBeNull();
    expect(copilotProcedure("/app/goals/small-business/documents", null)).toBe("small-business");
  });
  it("explains the current branch instead of the seeded step", () => {
    const workflow = compileProcedure("birth-certificate", { record: "unknown", channel: "ward" });
    expect(localCopilotAnswer("Explain the sample step: Contact the ward office about the record", workflow)).toContain("missing record");
    expect(localCopilotAnswer("What should I do next?", workflow)).toContain("Contact the ward office");
  });
  it("reports document reuse and preparedness separately from progress", () => {
    const workflow = { ...compileWorkflow(defaultAnswers), documents: ["Premises proof"] };
    const answer = localCopilotAnswer("Which documents can I reuse?", workflow)!;
    expect(answer).toContain("1 of 9"); expect(answer).toContain("Premises proof (3 steps)");
    expect(workflow.completed).toEqual(["scope"]);
  });
  it("answers translated prompts from local state without requiring the API", () => {
    const workflow = compileProcedure("birth-certificate");
    expect(localCopilotAnswer("मी पुढे काय करावे?", workflow, "mr")).toContain("पुढील काम");
    expect(localCopilotAnswer("यह जानकारी कैसे सत्यापित होती है?", workflow, "hi")).toContain("स्वतंत्र रूप से सत्यापित");
  });
  it("never invents fees or timelines", () => {
    expect(localCopilotAnswer("What is the cost?", compileWorkflow(defaultAnswers))).toContain("does not calculate");
  });
  it("searches supported commands with multiple words and either script", () => {
    expect(searchCommands("birth print").map((command) => command.href)).toEqual(["/app/goals/birth-certificate/print"]);
    expect(searchCommands("जन्म", "hi")).toHaveLength(5);
    expect(searchCommands("nonsense")).toEqual([]);
    expect(civicCommands.filter((command) => command.theme).map((command) => command.theme)).toEqual(["light", "dark", "system"]);
  });
  it("filters current dependency statuses and translated titles", () => {
    const workflow = toggleStep(compileWorkflow(defaultAnswers), "fssai");
    const filters = { search: "", locale: "en" as const, showOptional: true, showCompleted: true, status: "ready" as const };
    expect(filterRoadmap(workflow, filters).map((step) => step.id)).toEqual(["premises", "gst"]);
    expect(filterRoadmap(workflow, { ...filters, status: "complete", showCompleted: false })).toEqual([]);
    expect(filterRoadmap(workflow, { ...filters, status: "all", locale: "hi", search: "परिसर अनुमतियाँ" }).map((step) => step.id)).toEqual(["premises"]);
    expect(filterRoadmap(workflow, { ...filters, status: "optional" }).map((step) => step.id)).toEqual(["udyam"]);
    expect(workflowGraph(workflow).items).toHaveLength(8);
  });
});
