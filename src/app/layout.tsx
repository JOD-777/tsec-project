import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AppProviders } from "@/components/app-providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function getMetadataBase() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configuredUrl) {
    try {
      return new URL(configuredUrl);
    } catch {
      // Fall through to the deployment URL when a configured value is malformed.
    }
  }

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  return new URL(vercelHost ? `https://${vercelHost}` : "http://localhost:3000");
}

export const metadata: Metadata = {
  title: { default: "CivicFlow AI — Government procedures, compiled", template: "%s · CivicFlow AI" },
  description: "Turn a civic goal into a personalized, source-verifiable government procedure roadmap.",
  metadataBase: getMetadataBase(),
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AppProviders>{children}</AppProviders>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
