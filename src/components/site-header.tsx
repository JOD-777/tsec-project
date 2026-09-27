"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Landmark, Menu, Moon, Sun, X } from "lucide-react";
import { useRef, useState } from "react";

export function SiteHeader({ compact = false }: { compact?: boolean }) {
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
          aria-label="CivicFlow AI home"
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
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              aria-current={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "page" : undefined}
              className={`whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-surface-2 hover:text-foreground ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? "bg-surface-2 text-foreground" : ""}`}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <button
            className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-surface"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            aria-label="Toggle colour theme"
          >
            <Sun size={17} className="hidden dark:block" />
            <Moon size={17} className="dark:hidden" />
          </button>
          <span className="hidden sm:inline-flex"><Link className="button-primary whitespace-nowrap text-sm" href="/demo">
            Try the demo
          </Link></span>
          <button
            ref={menuButton}
            onClick={() => setOpen((v) => !v)}
            className="grid size-11 shrink-0 place-items-center lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close menu" : "Open menu"}
            onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); setOpen(false); menuButton.current?.focus(); } }} className="shell grid gap-1 border-t border-line py-3 lg:hidden">
          {navItems.map((item) => (
            <Link
              onClick={() => setOpen(false)}
              key={item.href}
              className={`rounded-xl px-3 py-2 ${pathname === item.href ? "bg-surface-2 font-semibold" : ""}`}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
          <Link
            onClick={() => setOpen(false)}
            className="rounded-xl bg-brand px-3 py-2 font-semibold text-white"
            href="/demo"
          >
            Try the demo
          </Link>
        </nav>
      )}
    </header>
  );
}
