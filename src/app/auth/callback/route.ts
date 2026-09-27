import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const failure = () => NextResponse.redirect(`${origin}/login?message=Could+not+complete+sign-in.+Try+again+or+use+the+demo.`);
  if (!code) return failure();
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return failure();
  } catch { return failure(); }
  return NextResponse.redirect(`${origin}/app`);
}
