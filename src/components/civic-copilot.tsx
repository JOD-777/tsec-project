"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
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

type Message = { role: "assistant" | "user"; text: string; meta?: string };
const starter: Message = {
  role: "assistant",
  text: "I can explain this roadmap, surface the next action, and show which claims still need official verification.",
  meta: "Verified-context assistant",
};
const prompts = [
  "What should I do next?",
  "Which documents can I reuse?",
  "How is this information verified?",
];

export function CivicCopilot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([starter]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const openCopilot = () => setOpen(true);
    window.addEventListener("civicflow:open-copilot", openCopilot);
    return () =>
      window.removeEventListener("civicflow:open-copilot", openCopilot);
  }, []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
  if (pathname === "/login") return null;

  async function ask(text: string) {
    const clean = text.trim();
    if (clean.length < 3 || loading) return;
    setOpen(true);
    setQuestion("");
    setLoading(true);
    setMessages((current) => [...current, { role: "user", text: clean }]);
    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: clean, pathname }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Copilot request failed");
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: data.answer,
          meta:
            data.mode === "live"
              ? `Live AI · ${data.model}`
              : "Verified safe mode",
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "I could not reach the assistant. Open the roadmap and use its official-source links while I reconnect.",
          meta: "Connection fallback",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(question);
  }
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`copilot-launcher ${open ? "pointer-events-none scale-90 opacity-0" : ""}`}
        aria-label="Open CivicFlow Copilot"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
        <Sparkles size={20} />
        <span className="hidden sm:inline">Ask CivicFlow</span>
        <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-background bg-emerald-400" />
      </button>
      <aside
        className={`copilot-panel ${open ? "translate-y-0 opacity-100 sm:translate-x-0" : "pointer-events-none translate-y-8 opacity-0 sm:translate-x-8 sm:translate-y-0"}`}
        aria-hidden={!open}
        aria-label="CivicFlow Copilot"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-brand text-white">
              <Bot size={19} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">CivicFlow Copilot</h2>
                <span className="size-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-[11px] text-muted">
                Grounded in the visible demo evidence
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="icon-button"
            aria-label="Close CivicFlow Copilot"
          >
            <X size={18} />
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={message.role === "user" ? "ml-10" : "mr-5"}
              >
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "rounded-br-sm bg-brand text-white" : "rounded-bl-sm border border-line bg-surface-2"}`}
                >
                  <p className="whitespace-pre-line">{message.text}</p>
                </div>
                {message.meta ? (
                  <p className="mt-1.5 flex items-center gap-1.5 px-1 text-[10px] text-muted">
                    <ShieldCheck size={11} />
                    {message.meta}
                  </p>
                ) : null}
              </div>
            ))}
            {loading ? (
              <div className="mr-16 rounded-2xl rounded-bl-sm border border-line bg-surface-2 px-4 py-3">
                <span className="flex items-center gap-2 text-xs text-muted">
                  <LoaderCircle className="animate-spin" size={14} />
                  Checking the verified context…
                </span>
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
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}
          <div className="border-t border-line bg-surface/90 p-4">
            <form
              onSubmit={submit}
              className="flex items-end gap-2 rounded-2xl border border-line bg-background p-2 focus-within:border-brand"
            >
              <label className="sr-only" htmlFor="copilot-question">
                Ask CivicFlow
              </label>
              <textarea
                id="copilot-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void ask(question);
                  }
                }}
                rows={1}
                placeholder="Ask about this civic path…"
                className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
              />
              <button
                disabled={question.trim().length < 3 || loading}
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-white transition disabled:opacity-40"
                aria-label="Send question"
              >
                <ArrowUp size={17} />
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between text-[10px] text-muted">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={11} />
                No AI claim is treated as official
              </span>
              <button
                onClick={() => setMessages([starter])}
                className="flex items-center gap-1 hover:text-foreground"
              >
                <Minimize2 size={11} />
                Reset
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
