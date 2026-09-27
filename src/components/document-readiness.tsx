"use client";

import { toast } from "sonner";
import { documentChecklist, type Workflow } from "@/lib/workflow";
import { updateWorkflow } from "@/lib/local-demo";
import { procedureSources } from "@/lib/procedures";

export function DocumentReadiness({ workflow, compact = false }: { workflow: Workflow; compact?: boolean }) {
  const documents = documentChecklist(workflow);
  const prepared = documents.filter((document) => document.ready).length;
  return <div><p className="text-xs leading-5 text-muted">{prepared} of {documents.length} prepared. Readiness is your checklist status; it does not upload or verify documents.</p>
    <div className="mt-3 space-y-3">{documents.map((document) => <div key={document.name} className={compact ? "border-b border-line pb-3 last:border-0" : "rounded-2xl border border-line p-4"}>
      <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm"><input className="mt-1 accent-brand" type="checkbox" checked={document.ready} onChange={() => {
        const persisted = updateWorkflow(workflow.procedureId, (current) => ({ ...current, documents: current.documents.includes(document.name) ? current.documents.filter((name) => name !== document.name) : [...current.documents, document.name] }));
        if (!persisted) toast.info("Checklist kept for this session; browser storage unavailable");
      }} /><span className="min-w-0"><b className="font-medium">{document.name}</b><span className="mt-1 block text-xs text-muted">{document.ready ? "Prepared" : "Not prepared"} · Used by {document.usedBy.length} {document.usedBy.length === 1 ? "step" : "steps"}</span></span></label>
      <details className="mt-1"><summary className="cursor-pointer text-xs text-brand">Show related steps and sources</summary><ul className="mt-2 space-y-1 text-xs text-muted">{document.usedBy.map((title) => <li key={title}>• {title}</li>)}</ul><div className="mt-2 flex flex-wrap gap-x-3">{document.sourceIds.map((id) => { const source = procedureSources.find((item) => item.id === id)!; return <a key={id} href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-xs text-brand underline">{source.title}</a>; })}</div><p className="text-xs text-muted">Sample preparation item; requirement verification is pending.</p></details>
    </div>)}</div>
  </div>;
}
