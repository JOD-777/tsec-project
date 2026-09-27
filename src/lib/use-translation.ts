"use client";
import { useCallback } from "react";
import { useLocalDemo } from "./local-demo";
import { translateText } from "./translations";

export function useTranslation() {
  const { locale } = useLocalDemo();
  const t = useCallback((text: string, values?: Record<string, string | number>) => translateText(locale, text, values), [locale]);
  return { locale, t };
}
