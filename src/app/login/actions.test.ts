import { beforeEach, describe, expect, it, vi } from "vitest";

const { signInWithPassword, signUp } = vi.hoisted(() => ({ signInWithPassword: vi.fn(), signUp: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { signInWithPassword, signUp } }) }));
import { login, signup } from "./actions";
function form() { const data = new FormData(); data.set("email", "citizen@example.com"); data.set("password", "demo-password"); return data; }
beforeEach(() => { vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.test"); vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-key"); vi.clearAllMocks(); });
describe("auth redirect handling without contacting a backend", () => {
  it("preserves provider rejection rather than catching a Next.js redirect", async () => {
    signInWithPassword.mockResolvedValue({ error: { message: "Invalid login credentials" } });
    await expect(login(form())).rejects.toThrow("REDIRECT:/login?message=Invalid%20login%20credentials");
  });
  it("redirects a successful login to the app", async () => {
    signInWithPassword.mockResolvedValue({ error: null });
    await expect(login(form())).rejects.toThrow("REDIRECT:/app");
  });
  it("explains email verification only when there is no signup session", async () => {
    signUp.mockResolvedValue({ error: null, data: { session: null } });
    await expect(signup(form())).rejects.toThrow("Check%20your%20email");
    signUp.mockResolvedValue({ error: null, data: { session: {} } });
    await expect(signup(form())).rejects.toThrow("REDIRECT:/app");
  });
  it("does not contact auth when local credentials are absent", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    await expect(login(form())).rejects.toThrow("not%20configured%20locally");
    expect(signInWithPassword).not.toHaveBeenCalled();
  });
});
