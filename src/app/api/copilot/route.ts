import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sources, steps } from "@/lib/demo-data";

export const maxDuration = 30;

const requestSchema = z.object({
  question: z.string().trim().min(3).max(600),
  pathname: z.string().max(200).optional(),
});

const context = steps
  .map((step) => {
    const source = sources.find((item) => item.id === step.sourceId);
    return `${step.title}: ${step.description} Agency: ${step.agency}. Status: ${step.status}. Verification: ${step.verification}. Source: ${source?.title ?? "none"} (${source?.url ?? "none"}).`;
  })
  .join("\n");

function safeFallback(question: string) {
  const normalized = question.toLowerCase();
  if (normalized.includes("document"))
    return "For the seeded Mumbai home-food workflow, start with identity proof, address proof, premises proof, and your food activity details. Reuse the same verified files across applicable applications, and confirm each portal’s current format before uploading.";
  if (normalized.includes("next") || normalized.includes("start"))
    return "Your next best action is to use the official FoSCoS eligibility flow to determine the applicable FSSAI route. The municipal premises check can run in parallel. Open the roadmap to see both paths and their evidence.";
  if (
    normalized.includes("verify") ||
    normalized.includes("trust") ||
    normalized.includes("source")
  )
    return "CivicFlow separates AI explanation from official evidence. Green source labels point to an official portal; amber or ‘Not verified’ labels mean you should confirm the claim before acting.";
  return "I can explain the seeded home-food-business roadmap, its documents, dependencies, and source labels. I cannot create new legal requirements or confirm eligibility; use the linked official portal for the final decision.";
}

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "Ask a question between 3 and 600 characters." },
      { status: 400 },
    );
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey)
    return NextResponse.json({
      answer: safeFallback(parsed.data.question),
      mode: "safe",
      model: "CivicFlow verified fallback",
    });

  try {
    const openrouter = createOpenRouter({
      apiKey,
      headers: {
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL || "https://tsecproject.vercel.app",
        "X-OpenRouter-Title": "CivicFlow AI",
      },
    });
    const modelId =
      process.env.OPENROUTER_COPILOT_MODEL ||
      "nvidia/nemotron-3-super-120b-a12b:free";
    const result = await generateText({
      model: openrouter(modelId),
      instructions: `You are CivicFlow Copilot, a concise civic-navigation assistant. Answer only from the supplied seeded demonstration context. Never invent laws, fees, timelines, eligibility, documents, offices, or approvals. Clearly label uncertainty. Never claim to be a government authority. Keep answers under 130 words, use short bullets when helpful, and end with the exact official source the user should verify when one is relevant. Current page: ${parsed.data.pathname || "unknown"}.\n\nVERIFIED DEMO CONTEXT:\n${context}`,
      prompt: parsed.data.question,
      temperature: 0.2,
      maxOutputTokens: 320,
      abortSignal: AbortSignal.timeout(22_000),
    });
    const answer = result.text.trim();
    const unusable =
      answer.length < 24 || /^(user safety|safe|unsafe)[:\s]/i.test(answer);
    const model = result.finalStep.response.modelId || modelId;
    return NextResponse.json({
      answer: unusable ? safeFallback(parsed.data.question) : answer,
      mode: unusable ? "safe" : "live",
      model: unusable ? "CivicFlow verified fallback" : model,
    });
  } catch (error) {
    console.error(
      "CivicFlow copilot request failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json({
      answer: safeFallback(parsed.data.question),
      mode: "safe",
      model: "CivicFlow verified fallback",
    });
  }
}
