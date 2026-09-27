"use client";
import { useTranslation } from "@/lib/use-translation";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  CircleCheckBig,
  FileSearch,
  GitBranch,
  Globe2,
  Languages,
  Mic,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { translations } from "@/lib/demo-data";
import { useLocalDemo, updateDemo, type Locale } from "@/lib/local-demo";
import { useSpeechInput } from "@/lib/use-speech-input";
const examples = [
  "Start a home food business in Mumbai",
  "Get a birth certificate",
  "Register a small business",
  "Renew a driving licence",
];
export function LandingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const { locale: lang } = useLocalDemo();
  const speech = useSpeechInput(setGoal, lang);
  const copy = translations[lang];
  function submit(e: FormEvent) {
    e.preventDefault();
    router.push(
      `/demo?goal=${encodeURIComponent(goal.trim() || examples[0])}`,
    );
  }
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section className="shell grid min-h-[calc(100dvh-4rem)] items-center gap-8 py-10 sm:gap-12 sm:py-16 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,.92fr)] lg:py-24">
          <div className="min-w-0 animate-rise">
            <div className="mb-7 flex flex-wrap gap-2">
              <span className="badge">
                <ShieldCheck size={13} className="text-brand" /> {t("Official source links")} </span>
              <span className="badge">
                <GitBranch size={13} className="text-brand" /> {t("Dependency-aware")} </span>
              <span className="badge">
                <Languages size={13} className="text-brand" />
                English · हिंदी · मराठी
              </span>
            </div>
            <p className="eyebrow mb-4"> {t("Municipal bureaucracy path visualizer")} </p>
            <h1 className="display max-w-3xl text-balance">{copy.headline}</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted"> {t("Tell CivicFlow what you need to achieve. It resolves the jurisdiction, assembles official sources, and turns scattered requirements into one executable roadmap.")} </p>
            <form onSubmit={submit} className="card mt-9 p-2">
              <label className="sr-only" htmlFor="goal">
                {copy.prompt}
              </label>
              <div className="flex items-center gap-2">
                <Search className="ml-3 shrink-0 text-muted" size={20} />
                <input
                  id="goal"
                  value={goal}
                  maxLength={500}
                  onChange={(e) => setGoal(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-1 py-4 outline-none"
                  placeholder={copy.prompt}
                />
                <button
                  type="button"
                  className="grid size-11 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-2"
                  aria-label={t(speech.listening ? "Stop voice input" : "Speak your civic goal")}
                  aria-pressed={speech.listening}
                  onClick={speech.toggle}
                >
                  <Mic size={19} />
                </button>
                <button
                  className="button-primary size-12 shrink-0 !p-0"
                  aria-label={t("Build my roadmap")}
                >
                  <ArrowRight />
                </button>
              </div>
            </form>
            {speech.message && <p role="status" className="mt-3 text-sm text-muted">{speech.message}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {examples.map((x) => (
                <button
                  key={x}
                  onClick={() => setGoal(x)}
                  className="rounded-full border border-line bg-surface/70 px-3 py-1.5 text-xs text-muted hover:text-foreground"
                >
                  {t(x)}
                </button>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-2 text-sm">
              <Globe2 size={16} className="text-muted" />
              {Object.entries(translations).map(([key, value]) => (
                <button
                  key={key}
                  className={`rounded-full px-3 py-1 ${lang === key ? "bg-foreground text-background" : "text-muted"}`}
                  aria-pressed={lang === key}
                  onClick={() => updateDemo((current) => ({ ...current, locale: key as Locale }))}
                >
                  {t(value.label)}
                </button>
              ))}
            </div>
          </div>
          <div
            className="relative min-w-0 animate-rise"
            style={{ animationDelay: "120ms" }}
          >
  <div className="absolute inset-0 -z-10 rounded-full bg-accent/30 blur-3xl" />
            <div className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                <div>
                  <p className="text-xs font-semibold text-brand"> {t("SAMPLE ROADMAP PREVIEW")} </p>
                  <p className="mt-1 font-semibold"> {t("Home food business · Mumbai")} </p>
                </div>
                <span className="badge">
                  <span className="size-1.5 rounded-full bg-emerald-500" />{t("8 steps")} </span>
              </div>
              <div className="landing-preview dot-grid relative h-[430px] overflow-hidden p-7">
                <div className="absolute left-[14%] top-[44%] h-px w-[28%] bg-brand/40" />
                <div className="absolute left-[42%] top-[26%] h-[38%] w-px bg-brand/40" />
                <div className="absolute left-[42%] top-[26%] h-px w-[28%] bg-brand/40" />
                <div className="absolute left-[42%] top-[64%] h-px w-[28%] bg-brand/40" />
                <PreviewNode
                  className="left-[3%] top-[36%] sm:left-[5%]"
                  icon={<Sparkles size={16} />}
                  title={t("Understand goal")}
                  label={t("Complete")}
                  complete
                />
                <PreviewNode
                  className="left-[31%] top-[8%] sm:left-[34%]"
                  icon={<Globe2 size={16} />}
                  title={t("Resolve jurisdiction")}
                  label={t("Mumbai · MCGM")}
                />
                <PreviewNode
                  className="left-[31%] top-[47%] sm:left-[34%]"
                  icon={<FileSearch size={16} />}
                  title={t("Verify sources")}
                  label={t("4 official portals")}
                />
                <PreviewNode
                  className="left-[57%] top-[8%] sm:left-[65%]"
                  icon={<GitBranch size={16} />}
                  title={t("Build dependencies")}
                  label={t("2 parallel paths")}
                />
                <PreviewNode
                  className="left-[57%] top-[47%] sm:left-[65%]"
                  icon={<CircleCheckBig size={16} />}
                  title={t("Execute roadmap")}
                  label={t("Next action ready")}
                />
              </div>
              <div className="grid grid-cols-3 border-t border-line bg-surface-2/60 p-4 text-center text-xs">
                <div>
                  <b className="block text-lg">4</b>
                  <span className="text-muted">{t("official sources")}</span>
                </div>
                <div className="border-x border-line">
                  <b className="block text-lg">3</b>
                  <span className="text-muted">{t("authorities")}</span>
                </div>
                <div>
                  <b className="block text-lg">100%</b>
                  <span className="text-muted">{t("claims labelled")}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="border-y border-line bg-surface/60 py-20">
          <div className="shell">
            <p className="eyebrow">{t("From goal to next action")}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Feature
                icon={<Sparkles />}
                n="01"
                title={t("Understand your situation")}
                text="Structured intake asks only clarifying questions that materially change your path."
              />
              <Feature
                icon={<ShieldCheck />}
                n="02"
                title={t("Compile verified evidence")}
                text="Each procedural claim keeps its authority, source URL, freshness and verification state."
              />
              <Feature
                icon={<GitBranch />}
                n="03"
                title={t("Execute in the right order")}
                text="Dependencies reveal blockers, parallel tasks, reusable documents and the next best action."
              />
            </div>
          </div>
        </section>
        <section className="shell py-24">
          <div className="grid items-end gap-8 md:grid-cols-2">
            <div>
              <p className="eyebrow">{t("Built for citizen trust")}</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-.045em] md:text-6xl"> {t("Not another government chatbot.")} </h2>
            </div>
            <p className="max-w-xl text-lg leading-8 text-muted"> {t("CivicFlow separates verified facts from AI explanations. Every step can show why it exists, where it came from, what unlocks it, and when its source was last checked.")} </p>
          </div>
          <div className="mt-12 grid gap-3 md:grid-cols-4">
            {[
              "Jurisdiction resolver",
              "Source registry",
              "Deterministic rule engine",
              "Human validation workflow",
            ].map((x, i) => (
              <div key={x} className="card p-5">
                <Check className="mb-8 text-brand" />
                <span className="text-xs text-muted">0{i + 1}</span>
                <h3 className="mt-2 font-semibold">{t(x)}</h3>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
function PreviewNode({
  className,
  title,
  label,
  icon,
  complete = false,
}: {
  className: string;
  title: string;
  label: string;
  icon: React.ReactNode;
  complete?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={`preview-node absolute w-36 rounded-2xl border border-line bg-surface p-3 shadow-lg sm:w-40 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`grid size-7 place-items-center rounded-lg ${complete ? "bg-brand text-white" : "bg-accent text-accent-ink"}`}
        >
          {icon}
        </span>
        <span className="text-[11px] font-semibold">{t(title)}</span>
      </div>
      <p className="mt-3 text-[10px] text-muted">{t(label)}</p>
    </div>
  );
}
function Feature({
  icon,
  n,
  title,
  text,
}: {
  icon: React.ReactNode;
  n: string;
  title: string;
  text: string;
}) {
  const { t } = useTranslation();
  return (
    <article className="card p-6">
      <div className="flex items-center justify-between text-brand">
        {icon}
        <span className="font-mono text-xs">{n}</span>
      </div>
      <h3 className="mt-12 text-xl font-semibold tracking-tight">{t(title)}</h3>
      <p className="mt-3 text-sm leading-6 text-muted">{t(text)}</p>
    </article>
  );
}
