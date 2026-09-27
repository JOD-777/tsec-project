import Link from "next/link";
import {
  ArrowRight,
  Baby,
  Building2,
  Car,
  Home,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
const services = [
  {
    i: <UtensilsCrossed />,
    t: "Start a home food business",
    j: "Mumbai · Demo workflow",
    v: true,
  },
  {
    i: <Baby />,
    t: "Get a birth certificate",
    j: "Jurisdiction required",
    v: false,
  },
  { i: <Store />, t: "Register a small business", j: "India", v: false },
  { i: <Car />, t: "Renew a driving licence", j: "State-specific", v: false },
  { i: <Home />, t: "Register property", j: "Local jurisdiction", v: false },
  { i: <Building2 />, t: "Register a society", j: "State-specific", v: false },
];
export default function Services() {
  return (
    <>
      <SiteHeader />
      <main className="shell py-16">
        <p className="eyebrow">Service explorer</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-5xl font-semibold tracking-[-.05em] md:text-7xl">
              Start with your goal.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
              CivicFlow supports deep verified workflows first, then expands
              service by service.
            </p>
          </div>
          <Link href="/demo" className="button-primary">
            Describe another goal <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <article
              key={s.t}
              className={`card group relative overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-xl ${s.v ? "ring-1 ring-brand/20" : ""}`}
            >
              <div className="absolute right-0 top-0 size-24 -translate-y-1/2 translate-x-1/2 rounded-full bg-accent/30 blur-2xl" />
              <span className="grid size-11 place-items-center rounded-2xl bg-surface-2 text-brand transition group-hover:bg-brand group-hover:text-white">
                {s.i}
              </span>
              <div className="mt-8 flex gap-2">
                {s.v ? (
                  <span className="badge !bg-emerald-50 !text-emerald-800">
                    Verified demo
                  </span>
                ) : (
                  <span className="badge">AI discovery</span>
                )}
              </div>
              <h2 className="mt-4 text-xl font-semibold">{s.t}</h2>
              <p className="mt-2 text-sm text-muted">{s.j}</p>
              <Link
                href={`/demo?goal=${encodeURIComponent(s.t + (i === 0 ? " in Mumbai" : ""))}`}
                className="mt-7 inline-flex items-center gap-1 text-sm font-semibold text-brand"
              >
                Build roadmap <ArrowRight size={15} />
              </Link>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
