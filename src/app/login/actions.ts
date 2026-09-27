"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ email: z.email(), password: z.string().min(8).max(256) });
const messageUrl = (message: string) => `/login?message=${encodeURIComponent(message)}`;

async function authenticate(formData: FormData, mode: "login" | "signup") {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(messageUrl("Enter a valid email and a password of 8–256 characters."));
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    redirect(messageUrl("Live auth is not configured locally. Continue with the seeded demo."));
  }
  let destination = "/app";
  try {
    const supabase = await createClient();
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) destination = messageUrl(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp(parsed.data);
      if (error) destination = messageUrl(error.message);
      else if (!data.session) destination = messageUrl("Check your email to verify your account.");
    }
  } catch {
    destination = messageUrl("Could not reach authentication. Try again or continue with the seeded demo.");
  }
  // Next.js redirects throw; keep them outside catch so provider errors aren't swallowed.
  redirect(destination);
}
export async function login(formData: FormData) { await authenticate(formData, "login"); }
export async function signup(formData: FormData) { await authenticate(formData, "signup"); }
