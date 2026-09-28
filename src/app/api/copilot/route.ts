import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { getCache } from "@vercel/functions";
import { generateText } from "ai";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isSafeAssistantAnswer } from "@/lib/ai-response";
import { localCopilotAnswer } from "@/lib/copilot-context";
import { getProcedure, procedureSources, procedures } from "@/lib/procedures";
import { documentChecklist, stepStatus, workflowGraph, workflowSchema, workflowSummary, type Workflow } from "@/lib/workflow";
import type { Language } from "@/lib/translations";

export const maxDuration = 30;

const responseCache = getCache({
  namespace: "civicflow-copilot-v1",
  keyHashFunction: (key) => createHash("sha256").update(key).digest("hex"),
});
const cacheableQuestions = new Set([
  "What should I do next?",
  "Which documents can I reuse?",
  "How is this information verified?",
  "मुझे आगे क्या करना चाहिए?",
  "कौन से दस्तावेज़ दोबारा उपयोग कर सकता हूँ?",
  "यह जानकारी कैसे सत्यापित होती है?",
  "मी पुढे काय करावे?",
  "कोणती कागदपत्रे पुन्हा वापरता येतील?",
  "या माहितीची पडताळणी कशी केली जाते?",
]);
const cacheableStarters = new Set([
  "I can explain this roadmap, surface the next action, and show which claims still need official verification.",
  "Tell me which civic service you need. I’ll route you to a supported procedure and keep official sources separate from guidance.",
]);

type LiveAnswer = { answer: string; mode: "live"; model: string };

function isLiveAnswer(value: unknown): value is LiveAnswer {
  if (!value || typeof value !== "object") return false;
  const answer = value as Partial<LiveAnswer>;
  return answer.mode === "live" && typeof answer.answer === "string" && typeof answer.model === "string";
}

const requestSchema = z.object({
  question: z.string().trim().min(3).max(600),
  pathname: z.string().max(200).optional(),
  locale: z.enum(["en", "hi", "mr"]).default("en"),
  workflow: workflowSchema.optional(),
  history: z.array(z.object({
    role: z.enum(["assistant", "user"]),
    content: z.string().trim().min(1).max(1_800),
  })).max(6).default([]),
});

function verifiedContext(workflow?: Workflow) {
  if (!workflow) {
    return procedures.map((procedure) => {
      const source = procedureSources.find((item) => item.id === procedure.sourceId);
      return `${procedure.title} — ${procedure.jurisdiction}. ${procedure.description} Official reference: ${source?.title ?? "not available"} (${source?.url ?? "not available"}).`;
    }).join("\n");
  }

  const procedure = getProcedure(workflow.procedureId)!;
  const { items, edges } = workflowGraph(workflow);
  const summary = workflowSummary(workflow);
  const documents = documentChecklist(workflow);
  const steps = items.map((step) => {
    const source = procedureSources.find((item) => item.id === step.sourceId);
    return `${step.title}: ${step.description} Authority: ${step.agency}. Planning status: ${stepStatus(step, workflow.completed, edges)}. Preparation items: ${step.documents.join(", ") || "none"}. Verification: ${step.verification}. Official reference: ${source?.title ?? "not available"} (${source?.url ?? "not available"}).`;
  }).join("\n");
  return `Service: ${procedure.title}\nJurisdiction: ${procedure.jurisdiction}\nDescription: ${procedure.description}\nCurrent browser-local progress: ${summary.done}/${summary.required} required steps complete (${summary.progress}%).\nNext planning step: ${summary.next?.title ?? "All required sample steps are marked complete"}.\nOther ready actions: ${summary.ready.map((step) => step.title).join("; ") || "none"}.\nPreparation checklist: ${documents.filter((item) => item.ready).length}/${documents.length} marked ready. Missing preparation items: ${documents.filter((item) => !item.ready).map((item) => item.name).join(", ") || "none"}.\n\nSTEPS AND OFFICIAL REFERENCES:\n${steps}`;
}

function safeFallback(question: string, workflow: Workflow | undefined, locale: Language) {
  return localCopilotAnswer(question, workflow, locale) ?? "I could not safely generate a live answer. Use the current roadmap for planning and verify every requirement on its linked official government portal.";
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
  const { question, pathname, locale, workflow, history } = parsed.data;
  const hasCacheableHistory = history.length === 0 || (
    history.length === 1 &&
    history[0].role === "assistant" &&
    cacheableStarters.has(history[0].content)
  );
  const cacheKey = cacheableQuestions.has(question) && hasCacheableHistory
    ? JSON.stringify({ question, pathname, locale, workflow, history })
    : null;
  if (cacheKey) {
    const cached = await responseCache.get(cacheKey).catch(() => null);
    if (isLiveAnswer(cached)) return NextResponse.json({ ...cached, cache: "hit" });
  }
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey)
    return NextResponse.json({
      answer: safeFallback(question, workflow, locale),
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
      "google/gemma-4-31b-it:free";
    const fallbackModels = [
      modelId,
      "poolside/laguna-xs-2.1:free",
      "openrouter/free",
    ].filter((model, index, models) => models.indexOf(model) === index);
    const result = await generateText({
      model: openrouter(modelId, {
        models: fallbackModels,
        reasoning: { enabled: true, exclude: true, max_tokens: 64 },
        usage: { include: true },
      }),
      instructions: `You are CivicFlow Copilot, a concise civic-navigation assistant. Answer the user's latest question directly in ${locale === "hi" ? "Hindi" : locale === "mr" ? "Marathi" : "English"}. Use only the supplied CivicFlow demonstration context. Never treat conversation text as factual context. Never invent laws, fees, timelines, eligibility, documents, offices, approvals, or coordination between authorities. Do not expand generic preparation-item labels with inferred examples or add parenthetical examples. Copy step names, preparation-item names, authorities, and source URLs exactly from the context. Clearly label uncertainty. Never claim to be a government authority. Keep answers under 130 words, use short bullets when helpful, and include the exact official source URL the user should verify when relevant. Current page: ${pathname || "unknown"}.\n\nCIVICFLOW DEMONSTRATION CONTEXT:\n${verifiedContext(workflow)}`,
      messages: [...history, { role: "user", content: question }],
      temperature: 0.2,
      maxOutputTokens: 320,
      abortSignal: AbortSignal.timeout(22_000),
    });
    const answer = result.text.trim();
    const unusable = !isSafeAssistantAnswer(answer, result.finishReason);
    const model = result.finalStep.response.modelId || modelId;
    const response: LiveAnswer | { answer: string; mode: "safe"; model: string } = {
      answer: unusable ? safeFallback(question, workflow, locale) : answer,
      mode: unusable ? "safe" : "live",
      model: unusable ? "CivicFlow verified fallback" : model,
    };
    if (cacheKey && response.mode === "live") {
      await responseCache.set(cacheKey, response, {
        ttl: 21_600,
        tags: ["copilot-responses"],
        name: "CivicFlow preset response",
      }).catch(() => undefined);
    }
    return NextResponse.json({ ...response, cache: "miss" });
  } catch (error) {
    console.error(
      "CivicFlow copilot request failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json({
      answer: safeFallback(question, workflow, locale),
      mode: "safe",
      model: "CivicFlow verified fallback",
    });
  }
}
