"use client";
import { useTranslation } from "@/lib/use-translation";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Check,
  Database,
  ExternalLink,
  FileCheck2,
  GitCompareArrows,
  RefreshCw,
  ShieldAlert,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { useLocalDemo, updateDemo } from "@/lib/local-demo";
import { AdminPanel } from "@/components/admin-panel";
import { procedureSources } from "@/lib/procedures";
import { catalogueInventory } from "@/lib/catalogue";
import { validateGraph } from "@/lib/graph";
export function AdminConsole() {
  const { t } = useTranslation();
  const demo = useLocalDemo();
  const state = demo.review;
  const inventory = catalogueInventory();
  const totalSteps = inventory.reduce((total, entry) => total + entry.items.length, 0);
  const graphsValid = inventory.every((entry) => validateGraph(entry.items.map((step) => step.id), entry.edges).valid);
  const [active, setActive] = useState("Changes");
  function decide(next: "approved" | "rejected") {
    const persisted = updateDemo((current) => ({ ...current, review: next, audit: [...current.audit, { action: `Synthetic change ${next}`, at: new Date().toISOString() }].slice(-100) }));
    toast.success(
      t(next === "approved"
        ? "Demo change approved; local audit event recorded"
        : "Demo change rejected; local audit event recorded"),
      { description: t(persisted ? "Saved in this browser only. No backend mutation." : "Browser storage unavailable; saved for this session only.") },
    );
  }
  return (
    <>
      <SiteHeader compact />
      <main id="main-content" className="shell pb-28 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{t("Human validation console")}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-.045em]"> {t("Source intelligence")} </h1>
            <p className="mt-2 text-muted"> {t("Browser-local demo console. No shared backend changes are made.")} </p>
          </div>
          <span className="badge">
            <span className="size-2 rounded-full bg-emerald-500" /> {t("6 sample procedures")} </span>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric icon={<Database />} value={String(procedureSources.length)} label={t("Sample source links")} />
          <Metric icon={<FileCheck2 />} value={String(totalSteps)} label={t("Sample steps")} />
          <Metric
            icon={<GitCompareArrows />}
            value={state === "pending" ? "1" : "0"}
            label={t("Review pending")}
          />
          <Metric icon={<Activity />} value={graphsValid ? "Pass" : "Fail"} label={t("Graph validity")} />
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-[260px_1fr]">
          <aside className="card h-fit p-3">
            <p className="px-3 py-2 text-xs font-semibold text-muted"> {t("ADMIN WORKSPACE")} </p>
            <nav aria-label={t("Admin demo sections")} className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1">{[
              "Overview",
              "Sources",
              "Changes",
              "Claims",
              "Procedures",
              "Evaluations",
              "Audit log",
            ].map((x) => (
              <button
                key={x}
                onClick={() => {
                  setActive(x);
                }}
                aria-pressed={active === x}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${active === x ? "bg-foreground text-background" : "hover:bg-surface-2"}`}
              >
                {t(x)}
                {x === "Changes" && state === "pending" ? (
                  <span className="ml-auto rounded-full bg-accent px-2 text-[10px] text-accent-ink">
                    1
                  </span>
                ) : null}
              </button>
            ))}</nav>
          </aside>
          {active !== "Changes" ? <AdminPanel active={active} /> : <section className="card overflow-hidden" aria-label={t("Synthetic source change review")}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-6">
              <div>
                <p className="text-xs font-semibold text-brand"> {t("SEEDED CHANGE-DETECTION DEMO")} </p>
                <h2 className="mt-2 text-xl font-semibold"> {t("Synthetic source change")} </h2>
              </div>
              <span
                className={`badge ${state === "pending" ? "!bg-amber-50 !text-amber-800" : state === "approved" ? "!bg-emerald-50 !text-emerald-800" : "!bg-red-50 !text-red-800"}`}
              >
                {t(state)}
              </span>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
                <ShieldAlert className="mt-0.5 shrink-0" size={18} />
                <div>
                  <b>{t("Demonstration only")}</b>
                  <p className="mt-1 text-xs leading-5"> {t("The text below is synthetic change data created to demonstrate review mechanics. It does not assert a real government fee change.")} </p>
                </div>
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-line p-5">
                  <p className="text-xs font-semibold text-muted">{t("SOURCE")}</p>
                  <h3 className="mt-3 font-semibold">
                    FoSCoS eligibility guidance
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Food Safety and Standards Authority of India
                  </p>
                  <a
                    href="https://foscos.fssai.gov.in/"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand"
                  > {t("Open official portal")} <ExternalLink size={12} />
                  </a>
                </div>
                <div className="rounded-2xl border border-line p-5">
                  <p className="text-xs font-semibold text-muted"> {t("IMPACT ANALYSIS · FOOD-BUSINESS SAMPLE ONLY")} </p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-xl bg-surface-2 p-3">
                      <b className="block text-lg">1</b>{t("procedure")} </div>
                    <div className="rounded-xl bg-surface-2 p-3">
                      <b className="block text-lg">2</b>{t("claims")} </div>
                    <div className="rounded-xl bg-surface-2 p-3">
                      <b className="block text-lg">1</b>{t("roadmap")} </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 overflow-hidden rounded-2xl border border-line">
                <div className="border-b border-line bg-surface-2 px-5 py-3 text-xs font-semibold"> {t("EXACT CONTENT DIFF · SYNTHETIC")} </div>
                <div className="grid font-mono text-sm md:grid-cols-2">
                  <div className="border-b border-line bg-red-50 p-5 text-red-900 dark:bg-red-950 dark:text-red-100 md:border-b-0 md:border-r">
                    <span className="mb-2 block text-xs font-sans font-semibold"> {t("Previous snapshot")} </span> {t("- Fee value: DEMO ₹500")} </div>
                  <div className="bg-emerald-50 p-5 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
                    <span className="mb-2 block text-xs font-sans font-semibold"> {t("New snapshot")} </span> {t("+ Fee value: DEMO ₹750")} </div>
                </div>
              </div>
              {state === "pending" ? (
                <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
                  <button
                    onClick={() => decide("rejected")}
                    className="button-secondary"
                  >
                    <X size={16} /> {t("Reject change")} </button>
                  <button
                    onClick={() => decide("approved")}
                    className="button-primary"
                  >
                    <Check size={16} /> {t("Approve demo change")} </button>
                </div>
              ) : (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-2 p-4">
                  <div>
                    <b className="text-sm">{t("Decision recorded")}</b>
                    <p className="mt-1 text-xs text-muted"> {t("Browser-local audit event recorded ·")} {t(state === "approved" ? "demo version v1.4" : "demo version v1.3 retained")}
                    </p>
                  </div>
                  <button
                    onClick={() => updateDemo((current) => ({ ...current, review: "pending", audit: [...current.audit, { action: "Synthetic review reset", at: new Date().toISOString() }].slice(-100) }))}
                    className="button-secondary !min-h-9 text-xs"
                  >
                    <RefreshCw size={14} /> {t("Reset demo")} </button>
                </div>
              )}
            </div>
          </section>}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/app/goals/home-food-business/roadmap"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand"
          > {t("Return to citizen roadmap")} <ArrowRight size={15} />
          </Link>
        </div>
      </main>
    </>
  );
}
function Metric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="card p-5">
      <span className="text-brand [&>svg]:size-5">{icon}</span>
      <b className="mt-5 block text-2xl">{t(value)}</b>
      <p className="mt-1 text-xs text-muted">{t(label)}</p>
    </div>
  );
}
