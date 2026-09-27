import { act, renderHook, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_STORAGE_KEY, initialDemoState, updateDemo, updateWorkflow, useLocalDemo, useWorkflowDemo } from "./local-demo";
import { toggleStep } from "./workflow";

beforeEach(() => { localStorage.clear(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
describe("browser-local demo persistence", () => {
  it("preserves food progress when updating another service", () => {
    const food = renderHook(() => useWorkflowDemo("home-food-business"));
    const birth = renderHook(() => useWorkflowDemo("birth-certificate"));
    act(() => { updateWorkflow("home-food-business", (workflow) => toggleStep(workflow, "fssai")); });
    act(() => { updateWorkflow("birth-certificate", (workflow) => toggleStep(workflow, "birth-search")); });
    expect(food.result.current.workflow.completed).toEqual(["scope", "fssai"]);
    expect(birth.result.current.workflow.completed).toEqual(["birth-scope", "birth-search"]);
    expect(renderHook(() => useWorkflowDemo("birth-certificate")).result.current.workflow).toEqual(birth.result.current.workflow);
  });
  it("loads the earlier food-only saved format without losing progress", () => {
    const { procedureId: _id, profile: _profile, ...workflow } = initialDemoState.workflow;
    void _id; void _profile;
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ workflow: { ...workflow, completed: ["scope", "fssai"] }, locale: "mr", review: "approved", audit: [] }));
    const state = renderHook(useLocalDemo).result.current;
    expect(state.workflow.completed).toEqual(["scope", "fssai"]);
    expect(state.workflows).toEqual({});
    expect(state.locale).toBe("mr");
  });
  it("persists updates and hydrates a second consumer", () => {
    const first = renderHook(useLocalDemo);
    act(() => { updateDemo((current) => ({ ...current, locale: "mr", review: "approved" })); });
    expect(first.result.current.locale).toBe("mr");
    expect(JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY)!)).toMatchObject({ locale: "mr", review: "approved" });
    const second = renderHook(useLocalDemo);
    expect(second.result.current).toBe(first.result.current);
  });
  it("recovers gracefully from corrupt saved data", () => {
    localStorage.setItem(DEMO_STORAGE_KEY, "{broken");
    expect(renderHook(useLocalDemo).result.current).toEqual(initialDemoState);
  });
  it("updates when another tab stores a review decision", () => {
    const hook = renderHook(useLocalDemo);
    act(() => {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ ...initialDemoState, review: "rejected" }));
      window.dispatchEvent(new StorageEvent("storage", { key: DEMO_STORAGE_KEY }));
    });
    expect(hook.result.current.review).toBe("rejected");
  });
  it("keeps session state functional when storage is denied", () => {
    const hook = renderHook(useLocalDemo);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage denied"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage denied"); });
    let persisted = true;
    act(() => { persisted = updateDemo((current) => ({ ...current, locale: "hi" })); });
    expect(persisted).toBe(false);
    expect(hook.result.current.locale).toBe("hi");
  });
});
