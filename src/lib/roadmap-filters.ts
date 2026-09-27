import { translateText } from "./translations";
import { stepStatus, workflowGraph, type Workflow } from "./workflow";

export type RoadmapStatusFilter = "all" | "ready" | "blocked" | "complete" | "optional";
export function filterRoadmap(workflow: Workflow, filters: { search: string; locale: "en" | "hi" | "mr"; showOptional: boolean; showCompleted: boolean; status: RoadmapStatusFilter }) {
  const { items, edges } = workflowGraph(workflow);
  const words = filters.search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((step) => {
    const status = stepStatus(step, workflow.completed, edges);
    const translated = translateText(filters.locale, step.title);
    return (filters.showOptional || step.status !== "optional") && (filters.showCompleted || status !== "complete") && (filters.status === "all" || status === filters.status)
      && words.every((word) => `${step.title} ${translated} ${step.agency}`.toLocaleLowerCase().includes(word));
  });
}
