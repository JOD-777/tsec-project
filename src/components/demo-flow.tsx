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
import { useWorkflowDemo, updateWorkflow } from "@/lib/local-demo";
import { defaultProfile, resolveProcedure, type Procedure, type Profile } from "@/lib/procedures";
import { ServiceCards } from "@/components/service-cards";
import { compileProcedure, compileWorkflow, workflowSummary, type Answers } from "@/lib/workflow";

const pipeline = [
  "Understanding your goal",
  "Resolving jurisdiction",
  "Loading sample source catalogue",
  "Applying your demo profile",
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
  const goal = params.get("goal");
  if (!goal) return <div className="min-h-screen"><SiteHeader compact /><main id="main-content" className="shell pb-28 pt-12"><p className="eyebrow">Try the demo</p><h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">Choose a sample to try.</h1><p className="mt-4 max-w-2xl text-muted">See how CivicFlow works: answer questions, build a roadmap and complete a step. No login is needed, and sample progress stays in this browser.</p><Link href="/services" className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm text-brand">Looking for service requirements? Browse services <ArrowRight size={15} /></Link><ServiceCards mode="demo" /></main></div>;
  const procedure = resolveProcedure(goal);
  if (!procedure) return <div className="min-h-screen"><SiteHeader compact /><main id="main-content" className="shell py-12"><section className="card mx-auto max-w-2xl p-6"><p className="eyebrow">Procedure coverage</p><h1 className="mt-3 text-3xl font-semibold">This goal needs another procedure.</h1><p className="mt-4 break-words text-sm text-muted">Your goal: “{goal.slice(0, 500)}”</p><p className="mt-4 text-sm text-muted">Choose a isFood sample and confirm its jurisdiction before building a roadmap.</p><Link href="/demo" className="button-primary mt-6">Explore sample workflows <ArrowRight size={16} /></Link></section></main></div>;
  return <DemoIntake key={procedure.id + goal} goal={goal === procedure.id ? `${procedure.title} in ${procedure.jurisdiction}` : goal} procedure={procedure} />;
}

function DemoIntake({ goal, procedure }: { goal: string; procedure: Procedure }) {
  const isFood = procedure.id === "home-food-business";
  const demo = useWorkflowDemo(procedure.id);
  const [draftProfile, setDraftProfile] = useState<Profile | null>(null);
  const profile = draftProfile ?? { ...defaultProfile(procedure), ...demo.workflow.profile };
  const [jurisdictionConfirmed, setJurisdictionConfirmed] = useState(false);
  const [draft, setDraft] = useState<Answers | null>(null);
  const answers = draft ?? demo.workflow.answers;
  const [stage, setStage] = useState<"questions" | "building" | "ready">(
    "questions",
  );
  const [progress, setProgress] = useState(0);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [intentState, setIntentState] = useState<"loading" | "ready" | "error">(
    isFood ? "loading" : "ready",
  );
  const fetchIntent = useCallback(async () => {
    try {
      const response = await fetch("/api/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: goal }),
        signal: AbortSignal.timeout(25_000),
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
    if (!isFood) return;
    const controller = new AbortController();
    fetch("/api/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: goal }),
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(25_000)]),
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
  }, [goal, isFood]);
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
  const location = procedure.jurisdiction;
  return (
    <div className="min-h-screen">
      <SiteHeader compact />
      <main id="main-content" className="shell pb-28 pt-8 md:pt-12">
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
                    “{isFood ? intent?.normalizedGoal || goal : procedure.title}”
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-brand">
                    <MapPin size={15} />
                    <span>{location || "Jurisdiction needs confirmation"}</span>
                  </div>
                </div>
              </div>
              {isFood ? <IntentStatus
                state={intentState}
                intent={intent}
                onRetry={retryIntent}
              /> : <p className="mt-4 text-xs text-muted">Deterministic sample · works without AI or backend credentials</p>}
            </div>
            <div className="p-5 md:p-8">
              {stage === "questions" ? (
                <div className="space-y-6">
                  <div>
                    <p className="eyebrow">Confirm your sample profile</p>
                    <p className="mt-2 text-sm text-muted">
                      We ask only what affects jurisdiction or eligibility.
                      Personal documents are not needed for this demo.
                    </p>
                  </div>
                  {isFood ? <>
                  <Question
                    label="Where will you operate?"
                    hint="This selects the applicable municipal authority."
                  >
                    <select aria-label="Where will you operate?" className="field mt-2" value={answers.premises} onChange={(event) => setDraft({ ...answers, premises: event.target.value as Answers["premises"] })}>
                      <option value="home">Home premises in Mumbai</option>
                      <option value="commercial">Commercial premises in Mumbai</option>
                    </select>
                  </Question>
                  <Question
                    label="What will you primarily do?"
                    hint="The activity changes the official eligibility path."
                  >
                    <select aria-label="What will you primarily do?" className="field mt-2" value={answers.activity} onChange={(event) => setDraft({ ...answers, activity: event.target.value as Answers["activity"] })}>
                      <option value="prepare">Prepare and deliver food</option>
                      <option value="package">Package food products</option>
                      <option value="resell">Resell packaged goods</option>
                    </select>
                  </Question>
                  <Question
                    label="Do you already have a food business registration or licence?"
                    hint="Completed work will be hidden from your next actions."
                  >
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <label className="choice">
                        <input checked={!answers.existingRegistration} onChange={() => setDraft({ ...answers, existingRegistration: false })} type="radio" name="existing" />
                        No
                      </label>
                      <label className="choice">
                        <input checked={answers.existingRegistration} onChange={() => setDraft({ ...answers, existingRegistration: true })} type="radio" name="existing" />
                        Yes
                      </label>
                    </div>
                  </Question>
                  </> : procedure.questions.map((question) => <Question key={question.id} label={question.label} hint="Your answer personalizes this sample roadmap."><select className="field mt-2" aria-label={question.label} value={profile[question.id]} onChange={(event) => setDraftProfile({ ...profile, [question.id]: event.target.value })}>{question.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Question>)}
                  <p className="text-sm leading-6 text-muted">{procedure.description}</p>
                  <label className="flex min-h-11 items-start gap-3 text-sm"><input className="mt-1 accent-brand" type="checkbox" checked={jurisdictionConfirmed} onChange={(event) => setJurisdictionConfirmed(event.target.checked)} /><span>Use the {procedure.jurisdiction} sample jurisdiction.</span></label>
                  <button
                    className="button-primary w-full disabled:opacity-50"
                    disabled={!jurisdictionConfirmed}
                    onClick={() => {
                      updateWorkflow(procedure.id, () => isFood ? compileWorkflow(answers) : compileProcedure(procedure.id, profile));
                      setProgress(0);
                      setStage("building");
                    }}
                  >
                    Compile my roadmap <ArrowRight size={17} />
                  </button>
                  <p className="text-xs leading-5 text-muted">Creates a fresh browser-local sample using your answers. Only this service’s sample progress will be replaced. Other saved roadmaps are preserved.</p>
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
                        Preparing the seeded sample and applying your answers.
                        No live government crawl runs in this demo.
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
                    {workflowSummary(demo.workflow).items.length} steps · personalized dependencies · browser-local progress.
                  </p>
                  <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                      className="button-primary"
                      href={`/app/goals/${procedure.id}/roadmap`}
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
