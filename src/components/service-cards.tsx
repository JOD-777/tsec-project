"use client";
import { useTranslation } from "@/lib/use-translation";
import Link from "next/link";
import { ArrowRight, Baby, Building2, Car, Home, Store, UtensilsCrossed } from "lucide-react";
import { procedures } from "@/lib/procedures";

const icons = [UtensilsCrossed, Baby, Store, Car, Home, Building2];
export function ServiceCards({ mode = "services" }: { mode?: "services" | "demo" }) {
  const { t } = useTranslation();
  return <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{procedures.map((procedure, index) => {
    const Icon = icons[index];
    return <article key={procedure.id} className="card group relative overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-xl ring-1 ring-brand/20">
      <div className="absolute right-0 top-0 size-24 -translate-y-1/2 translate-x-1/2 rounded-full bg-accent/30 blur-2xl" />
      <span className="grid size-11 place-items-center rounded-2xl bg-surface-2 text-brand transition group-hover:bg-brand group-hover:text-white"><Icon /></span>
      <div className="mt-8"><span className="badge !bg-emerald-50 !text-emerald-800">{t(mode === "demo" ? "Interactive sample" : "Procedure available")}</span></div>
      <h2 className="mt-4 text-xl font-semibold">{t(procedure.title)}</h2><p className="mt-2 text-sm text-muted">{t(procedure.jurisdiction)}</p>
      {mode === "services" ? <><p className="mt-4 text-sm leading-6 text-muted">{t(procedure.description)}</p><Link href={`/services/${procedure.id}`} className="mt-5 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand">{t("View procedure details")} <ArrowRight size={15} /></Link></> : <><p className="mt-4 text-sm leading-6 text-muted">{t("Answer a few questions, explore the dependency graph and try saving your progress.")}</p><Link href={`/demo?goal=${procedure.id}`} className="mt-5 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand">{t("Build sample roadmap")} <ArrowRight size={15} /></Link></>}
    </article>;
  })}</div>;
}
