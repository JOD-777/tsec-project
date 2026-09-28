import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { compileProcedure } from "@/lib/workflow";
import { generateText } from "ai";

vi.mock("@openrouter/ai-sdk-provider", () => ({
  createOpenRouter: () => () => ({ provider: "openrouter-test-model" }),
}));

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

import { POST } from "./route";

const originalKey = process.env.OPENROUTER_API_KEY;

describe("copilot API", () => {
  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test-key";
    vi.mocked(generateText).mockReset();
  });

  afterEach(() => {
    if (originalKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = originalKey;
  });

  it("calls the model with the current workflow instead of returning a canned client answer", async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: "Contact the BMC ward office to locate the record, then verify the request route on the official BMC portal.",
      finishReason: "stop",
      finalStep: { response: { modelId: "poolside/laguna-xs-2.1:free" } },
    } as Awaited<ReturnType<typeof generateText>>);

    const response = await POST(new Request("http://localhost/api/copilot", {
      method: "POST",
      body: JSON.stringify({
        question: "What should I do next?",
        pathname: "/app/goals/birth-certificate/roadmap",
        locale: "en",
        workflow: { ...compileProcedure("birth-certificate", { record: "unknown", channel: "ward" }), notes: {} },
        history: [{ role: "assistant", content: "How can I help?" }],
      }),
    }));
    const data = await response.json();
    const options = vi.mocked(generateText).mock.calls[0][0];

    expect(data).toMatchObject({ mode: "live", model: "poolside/laguna-xs-2.1:free" });
    expect(options.instructions).toContain("Get a birth certificate");
    expect(options.instructions).toContain("Contact the ward office about the record");
    expect(options.messages).toEqual([
      { role: "assistant", content: "How can I help?" },
      { role: "user", content: "What should I do next?" },
    ]);
  });

  it("uses the workflow-aware fallback when live generation fails validation", async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: "We need to answer the user from the supplied context and then",
      finishReason: "length",
      finalStep: { response: { modelId: "unsafe-test-model" } },
    } as Awaited<ReturnType<typeof generateText>>);
    const workflow = compileProcedure("small-business");
    const response = await POST(new Request("http://localhost/api/copilot", {
      method: "POST",
      body: JSON.stringify({ question: "What should I do next?", locale: "en", workflow }),
    }));
    const data = await response.json();

    expect(data.mode).toBe("safe");
    expect(data.model).toBe("CivicFlow verified fallback");
    expect(data.answer).toContain("Current sample progress");
    expect(data.answer).toContain("Prepare service enterprise details");
  });
});
