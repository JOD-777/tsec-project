"use client";
import { useTranslation } from "@/lib/use-translation";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Search, X } from "lucide-react";
import { searchCommands, type CivicCommand } from "@/lib/commands";

export function CommandMenu() {
  const { t, locale } = useTranslation();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const router = useRouter();
  const { setTheme } = useTheme();
  const results = searchCommands(query, locale);
  const activeIndex = Math.min(active, Math.max(0, results.length - 1));
  function close() { dialog.current?.close(); }
  function run(command: CivicCommand) {
    close();
    if (command.theme) setTheme(command.theme);
    if (command.href) router.push(command.href);
  }
  useEffect(() => {
    const open = () => {
      if (dialog.current?.open) return;
      previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setQuery(""); setActive(0);
      dialog.current?.showModal(); input.current?.focus();
    };
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k" && !event.isComposing) {
        event.preventDefault();
        if (dialog.current?.open) close(); else open();
      }
    };
    window.addEventListener("keydown", shortcut);
    window.addEventListener("civicflow:open-search", open);
    return () => { window.removeEventListener("keydown", shortcut); window.removeEventListener("civicflow:open-search", open); };
  }, []);
  useEffect(() => { dialog.current?.querySelector(`#command-${activeIndex}`)?.scrollIntoView({ block: "nearest" }); }, [activeIndex, query]);
  return <dialog ref={dialog} className="command-dialog" aria-labelledby="command-title" onClick={(event) => { if (event.target === event.currentTarget) close(); }} onClose={() => { if (previousFocus.current?.isConnected) previousFocus.current.focus({ preventScroll: true }); }}>
    <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3"><h2 id="command-title" className="font-semibold">{t("Search CivicFlow")}</h2><button onClick={close} className="icon-button" aria-label={t("Close search")}><X size={18} /></button></div>
    <div className="flex items-center gap-3 p-4"><Search size={18} className="shrink-0 text-muted" /><input ref={input} className="field" aria-label={t("Search services and commands")} role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="command-results" aria-activedescendant={results.length ? `command-${activeIndex}` : undefined} value={query} maxLength={200} placeholder={t("Search services, roadmap tools or themes…")} onChange={(event) => { setQuery(event.target.value); setActive(0); }} onKeyDown={(event) => {
      if (event.nativeEvent.isComposing) return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setActive((current) => results.length ? (Math.min(current, results.length - 1) + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length : 0); }
      if (event.key === "Enter" && results[activeIndex]) { event.preventDefault(); run(results[activeIndex]); }
    }} /></div>
    <div id="command-results" role="listbox" aria-label={t("Search results")} className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">{results.map((command, index) => <button id={`command-${index}`} key={command.id} role="option" aria-selected={index === activeIndex} className={`block min-h-12 w-full rounded-xl p-3 text-left text-sm ${index === activeIndex ? "bg-surface-2 text-brand" : "hover:bg-surface-2"}`} onClick={() => run(command)}><span className="block text-[10px] uppercase tracking-wide text-muted">{t(command.group)}</span><span className="mt-1 block">{t(command.title)}</span></button>)}</div>
    {!results.length && <p role="status" className="px-5 pb-5 text-sm text-muted">{t("No matching services or commands. Try a service name or “theme”.")}</p>}
    <p className="border-t border-line px-4 py-3 text-xs text-muted">{t("↑ ↓ to choose · Enter to open · Esc to close · Ctrl / ⌘ K")}</p>
  </dialog>;
}
