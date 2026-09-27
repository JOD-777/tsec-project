"use client";

import { useSyncExternalStore } from "react";
import { z } from "zod";
import { compileProcedure, defaultWorkflow, workflowSchema, type Workflow } from "./workflow";

const schema = z.object({
  workflow: workflowSchema,
  workflows: z.record(z.string(), workflowSchema).default({}),
  locale: z.enum(["en", "hi", "mr"]),
  review: z.enum(["pending", "approved", "rejected"]),
  audit: z.array(z.object({ action: z.string().max(100), at: z.string().max(40) })).max(100),
}).superRefine((state, context) => {
  if (state.workflow.procedureId !== "home-food-business") context.addIssue({ code: "custom", message: "Invalid original workflow" });
  for (const [id, workflow] of Object.entries(state.workflows)) {
    if (id === "home-food-business" || id !== workflow.procedureId) context.addIssue({ code: "custom", message: "Mismatched workflow key" });
  }
});
export type DemoState = z.infer<typeof schema>;
export type Locale = DemoState["locale"];
export const initialDemoState: DemoState = { workflow: defaultWorkflow, workflows: {}, locale: "en", review: "pending", audit: [] };
export const DEMO_STORAGE_KEY = "civicflow.local-demo.v1";
const EVENT = "civicflow:demo-updated";
let cachedRaw: string | null | undefined;
let snapshot = initialDemoState;

function readSnapshot(): DemoState {
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      if (!raw) snapshot = initialDemoState;
      else {
        try { snapshot = schema.parse(JSON.parse(raw)); }
        catch { snapshot = initialDemoState; }
      }
    }
  } catch { /* Restricted storage keeps the demo functional in memory. */ }
  return snapshot;
}
function subscribe(callback: () => void) {
  const storage = (event: StorageEvent) => { if (event.key === DEMO_STORAGE_KEY || event.key === null) callback(); };
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", storage);
  return () => { window.removeEventListener(EVENT, callback); window.removeEventListener("storage", storage); };
}
export function updateDemo(update: (current: DemoState) => DemoState): boolean {
  snapshot = schema.parse(update(readSnapshot()));
  const raw = JSON.stringify(snapshot);
  let persisted = true;
  try { window.localStorage.setItem(DEMO_STORAGE_KEY, raw); cachedRaw = raw; }
  catch { persisted = false; }
  window.dispatchEvent(new Event(EVENT));
  return persisted;
}
export function useLocalDemo() {
  return useSyncExternalStore(subscribe, readSnapshot, () => initialDemoState);
}

export function workflowFor(state: DemoState, id: string): Workflow {
  return id === "home-food-business" ? state.workflow : state.workflows[id] ?? compileProcedure(id);
}
export function useWorkflowDemo(id: string) {
  const state = useLocalDemo();
  return { ...state, workflow: workflowFor(state, id) };
}
export function updateWorkflow(id: string, update: (current: Workflow) => Workflow) {
  return updateDemo((state) => id === "home-food-business"
    ? { ...state, workflow: update(state.workflow) }
    : { ...state, workflows: { ...state.workflows, [id]: update(workflowFor(state, id)) } });
}
