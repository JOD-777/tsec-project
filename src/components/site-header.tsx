"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Landmark, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";

export function SiteHeader({ compact=false }:{compact?:boolean}) {
  const {resolvedTheme,setTheme}=useTheme();
  const [open,setOpen]=useState(false);
  return <header className="sticky top-0 z-50 border-b border-line/80 bg-background/85 backdrop-blur-xl">
    <div className="shell flex h-16 items-center justify-between">
      <Link href="/" className="flex items-center gap-2 font-semibold tracking-[-.02em]"><span className="grid size-8 place-items-center rounded-xl bg-brand-strong text-white dark:text-black"><Landmark size={17}/></span>CivicFlow <span className="text-brand">AI</span></Link>
      <nav className="hidden items-center gap-7 text-sm text-muted md:flex" aria-label="Main navigation">
        {!compact&&<><Link className="hover:text-foreground" href="/how-it-works">How it works</Link><Link className="hover:text-foreground" href="/services">Explore services</Link></>}
        <Link className="hover:text-foreground" href="/app">My roadmaps</Link><Link className="hover:text-foreground" href="/admin">Admin</Link>
      </nav>
      <div className="flex items-center gap-2">
        <button className="grid size-10 place-items-center rounded-full border border-line bg-surface" onClick={()=>setTheme(resolvedTheme==="dark"?"light":"dark")} aria-label="Toggle colour theme"><Sun size={17} className="hidden dark:block"/><Moon size={17} className="dark:hidden"/></button>
        <Link className="button-primary hidden sm:inline-flex" href="/demo">Try the demo</Link>
        <button onClick={()=>setOpen(v=>!v)} className="grid size-10 place-items-center md:hidden" aria-expanded={open} aria-label="Open menu">{open?<X/>:<Menu/>}</button>
      </div>
    </div>
    {open&&<nav className="shell grid gap-1 border-t border-line py-3 md:hidden"><Link className="rounded-xl px-3 py-2" href="/how-it-works">How it works</Link><Link className="rounded-xl px-3 py-2" href="/services">Explore services</Link><Link className="rounded-xl px-3 py-2" href="/app">My roadmaps</Link><Link className="rounded-xl px-3 py-2" href="/admin">Admin</Link></nav>}
  </header>;
}
