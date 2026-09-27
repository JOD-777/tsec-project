import { describe, expect, it } from "vitest";
import { isSafeAssistantAnswer } from "./ai-response";

describe("AI response guardrails", () => {
  it("accepts a concise completed civic answer", () => {
    expect(isSafeAssistantAnswer("Use the linked FoSCoS portal to verify the current FSSAI route before applying.", "stop")).toBe(true);
  });

  it("rejects leaked drafting and truncated generations", () => {
    expect(isSafeAssistantAnswer("We need to answer using only the context. Let's craft a response for the user.", "stop")).toBe(false);
    expect(isSafeAssistantAnswer("BMC handles the premises review while FoSCoS handles", "length")).toBe(false);
  });
});
