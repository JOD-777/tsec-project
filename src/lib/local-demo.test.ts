import { act, renderHook, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_STORAGE_KEY, initialDemoState, updateDemo, useLocalDemo } from "./local-demo";

beforeEach(() => { localStorage.clear(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
describe("browser-local demo persistence", () => {
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
