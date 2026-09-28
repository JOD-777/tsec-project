"use client";
import { useTranslation } from "@/lib/use-translation";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ArrowUp,
  Bot,
  CheckCircle2,
  LoaderCircle,
  Minimize2,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useWorkflowDemo } from "@/lib/local-demo";
import { getProcedure } from "@/lib/procedures";
import { copilotProcedure } from "@/lib/copilot-context";
import {
  Message as AIMessage,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";

type Message = { role: "assistant" | "user"; text: string; meta?: string };
function starterMessage(hasProcedure: boolean): Message {
  return hasProcedure
    ? {
        role: "assistant",
        text: "I can explain this roadmap, surface the next action, and show which claims still need official verification.",
        meta: "Sample-context assistant",
      }
    : {
        role: "assistant",
        text: "Tell me which civic service you need. I’ll route you to a supported procedure and keep official sources separate from guidance.",
        meta: "Service catalogue assistant",
      };
}
const prompts = [
  "What should I do next?",
  "Which documents can I reuse?",
  "How is this information verified?",
];

export function CivicCopilot() {
  const pathname = usePathname();
  const params = useSearchParams();
  const procedureId = copilotProcedure(pathname, params.get("goal"));
  if (pathname === "/login") return null;
  return <CopilotSession key={procedureId ?? "catalogue"} pathname={pathname} procedureId={procedureId} />;
}

function CopilotSession({ pathname, procedureId }: { pathname: string; procedureId: string | null }) {
  const { t, locale } = useTranslation();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([starterMessage(Boolean(procedureId))]);
  const [loading, setLoading] = useState(false);
  const demo = useWorkflowDemo(procedureId ?? "home-food-business");
  const requestRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const openCopilot = (event: Event) => { setOpen(true); const detail = (event as CustomEvent<unknown>).detail; if (typeof detail === "string") setQuestion(detail.slice(0, 600)); };
    window.addEventListener("civicflow:open-copilot", openCopilot);
    return () =>
      window.removeEventListener("civicflow:open-copilot", openCopilot);
  }, []);
  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading, open]);
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus({ preventScroll: true });
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); launcherRef.current?.focus({ preventScroll: true }); } };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [open]);
  useEffect(() => () => requestRef.current?.abort(), []);

  async function ask(text: string) {
    const clean = text.trim().slice(0, 600);
    if (clean.length < 3 || loading) return;
    setOpen(true);
    setQuestion("");
    setLoading(true);
    setMessages((current) => [...current, { role: "user", text: clean }]);
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: clean,
          pathname,
          locale,
          workflow: procedureId ? { ...demo.workflow, notes: {} } : undefined,
          history: messages.slice(-6).map(({ role, text: content }) => ({ role, content })),
        }),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(25_000)]),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Copilot request failed");
      if (typeof data.answer !== "string" || !data.answer.trim()) throw new Error("Empty assistant response");
      if (controller.signal.aborted) return;
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: data.answer,
          meta:
            data.mode === "live"
              ? `Live AI · ${data.model}`
              : "Verified guidance fallback · AI temporarily unavailable",
        },
      ]);
    } catch {
      if (controller.signal.aborted) return;
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: t("The live assistant is unavailable. {description} Use the roadmap for current progress and official-source links.", { description: t(getProcedure(procedureId!)?.description ?? "") }),
          meta: "Connection fallback",
        },
      ]);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(question);
  }
  function closePanel() {
    setOpen(false);
    launcherRef.current?.focus({ preventScroll: true });
  }
  function resetConversation() {
    requestRef.current?.abort();
    requestRef.current = null;
    setLoading(false);
    setQuestion("");
    setMessages([starterMessage(Boolean(procedureId))]);
    inputRef.current?.focus({ preventScroll: true });
  }
  return (
    <>
      <button
        ref={launcherRef}
        tabIndex={open ? -1 : 0}
        onClick={() => setOpen(true)}
        className={`copilot-launcher ${open ? "pointer-events-none scale-90 opacity-0" : ""}`}
        aria-label={t("Open CivicFlow Copilot")}
      >
        <span className="absolute inset-0 animate-pulse rounded-full bg-accent/20" />
        <Sparkles size={20} />
        <span className="hidden sm:inline">{t("Ask CivicFlow")}</span>
        <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-background bg-emerald-400" />
      </button>
      <div
        aria-hidden="true"
        onClick={closePanel}
        className={`copilot-backdrop ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        ref={panelRef}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = [...(panelRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), textarea, a[href], input:not(:disabled)') ?? [])].filter((element) => element.offsetParent !== null);
          const first = controls[0], last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }}
        className={`copilot-panel ${open ? "translate-y-0 opacity-100 sm:translate-x-0" : "pointer-events-none translate-y-8 opacity-0 sm:translate-x-8 sm:translate-y-0"}`}
        data-open={open}
        aria-hidden={!open}
        inert={!open}
        aria-labelledby="copilot-title"
        aria-modal="true"
        role="dialog"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand text-white">
              <Bot size={19} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="copilot-title" className="truncate font-semibold">{t("CivicFlow Copilot")}</h2>
                <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
              </div>
              <p className="truncate text-[11px] text-muted">
                {t(procedureId ? getProcedure(procedureId)!.title : "Explore the service catalogue")}
              </p>
            </div>
          </div>
          <button
            onClick={closePanel}
            className="icon-button"
            aria-label={t("Close CivicFlow Copilot")}
          >
            <X size={18} />
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col">
          <div role="log" aria-label={t("Assistant conversation")} aria-live="polite" className="copilot-transcript flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
            {messages.map((message, index) => (
              <AIMessage
                from={message.role}
                key={`${message.role}-${index}`}
                className={message.role === "user" ? "ml-8" : "mr-3"}
              >
                <MessageContent
                  className={`!rounded-2xl !px-3.5 !py-2.5 text-sm leading-6 ${message.role === "user" ? "!rounded-br-sm !bg-brand !text-white" : "!rounded-bl-sm border border-line !bg-surface-2"}`}
                >
                  {message.role === "assistant" ? (
                    <MessageResponse className="break-words [overflow-wrap:anywhere]">{t(message.text)}</MessageResponse>
                  ) : (
                    <p className="whitespace-pre-line break-words [overflow-wrap:anywhere]">{message.text}</p>
                  )}
                </MessageContent>
                {message.meta ? (
                  <p className="mt-1.5 flex items-center gap-1.5 px-1 text-[10px] text-muted">
                    <ShieldCheck size={11} />
                    {t(message.meta)}
                  </p>
                ) : null}
              </AIMessage>
            ))}
            {loading ? (
              <div className="mr-16 rounded-2xl rounded-bl-sm border border-line bg-surface-2 px-4 py-3">
                <span className="flex items-center gap-2 text-xs text-muted">
                  <LoaderCircle className="animate-spin" size={14} /> {t("Consulting CivicFlow AI…")} </span>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>
          {messages.length === 1 ? (
            <div className="flex gap-2 overflow-x-auto px-5 pb-3">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => void ask(prompt)}
                  className="shrink-0 rounded-full border border-line bg-surface px-3 py-2 text-xs transition hover:border-brand hover:text-brand"
                >
                  {t(prompt)}
                </button>
              ))}
            </div>
          ) : null}
          <div className="shrink-0 border-t border-line bg-surface/95 p-3 sm:p-4">
            <form
              onSubmit={submit}
              className="flex items-end gap-2 rounded-2xl border border-line bg-background p-2 focus-within:border-brand"
            >
              <label className="sr-only" htmlFor="copilot-question"> {t("Ask CivicFlow")} </label>
              <textarea
                ref={inputRef}
                id="copilot-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    void ask(question);
                  }
                }}
                rows={1}
                maxLength={600}
                autoComplete="off"
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
                data-lt-active="false"
                data-ms-editor="false"
                placeholder={t("Ask about this civic path…")}
                className="copilot-input max-h-24 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
              />
              <button
                type="submit"
                disabled={question.trim().length < 3 || loading}
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-white transition disabled:opacity-40"
                aria-label={t("Send question")}
              >
                <ArrowUp size={17} />
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between text-[10px] text-muted">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={11} /> {t("No AI claim is treated as official")} </span>
              <button
                type="button"
                disabled={loading}
                onClick={resetConversation}
                className="flex items-center gap-1 hover:text-foreground"
              >
                <Minimize2 size={11} /> {t("Reset")} </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
