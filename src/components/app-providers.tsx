"use client";
import { ThemeProvider } from "next-themes";
import { CivicCopilot } from "@/components/civic-copilot";
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <CivicCopilot />
    </ThemeProvider>
  );
}
