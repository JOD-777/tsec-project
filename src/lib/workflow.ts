import { z } from "zod";
import { dependencies, steps, type CivicStep } from "./demo-data";
import { defaultProfile, getProcedure, resolveProcedure, type Profile } from "./procedures";

export const answersSchema = z.object({
  premises: z.enum(["home", "commercial"]),
  activity: z.enum(["prepare", "package", "resell"]),
  existingRegistration: z.boolean(),
});
export type Answers = z.infer<typeof answersSchema>;
export const defaultAnswers: Answers = { premises: "home", activity: "prepare", existingRegistration: false };
export const workflowSchema = z.object({
  procedureId: z.string().default("home-food-business"),
  profile: z.record(z.string(), z.string().max(100)).default({}),
  answers: answersSchema,
  completed: z.array(z.string()).max(30),
  documents: z.array(z.string().max(100)).max(30),
  notes: z.record(z.string(), z.string().max(1000)),
}).superRefine((workflow, context) => {
  const procedure = getProcedure(workflow.procedureId);
  if (!procedure) { context.addIssue({ code: "custom", message: "Unknown procedure" }); return; }
  for (const question of procedure.questions) {
    const value = workflow.profile[question.id];
    if (!question.options.some(([option]) => option === value)) context.addIssue({ code: "custom", message: `Invalid profile field: ${question.id}` });
  }
  const ids = new Set(procedure.build(workflow.profile).items.map((step) => step.id));
  if (workflow.completed.some((id) => !ids.has(id)) || new Set(workflow.completed).size !== workflow.completed.length)
    context.addIssue({ code: "custom", message: "Invalid completed step IDs" });
});
export type Workflow = z.infer<typeof workflowSchema>;
export const defaultWorkflow: Workflow = { procedureId: "home-food-business", profile: {}, answers: defaultAnswers, completed: ["scope"], documents: [], notes: {} };

export function compileWorkflow(answers: Answers): Workflow {
  const parsed = answersSchema.parse(answers);
  return { ...defaultWorkflow, answers: parsed, completed: parsed.existingRegistration ? ["scope", "fssai"] : ["scope"] };
}

export function compileProcedure(id: string, profile?: Profile): Workflow {
  const procedure = getProcedure(id);
  if (!procedure) throw new Error("Unknown procedure");
  if (id === "home-food-business") return compileWorkflow(defaultAnswers);
  const values = profile ?? defaultProfile(procedure);
  return workflowSchema.parse({ ...defaultWorkflow, procedureId: id, profile: values, completed: [procedure.build(values).items[0].id] });
}
export function workflowGraph(workflow: Workflow) {
  return workflow.procedureId === "home-food-business"
    ? { items: personalizedSteps(workflow.answers), edges: dependencies }
    : getProcedure(workflow.procedureId)!.build(workflow.profile);
}

export function personalizedSteps(answers: Answers): CivicStep[] {
  return steps.map((step) => {
    if (step.id === "premises") return { ...step, title: `Check ${answers.premises} premises permissions` };
    if (step.id === "scope") return { ...step, description: `Demo profile: ${answers.premises} premises in Mumbai; ${answers.activity === "prepare" ? "prepare and deliver food" : answers.activity === "package" ? "package food products" : "resell packaged goods"}. Confirm the applicable route with the official authority.` };
    if (step.id === "fssai" && answers.existingRegistration) return { ...step, description: "You marked this route as already addressed. Confirm your existing registration or licence covers the selected activity and premises on FoSCoS. You can reopen this step." };
    return { ...step };
  });
}

export function prerequisites(id: string, edges: readonly (readonly [string, string])[] = dependencies): string[] {
  return edges.filter(([, to]) => to === id).map(([from]) => from);
}

export function stepStatus(step: CivicStep, completed: readonly string[], edges: readonly (readonly [string, string])[] = dependencies): CivicStep["status"] {
  if (completed.includes(step.id)) return "complete";
  if (!prerequisites(step.id, edges).every((id) => completed.includes(id))) return "blocked";
  return step.status === "optional" ? "optional" : "ready";
}

export function workflowSummary(workflow: Workflow) {
  const { items, edges } = workflowGraph(workflow);
  const required = items.filter((step) => step.status !== "optional");
  const done = required.filter((step) => workflow.completed.includes(step.id)).length;
  const ready = items.filter((step) => stepStatus(step, workflow.completed, edges) === "ready");
  // Prioritize the eligibility branch, then other parallel-ready actions.
  const next = ready.find((step) => step.id === "fssai") ?? ready[0];
  return { items, required: required.length, done, progress: Math.round(done / required.length * 100), ready, next };
}

export function toggleStep(workflow: Workflow, id: string): Workflow {
  const { items, edges } = workflowGraph(workflow);
  const step = items.find((item) => item.id === id);
  if (!step) return workflow;
  if (!workflow.completed.includes(id)) {
    if (stepStatus(step, workflow.completed, edges) === "blocked") return workflow;
    return { ...workflow, completed: [...workflow.completed, id] };
  }
  // Reopening invalidates completed descendants so no task stays complete with missing prerequisites.
  const reopened = new Set([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [from, to] of edges) if (reopened.has(from) && !reopened.has(to)) {
      reopened.add(to);
      changed = true;
    }
  }
  return { ...workflow, completed: workflow.completed.filter((item) => !reopened.has(item)) };
}

export function documentChecklist(workflow: Workflow) {
  const documents = new Map<string, string[]>();
  for (const step of workflowGraph(workflow).items) for (const name of step.documents) {
    documents.set(name, [...(documents.get(name) ?? []), step.title]);
  }
  return [...documents].map(([name, usedBy]) => ({ name, usedBy, ready: workflow.documents.includes(name) }));
}

export function supportsDemoGoal(query: string) {
  return Boolean(resolveProcedure(query));
}
