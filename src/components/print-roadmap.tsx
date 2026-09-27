"use client";
import { useTranslation } from "@/lib/use-translation";
import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "./site-header";
import { useWorkflowDemo } from "@/lib/local-demo";
import { getProcedure, procedureSources } from "@/lib/procedures";
import { documentChecklist, prerequisites, stepStatus, workflowGraph, workflowSummary } from "@/lib/workflow";

export function PrintRoadmap({ procedureId }: { procedureId: string }) {
  const { t } = useTranslation();
  const { workflow, review } = useWorkflowDemo(procedureId);
  const [includeNotes, setIncludeNotes] = useState(false);
  const procedure = getProcedure(procedureId)!;
  const { items, edges } = workflowGraph(workflow), summary = workflowSummary(workflow);
  const documents = documentChecklist(workflow);
  const sources = procedureSources.filter((source) => items.some((step) => step.sourceId === source.id));
  return <div className="print-page"><div className="print-controls"><SiteHeader compact /></div><main id="main-content" className="shell py-8"><div className="print-controls mb-6"><Link href={`/app/goals/${procedureId}/roadmap`} className="text-sm text-brand">{t("← Back to roadmap")}</Link><div className="mt-4 flex flex-wrap items-center gap-4"><button className="button-primary" onClick={() => window.print()}>{t("Print / Save as PDF")}</button><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={includeNotes} onChange={(event) => setIncludeNotes(event.target.checked)} />{t("Include my local notes")}</label></div><p className="mt-3 text-sm text-muted">{t("Use your browser’s print dialog to print this report or choose “Save as PDF”. The full checklist prints regardless of collapsed roadmap panels or search filters.")}</p></div>
    <article className="print-report card p-5 sm:p-8"><p className="eyebrow">{t("CivicFlow AI · Roadmap report")}</p><h1 className="mt-3 text-3xl font-semibold">{t(procedure.title)}</h1><p className="mt-2 text-muted">{t(procedure.jurisdiction)} {t("· Sample version")} {procedureId === "home-food-business" ? review === "approved" ? "1.4" : "1.3" : "1.0"}</p><p className="mt-4 text-sm leading-6">{t(procedure.description)}</p><p className="mt-3 text-sm"><b>{t("Progress snapshot:")}</b> {summary.done}/{summary.required} {t("required steps complete (")}{summary.progress}%). {documents.filter((document) => document.ready).length}/{documents.length} {t("preparation items marked ready.")}</p>
    <section className="mt-6"><h2 className="text-xl font-semibold">{t("Procedure checklist")}</h2><ol className="mt-4 space-y-4">{items.map((step, index) => <li key={step.id} className="print-step rounded-xl border border-line p-4"><h3 className="font-semibold">{index + 1}. {t(step.title)}</h3><p className="mt-1 text-xs text-muted">{t(stepStatus(step, workflow.completed, edges))}{t(step.status === "optional" && stepStatus(step, workflow.completed, edges) !== "optional" ? ` · ${t("Optional")}` : "")} · {step.agency} · {t(step.mode)}</p><p className="mt-2 text-sm leading-6">{t(step.description)}</p><p className="mt-2 text-xs"><b>{t("Prerequisites:")}</b> {prerequisites(step.id, edges).map((id) => t(items.find((item) => item.id === id)!.title)).join("; ") || t("None")}</p><p className="mt-2 text-xs"><b>{t("Preparation:")}</b> {step.documents.map((name) => t(name)).join("; ") || t("None listed")}</p>{includeNotes && workflow.notes[step.id] && <p className="mt-2 whitespace-pre-wrap break-words text-xs"><b>{t("Local note:")}</b> {workflow.notes[step.id]}</p>}</li>)}</ol></section>
    <section className="mt-6"><h2 className="text-xl font-semibold">{t("Document readiness")}</h2><ul className="mt-4 space-y-3">{documents.map((document) => <li key={document.name} className="print-step text-sm"><b>{`[${t(document.ready ? "Prepared" : "Not prepared")}]`} {t(document.name)}</b><p className="mt-1 text-xs">{t("Used by:")} {document.usedBy.map((title) => t(title)).join("; ")}</p></li>)}</ul></section>
    <section className="mt-6"><h2 className="text-xl font-semibold">{t("Official sources")}</h2><ul className="mt-3 space-y-3">{sources.map((source) => <li key={source.id} className="print-step text-sm"><b>{source.title}</b><p className="mt-1 text-xs">{source.authority} · {source.checked}</p><a href={source.url} className="print-source mt-1 block break-all text-xs text-brand underline">{source.url}</a></li>)}</ul></section><p className="mt-6 border-t border-line pt-4 text-xs leading-5">{t("Browser-local sample planning data, not official approval. Requirement, fee and timeline verification remains pending. Prepared items are self-reported; no documents have been uploaded or verified.")}</p>
    </article></main></div>;
}
