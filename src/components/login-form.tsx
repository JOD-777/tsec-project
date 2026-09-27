"use client";

import { useFormStatus } from "react-dom";
import { login, signup } from "@/app/login/actions";

export function LoginForm() {
  return <form className="mt-6 space-y-4"><label className="block text-sm font-medium">Email<input name="email" type="email" required autoComplete="email" maxLength={254} className="field mt-2" placeholder="you@example.com" /></label><label className="block text-sm font-medium">Password<input name="password" type="password" minLength={8} maxLength={256} required autoComplete="current-password" className="field mt-2" placeholder="At least 8 characters" /></label><SubmitButtons /></form>;
}
function SubmitButtons() {
  const { pending } = useFormStatus();
  return <><button formAction={login} disabled={pending} className="button-primary w-full disabled:opacity-50">{pending ? "Please wait…" : "Sign in"}</button><button formAction={signup} disabled={pending} className="button-secondary w-full disabled:opacity-50">Create account</button><p role="status" className="sr-only">{pending ? "Submitting authentication request" : ""}</p></>;
}
