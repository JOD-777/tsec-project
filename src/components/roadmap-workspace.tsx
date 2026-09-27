"use client";

import Link from "next/link";
import { Background, Controls, MarkerType, MiniMap, Position, ReactFlow, type Edge, type Node } from "@xyflow/react";
import { useTheme } from "next-themes";
import { ArrowLeft, BookOpen, Check, ChevronRight, Clock3, ExternalLink, FileText, GitBranch, Languages, List, PanelRightClose, PanelRightOpen, ShieldAlert, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { type CivicStep } from "@/lib/demo-data";
import { useWorkflowDemo, updateWorkflow, updateDemo, type Locale } from "@/lib/local-demo";
import { uiCopy, stepTitles } from "@/lib/locales";
import { documentChecklist, prerequisites, stepStatus, toggleStep, workflowSummary, workflowGraph } from "@/lib/workflow";

import { getProcedure, procedureSources } from "@/lib/procedures";
import type { Dependency } from "@/lib/graph";

function localizedTitle(step: CivicStep, locale: Locale) {
  return locale === "en" ? step.title : stepTitles[locale][step.id as keyof typeof stepTitles.hi] ?? step.title;
}
const compactPositions: Record<string, { x: number; y: number }> = {
  scope: { x: 215, y: 0 }, premises: { x: 0, y: 165 }, fssai: { x: 215, y: 165 }, udyam: { x: 430, y: 165 },
  docs: { x: 105, y: 330 }, gst: { x: 325, y: 330 }, apply: { x: 215, y: 495 }, ready: { x: 215, y: 660 },
};
const subscribeHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function RoadmapWorkspace({ procedureId = "home-food-business" }: { procedureId?: string }) {
  const demo = useWorkflowDemo(procedureId);
  const procedure = getProcedure(procedureId)!;
  const { resolvedTheme } = useTheme();
  const hydrated = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
  const { workflow, locale } = demo;
  const copy = uiCopy[locale];
  const summary = workflowSummary(workflow);
  const dependencies = useMemo(() => workflowGraph(workflow).edges, [workflow]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"auto" | "graph" | "list">("auto");
  const [search, setSearch] = useState("");
  const [showOptional, setShowOptional] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);
  const dialog = useRef<HTMLDialogElement>(null);
  const selected = summary.items.find((step) => step.id === selectedId);
  const visible = summary.items.filter((step) => (showOptional || step.status !== "optional") && (showCompleted || !workflow.completed.includes(step.id)) && `${step.title} ${localizedTitle(step, locale)} ${step.agency}`.toLowerCase().includes(search.toLowerCase()));
  const documents = documentChecklist(workflow);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1279px)");
    const sync = () => {
      if (selectedId && media.matches) { if (!dialog.current?.open) dialog.current?.showModal(); }
      else dialog.current?.close();
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [selectedId]);

  const nodes = useMemo<Node[]>(() => {
    return workflowSummary(workflow).items.filter((step) => (showOptional || step.status !== "optional") && (showCompleted || !workflow.completed.includes(step.id)) && `${step.title} ${localizedTitle(step, locale)} ${step.agency}`.toLowerCase().includes(search.toLowerCase())).map((step) => {
      const status = stepStatus(step, workflow.completed, dependencies);
      const statusLabel = uiCopy[locale][status === "complete" ? "done" : status];
      return {
        id: step.id,
        position: compactPositions[step.id] ?? { x: step.x, y: step.y },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        data: { label: <div className="w-[165px]"><div className="mb-2 flex items-center justify-between gap-2 text-[10px]"><span className="font-semibold uppercase">{status === "complete" ? "✓ " : ""}{statusLabel}</span><span className="text-muted">{step.mode}</span></div><div className="text-sm font-semibold">{localizedTitle(step, locale)}</div><div className="mt-2 text-[10px] text-muted">{step.agency}</div><div className="mt-2 text-[10px] text-muted">{step.documents.length} documents · Sample</div></div> },
        ariaLabel: `${localizedTitle(step, locale)}, ${statusLabel}, ${step.agency}`,
        className: `civic-node civic-node-${status} ${selectedId === step.id ? "civic-node-selected" : ""}`,
        style: { borderRadius: 14, padding: 12 },
      };
    });
  }, [workflow, locale, search, showOptional, showCompleted, selectedId, dependencies]);
  const edges = useMemo<Edge[]>(() => {
    const ids = new Set(nodes.map((node) => node.id));
    return dependencies.filter(([from, to]) => ids.has(from) && ids.has(to)).map(([from, to]) => ({ id: `${from}-${to}`, source: from, target: to, markerEnd: { type: MarkerType.ArrowClosed, color: "#719287" }, style: { stroke: "#719287", strokeWidth: 1.5 } }));
  }, [nodes, dependencies]);

  function mutateStep() {
    if (!selected) return;
    const done = workflow.completed.includes(selected.id);
    const persisted = updateWorkflow(procedureId, (current) => toggleStep(current, selected.id));
    toast.success(done ? "Step reopened; dependent steps updated" : "Step marked complete", { description: persisted ? "Saved in this browser only" : "Browser storage is unavailable; kept for this session" });
  }
  const panel = selected ? <StepPanel edges={dependencies} step={selected} items={summary.items} completed={workflow.completed} locale={locale} note={workflow.notes[selected.id] ?? ""} onNote={(note) => updateWorkflow(procedureId, (current) => ({ ...current, notes: { ...current.notes, [selected.id]: note } }))} onClose={() => setSelectedId(null)} onComplete={mutateStep} /> : null;

  return <div className="min-h-screen bg-background">
    <SiteHeader compact />
    <div className="border-b border-line bg-surface/70">
      <div className="shell flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex min-w-0 items-start gap-3"><Link href="/app" aria-label="Back to dashboard" className="grid size-11 shrink-0 place-items-center rounded-full border border-line"><ArrowLeft size={16} /></Link><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="font-semibold">{procedureId === "home-food-business" ? copy.title : procedure.title}</h1><span className="badge !bg-amber-50 !text-amber-800">{copy.demo}</span></div><p className="mt-1 text-xs text-muted">{procedure.jurisdiction} · Demo procedure {procedureId === "home-food-business" ? demo.review === "approved" ? "v1.4" : "v1.3" : "v1.0"}</p></div></div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs"><Languages size={16} /><span className="sr-only">Roadmap language</span><select className="field !w-auto !py-2" value={locale} onChange={(event) => updateDemo((current) => ({ ...current, locale: event.target.value as Locale }))}><option value="en">English</option><option value="hi">हिंदी</option><option value="mr">मराठी</option></select></label>
          <button onClick={() => setView(view === "auto" ? (window.matchMedia("(max-width: 767px)").matches ? "graph" : "list") : view === "list" ? "graph" : "list")} className="button-secondary text-xs"><List size={14} />{view === "list" ? copy.graph : view === "graph" ? copy.list : <><span className="md:hidden">{copy.graph}</span><span className="hidden md:inline">{copy.list}</span></>}</button>
        </div>
      </div>
    </div>
    <main id="main-content" className="shell pb-28 pt-6">
      {procedureId === "home-food-business" && demo.review === "approved" && <div role="status" className="card mb-4 p-4 text-sm"><b>Demo source review approved.</b> Synthetic fee changed from DEMO ₹500 to DEMO ₹750. Your completed steps are preserved. This is a browser-local demonstration, not a verified government fee. <Link href="/admin" className="text-brand underline">Review change</Link></div>}
      <p className="mb-4 text-xs text-muted">{copy.saved}</p>
      <div className="grid min-w-0 gap-4 lg:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[210px_minmax(0,1fr)_290px]">
        <aside className="grid min-w-0 content-start gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="card p-5"><div className="flex items-center justify-between gap-2 text-sm"><span>{copy.progress}</span><b>{summary.progress}%</b></div><div role="progressbar" aria-label={copy.progress} aria-valuenow={summary.progress} aria-valuemin={0} aria-valuemax={100} className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${summary.progress}%` }} /></div><p className="mt-3 text-xs leading-5 text-muted">{summary.done} / {summary.required} · {copy.done}</p></div>
          <div className="card p-5"><p className="eyebrow">{copy.next}</p><h2 className="mt-3 font-semibold">{summary.next ? localizedTitle(summary.next, locale) : copy.allDone}</h2><p className="mt-2 text-xs leading-5 text-muted">{summary.next ? `${copy.ready} · ${summary.ready.length} available actions` : copy.noNext}</p>{summary.next && <button onClick={() => setSelectedId(summary.next!.id)} className="mt-3 flex min-h-11 items-center gap-1 text-xs font-semibold text-brand">{copy.open}<ChevronRight size={14} /></button>}{summary.ready.filter((step) => step.id !== summary.next?.id).map((step) => <button key={step.id} onClick={() => setSelectedId(step.id)} className="mt-2 block min-h-11 text-left text-xs text-brand">{localizedTitle(step, locale)} <span className="text-muted">· parallel</span></button>)}</div>
          <details className="card p-5 sm:col-span-2 lg:col-span-1"><summary className="cursor-pointer text-sm font-semibold">{copy.documents} <span className="font-normal text-muted">({documents.filter((document) => document.ready).length}/{documents.length})</span></summary><p className="mt-2 text-xs leading-5 text-muted">{copy.documentHint}</p><div className="mt-3 space-y-2">{documents.map((document) => <label key={document.name} className="flex min-h-11 cursor-pointer items-start gap-2 text-xs"><input type="checkbox" checked={document.ready} onChange={() => { const persisted = updateWorkflow(procedureId, (current) => ({ ...current, documents: document.ready ? current.documents.filter((name) => name !== document.name) : [...current.documents, document.name] })); if (!persisted) toast.info("Checklist kept for this session; browser storage unavailable"); }} className="mt-1 accent-brand" /><span>{document.name}<span className="mt-1 block text-[10px] text-muted">Used by {document.usedBy.length} sample steps</span></span></label>)}</div></details>
        </aside>
        <section className="card min-w-0 overflow-hidden">
          <div className="space-y-3 border-b border-line p-4"><label className="block"><span className="sr-only">Search roadmap steps</span><input className="field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search steps or agencies…" type="search" /></label><div className="flex flex-wrap gap-x-4 gap-y-2 text-xs"><label className="flex min-h-8 items-center gap-2"><input type="checkbox" checked={showOptional} onChange={(event) => setShowOptional(event.target.checked)} />{copy.optional}</label><label className="flex min-h-8 items-center gap-2"><input type="checkbox" checked={showCompleted} onChange={(event) => setShowCompleted(event.target.checked)} />{copy.done}</label></div></div>
          {visible.length === 0 ? <p role="status" className="p-6 text-sm text-muted">No matching steps. Try a different search or show completed steps.</p> : <>
            <div className={`roadmap-graph h-[480px] bg-background md:h-[640px] ${view === "list" ? "hidden" : view === "auto" ? "hidden md:block" : "block"}`}><ReactFlow nodes={nodes} edges={edges} onNodeClick={(_, node) => setSelectedId(node.id)} fitView fitViewOptions={{ padding: 0.08 }} colorMode={hydrated && resolvedTheme === "dark" ? "dark" : "light"} style={{ background: "var(--background)" }} minZoom={0.15} maxZoom={2} nodesDraggable={false} nodesConnectable={false} aria-label="Procedure dependency graph"><Background color="var(--line)" gap={22} /><Controls showInteractive={false} /><MiniMap className="!bg-surface" style={{ width: 120, height: 85 }} maskColor="rgba(100, 130, 115, 0.15)" nodeColor={(node) => node.className?.includes("complete") ? "#115e4d" : "#8aaa2a"} pannable zoomable /></ReactFlow></div>
            <div className={`p-4 md:p-5 ${view === "graph" ? "hidden" : view === "auto" ? "md:hidden" : "block"}`}><p className="eyebrow">{copy.list}</p><h2 className="mb-5 mt-2 text-2xl font-semibold">Steps in dependency order</h2><ol className="space-y-3">{visible.map((step) => { const status = stepStatus(step, workflow.completed, dependencies); return <li key={step.id}><button onClick={() => setSelectedId(step.id)} className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-left hover:border-brand"><span className={`grid size-9 shrink-0 place-items-center rounded-full ${status === "complete" ? "bg-brand-strong text-background" : "bg-surface-2"}`}>{status === "complete" ? <Check size={16} /> : summary.items.indexOf(step) + 1}</span><span className="min-w-0"><b className="block text-sm">{localizedTitle(step, locale)}</b><span className="mt-1 block text-xs text-muted">{step.agency} · {copy[status === "complete" ? "done" : status]}</span></span><ChevronRight className="ml-auto shrink-0 text-muted" size={18} /></button></li>; })}</ol></div>
          </>}
          <div className="flex flex-wrap gap-3 border-t border-line p-4 text-xs text-muted"><span>✓ {copy.done}</span><span>● {copy.ready}</span><span>◷ {copy.blocked}</span><span>◇ {copy.optional}</span></div>
        </section>
        <aside className="card hidden min-w-0 self-start overflow-hidden xl:block">{panel ?? <div className="p-8 text-center text-sm text-muted"><PanelRightOpen className="mx-auto mb-3" />Select a roadmap node to inspect its details and source.</div>}</aside>
      </div>
      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"><ShieldAlert className="mt-0.5 shrink-0" size={16} /><p>{copy.warning}{locale !== "en" && " Step descriptions and source wording remain in English."}</p></div>
      <dialog ref={dialog} onCancel={() => setSelectedId(null)} onClick={(event) => { if (event.target === event.currentTarget) setSelectedId(null); }} aria-label={copy.details} className="step-dialog">{panel}</dialog>
    </main>
  </div>;
}

function StepPanel({ edges, step, items, completed, locale, note, onNote, onClose, onComplete }: { edges: readonly Dependency[]; step: CivicStep; items: CivicStep[]; completed: string[]; locale: Locale; note: string; onNote: (note: string) => void; onClose: () => void; onComplete: () => void }) {
  const copy = uiCopy[locale];
  const source = procedureSources.find((item) => item.id === step.sourceId);
  const status = stepStatus(step, completed, edges);
  const parents = prerequisites(step.id, edges).map((id) => items.find((item) => item.id === id)!);
  return <div><div className="flex items-center justify-between gap-3 border-b border-line p-5"><p className="text-xs font-semibold text-brand">{copy.details}</p><button onClick={onClose} className="icon-button" aria-label={copy.close}><PanelRightClose size={18} /></button></div><div className="space-y-5 p-5"><div><span className="badge">{copy[status === "complete" ? "done" : status]}</span><h2 className="mt-3 text-xl font-semibold tracking-tight">{localizedTitle(step, locale)}</h2><p className="mt-3 text-sm leading-6 text-muted">{step.description}</p></div><div className="grid grid-cols-2 gap-3 text-xs"><Info icon={<Clock3 />} label={copy.timing} value={step.duration} /><Info icon={<GitBranch />} label={copy.mode} value={step.mode} /></div>{parents.length > 0 && <div><h3 className="text-sm font-semibold">{copy.prerequisites}</h3><ul className="mt-2 space-y-2 text-xs text-muted">{parents.map((parent) => <li key={parent.id}>{completed.includes(parent.id) ? "✓" : "◷"} {localizedTitle(parent, locale)}</li>)}</ul></div>}{step.documents.length > 0 && <div><h3 className="flex items-center gap-2 text-sm font-semibold"><FileText size={15} />{copy.documents}</h3><div className="mt-2 flex flex-wrap gap-2">{step.documents.map((document) => <span key={document} className="badge">{document}</span>)}</div></div>}<div className="rounded-2xl border border-line bg-surface-2/60 p-4"><div className="flex items-start gap-2 text-xs font-semibold"><ShieldCheck size={16} className="shrink-0 text-amber-600" />Not verified from an official source</div><p className="mt-2 text-xs text-muted">Sample requirement. The portal link identifies an official authority; no captured evidence supports this sample claim.</p>{source && <><p className="mt-3 text-xs font-medium">{source.title}</p><p className="mt-1 text-[11px] leading-5 text-muted">{source.authority}<br />{source.checked}</p><a href={source.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-brand">{copy.source}<ExternalLink size={12} /></a></>}</div><div className="rounded-2xl border border-line p-4"><h3 className="flex items-center gap-2 text-sm font-semibold"><BookOpen size={15} />{copy.why}</h3><p className="mt-2 text-xs leading-5 text-muted">This sample step resolves an eligibility question, prepares shared documents, or unlocks the next planning step. Its dependencies are planning relationships, not verified legal rules.</p></div><label className="block text-sm font-semibold">Notes <span className="font-normal text-muted">(browser-local demo)</span><textarea className="field mt-2 text-sm font-normal" rows={3} maxLength={1000} value={note} onChange={(event) => onNote(event.target.value)} placeholder="Avoid personal or sensitive information" /></label><button disabled={status === "blocked"} onClick={onComplete} className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-50">{status === "complete" ? copy.reopen : copy.complete}</button>{status === "blocked" && <p className="text-xs text-muted">Complete the prerequisites above to unlock this step.</p>}<button onClick={() => { onClose(); window.dispatchEvent(new CustomEvent("civicflow:open-copilot", { detail: `Explain the sample step: ${step.title}` })); }} className="button-secondary w-full text-xs">Ask CivicFlow about this step</button></div></div>;
}
function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="min-w-0 rounded-xl border border-line p-3"><span className="text-brand [&>svg]:size-4">{icon}</span><span className="mt-3 block text-muted">{label}</span><b className="mt-1 block">{value}</b></div>; }
