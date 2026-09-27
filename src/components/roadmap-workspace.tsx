"use client";
import { useTranslation } from "@/lib/use-translation";

import Link from "next/link";
import { Background, Controls, MarkerType, MiniMap, Position, ReactFlow, type Edge, type Node } from "@xyflow/react";
import { useTheme } from "next-themes";
import { ArrowLeft, BookOpen, Check, ChevronRight, Clock3, ExternalLink, FileText, GitBranch, Languages, List, PanelRightClose, PanelRightOpen, PanelLeft, Printer, FlaskConical, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { type CivicStep } from "@/lib/demo-data";
import { useWorkflowDemo, updateWorkflow, updateDemo, type Locale } from "@/lib/local-demo";
import { uiCopy } from "@/lib/locales";
import { documentChecklist, prerequisites, stepStatus, toggleStep, workflowSummary, workflowGraph, stepDocumentReadiness, type Workflow } from "@/lib/workflow";

import { getProcedure, procedureSources } from "@/lib/procedures";
import { DocumentReadiness } from "./document-readiness";
import type { Dependency } from "@/lib/graph";
import { translateText } from "@/lib/translations";
import { filterRoadmap, type RoadmapStatusFilter } from "@/lib/roadmap-filters";

function compactAgency(agency: string) {
  const labels: Record<string, string> = {
    "Brihanmumbai Municipal Corporation": "BMC",
    "Ministry of Micro, Small & Medium Enterprises": "Ministry of MSME",
    "Ministry of Road Transport and Highways": "MoRTH",
    "Department of Registration and Stamps, Maharashtra": "IGR Maharashtra",
    "Commissioner for Co-operation and Registrar of Co-operative Societies": "Co-operation Department",
  };
  return labels[agency] ?? agency;
}

function localizedTitle(step: CivicStep, locale: Locale) {
  return translateText(locale, step.title);
}
const compactPositions: Record<string, { x: number; y: number }> = {
  scope: { x: 260, y: 0 }, premises: { x: 0, y: 165 }, fssai: { x: 260, y: 165 }, udyam: { x: 520, y: 165 },
  docs: { x: 130, y: 330 }, gst: { x: 390, y: 330 }, apply: { x: 260, y: 495 }, ready: { x: 260, y: 660 },
};
const subscribeHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
const wideGraphSnapshot = () => window.matchMedia("(min-width: 1024px)").matches;
const desktopDetailsSnapshot = () => window.matchMedia("(min-width: 1280px)").matches;
function subscribeDesktopDetails(callback: () => void) {
  const media = window.matchMedia("(min-width: 1280px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function subscribeWideGraph(callback: () => void) {
  const media = window.matchMedia("(min-width: 1024px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function horizontalPositions(items: CivicStep[], edges: readonly Dependency[]) {
  const levels = new Map<string, number>();
  function level(id: string): number {
    const cached = levels.get(id);
    if (cached !== undefined) return cached;
    const parents = prerequisites(id, edges);
    const value = parents.length ? Math.max(...parents.map(level)) + 1 : 0;
    levels.set(id, value); return value;
  }
  for (const step of items) level(step.id);
  return Object.fromEntries(items.map((step) => {
    const peers = items.filter((item) => levels.get(item.id) === levels.get(step.id));
    return [step.id, { x: levels.get(step.id)! * 255, y: 210 + (peers.indexOf(step) - (peers.length - 1) / 2) * 210 }];
  }));
}

export function RoadmapWorkspace({ procedureId = "home-food-business" }: { procedureId?: string }) {
  const { t } = useTranslation();
  const demo = useWorkflowDemo(procedureId);
  const procedure = getProcedure(procedureId)!;
  const { resolvedTheme } = useTheme();
  const hydrated = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
  const wideGraph = useSyncExternalStore(subscribeWideGraph, wideGraphSnapshot, serverSnapshot);
  const desktopDetails = useSyncExternalStore(subscribeDesktopDetails, desktopDetailsSnapshot, serverSnapshot);
  const { workflow, locale } = demo;
  const copy = uiCopy[locale];
  const summary = workflowSummary(workflow);
  const dependencies = useMemo(() => workflowGraph(workflow).edges, [workflow]);
  const [selectedOverride, setSelectedId] = useState<string | null>(null);
  const selectedId = selectedOverride ?? String(summary.next?.id ?? summary.items[0]?.id ?? "");
  const [overviewOpen, setOverviewOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [detailsRequested, setDetailsRequested] = useState(false);
  const [view, setView] = useState<"auto" | "graph" | "list">("auto");
  const [search, setSearch] = useState("");
  const [showOptional, setShowOptional] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);
  const [statusFilter, setStatusFilter] = useState<RoadmapStatusFilter>("all");
  const dialog = useRef<HTMLDialogElement>(null);
  const selected = summary.items.find((step) => step.id === selectedId);
  const visible = filterRoadmap(workflow, { search, locale, showOptional, showCompleted, status: statusFilter });
  const documents = documentChecklist(workflow);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1279px)");
    const sync = () => {
      if (selectedId && detailsOpen && detailsRequested && media.matches) { if (!dialog.current?.open) dialog.current?.showModal(); }
      else dialog.current?.close();
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [selectedId, detailsOpen, detailsRequested]);

  const nodes = useMemo<Node[]>(() => {
    const positions = wideGraph ? horizontalPositions(workflowSummary(workflow).items, dependencies) : compactPositions;
    return filterRoadmap(workflow, { search, locale, showOptional, showCompleted, status: statusFilter }).map((step) => {
      const status = stepStatus(step, workflow.completed, dependencies);
      const statusLabel = uiCopy[locale][status === "complete" ? "done" : status];
      return {
        id: step.id,
        width: 220,
        height: 180,
        position: wideGraph ? positions[step.id] : { x: (positions[step.id] ?? step).x, y: (positions[step.id] ?? step).y * 1.3 },
        sourcePosition: wideGraph ? Position.Right : Position.Bottom,
        targetPosition: wideGraph ? Position.Left : Position.Top,
        data: { label: <div className="civic-node-content"><div className="mb-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[10px] leading-4"><span className="font-semibold uppercase">{t(status === "complete" ? "✓ " : "")}{statusLabel}</span><span className="text-muted">{t(step.mode)}</span></div><div className="text-[13px] font-semibold leading-[18px]">{localizedTitle(step, locale)}</div><div className="mt-2 text-[11px] leading-4 text-muted" title={step.agency}>{compactAgency(step.agency)}</div><div className="mt-2 border-t border-line pt-2 text-[10px] leading-4 text-muted">{stepDocumentReadiness(workflow, step.id).prepared}/{step.documents.length} {t("preparation items ready")}</div></div> },
        ariaLabel: `${localizedTitle(step, locale)}, ${statusLabel}, ${step.agency}`,
        className: `civic-node civic-node-${status} ${selectedId === step.id ? "civic-node-selected" : ""}`,
        style: { width: 220, height: 180, borderRadius: 14, padding: 12, textAlign: "left" },
      };
    });
  }, [workflow, locale, search, showOptional, showCompleted, statusFilter, selectedId, dependencies, wideGraph, t]);
  const edges = useMemo<Edge[]>(() => {
    const ids = new Set(nodes.map((node) => node.id));
    return dependencies.filter(([from, to]) => ids.has(from) && ids.has(to)).map(([from, to]) => ({ id: `${from}-${to}`, source: from, target: to, markerEnd: { type: MarkerType.ArrowClosed, color: "#719287" }, style: { stroke: "#719287", strokeWidth: 1.5 } }));
  }, [nodes, dependencies]);

  function mutateStep() {
    if (!selected) return;
    setSelectedId(selected.id);
    const done = workflow.completed.includes(selected.id);
    const persisted = updateWorkflow(procedureId, (current) => toggleStep(current, selected.id));
    toast.success(t(done ? "Step reopened; dependent steps updated" : "Step marked complete"), { description: t(persisted ? "Saved in this browser only" : "Browser storage is unavailable; kept for this session") });
  }
  function selectStep(id: string) { setSelectedId(id); setDetailsOpen(true); setDetailsRequested(true); }
  const panel = selected ? <StepPanel workflow={workflow} edges={dependencies} step={selected} items={summary.items} completed={workflow.completed} locale={locale} note={workflow.notes[selected.id] ?? ""} onNote={(note) => updateWorkflow(procedureId, (current) => ({ ...current, notes: { ...current.notes, [selected.id]: note } }))} onClose={() => setDetailsOpen(false)} onComplete={mutateStep} /> : null;

  return <div className="roadmap-page bg-background">
    <SiteHeader compact />
    <div className="roadmap-header border-b border-line bg-surface/70">
      <div className="roadmap-shell flex flex-wrap items-center justify-between gap-3 py-3">
        <div className="flex min-w-0 items-start gap-3"><Link href="/app" aria-label={t("Back to dashboard")} className="grid size-10 shrink-0 place-items-center rounded-full border border-line"><ArrowLeft size={16} /></Link><div className="min-w-0"><h1 className="text-sm font-semibold sm:text-base">{procedureId === "home-food-business" ? copy.title : t(procedure.title)}</h1><p className="mt-1 text-xs text-muted">{t(procedure.jurisdiction)} · {copy.demo} · {procedureId === "home-food-business" ? demo.review === "approved" ? "v1.4" : "v1.3" : "v1.0"}</p></div></div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1 text-xs"><Languages size={14} /><span className="sr-only">{t("Roadmap language")}</span><select className="field !w-auto !py-2" value={locale} onChange={(event) => updateDemo((current) => ({ ...current, locale: event.target.value as Locale }))}><option value="en">English</option><option value="hi">हिंदी</option><option value="mr">मराठी</option></select></label>
          <Link className="button-secondary text-xs" href={`/app/goals/${procedureId}/what-if`}><FlaskConical size={14} />{t("What-if")}</Link>
          <Link className="button-secondary text-xs" href={`/app/goals/${procedureId}/documents`}><FileText size={14} />{t("Readiness")}</Link>
          <Link className="button-secondary text-xs" href={`/app/goals/${procedureId}/print`}><Printer size={14} />{t("Print / PDF")}</Link>
        </div>
      </div>
    </div>
    <main id="main-content" className="roadmap-shell roadmap-main">
      {procedureId === "home-food-business" && demo.review === "approved" && <details className="text-xs"><summary className="cursor-pointer py-1 text-brand">{t("Demo source review approved · v1.4")}</summary><p className="py-2">{t("Synthetic fee changed from DEMO ₹500 to DEMO ₹750. Your completed steps are preserved. This is a browser-local demonstration, not a verified government fee.")} <Link href="/admin" className="text-brand underline">{t("Review change")}</Link></p></details>}
      <div className="roadmap-summary flex flex-wrap items-center gap-x-4 gap-y-2 py-2">
        <div className="flex items-center gap-3 text-xs"><b>{summary.progress}%</b><div role="progressbar" aria-label={copy.progress} aria-valuenow={summary.progress} aria-valuemin={0} aria-valuemax={100} className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-2"><div className="h-full bg-brand" style={{ width: `${summary.progress}%` }} /></div><span>{summary.done} / {summary.required} · {copy.done}</span></div>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2"><span className="text-xs text-muted">{copy.next}:</span><h2 className="text-xs font-semibold">{summary.next ? localizedTitle(summary.next, locale) : copy.allDone}</h2>{summary.next && <button onClick={() => selectStep(summary.next!.id)} className="inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-brand">{copy.open}<ChevronRight size={13} /></button>}</div>
        <span className="text-xs text-muted">{documents.filter((document) => document.ready).length}/{documents.length} {t("preparation items ready")}</span>
      </div>
      <div className="roadmap-layout" data-overview-open={overviewOpen} data-details-open={Boolean(detailsOpen && selected)}>
        <aside hidden={!overviewOpen} id="roadmap-overview" className="card roadmap-overview p-4">
          <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">{t("Overview")}</h2><button className="icon-button" aria-label={t("Collapse overview")} onClick={() => setOverviewOpen(false)}><PanelLeft size={16} /></button></div>
          <p className="mt-2 text-xs text-muted">{copy.saved}</p><h3 className="eyebrow mt-4">{t("Available actions")}</h3><div className="mt-2 space-y-1">{summary.ready.map((step) => <button key={step.id} onClick={() => selectStep(step.id)} className="block min-h-11 w-full text-left text-xs text-brand">{localizedTitle(step, locale)}{step.id !== summary.next?.id && <span className="text-muted"> {t("· parallel")}</span>}</button>)}{!summary.ready.length && <p className="text-xs text-muted">{copy.noNext}</p>}</div>
          <details className="mt-4 border-t border-line pt-4"><summary className="min-h-9 cursor-pointer text-sm font-semibold">{copy.documents}</summary><DocumentReadiness workflow={workflow} compact /><Link href={`/app/goals/${procedureId}/documents`} className="mt-3 inline-flex min-h-11 text-xs text-brand underline">{t("Open full readiness checklist")}</Link></details>
        </aside>
        <section className="card roadmap-canvas min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-line p-2 sm:p-3">
            <button aria-expanded={overviewOpen} aria-controls="roadmap-overview" onClick={() => setOverviewOpen(!overviewOpen)} className="button-secondary text-xs"><PanelLeft size={14} />{t("Overview")}</button>
            <button onClick={() => setView(view === "auto" ? (window.matchMedia("(max-width: 767px)").matches ? "graph" : "list") : view === "list" ? "graph" : "list")} className="button-secondary text-xs"><List size={14} />{view === "list" ? copy.graph : view === "graph" ? copy.list : <><span className="md:hidden">{copy.graph}</span><span className="hidden md:inline">{copy.list}</span></>}</button>
            <label className="min-w-0 flex-1 basis-40"><span className="sr-only">{t("Search roadmap steps")}</span><input className="field !py-2 text-xs" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("Search steps or agencies…")} type="search" /></label>
            <label className="text-xs"><span className="sr-only">{t("Filter step status")}</span><select className="field !w-auto !px-2 !py-2" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as RoadmapStatusFilter)}><option value="all">{t("All statuses")}</option><option value="ready">{copy.ready}</option><option value="blocked">{copy.blocked}</option><option value="complete">{copy.done}</option><option value="optional">{copy.optional}</option></select></label>
            <label className="flex min-h-9 items-center gap-1 text-xs"><input type="checkbox" checked={showOptional} onChange={(event) => setShowOptional(event.target.checked)} />{copy.optional}</label><label className="flex min-h-9 items-center gap-1 text-xs"><input type="checkbox" checked={showCompleted} onChange={(event) => setShowCompleted(event.target.checked)} />{copy.done}</label>
            <button disabled={!selected} aria-expanded={detailsOpen && (desktopDetails || detailsRequested)} onClick={() => { setDetailsRequested(true); setDetailsOpen(!desktopDetails && !detailsRequested ? true : !detailsOpen); }} className="button-secondary text-xs disabled:opacity-50"><PanelRightOpen size={14} />{copy.details}</button>
            {(search || statusFilter !== "all" || !showOptional || !showCompleted) && <button className="min-h-9 text-xs text-brand underline" onClick={() => { setSearch(""); setStatusFilter("all"); setShowOptional(true); setShowCompleted(true); }}>{t("Clear filters")}</button>}
          </div>
          {visible.length === 0 ? <p role="status" className="p-6 text-sm text-muted">{t("No matching steps. Try another search or clear the filters.")}</p> : <>
            <div className={`roadmap-graph bg-background ${view === "list" ? "hidden" : view === "auto" ? "hidden md:block" : "block"}`}><ReactFlow key={`${wideGraph}-${view}-${overviewOpen}-${detailsOpen}-${nodes.map((node) => node.id).join(",")}`} nodes={nodes} edges={edges} onNodeClick={(_, node) => selectStep(node.id)} fitView fitViewOptions={{ padding: 0.1 }} colorMode={hydrated && resolvedTheme === "dark" ? "dark" : "light"} style={{ background: "var(--background)" }} minZoom={0.15} maxZoom={2} nodesDraggable={false} nodesConnectable={false} aria-label={t("Procedure dependency graph")}><Background color="var(--line)" gap={22} /><Controls showInteractive={false} /><MiniMap className="!bg-surface" style={{ width: 100, height: 70 }} maskColor="rgba(100, 130, 115, 0.15)" nodeColor={(node) => node.className?.includes("complete") ? "#115e4d" : "#8aaa2a"} pannable zoomable /></ReactFlow></div>
            <div className={`roadmap-list p-3 sm:p-4 ${view === "graph" ? "hidden" : view === "auto" ? "md:hidden" : "block"}`}><h2 className="mb-4 text-lg font-semibold">{t("Steps in dependency order")}</h2><ol className="grid gap-3">{visible.map((step) => { const status = stepStatus(step, workflow.completed, dependencies), readiness = stepDocumentReadiness(workflow, step.id); return <li key={step.id}><button onClick={() => selectStep(step.id)} className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-3 text-left hover:border-brand"><span className={`grid size-8 shrink-0 place-items-center rounded-full ${status === "complete" ? "bg-brand-strong text-background" : "bg-surface-2"}`}>{status === "complete" ? <Check size={14} /> : summary.items.indexOf(step) + 1}</span><span className="min-w-0"><b className="block text-sm">{localizedTitle(step, locale)}</b><span className="mt-1 block text-xs text-muted">{step.agency} · {copy[status === "complete" ? "done" : status]} · {readiness.prepared}/{readiness.required} {t("preparation items ready")}</span></span><ChevronRight className="ml-auto shrink-0 text-muted" size={16} /></button></li>; })}</ol></div>
          </>}
          <div className="flex flex-wrap gap-3 border-t border-line px-3 py-2 text-[11px] text-muted"><span>✓ {copy.done}</span><span>● {copy.ready}</span><span>◷ {copy.blocked}</span><span>◇ {copy.optional}</span></div>
        </section>
        {detailsOpen && selected && <aside className="card roadmap-details min-w-0 overflow-hidden">{panel}</aside>}
      </div>
      <details className="roadmap-notice text-[11px] text-muted"><summary className="cursor-pointer py-2">{t("Sample guidance ·")} {copy.saved}</summary><p className="pb-2">{copy.warning}{locale !== "en" && t("Official source names and wording are preserved as supplied.")}</p></details>
      <dialog ref={dialog} onCancel={() => setDetailsOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setDetailsOpen(false); }} aria-label={copy.details} className="step-dialog">{panel}</dialog>
    </main>
  </div>;
}

function StepPanel({ workflow, edges, step, items, completed, locale, note, onNote, onClose, onComplete }: { workflow: Workflow; edges: readonly Dependency[]; step: CivicStep; items: CivicStep[]; completed: string[]; locale: Locale; note: string; onNote: (note: string) => void; onClose: () => void; onComplete: () => void }) {
  const { t } = useTranslation();
  const copy = uiCopy[locale];
  const source = procedureSources.find((item) => item.id === step.sourceId);
  const status = stepStatus(step, completed, edges);
  const readiness = stepDocumentReadiness(workflow, step.id);
  const parents = prerequisites(step.id, edges).map((id) => items.find((item) => item.id === id)!);
  return <div><div className="flex items-center justify-between gap-3 border-b border-line p-5"><p className="text-xs font-semibold text-brand">{copy.details}</p><button onClick={onClose} className="icon-button" aria-label={copy.close}><PanelRightClose size={18} /></button></div><div className="space-y-5 p-5"><div><span className="badge">{copy[status === "complete" ? "done" : status]}</span><h2 className="mt-3 text-xl font-semibold tracking-tight">{localizedTitle(step, locale)}</h2><p className="mt-3 text-sm leading-6 text-muted">{t(step.description)}</p></div><div className="grid grid-cols-2 gap-3 text-xs"><Info icon={<Clock3 />} label={copy.timing} value={t(step.duration)} /><Info icon={<GitBranch />} label={copy.mode} value={t(step.mode)} /></div>{parents.length > 0 && <div><h3 className="text-sm font-semibold">{copy.prerequisites}</h3><ul className="mt-2 space-y-2 text-xs text-muted">{parents.map((parent) => <li key={parent.id}>{t(completed.includes(parent.id) ? "✓" : "◷")} {localizedTitle(parent, locale)}</li>)}</ul></div>}{step.documents.length > 0 && <div><h3 className="flex items-center gap-2 text-sm font-semibold"><FileText size={15} />{copy.documents}</h3><div className="mt-2 flex flex-wrap gap-2">{step.documents.map((document) => <span key={document} className="badge">{t(workflow.documents.includes(document) ? "✓ " : "◷ ")}{t(document)}</span>)}</div><p className="mt-2 text-xs text-muted">{readiness.prepared}/{readiness.required} {t("prepared. Preparation status does not verify documents.")}</p><Link href={`/app/goals/${workflow.procedureId}/documents`} className="mt-2 inline-flex min-h-11 text-xs text-brand underline">{t("Update document readiness")}</Link></div>}<div className="rounded-2xl border border-line bg-surface-2/60 p-4"><div className="flex items-start gap-2 text-xs font-semibold"><ShieldCheck size={16} className="shrink-0 text-amber-600" />{t("Not verified from an official source")}</div><p className="mt-2 text-xs text-muted">{t("Sample requirement. The portal link identifies an official authority; no captured evidence supports this sample claim.")}</p>{source && <><p className="mt-3 text-xs font-medium">{source.title}</p><p className="mt-1 text-[11px] leading-5 text-muted">{source.authority}<br />{source.checked}</p><a href={source.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-brand">{copy.source}<ExternalLink size={12} /></a></>}</div><div className="rounded-2xl border border-line p-4"><h3 className="flex items-center gap-2 text-sm font-semibold"><BookOpen size={15} />{copy.why}</h3><p className="mt-2 text-xs leading-5 text-muted">{t("This sample step resolves an eligibility question, prepares shared documents, or unlocks the next planning step. Its dependencies are planning relationships, not verified legal rules.")}</p></div><label className="block text-sm font-semibold">{t("Notes")} <span className="font-normal text-muted">{t("(browser-local demo)")}</span><textarea className="field mt-2 text-sm font-normal" rows={3} maxLength={1000} value={note} onChange={(event) => onNote(event.target.value)} placeholder={t("Avoid personal or sensitive information")} /></label><button disabled={status === "blocked"} onClick={onComplete} className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-50">{status === "complete" ? copy.reopen : copy.complete}</button>{status === "blocked" && <p className="text-xs text-muted">{t("Complete the prerequisites above to unlock this step.")}</p>}<button onClick={() => { onClose(); window.dispatchEvent(new CustomEvent("civicflow:open-copilot", { detail: t("Explain the sample step: {step}", { step: t(step.title) }) })); }} className="button-secondary w-full text-xs">{t("Ask CivicFlow about this step")}</button></div></div>;
}
function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  const { t } = useTranslation(); return <div className="min-w-0 rounded-xl border border-line p-3"><span className="text-brand [&>svg]:size-4">{icon}</span><span className="mt-3 block text-muted">{t(label)}</span><b className="mt-1 block">{t(value)}</b></div>; }
