/**
 * The guide's evaluation (3.4): retrieval always; answers through the real route only when
 * GROQ_EVAL_API_KEY is set (from a separate Groq organisation, since limits are per organisation).
 * Run with `npm run eval:guide`; nightly in .github/workflows/guide-eval.yml.
 */
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import index from "@/generated/guide-index.json";
import { GUIDE_MODEL } from "@/lib/guide/config";
import { embedQuery } from "@/lib/guide/embed";
import { createSearcher, type GuideIndex } from "@/lib/guide/search";
import { cases } from "./cases";

const chunks = (index as GuideIndex).chunks;
const search = createSearcher(chunks);
const evalKey = process.env.GROQ_EVAL_API_KEY;
const DONT_KNOW = /I don['’]t know/i;
// Groq's free tier allows about 8K tokens a minute, so questions go one at a time with a pause.
const PAUSE_MS = 8000;

const fromAny = (url: string, expected: string[]) => expected.some((e) => url === e || url.startsWith(e));
const pause = () => new Promise((resolve) => setTimeout(resolve, PAUSE_MS));

const summary: { question: string; check: string; ok: boolean }[] = [];
const record = (question: string, check: string, ok: boolean) => summary.push({ question, check, ok });

beforeAll(async () => {
  // The model downloads on the first run; warm it so no question falls back to keywords.
  await embedQuery("warm up", 120_000);
}, 180_000);

afterAll(() => {
  console.table(summary);
});

describe("retrieval", () => {
  for (const c of cases) {
    it(c.question, async () => {
      const vector = await embedQuery(c.question, 30_000);
      expect(vector, "embedding").not.toBeNull();
      const urls = search(c.question, vector).map((hit) => hit.chunk.url);
      if (c.kind === "answer") {
        const ok = urls.some((url) => fromAny(url, c.sources));
        record(c.question, "source retrieved", ok);
        expect(ok, `expected one of ${c.sources.join(", ")} in ${urls.join(", ")}`).toBe(true);
      } else if (c.offTopic) {
        record(c.question, "nothing retrieved", urls.length === 0);
        expect(urls).toEqual([]);
      }
    });
  }
});

/** Text, sources and errors from the route's UI message stream. */
async function readAnswer(response: Response) {
  const events = (await response.text())
    .split("\n")
    .filter((line) => line.startsWith("data: ") && line !== "data: [DONE]")
    .map((line) => JSON.parse(line.slice(6)));
  const metadata = Object.assign({}, ...events.filter((e) => e.messageMetadata).map((e) => e.messageMetadata));
  return {
    text: events.filter((e) => e.type === "text-delta").map((e) => e.delta).join("") as string,
    sources: (metadata.sources ?? []) as { n: number; title: string; url: string }[],
    errors: events.filter((e) => e.type === "error").map((e) => e.errorText) as string[],
  };
}

/** LLM-judged faithfulness: is every claim in the answer supported by its sources? */
async function judge(question: string, answer: string, sourceTitles: string[]) {
  const sourceText = chunks
    .filter((c) => sourceTitles.includes(c.title))
    .map((c) => `${c.title}: ${c.text}`)
    .join("\n\n");
  const { text } = await generateText({
    model: createGroq({ apiKey: evalKey })(GUIDE_MODEL),
    prompt: `Sources:\n${sourceText}\n\nQuestion: ${question}\nAnswer: ${answer}\n\nIs every factual claim in the answer supported by the sources? Reply with one word: SUPPORTED or UNSUPPORTED.`,
    maxOutputTokens: 400,
    providerOptions: { groq: { reasoningEffort: "low" } },
  });
  return /\bSUPPORTED\b/.test(text) && !/UNSUPPORTED/.test(text);
}

describe.skipIf(!evalKey)("answers through the real route", () => {
  beforeAll(() => {
    process.env.GROQ_API_KEY = evalKey;
  });

  for (const c of cases) {
    it(c.question, async () => {
      await pause();
      const { POST } = await import("@/app/api/guide/route");
      const response = await POST(
        new Request("http://localhost/api/guide", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: [{ id: "q", role: "user", parts: [{ type: "text", text: c.question }] }] }),
        }),
      );
      expect(response.status).toBe(200);
      const { text, sources, errors } = await readAnswer(response);
      expect(errors, "provider errors").toEqual([]);

      if (c.kind === "refuse") {
        record(c.question, "says I don't know", DONT_KNOW.test(text));
        expect(text).toMatch(DONT_KNOW);
        return;
      }
      const cited = /\[\d+\]/.test(text) && sources.length > 0;
      record(c.question, "cites a source", cited);
      expect(cited, `cites a source: ${text}`).toBe(true);
      for (const pattern of c.mustInclude) {
        record(c.question, `contains ${pattern}`, pattern.test(text));
        expect(text).toMatch(pattern);
      }
      if (c.judge) {
        await pause();
        const faithful = await judge(c.question, text, sources.map((s) => s.title));
        record(c.question, "faithful (LLM judge)", faithful);
        expect(faithful, `faithful: ${text}`).toBe(true);
      }
    }, 120_000);
  }
});
