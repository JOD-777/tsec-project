"use client";
import { useTranslation } from "@/lib/use-translation";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "./site-header";
import { useWorkflowDemo, updateWorkflow } from "@/lib/local-demo";
import { getProcedure } from "@/lib/procedures";
import { compareScenario, previewScenario, scenarioInput, type ScenarioInput } from "@/lib/scenarios";
import { type Answers } from "@/lib/workflow";

export function WhatIfWorkspace({ procedureId }: { procedureId: string }) {
  const { t } = useTranslation();
  const { workflow } = useWorkflowDemo(procedureId);
  const procedure = getProcedure(procedureId)!;
  const router = useRouter();
  const [draft, setDraft] = useState<ScenarioInput | null>(null);
  const input = draft ?? scenarioInput(workflow);
  const preview = previewScenario(workflow, input);
  const comparison = compareScenario(workflow, preview);
  const changed = JSON.stringify(scenarioInput(workflow)) !== JSON.stringify(input);
  const foodQuestions = [
    { id: "premises", label: "Premises", options: [["home", "Home"], ["commercial", "Commercial"]] },
    { id: "activity", label: "Activity", options: [["prepare", "Prepare and deliver food"], ["package", "Package food products"], ["resell", "Resell packaged goods"]] },
    { id: "existingRegistration", label: "Existing food registration or licence", options: [["false", "No"], ["true", "Yes"]] },
  ];
  return <><SiteHeader compact /><main id="main-content" className="shell pb-28 pt-8"><Link href={`/app/goals/${procedureId}/roadmap`} className="text-sm text-brand">{t("← Back to roadmap")}</Link><p className="eyebrow mt-6">{t("What-if comparison")}</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">{t("Explore another path.")}</h1><p className="mt-3 text-muted">{t(procedure.title)} · {t(procedure.jurisdiction)}</p><p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{t("Preview supported choices without changing your saved roadmap. Apply only when you want to use the scenario. Other locations and eligibility fields are not supported by this procedure yet.")}</p>
    <section className="card mt-6 p-5 sm:p-6"><h2 className="font-semibold">{t("Scenario choices")}</h2><div className="mt-4 grid gap-4 md:grid-cols-3">{procedureId === "home-food-business" ? foodQuestions.map((question) => <label key={question.id} className="text-sm font-medium">{t(question.label)}<select className="field mt-2" value={String(input.answers[question.id as keyof Answers])} onChange={(event) => setDraft({ ...input, answers: { ...input.answers, [question.id]: question.id === "existingRegistration" ? event.target.value === "true" : event.target.value } })}>{question.options.map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}</select></label>) : procedure.questions.map((question) => <label key={question.id} className="text-sm font-medium">{t(question.label)}<select className="field mt-2" value={input.profile[question.id]} onChange={(event) => setDraft({ ...input, profile: { ...input.profile, [question.id]: event.target.value } })}>{question.options.map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}</select></label>)}</div><button className="mt-4 min-h-11 text-sm text-brand underline" onClick={() => setDraft(null)} disabled={!changed}>{t("Reset preview")}</button></section>
    <section className="card mt-4 overflow-hidden"><div className="p-5"><h2 className="font-semibold">{t("Current roadmap vs scenario")}</h2><p role="status" className="mt-2 text-sm text-muted">{t(changed ? "Preview only — saved progress is unchanged." : "Choose another option to see the differences.")}</p></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-surface-2"><tr><th className="p-4">{t("Measure")}</th><th className="p-4">{t("Current")}</th><th className="p-4">{t("Scenario")}</th></tr></thead><tbody>{([
      ["Required steps", comparison.before.required, comparison.after.required], ["Optional steps", comparison.before.optional, comparison.after.optional],
      ["Preparation items", comparison.before.documents, comparison.after.documents], ["Physical / hybrid steps", comparison.before.visits, comparison.after.visits],
      ["Dependencies", comparison.before.dependencies, comparison.after.dependencies], ["Progress after applying", `${comparison.before.progress}%`, `${comparison.after.progress}%`],
    ] as const).map(([label, before, after]) => <tr key={label} className="border-t border-line"><th className="p-4 font-medium">{t(label)}</th><td className="p-4">{before}</td><td className="p-4">{after}</td></tr>)}</tbody></table></div><p className="p-5 text-xs leading-5 text-muted">{t("Complexity is shown through step, dependency and preparation counts. Fees and waiting times cannot be compared because this sample has no verified values. Physical / hybrid steps are not an appointment count.")}</p></section>
    <div className="mt-4 grid gap-4 md:grid-cols-2"><Diff title={t("Steps added")} values={comparison.added.map((step) => step.title)} /><Diff title={t("Steps removed")} values={comparison.removed.map((step) => step.title)} /><Diff title={t("Steps updated")} values={comparison.changed.map((step) => step.title)} /><Diff title={t("Document changes")} values={[...comparison.documentsAdded.map((name) => `Added: ${name}`), ...comparison.documentsRemoved.map((name) => `Removed from checklist: ${name}`)]} /><Diff title={t("Agency changes")} values={[...comparison.agenciesAdded.map((name) => `Added: ${name}`), ...comparison.agenciesRemoved.map((name) => `Removed: ${name}`)]} /><Diff title={t("Completed steps needing review")} values={comparison.reopened.map((step) => step.title)} /></div>
    <section className="card mt-4 p-5"><p className="text-sm leading-6 text-muted">{comparison.preserved.length} {t("completed")} {t(comparison.preserved.length === 1 ? "step is" : "steps are")} {t("retained. Changed steps and affected dependants reopen. Notes and prepared-document selections are retained; items outside the new checklist stay stored for later use.")}</p><div className="mt-4 flex flex-wrap gap-3"><button className="button-primary disabled:opacity-50" disabled={!changed} onClick={() => {
      const persisted = updateWorkflow(procedureId, (current) => previewScenario(current, input));
      toast.success(t("Scenario applied"), { description: t(persisted ? "Unaffected progress and notes preserved" : "Kept for this session; storage unavailable") });
      router.push(`/app/goals/${procedureId}/roadmap`);
    }}>{t("Apply scenario to my roadmap")}</button><Link href={`/app/goals/${procedureId}/roadmap`} className="button-secondary">{t("Discard preview")}</Link></div></section>
  </main></>;
}
function Diff({ title, values }: { title: string; values: string[] }) {
  const { t } = useTranslation();
  return <section className="card p-5"><h2 className="font-semibold">{t(title)}</h2>{values.length ? <ul className="mt-3 space-y-2 text-sm text-muted">{values.map((value) => <li key={value}>• {t(value)}</li>)}</ul> : <p className="mt-3 text-sm text-muted">{t("No changes")}</p>}</section>;
}
