"use client";
import { useTranslation } from "@/lib/use-translation";
import { updateDemo, type Locale } from "@/lib/local-demo";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Landmark, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useRef, useState } from "react";

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  const { t, locale } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const navItems = [
    ...(!compact
      ? [
          { href: "/how-it-works", label: "How it works" },
          { href: "/services", label: "Explore services" },
        ]
      : []),
    { href: "/app", label: "My roadmaps" },
    { href: "/admin", label: "Admin" },
    { href: "/login", label: "Sign in" },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-background/85 backdrop-blur-xl">
      <div className="shell flex h-16 items-center justify-between gap-3">
        <Link
          aria-label={t("CivicFlow AI home")}
          href="/"
          className="flex shrink-0 items-center gap-2 whitespace-nowrap font-semibold tracking-[-.02em]"
        >
          <span className="grid size-8 place-items-center rounded-xl bg-brand-strong text-white dark:text-black">
            <Landmark size={17} />
          </span>
          <span className="text-sm sm:text-base">CivicFlow <span className="text-brand">AI</span></span>
        </Link>
        <nav
          className="hidden items-center gap-1 text-sm text-muted lg:flex"
          aria-label={t("Main navigation")}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              aria-current={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "page" : undefined}
              className={`whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-surface-2 hover:text-foreground ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? "bg-surface-2 text-foreground" : ""}`}
              href={item.href}
            >
              {t(item.label)}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2"><label className="hidden xl:block"><span className="sr-only">{t("Interface language")}</span><select className="field !w-auto !px-2 !py-2 text-xs" value={locale} onChange={(event) => updateDemo((current) => ({ ...current, locale: event.target.value as Locale }))}><option value="en">English</option><option value="hi">हिंदी</option><option value="mr">मराठी</option></select></label>
          <button className="hidden size-9 shrink-0 place-items-center rounded-full border border-line bg-surface min-[360px]:grid" aria-label={t("Search CivicFlow")} aria-keyshortcuts="Control+k Meta+k" onClick={() => window.dispatchEvent(new Event("civicflow:open-search"))}><Search size={17} /></button>
          <button
            className="hidden size-11 shrink-0 place-items-center rounded-full border border-line bg-surface min-[420px]:grid"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            aria-label={t("Toggle colour theme")}
          >
            <Sun size={17} className="hidden dark:block" />
            <Moon size={17} className="dark:hidden" />
          </button>
          <span className="hidden sm:inline-flex"><Link className="button-primary whitespace-nowrap text-sm" href="/demo"> {t("Try the demo")} </Link></span>
          <button
            ref={menuButton}
            onClick={() => setOpen((v) => !v)}
            className="grid size-11 shrink-0 place-items-center lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={t(open ? "Close menu" : "Open menu")}
            onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-navigation" aria-label={t("Mobile navigation")} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); setOpen(false); menuButton.current?.focus(); } }} className="shell grid max-h-[calc(100dvh-4rem)] gap-1 overflow-y-auto border-t border-line py-3 lg:hidden">
          <div className="mb-2 grid grid-cols-2 gap-2 border-b border-line pb-3">
            <button className="button-secondary !justify-start text-sm" onClick={() => { setOpen(false); window.dispatchEvent(new Event("civicflow:open-search")); }}><Search size={16} />{t("Search")}</button>
            <button className="button-secondary !justify-start text-sm" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
              {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}{t("Theme")}
            </button>
          </div>
          {navItems.map((item) => (
            <Link
              onClick={() => setOpen(false)}
              key={item.href}
              aria-current={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "page" : undefined}
              className={`rounded-xl px-3 py-2 ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? "bg-surface-2 font-semibold" : ""}`}
              href={item.href}
            >
              {t(item.label)}
            </Link>
          ))}
          <Link
            onClick={() => setOpen(false)}
            className="rounded-xl bg-brand px-3 py-2 font-semibold text-white"
            href="/demo"
          > {t("Try the demo")} </Link>
          <label className="px-3 py-2 text-sm">{t("Interface language")} <select className="field !w-auto !px-2 !py-2 text-xs" value={locale} onChange={(event) => updateDemo((current) => ({ ...current, locale: event.target.value as Locale }))}><option value="en">English</option><option value="hi">हिंदी</option><option value="mr">मराठी</option></select></label>
        </nav>
      )}
    </header>
  );
}
