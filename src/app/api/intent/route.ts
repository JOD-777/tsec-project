import { NextResponse } from "next/server";
import { z } from "zod";

const inputSchema = z.object({ query: z.string().trim().min(3).max(500) });
const intentSchema = z.object({
  normalizedGoal: z.string().min(3),
  goalType: z.string().min(2),
  entities: z.object({
    businessType: z.string().nullable(),
    serviceType: z.string().nullable(),
  }),
  jurisdictionHints: z.object({
    country: z.string().nullable(),
    state: z.string().nullable(),
    city: z.string().nullable(),
    localBody: z.string().nullable(),
  }),
  missingFields: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});
const jsonSchema = {
  name: "civic_intent",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      normalizedGoal: {
        type: "string",
        description: "A concise action-oriented civic goal.",
      },
      goalType: {
        type: "string",
        description: "A stable snake_case intent category.",
      },
      entities: {
        type: "object",
        additionalProperties: false,
        properties: {
          businessType: { type: ["string", "null"] },
          serviceType: { type: ["string", "null"] },
        },
        required: ["businessType", "serviceType"],
      },
      jurisdictionHints: {
        type: "object",
        additionalProperties: false,
        properties: {
          country: { type: ["string", "null"] },
          state: { type: ["string", "null"] },
          city: { type: ["string", "null"] },
          localBody: { type: ["string", "null"] },
        },
        required: ["country", "state", "city", "localBody"],
      },
      missingFields: { type: "array", items: { type: "string" } },
      confidence: { type: "number", minimum: 0, maximum: 1 },
    },
    required: [
      "normalizedGoal",
      "goalType",
      "entities",
      "jurisdictionHints",
      "missingFields",
      "confidence",
    ],
  },
} as const;

function fallback(
  query: string,
  reason = "Live AI is temporarily unavailable",
) {
  const lower = query.toLowerCase();
  const food = lower.includes("food");
  const mumbai = lower.includes("mumbai");
  return {
    normalizedGoal: food ? "Start a home food business" : query,
    goalType: food ? "start_food_business" : "civic_task",
    entities: {
      businessType: food ? "home_food_business" : null,
      serviceType: food ? "food_business_registration" : null,
    },
    jurisdictionHints: {
      country: "India",
      state: mumbai ? "Maharashtra" : null,
      city: mumbai ? "Mumbai" : null,
      localBody: mumbai ? "BMC" : null,
    },
    missingFields: food
      ? ["premisesType", "existingRegistration"]
      : ["jurisdiction", "serviceDetails"],
    confidence: 0.72,
    mode: "demo" as const,
    providerModel: "Deterministic civic parser",
    notice: reason,
  };
}

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Enter a civic goal between 3 and 500 characters." },
      { status: 400 },
    );
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey)
    return NextResponse.json(
      fallback(parsed.data.query, "Live AI is not configured"),
    );
  const model = process.env.OPENROUTER_DEFAULT_MODEL || "openrouter/free";
  const started = Date.now();
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL || "https://tsecproject.vercel.app",
          "X-OpenRouter-Title": "CivicFlow AI",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "Extract only the user's civic intent and jurisdiction clues. Never invent legal requirements, fees, documents, eligibility rules, or government authorities. Use null when the user did not provide a value.",
            },
            { role: "user", content: parsed.data.query },
          ],
          response_format: { type: "json_schema", json_schema: jsonSchema },
          provider: { require_parameters: true, allow_fallbacks: true },
          temperature: 0,
          max_tokens: 700,
        }),
        signal: AbortSignal.timeout(20_000),
      },
    );
    if (!response.ok) {
      const providerError = await response.text();
      console.error(
        "OpenRouter intent request failed",
        response.status,
        providerError.slice(0, 500),
      );
      return NextResponse.json(
        fallback(
          parsed.data.query,
          `Live AI returned ${response.status}; safe demo mode is active`,
        ),
      );
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const candidate = intentSchema.safeParse(
      JSON.parse(typeof content === "string" ? content : "{}"),
    );
    if (!candidate.success) {
      console.error(
        "OpenRouter returned an invalid civic intent",
        candidate.error.issues,
      );
      return NextResponse.json(
        fallback(
          parsed.data.query,
          "Live AI response failed validation; safe demo mode is active",
        ),
      );
    }
    return NextResponse.json({
      ...candidate.data,
      mode: "live" as const,
      providerModel: data.model || model,
      latencyMs: Date.now() - started,
      notice:
        "AI interpreted the goal only; procedural facts still come from verified sources.",
    });
  } catch (error) {
    console.error(
      "OpenRouter intent request error",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(fallback(parsed.data.query));
  }
}
