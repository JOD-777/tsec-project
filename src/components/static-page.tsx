"use client";
import { useTranslation } from "@/lib/use-translation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Landmark, ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
export function StaticPage({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  const { t } = useTranslation();
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="shell min-h-[65vh] py-16 md:py-24">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,.7fr)] lg:gap-12">
          <div>
            <p className="eyebrow">{t(eyebrow)}</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-.055em] sm:text-5xl md:text-7xl">
              {t(title)}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-muted">
              {t(body)}
            </p>
            <Link href="/demo" className="button-primary mt-8"> {t("Explore the sample demo")} <ArrowRight size={16} />
            </Link>
          </div>
          <aside className="card relative overflow-hidden p-6">
            <div className="absolute -right-12 -top-12 size-40 rounded-full bg-accent/40 blur-3xl" />
            <span className="grid size-12 place-items-center rounded-2xl bg-brand text-white">
              <Landmark />
            </span>
            <h2 className="mt-8 text-xl font-semibold"> {t("The CivicFlow promise")} </h2>
            <div className="mt-5 space-y-4 text-sm text-muted">
              <p className="flex gap-3">
                <ShieldCheck className="shrink-0 text-brand" size={18} /> {t("AI can explain and organise, but never becomes the source of legal truth.")} </p>
              <p className="flex gap-3">
                <CheckCircle2 className="shrink-0 text-brand" size={18} /> {t("Every procedural claim displays its evidence and verification state.")} </p>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
