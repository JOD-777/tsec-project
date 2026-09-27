import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    environmentOptions: { jsdom: { url: "http://localhost:3000" } },
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
});
