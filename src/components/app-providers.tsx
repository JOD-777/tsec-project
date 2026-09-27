"use client";
import { useTranslation } from "@/lib/use-translation";
import { ThemeProvider } from "next-themes";
import { CivicCopilot } from "@/components/civic-copilot";
import { CommandMenu } from "@/components/command-menu";
import { Suspense, useEffect } from "react";
import { useLocalDemo } from "@/lib/local-demo";
export function AppProviders({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { locale } = useLocalDemo();
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <a className="skip-link" href="#main-content">{t("Skip to content")}</a>
      {children}
      <CommandMenu />
      <Suspense fallback={null}><CivicCopilot /></Suspense>
    </ThemeProvider>
  );
}
