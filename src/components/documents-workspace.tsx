"use client";
import { useTranslation } from "@/lib/use-translation";
import Link from "next/link";
import { SiteHeader } from "./site-header";
import { DocumentReadiness } from "./document-readiness";
import { useWorkflowDemo } from "@/lib/local-demo";
import { getProcedure } from "@/lib/procedures";

export function DocumentsWorkspace({ procedureId }: { procedureId: string }) {
  const { t } = useTranslation();
  const { workflow } = useWorkflowDemo(procedureId);
  const procedure = getProcedure(procedureId)!;
  return <><SiteHeader compact /><main id="main-content" className="shell pb-28 pt-8"><Link href={`/app/goals/${procedureId}/roadmap`} className="text-sm text-brand">{t("← Back to roadmap")}</Link><p className="eyebrow mt-6">{t("Document readiness")}</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">{t("Prepare once, reuse across steps.")}</h1><p className="mt-3 text-muted">{t(procedure.title)} · {t(procedure.jurisdiction)}</p><div className="card mt-6 p-5 sm:p-6"><DocumentReadiness workflow={workflow} /></div><Link className="button-secondary mt-6" href={`/app/goals/${procedureId}/print`}>{t("Print / Save as PDF")}</Link></main></>;
}
