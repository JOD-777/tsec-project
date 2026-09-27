const reasoningLeak = /(?:^|\n)\s*(?:<think>|we need to|we should|let(?:'|’)s (?:craft|answer|analyze)|the (?:user|question) (?:asks|is asking)|analysis:|reasoning:)/i;

export function isSafeAssistantAnswer(answer: string, finishReason: string) {
  const clean = answer.trim();
  if (finishReason !== "stop") return false;
  if (clean.length < 24 || clean.length > 1_800) return false;
  if (reasoningLeak.test(clean)) return false;
  if (/^(?:user safety|safe|unsafe)[:\s]/i.test(clean)) return false;
  return clean.split(/\s+/).length <= 180;
}
