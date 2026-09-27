import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ServiceCards } from "@/components/service-cards";
export default function Services() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="shell py-16">
        <p className="eyebrow">Service explorer</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-4xl font-semibold sm:text-5xl tracking-[-.05em] md:text-7xl">
              Start with your goal.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
              Explore sample workflows with personalized questions, official portal links and progress tracking.
            </p>
          </div>
          <Link href="/demo" className="button-primary">
            Choose a demo <ArrowRight size={16} />
          </Link>
        </div>
        <ServiceCards />
      </main>
      <SiteFooter />
    </>
  );
}
