import { z } from "zod";
import { dependencies, steps, type CivicStep } from "./demo-data";

export const answersSchema = z.object({
  premises: z.enum(["home", "commercial"]),
  activity: z.enum(["prepare", "package", "resell"]),
  existingRegistration: z.boolean(),
});
export type Answers = z.infer<typeof answersSchema>;
export const defaultAnswers: Answers = { premises: "home", activity: "prepare", existingRegistration: false };
export const workflowSchema = z.object({
  answers: answersSchema,
  completed: z.array(z.enum(["scope", "premises", "fssai", "udyam", "docs", "gst", "apply", "ready"])).max(steps.length).transform((ids): string[] => ids),
  documents: z.array(z.string().max(100)).max(30),
  notes: z.record(z.string(), z.string().max(1000)),
});
export type Workflow = z.infer<typeof workflowSchema>;
export const defaultWorkflow: Workflow = { answers: defaultAnswers, completed: ["scope"], documents: [], notes: {} };

export function compileWorkflow(answers: Answers): Workflow {
  const parsed = answersSchema.parse(answers);
  return { answers: parsed, completed: parsed.existingRegistration ? ["scope", "fssai"] : ["scope"], documents: [], notes: {} };
}

export function personalizedSteps(answers: Answers): CivicStep[] {
  return steps.map((step) => {
    if (step.id === "premises") return { ...step, title: `Check ${answers.premises} premises permissions` };
    if (step.id === "scope") return { ...step, description: `Demo profile: ${answers.premises} premises in Mumbai; ${answers.activity === "prepare" ? "prepare and deliver food" : answers.activity === "package" ? "package food products" : "resell packaged goods"}. Confirm the applicable route with the official authority.` };
    if (step.id === "fssai" && answers.existingRegistration) return { ...step, description: "You marked this route as already addressed. Confirm your existing registration or licence covers the selected activity and premises on FoSCoS. You can reopen this step." };
    return { ...step };
  });
}

export function prerequisites(id: string): string[] {
  return dependencies.filter(([, to]) => to === id).map(([from]) => from);
}

export function stepStatus(step: CivicStep, completed: readonly string[]): CivicStep["status"] {
  if (completed.includes(step.id)) return "complete";
  if (!prerequisites(step.id).every((id) => completed.includes(id))) return "blocked";
  return step.status === "optional" ? "optional" : "ready";
}

export function workflowSummary(workflow: Workflow) {
  const items = personalizedSteps(workflow.answers);
  const required = items.filter((step) => step.status !== "optional");
  const done = required.filter((step) => workflow.completed.includes(step.id)).length;
  const ready = items.filter((step) => stepStatus(step, workflow.completed) === "ready");
  // Prioritize the eligibility branch, then other parallel-ready actions.
  const next = ready.find((step) => step.id === "fssai") ?? ready[0];
  return { items, required: required.length, done, progress: Math.round(done / required.length * 100), ready, next };
}

export function toggleStep(workflow: Workflow, id: string): Workflow {
  const step = steps.find((item) => item.id === id);
  if (!step) return workflow;
  if (!workflow.completed.includes(id)) {
    if (stepStatus(step, workflow.completed) === "blocked") return workflow;
    return { ...workflow, completed: [...workflow.completed, id] };
  }
  // Reopening invalidates completed descendants so no task stays complete with missing prerequisites.
  const reopened = new Set([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [from, to] of dependencies) if (reopened.has(from) && !reopened.has(to)) {
      reopened.add(to);
      changed = true;
    }
  }
  return { ...workflow, completed: workflow.completed.filter((item) => !reopened.has(item)) };
}

export function documentChecklist(workflow: Workflow) {
  const documents = new Map<string, string[]>();
  for (const step of personalizedSteps(workflow.answers)) for (const name of step.documents) {
    documents.set(name, [...(documents.get(name) ?? []), step.title]);
  }
  return [...documents].map(([name, usedBy]) => ({ name, usedBy, ready: workflow.documents.includes(name) }));
}

export function supportsDemoGoal(query: string) {
  const hasFood = /food|kitchen|tiffin|catering|खाद्य|जेवण|भोजन/i.test(query);
  const otherPlace = /\b(delhi|pune|bangalore|bengaluru|chennai|hyderabad|kolkata|thane|navi mumbai)\b/i.test(query);
  return hasFood && !otherPlace;
}
