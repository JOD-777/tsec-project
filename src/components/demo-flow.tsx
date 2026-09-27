"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  CircleAlert,
  LoaderCircle,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";

const pipeline = [
  "Understanding your goal",
  "Resolving jurisdiction",
  "Finding official sources",
  "Structuring requirements",
  "Checking dependencies",
  "Building your roadmap",
];
type Intent = {
  normalizedGoal: string;
  jurisdictionHints: {
    country: string | null;
    state: string | null;
    city: string | null;
    localBody: string | null;
  };
  missingFields: string[];
  confidence: number;
  mode: "live" | "demo";
  providerModel: string;
  latencyMs?: number;
  notice: string;
};

export function DemoFlow() {
  const params = useSearchParams();
  const goal = params.get("goal") || "Start a home food business in Mumbai";
  const [stage, setStage] = useState<"questions" | "building" | "ready">(
    "questions",
  );
  const [progress, setProgress] = useState(0);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [intentState, setIntentState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const fetchIntent = useCallback(async () => {
    try {
      const response = await fetch("/api/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: goal }),
      });
      if (!response.ok) throw new Error("Could not interpret this goal");
      setIntent(await response.json());
      setIntentState("ready");
    } catch {
      setIntentState("error");
    }
  }, [goal]);
  const retryIntent = () => {
    setIntentState("loading");
    void fetchIntent();
  };
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: goal }),
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Could not interpret this goal");
        return response.json();
      })
      .then((data) => {
        setIntent(data);
        setIntentState("ready");
      })
      .catch((error) => {
        if (error instanceof Error && error.name !== "AbortError")
          setIntentState("error");
      });
    return () => controller.abort();
  }, [goal]);
  useEffect(() => {
    if (stage !== "building") return;
    const id = window.setInterval(
      () =>
        setProgress((current) => {
          if (current >= pipeline.length) {
            window.clearInterval(id);
            setStage("ready");
            return current;
          }
          return current + 1;
        }),
      480,
    );
    return () => window.clearInterval(id);
  }, [stage]);
  const location = intent
    ? [
        intent.jurisdictionHints.country,
        intent.jurisdictionHints.state,
        intent.jurisdictionHints.city,
        intent.jurisdictionHints.localBody,
      ]
        .filter(Boolean)
        .join(" / ")
    : "Resolving jurisdiction…";
  return (
    <div className="min-h-screen">
      <SiteHeader compact />
      <main className="shell py-8 md:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>
        <div className="mx-auto mt-8 max-w-4xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">AI-assisted civic intake</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-.05em] md:text-6xl">
                Build a path you can trust.
              </h1>
            </div>
            <span className="badge">
              <ShieldCheck size={13} />
              Offline-safe by design
            </span>
          </div>
          <div className="card mt-8 overflow-hidden">
            <div className="border-b border-line bg-surface-2/60 p-5 md:p-6">
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand text-white">
                  <BrainCircuit size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[.14em] text-muted">
                    Interpreted goal
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    “{intent?.normalizedGoal || goal}”
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-brand">
                    <MapPin size={15} />
                    <span>{location || "Jurisdiction needs confirmation"}</span>
                  </div>
                </div>
              </div>
              <IntentStatus
                state={intentState}
                intent={intent}
                onRetry={retryIntent}
              />
            </div>
            <div className="p-5 md:p-8">
              {stage === "questions" ? (
                <div className="space-y-6">
                  <div>
                    <p className="eyebrow">Two details change your route</p>
                    <p className="mt-2 text-sm text-muted">
                      We ask only what affects jurisdiction or eligibility.
                      Personal documents are not needed for this demo.
                    </p>
                  </div>
                  <Question
                    label="Where will you operate?"
                    hint="This selects the applicable municipal authority."
                  >
                    <select className="field mt-2">
                      <option>Home premises in Mumbai</option>
                      <option>Commercial premises in Mumbai</option>
                    </select>
                  </Question>
                  <Question
                    label="What will you primarily do?"
                    hint="The activity changes the official eligibility path."
                  >
                    <select className="field mt-2">
                      <option>Prepare and deliver food</option>
                      <option>Package food products</option>
                      <option>Resell packaged goods</option>
                    </select>
                  </Question>
                  <Question
                    label="Do you already have a food business registration or licence?"
                    hint="Completed work will be hidden from your next actions."
                  >
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <label className="choice">
                        <input defaultChecked type="radio" name="existing" />
                        No
                      </label>
                      <label className="choice">
                        <input type="radio" name="existing" />
                        Yes
                      </label>
                    </div>
                  </Question>
                  <button
                    className="button-primary w-full"
                    onClick={() => {
                      setProgress(0);
                      setStage("building");
                    }}
                  >
                    Compile my roadmap <ArrowRight size={17} />
                  </button>
                </div>
              ) : null}
              {stage === "building" ? (
                <div>
                  <div className="mb-7 flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-accent text-accent-ink">
                      <Sparkles size={18} />
                    </span>
                    <div>
                      <p className="font-semibold">Compiling your procedure</p>
                      <p className="text-sm text-muted">
                        Matching verified source snapshots to deterministic
                        dependency rules.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {pipeline.map((item, index) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-xl border border-line px-4 py-3"
                      >
                        <span
                          className={`grid size-7 place-items-center rounded-full text-xs ${index < progress ? "bg-brand text-white" : index === progress ? "bg-accent text-accent-ink" : "bg-surface-2 text-muted"}`}
                        >
                          {index < progress ? <Check size={14} /> : index + 1}
                        </span>
                        <span
                          className={
                            index > progress ? "text-muted" : "font-medium"
                          }
                        >
                          {item}
                        </span>
                        {index === progress ? (
                          <LoaderCircle
                            className="ml-auto animate-spin text-brand"
                            size={16}
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {stage === "ready" ? (
                <div className="py-3 text-center">
                  <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand text-white shadow-lg">
                    <Check size={30} />
                  </span>
                  <h2 className="mt-5 text-3xl font-semibold tracking-tight">
                    Your roadmap is ready
                  </h2>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted">
                    8 steps · 4 official portals · 2 parallel paths · every
                    factual item carries a verification label.
                  </p>
                  <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                      className="button-primary"
                      href="/app/goals/home-food-business/roadmap"
                    >
                      Open interactive roadmap <ArrowRight size={17} />
                    </Link>
                    <button
                      className="button-secondary"
                      onClick={() => setStage("questions")}
                    >
                      <RotateCcw size={16} />
                      Edit answers
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <p className="mt-4 text-center text-xs leading-5 text-muted">
            Demo guidance is not legal advice. Confirm current requirements on
            each linked official portal.
          </p>
        </div>
      </main>
    </div>
  );
}

function IntentStatus({
  state,
  intent,
  onRetry,
}: {
  state: "loading" | "ready" | "error";
  intent: Intent | null;
  onRetry: () => void;
}) {
  if (state === "loading")
    return (
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs text-muted">
        <LoaderCircle className="animate-spin" size={14} />
        Securely interpreting your goal…
      </div>
    );
  if (state === "error")
    return (
      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
        <span className="flex items-center gap-2">
          <CircleAlert size={14} />
          Goal interpretation failed.
        </span>
        <button onClick={onRetry} className="font-semibold underline">
          Retry
        </button>
      </div>
    );
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
      <span
        className={`badge ${intent?.mode === "live" ? "!border-emerald-200 !bg-emerald-50 !text-emerald-800" : "!border-amber-200 !bg-amber-50 !text-amber-800"}`}
      >
        <WandSparkles size={12} />
        {intent?.mode === "live" ? "Live AI" : "Safe demo mode"}
      </span>
      <span className="text-muted">
        {intent?.providerModel}
        {intent?.latencyMs ? ` · ${(intent.latencyMs / 1000).toFixed(1)}s` : ""}
      </span>
      <span className="sr-only">{intent?.notice}</span>
    </div>
  );
}
function Question({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="font-semibold">{label}</legend>
      <p className="mt-1 text-xs text-muted">{hint}</p>
      {children}
    </fieldset>
  );
}
