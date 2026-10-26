/**
 * The exported data the drawn scenes read (M.2). Nothing on screen is typed in by hand: every
 * score, title, test name, number and answer comes from these files.
 */
import numbersFile from "../data/numbers.json";
import retrievalFile from "../data/retrieval.json";
import siteFile from "../data/site.json";
import testsFile from "../data/tests.json";

export const retrieval = retrievalFile;
export const tests = testsFile;
export const site = siteFile;

type Sourced<T> = { value: T; date: string; source: string };
export type Numbers = {
  evalCases: Sourced<{ total: number; answer: number; tool: number; refuse: number }>;
  lastNightly: Sourced<{ conclusion: string; runId: number }>;
  lighthouse: Sourced<{ path: string; runs: number; performance: number; lcpMs: number; cls: number; tbtMs: number }[]>;
};

/** Null until `npm run export:numbers` has run against a CI run on main with the Lighthouse reports. */
export const numbers: Numbers | null = "pending" in numbersFile ? null : (numbersFile as unknown as Numbers);

/** A short name for a chunk in the diagram: the case study section, or "Project card". */
export function chunkLabel(id: string, title: string): string {
  if (id.startsWith("project:")) return "Project card";
  return title.includes(": ") ? title.slice(title.indexOf(": ") + 2) : title;
}
