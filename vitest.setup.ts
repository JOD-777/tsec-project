// Node 26 exposes an incomplete experimental `localStorage` global unless it is
// started with --localstorage-file. Supply a standards-shaped in-memory store
// so jsdom browser tests stay deterministic on Node 20 through Node 26.
class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(String(key)) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(String(key)); }
  setItem(key: string, value: string) { this.values.set(String(key), String(value)); }
}

if (typeof window !== "undefined") {
  Object.defineProperty(globalThis, "Storage", { configurable: true, value: MemoryStorage });
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new MemoryStorage() });
}
