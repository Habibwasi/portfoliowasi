/**
 * M.2: the guide's real retrieval for the question the video asks, for scene 3's diagram.
 * Runs the site's own createSearcher over the committed index with the question's real
 * embedding, and writes video/data/retrieval.json.
 *
 *   npm run export:retrieval [-- "<question>"]
 *
 * The question must be one the evaluation answers (evals/guide/cases.ts). Once the chat is
 * recorded (M.3), its answer text goes in video/data/answer.md and its citations are checked
 * against the hits.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cases } from "../../portfolio-website/evals/guide/cases";
import { EMBEDDING_MODEL, GUIDE_MODEL, TOP_K } from "../../portfolio-website/src/lib/guide/config";
import { createSearcher, tokenize, type IndexedChunk } from "../../portfolio-website/src/lib/guide/search";
import { isMain, siteDir, today, videoDir, writeData } from "./lib";

export const DEFAULT_QUESTION = "How fast is Ridly's trip search?";

/** A question the nightly evaluation answers, so it is known to retrieve and cite the right pages. */
export function chooseQuestion(question: string | undefined): string {
  const chosen = question ?? DEFAULT_QUESTION;
  if (!cases.some((c) => c.kind === "answer" && c.question === chosen)) {
    throw new Error(`"${chosen}" isn't an answer case in the guide evaluation (evals/guide/cases.ts)`);
  }
  return chosen;
}

/** Source numbers an answer cites, as [n] or gpt-oss's 【n†…】, sorted and without repeats. */
export function citationsIn(answer: string): number[] {
  const numbers = [...answer.matchAll(/【(\d+)(?:†[^】]*)?】|\[(\d+)\]/g)].map((m) => Number(m[1] ?? m[2]));
  return [...new Set(numbers)].sort((a, b) => a - b);
}

const round = (x: number, digits = 4) => Math.round(x * 10 ** digits) / 10 ** digits;

type Input = { chunks: IndexedChunk[]; question: string; queryVector: number[]; answer: string | null };

export function buildRetrieval({ chunks, question, queryVector, answer }: Input) {
  const search = createSearcher(chunks);
  // Every candidate with both scores; the first TOP_K are exactly what the route sends the model.
  const candidates = search(question, queryVector, chunks.length);
  const hits = candidates.slice(0, TOP_K).map((hit, i) => ({
    n: i + 1,
    id: hit.chunk.id,
    title: hit.chunk.title,
    url: hit.chunk.url,
    bm25: round(hit.bm25),
    cosine: round(hit.cosine ?? 0),
    // Fused scores sit close together (1/61 + 1/63 …), so they keep more digits. Ranks (1, 3) and
    // (3, 1) fuse to the same score; a tie keeps the index order, as in the route.
    score: round(hit.score, 6),
  }));
  const ranking = (key: "bm25" | "cosine") =>
    candidates
      .map((hit) => ({ id: hit.chunk.id, title: hit.chunk.title, value: round(hit[key] ?? 0) }))
      .filter((entry) => entry.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

  const cited = answer ? citationsIn(answer) : [];
  const outside = cited.filter((n) => !hits.some((hit) => hit.n === n));
  if (outside.length) throw new Error(`The answer cites [${outside.join("], [")}], which isn't among the ${hits.length} hits`);

  return {
    question,
    terms: tokenize(question),
    model: GUIDE_MODEL,
    embeddingModel: EMBEDDING_MODEL,
    bm25: ranking("bm25"),
    cosine: ranking("cosine"),
    hits,
    answer,
    cited,
  };
}

async function main() {
  const question = chooseQuestion(process.argv[2]);
  const index = JSON.parse(readFileSync(join(siteDir, "src/generated/guide-index.json"), "utf8"));
  const { embed } = await import("../../portfolio-website/src/lib/guide/embed");
  const [queryVector] = await embed([question]);
  const answerPath = join(videoDir, "data", "answer.md");
  const answer = existsSync(answerPath) ? readFileSync(answerPath, "utf8").trim() : null;
  const data = buildRetrieval({ chunks: index.chunks, question, queryVector, answer });
  writeData("retrieval", {
    ...data,
    date: today(),
    source:
      `createSearcher (portfolio-website/src/lib/guide/search.ts) over src/generated/guide-index.json, query embedded with ${index.model}; ` +
      (answer ? "answer from video/data/answer.md" : "no recorded answer yet"),
  });
}

if (isMain(import.meta.url)) await main();
