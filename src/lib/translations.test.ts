import { describe, expect, it } from "vitest";
import { phraseTranslations, translateText } from "./translations";
import { procedures } from "./procedures";
import { compileProcedure, compileWorkflow, workflowGraph } from "./workflow";
import { sampleTranslationRows } from "./sample-translations";
import { extraTranslationRows } from "./translation-extras";

describe("English, Hindi and Marathi display translations", () => {
  it("contains both target-language values for every dictionary entry", () => {
    for (const [key, values] of Object.entries(phraseTranslations)) { expect(key).not.toBe(""); expect(values).toHaveLength(2); for (const value of values) expect(value?.trim()).toBeTruthy(); }
    for (const row of [sampleTranslationRows, extraTranslationRows].flatMap((rows) => rows.trim().split("\n"))) expect(row.split("|")).toHaveLength(3);
  });
  for (const locale of ["hi", "mr"] as const) it(`translates every supported sample variant into ${locale} without changing canonical data`, () => {
    for (const procedure of procedures) {
      const profiles = procedure.questions.reduce<Record<string, string>[]>((variants, question) => variants.flatMap((profile) => question.options.map(([value]) => ({ ...profile, [question.id]: value }))), [{}]);
      const workflows = procedure.id === "home-food-business" ? (["home", "commercial"] as const).flatMap((premises) => (["prepare", "package", "resell"] as const).flatMap((activity) => [false, true].map((existingRegistration) => compileWorkflow({ premises, activity, existingRegistration })))) : profiles.map((profile) => compileProcedure(procedure.id, profile));
      const copy = JSON.stringify(procedure);
      const texts = [procedure.title, procedure.description, ...procedure.questions.flatMap((question) => [question.label, ...question.options.map(([, label]) => label)]), ...workflows.flatMap((workflow) => workflowGraph(workflow).items.flatMap((step) => [step.title, step.description, ...step.documents]))];
      for (const text of texts) if (text !== "PAN") expect(translateText(locale, text), text).not.toBe(text);
      expect(JSON.stringify(procedure)).toBe(copy);
    }
  });
  it("interpolates translated phrases and preserves official or arbitrary user text", () => {
    expect(translateText("hi", "Next: {step}. {parallel}", { step: "FSSAI", parallel: "" })).toContain("FSSAI");
    for (const text of ["https://foscos.fssai.gov.in/", "Food Safety and Standards Authority of India", "A user-written note"]) expect(translateText("mr", text)).toBe(text);
    expect(translateText("en", "  My roadmaps  ")).toBe("  My roadmaps  ");
  });
});
