import path from "node:path";
import { defineConfig } from "vitest/config";

/** The guide's evaluation (3.4): separate from `npm test`, since it downloads a model and may call Groq. */
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  test: {
    environment: "node",
    include: ["evals/**/*.eval.ts"],
    testTimeout: 60_000,
    fileParallelism: false,
  },
});
