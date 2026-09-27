import { procedures, procedureSources } from "./procedures";
import { validateGraph } from "./graph";
import { compileProcedure, compileWorkflow, defaultAnswers, toggleStep, workflowGraph, workflowSummary, type Workflow } from "./workflow";

export function catalogueInventory() {
  return procedures.map((procedure) => ({ procedure, ...workflowGraph(compileProcedure(procedure.id)) }));
}
export function evaluateCatalogue() {
  const results = procedures.map((procedure) => {
    const profiles = procedure.questions.reduce<Record<string, string>[]>((variants, question) => variants.flatMap((profile) => question.options.map(([value]) => ({ ...profile, [question.id]: value }))), [{}]);
    const workflows: Workflow[] = procedure.id === "home-food-business"
      ? (["home", "commercial"] as const).flatMap((premises) => (["prepare", "package", "resell"] as const).flatMap((activity) => [false, true].map((existingRegistration) => compileWorkflow({ ...defaultAnswers, premises, activity, existingRegistration }))))
      : profiles.map((profile) => compileProcedure(procedure.id, profile));
    const errors: string[] = [];
    for (const original of workflows) {
      const { items, edges } = workflowGraph(original);
      errors.push(...validateGraph(items.map((step) => step.id), edges).errors);
      if (!items.every((step) => procedureSources.some((source) => source.id === step.sourceId))) errors.push("Missing source reference");
      let workflow = original;
      for (let count = 0; count < items.length; count++) {
        const next = workflowSummary(workflow).next;
        if (!next) break;
        workflow = toggleStep(workflow, next.id);
      }
      if (workflowSummary(workflow).progress !== 100) errors.push("Required steps cannot all be completed");
    }
    return { id: procedure.id, title: procedure.title, variants: workflows.length, errors: [...new Set(errors)], valid: errors.length === 0 };
  });
  return { results, totalVariants: results.reduce((total, result) => total + result.variants, 0),
    valid: results.every((result) => result.valid), sourceLinksValid: procedureSources.every((source) => new URL(source.url).protocol === "https:") };
}
