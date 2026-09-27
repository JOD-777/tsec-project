import { compileProcedure, compileWorkflow, documentChecklist, workflowGraph, workflowSchema, workflowSummary, type Answers, type Workflow } from "./workflow";
import type { Profile } from "./procedures";
import type { CivicStep } from "./demo-data";

export type ScenarioInput = { answers: Answers; profile: Profile };
export function scenarioInput(workflow: Workflow): ScenarioInput {
  return { answers: { ...workflow.answers }, profile: { ...workflow.profile } };
}
function sameStep(first: CivicStep, second: CivicStep) {
  return JSON.stringify([first.title, first.description, first.documents, first.agency, first.mode, first.status === "optional"])
    === JSON.stringify([second.title, second.description, second.documents, second.agency, second.mode, second.status === "optional"]);
}

/** Pure preview. It never reads or writes browser storage. */
export function previewScenario(current: Workflow, input: ScenarioInput): Workflow {
  const compiled = current.procedureId === "home-food-business"
    ? compileWorkflow(input.answers) : compileProcedure(current.procedureId, input.profile);
  const before = workflowGraph(current), after = workflowGraph(compiled);
  const oldItems = new Map(before.items.map((step) => [step.id, step]));
  const invalid = new Set(after.items.filter((step) => {
    const previous = oldItems.get(step.id);
    const oldParents = before.edges.filter(([, to]) => to === step.id).map(([from]) => from).sort();
    const newParents = after.edges.filter(([, to]) => to === step.id).map(([from]) => from).sort();
    return !previous || !sameStep(previous, step) || JSON.stringify(oldParents) !== JSON.stringify(newParents);
  }).map((step) => step.id));
  // Confirming the new profile keeps its initial scope milestone addressed.
  const scope = after.items[0].id;
  invalid.delete(scope);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [from, to] of after.edges) if (invalid.has(from) && !invalid.has(to)) { invalid.add(to); changed = true; }
  }
  const ids = new Set(after.items.map((step) => step.id));
  const completed = new Set([...current.completed.filter((id) => ids.has(id) && !invalid.has(id)), ...compiled.completed]);
  // A preserved completion must still have all of its prerequisites addressed.
  changed = true;
  while (changed) {
    changed = false;
    for (const [from, to] of after.edges) if (completed.has(to) && !completed.has(from)) { completed.delete(to); changed = true; }
  }
  return workflowSchema.parse({ ...compiled, completed: [...completed], documents: [...current.documents], notes: { ...current.notes } });
}

function difference(first: string[], second: string[]) { return first.filter((value) => !second.includes(value)); }
export function compareScenario(current: Workflow, preview: Workflow) {
  const before = workflowGraph(current), after = workflowGraph(preview);
  const oldIds = new Set(before.items.map((step) => step.id)), newIds = new Set(after.items.map((step) => step.id));
  const documentsBefore = documentChecklist(current).map((document) => document.name);
  const documentsAfter = documentChecklist(preview).map((document) => document.name);
  const agenciesBefore = [...new Set(before.items.map((step) => step.agency))];
  const agenciesAfter = [...new Set(after.items.map((step) => step.agency))];
  const stats = (workflow: Workflow) => {
    const { items, edges } = workflowGraph(workflow), summary = workflowSummary(workflow);
    return { required: summary.required, optional: items.length - summary.required, documents: documentChecklist(workflow).length,
      visits: items.filter((step) => step.mode !== "Online" && step.status !== "optional").length, dependencies: edges.length, progress: summary.progress };
  };
  return {
    added: after.items.filter((step) => !oldIds.has(step.id)), removed: before.items.filter((step) => !newIds.has(step.id)),
    changed: after.items.filter((step) => { const previous = before.items.find((item) => item.id === step.id); return previous && !sameStep(previous, step); }),
    documentsAdded: difference(documentsAfter, documentsBefore), documentsRemoved: difference(documentsBefore, documentsAfter),
    agenciesAdded: difference(agenciesAfter, agenciesBefore), agenciesRemoved: difference(agenciesBefore, agenciesAfter),
    reopened: before.items.filter((step) => current.completed.includes(step.id) && !preview.completed.includes(step.id)),
    preserved: after.items.filter((step) => current.completed.includes(step.id) && preview.completed.includes(step.id)),
    before: stats(current), after: stats(preview),
  };
}
