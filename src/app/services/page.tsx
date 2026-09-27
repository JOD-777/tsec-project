"use client";
import { useTranslation } from "@/lib/use-translation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ServiceCards } from "@/components/service-cards";
export default function Services() {
  const { t } = useTranslation();
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="shell py-16">
        <p className="eyebrow">{t("Service explorer")}</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-4xl font-semibold sm:text-5xl tracking-[-.05em] md:text-7xl"> {t("Start with your goal.")} </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted"> {t("Explore sample workflows with personalized questions, official portal links and progress tracking.")} </p>
          </div>
          <Link href="/demo" className="button-primary"> {t("Choose a demo")} <ArrowRight size={16} />
          </Link>
        </div>
        <ServiceCards />
      </main>
      <SiteFooter />
    </>
  );
}
