/**
 * M.2: the numbers scene 7 shows, each with the date and the source it came from. Writes
 * video/data/numbers.json.
 *
 *   npm run export:numbers
 *
 * Needs the GitHub CLI, signed in: the last nightly evaluation comes from the "Guide evaluation"
 * workflow's scheduled runs on main, and the Lighthouse medians from the lighthouse-report-<page>
 * artifacts (one per page) of the latest successful CI run on main (kept 7 days).
 */
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cases } from "../../portfolio-website/evals/guide/cases";
import { gh, isMain, today, writeData } from "./lib";

type Sourced<T> = { value: T; date: string; source: string };

export function evalCases(): Sourced<{ total: number; answer: number; tool: number; refuse: number }> {
  const count = (kind: string) => cases.filter((c) => c.kind === kind).length;
  return {
    value: { total: cases.length, answer: count("answer"), tool: count("tool"), refuse: count("refuse") },
    date: today(),
    source: "portfolio-website/evals/guide/cases.ts",
  };
}

export type Run = { conclusion: string; createdAt: string; databaseId: number; event: string; headBranch: string; url: string };

export function lastNightly(runs: Run[]): Sourced<{ conclusion: string; runId: number }> {
  const nightly = runs
    .filter((run) => run.event === "schedule" && run.headBranch === "main")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  if (!nightly) throw new Error("No scheduled guide evaluation on main");
  return { value: { conclusion: nightly.conclusion, runId: nightly.databaseId }, date: nightly.createdAt.slice(0, 10), source: nightly.url };
}

/** The parts of a Lighthouse result (LHR) the video uses. */
export type Lhr = {
  requestedUrl: string;
  fetchTime: string;
  categories: { performance: { score: number } };
  audits: Record<"largest-contentful-paint" | "cumulative-layout-shift" | "total-blocking-time", { numericValue: number }>;
};

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** Median per URL over the runs, the same aggregation lighthouserc.json asserts on. */
export function lighthouseMedians(lhrs: Lhr[]) {
  const byPath = new Map<string, Lhr[]>();
  for (const lhr of lhrs) {
    const path = new URL(lhr.requestedUrl).pathname;
    byPath.set(path, [...(byPath.get(path) ?? []), lhr]);
  }
  return [...byPath].map(([path, runs]) => ({
    path,
    runs: runs.length,
    performance: Math.round(median(runs.map((r) => r.categories.performance.score)) * 100),
    lcpMs: Math.round(median(runs.map((r) => r.audits["largest-contentful-paint"].numericValue))),
    cls: Math.round(median(runs.map((r) => r.audits["cumulative-layout-shift"].numericValue)) * 1000) / 1000,
    tbtMs: Math.round(median(runs.map((r) => r.audits["total-blocking-time"].numericValue))),
  }));
}

function lighthouse(): Sourced<ReturnType<typeof lighthouseMedians>> {
  const [run] = JSON.parse(
    gh(["run", "list", "--workflow", "ci.yml", "--branch", "main", "--event", "push", "--status", "success", "--limit", "1", "--json", "databaseId,createdAt,url,headSha"]),
  ) as { databaseId: number; createdAt: string; url: string; headSha: string }[];
  if (!run) throw new Error("No successful CI run on main");
  const dir = mkdtempSync(join(tmpdir(), "lighthouse-"));
  try {
    // One artifact per page; gh puts each in a folder named after it.
    gh(["run", "download", String(run.databaseId), "--pattern", "lighthouse-report-*", "--dir", dir]);
    const lhrs = (readdirSync(dir, { recursive: true }) as string[])
      .filter((file) => /(^|[\\/])lhr-[^\\/]*\.json$/.test(file))
      .map((file) => JSON.parse(readFileSync(join(dir, file), "utf8")) as Lhr);
    if (!lhrs.length) throw new Error(`No Lighthouse results in run ${run.databaseId}`);
    return { value: lighthouseMedians(lhrs), date: run.createdAt.slice(0, 10), source: `${run.url} (lighthouse-report-* artifacts, commit ${run.headSha.slice(0, 7)})` };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function main() {
  const runs = JSON.parse(
    gh(["run", "list", "--workflow", "guide-eval.yml", "--branch", "main", "--event", "schedule", "--limit", "5", "--json", "conclusion,createdAt,databaseId,event,headBranch,url"]),
  ) as Run[];
  writeData("numbers", { evalCases: evalCases(), lastNightly: lastNightly(runs), lighthouse: lighthouse() });
}

if (isMain(import.meta.url)) main();
