import { phraseTranslations, translateText, type Language } from "./translations";
import { getProcedure, procedureSources, procedures, resolveProcedure } from "./procedures";
import { documentChecklist, workflowGraph, workflowSummary, type Workflow } from "./workflow";

export function copilotProcedure(pathname: string, goal: string | null): string | null {
  if (pathname === "/demo") return goal ? resolveProcedure(goal)?.id ?? null : null;
  const parts = pathname.split("/");
  const id = parts[1] === "services" ? parts[2] : parts[1] === "app" && parts[2] === "goals" ? parts[3] : undefined;
  return id ? getProcedure(id)?.id ?? null : null;
}

/** Execution answers always come from current sample state, never the seeded API context. */
export function localCopilotAnswer(question: string, workflow?: Workflow, locale: Language = "en"): string | null {
  const t = (text: string, values?: Record<string, string | number>) => translateText(locale, text, values);
  const canonical = Object.entries(phraseTranslations).find(([, translations]) => translations.includes(question))?.[0] ?? question;
  if (!workflow) return t("Choose a service to get procedure-specific guidance. Available samples: {services}. Explore services for requirements or Try the demo to build a browser-local roadmap.", { services: procedures.map((procedure) => `${t(procedure.title)} (${t(procedure.jurisdiction)})`).join("; ") });
  const { items } = workflowGraph(workflow);
  const summary = workflowSummary(workflow);
  const procedure = getProcedure(workflow.procedureId)!;
  const sources = procedureSources.filter((source) => items.some((step) => step.sourceId === source.id));
  const step = items.find((item) => canonical.toLowerCase().includes(item.title.toLowerCase()) || question.includes(t(item.title)));
  if (step) return t("{step}: {description} Authority: {agency}. Official reference: {url}. This is sample planning guidance.", { step: t(step.title), description: t(step.description), agency: step.agency, url: procedureSources.find((source) => source.id === step.sourceId)!.url });
  if (/\b(verified|verification|sources?|evidence|official)\b|सत्याप|पडताळ|स्रोत/i.test(canonical)) return t("These are sample planning steps, not independently verified requirements. Official references for {service}: {sources}. Each step shows its authority and source reference. Local admin review does not verify a government rule.", { service: t(procedure.title), sources: sources.map((source) => `${source.title}: ${source.url}`).join("; ") });
  if (/\bdocuments?\b|दस्तावेज़|कागदपत्र/i.test(canonical)) {
    const checklist = documentChecklist(workflow), reused = checklist.filter((document) => document.usedBy.length > 1);
    return t("Your sample checklist has {ready} of {total} documents marked prepared. Still to prepare: {missing}. Reused across steps: {reused}. Readiness is separate from task completion. Confirm actual requirements with the authority.", { ready: checklist.filter((document) => document.ready).length, total: checklist.length, missing: checklist.filter((document) => !document.ready).map((document) => t(document.name)).join(", ") || t("none"), reused: reused.map((document) => `${t(document.name)} (${document.usedBy.length} ${t("steps")})`).join("; ") || t("none in this sample") });
  }
  if (/\b(next|start|blocking|blocked|parallel|progress|complete)\b|अगला|आगे|पुढे|पुढील|प्रगत/i.test(canonical)) return t("Current sample progress: {done}/{required} required steps complete. {next} Verify procedural requirements using the roadmap’s official portal links.", { done: summary.done, required: summary.required, next: summary.next ? t("Next: {step}. Ready actions: {actions}. Other steps unlock after their prerequisites are complete.", { step: t(summary.next.title), actions: summary.ready.map((step) => t(step.title)).join("; ") }) : t("All required sample steps are complete; confirm outstanding official requirements with the relevant authority.") });
  if (/\b(fees?|cost|time|duration|days)\b|शुल्क|समय|वेळ/i.test(canonical)) return t("This sample does not calculate charges or waiting times. Check the current {service} requirements with the linked authority: {sources}. Synthetic admin-review fees are demonstration values.", { service: t(procedure.title), sources: sources.map((source) => source.url).join("; ") });
  return workflow.procedureId === "home-food-business" && locale === "en" ? null : t("{service} ({jurisdiction}): {description} Open a step to see its official source link. This sample tracks planning progress; the authority confirms eligibility and approval.", { service: t(procedure.title), jurisdiction: t(procedure.jurisdiction), description: t(procedure.description) });
}
