/**
 * M.2: the test names scene 7 scrolls past, for the edge cases scenes 4–6 show. Writes
 * video/data/tests.json.
 *
 *   npm run export:tests
 *
 * The titles are read from the test files as they were at the latest successful CI run on main
 * (GitHub CLI, signed in), so the montage only shows tests that exist and passed. A wanted title
 * that isn't there fails the script instead of being shown.
 */
import { gh, git, isMain, writeData } from "./lib";

type Wanted = { file: string; title: string };

/** The edge cases, by scene, as the site's tests name them (paths from portfolio-website/). */
export const EDGE_CASE_TESTS: Wanted[] = [
  // Scene 4: trying to break it
  { file: "src/lib/guide/search.test.ts", title: "returns nothing for an off-topic question: no keyword hit and every cosine low" },
  { file: "src/app/api/guide/route.test.ts", title: "says it doesn't know, without calling the model, when nothing on the site matches" },
  { file: "src/app/api/guide/route.test.ts", title: "rejects system messages and tool parts in the visitor's messages" },
  { file: "src/lib/guide/answer.test.tsx", title: "never links URLs the model writes" },
  { file: "src/components/guide/guide.test.tsx", title: "caps the question at 500 characters" },
  // Scene 5: Groq down, limiter down
  { file: "src/app/api/guide/route.test.ts", title: "without a Groq key, says it is busy and lists the matches from the full search (3.6)" },
  { file: "src/app/api/guide/route.test.ts", title: "turns a provider error into the busy message" },
  { file: "src/components/guide/guide.test.tsx", title: "when Groq fails mid-answer, shows the busy state and the matches (3.6)" },
  { file: "src/lib/rate-limit.test.ts", title: "fails open when Upstash errors, so the form keeps working" },
  { file: "src/lib/rate-limit.test.ts", title: "fails closed when Upstash errors, to protect the model quota" },
  { file: "src/lib/rate-limit.test.ts", title: "allows 10 questions per visitor per 10 minutes and 90 a day across the site" },
  { file: "src/app/api/contact/route.test.ts", title: "reports a Resend failure instead of claiming success" },
  { file: "src/app/api/contact/route.test.ts", title: "quietly drops a filled honeypot" },
  { file: "e2e/launch.spec.ts", title: "shows an error with the email fallback" },
  // Scene 6: phones, reduced motion, privacy
  { file: "e2e/delight.spec.ts", title: "never loads Matter.js and keeps the still pile" },
  { file: "src/components/video-facade.test.tsx", title: "is a plain link to YouTube until clicked, with nothing loaded from YouTube" },
  { file: "e2e/shell.spec.ts", title: "sends a Content Security Policy" },
];

/** it( and test( titles in a test file, without .skip and .todo tests. Template titles keep their ${…}. */
export function testTitles(source: string): string[] {
  const pattern = /\b(?:it|test)(?:\.only)?\(\s*(["'`])((?:\\.|(?!\1)[^\\])*)\1/g;
  return [...source.matchAll(pattern)].map((m) => m[2].replace(/\\(.)/g, "$1"));
}

export function pickTests(wanted: Wanted[], files: Record<string, string>) {
  const tests: Wanted[] = [];
  const missing: Wanted[] = [];
  for (const test of wanted) {
    const source = files[test.file];
    (source !== undefined && testTitles(source).includes(test.title) ? tests : missing).push(test);
  }
  return { tests, missing };
}

function main() {
  const [run] = JSON.parse(
    gh(["run", "list", "--workflow", "ci.yml", "--branch", "main", "--event", "push", "--status", "success", "--limit", "1", "--json", "databaseId,createdAt,url,headSha"]),
  ) as { databaseId: number; createdAt: string; url: string; headSha: string }[];
  if (!run) throw new Error("No successful CI run on main");
  git(["fetch", "--quiet", "origin", run.headSha]);
  const files = Object.fromEntries(
    [...new Set(EDGE_CASE_TESTS.map((t) => t.file))].map((file) => {
      try {
        return [file, git(["show", `${run.headSha}:portfolio-website/${file}`])];
      } catch {
        return [file, undefined];
      }
    }),
  ) as Record<string, string>;
  const { tests, missing } = pickTests(EDGE_CASE_TESTS, files);
  if (missing.length) {
    throw new Error(`Not in the tests at ${run.headSha.slice(0, 7)}:\n${missing.map((t) => `  ${t.file}: ${t.title}`).join("\n")}`);
  }
  writeData("tests", {
    tests,
    date: run.createdAt.slice(0, 10),
    source: `Test files at commit ${run.headSha.slice(0, 7)}, which passed CI on main: ${run.url}`,
  });
}

if (isMain(import.meta.url)) main();
