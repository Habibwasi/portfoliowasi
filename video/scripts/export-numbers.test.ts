import { describe, expect, it } from "vitest";
import { cases } from "../../portfolio-website/evals/guide/cases";
import { evalCases, lastNightly, lighthouseMedians, type Lhr } from "./export-numbers";

const lhr = (url: string, performance: number, lcp: number, cls: number, tbt: number): Lhr => ({
  requestedUrl: url,
  fetchTime: "2026-10-26T11:40:00.000Z",
  categories: { performance: { score: performance } },
  audits: {
    "largest-contentful-paint": { numericValue: lcp },
    "cumulative-layout-shift": { numericValue: cls },
    "total-blocking-time": { numericValue: tbt },
  },
});

describe("export-numbers", () => {
  it("reads the eval case count from cases.ts", () => {
    const counted = evalCases();
    expect(counted.value.total).toBe(cases.length);
    expect(counted.value.answer + counted.value.tool + counted.value.refuse).toBe(cases.length);
    expect(counted.source).toContain("evals/guide/cases.ts");
    expect(counted.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("takes the latest scheduled evaluation on main", () => {
    const nightly = lastNightly([
      { conclusion: "failure", createdAt: "2026-10-25T03:20:17Z", databaseId: 1, event: "schedule", headBranch: "main", url: "u1" },
      { conclusion: "failure", createdAt: "2026-10-26T11:25:33Z", databaseId: 3, event: "push", headBranch: "main", url: "u3" },
      { conclusion: "success", createdAt: "2026-10-26T03:24:02Z", databaseId: 2, event: "schedule", headBranch: "main", url: "u2" },
    ]);
    expect(nightly).toEqual({ value: { conclusion: "success", runId: 2 }, date: "2026-10-26", source: "u2" });
  });

  it("takes the median of each Lighthouse metric per URL, rounded", () => {
    const medians = lighthouseMedians([
      lhr("http://localhost:3200/", 0.97, 1800, 0.01, 40),
      lhr("http://localhost:3200/", 0.99, 1650.4, 0, 20),
      lhr("http://localhost:3200/", 0.98, 2100, 0.02, 90),
      lhr("http://localhost:3200/about", 0.9, 2300, 0.05, 120),
    ]);
    expect(medians).toEqual([
      { path: "/", runs: 3, performance: 98, lcpMs: 1800, cls: 0.01, tbtMs: 40 },
      { path: "/about", runs: 1, performance: 90, lcpMs: 2300, cls: 0.05, tbtMs: 120 },
    ]);
  });
});
