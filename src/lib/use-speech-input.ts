"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "./local-demo";

type Recognition = {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void; stop: () => void; abort: () => void;
};
type SpeechWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };

export function useSpeechInput(onTranscript: (text: string) => void, locale: Locale) {
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("");
  const recognition = useRef<Recognition | null>(null);
  useEffect(() => () => { recognition.current?.abort(); }, []);
  function toggle() {
    if (listening) { recognition.current?.stop(); return; }
    const speechWindow = window as SpeechWindow;
    const Constructor = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Constructor) { setMessage("Voice input is unavailable in this browser. Type your civic goal instead."); return; }
    const instance = new Constructor();
    recognition.current = instance;
    instance.lang = locale === "en" ? "en-IN" : locale === "hi" ? "hi-IN" : "mr-IN";
    instance.continuous = false;
    instance.interimResults = false;
    instance.onresult = (event) => { onTranscript(event.results[0]?.[0]?.transcript.slice(0, 500) ?? ""); setMessage("Review the transcript before building your roadmap."); };
    instance.onerror = (event) => { setListening(false); setMessage(event.error === "not-allowed" ? "Microphone access was denied. You can type your goal." : "Voice input could not finish. Try again or type your goal."); };
    instance.onend = () => setListening(false);
    try { instance.start(); setListening(true); setMessage("Listening through your browser’s speech service… Tap again to stop."); }
    catch { setListening(false); setMessage("Voice input is unavailable. Type your civic goal instead."); }
  }
  return { listening, message, toggle };
}
