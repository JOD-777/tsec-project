"use client";
import { ThemeProvider } from "next-themes";
import { CivicCopilot } from "@/components/civic-copilot";
import { useEffect } from "react";
import { useLocalDemo } from "@/lib/local-demo";
export function AppProviders({ children }: { children: React.ReactNode }) {
  const { locale } = useLocalDemo();
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <a className="skip-link" href="#main-content">Skip to content</a>
      {children}
      <CivicCopilot />
    </ThemeProvider>
  );
}
