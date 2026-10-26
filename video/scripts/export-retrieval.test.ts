import { describe, expect, it } from "vitest";
import index from "../../portfolio-website/src/generated/guide-index.json";
import { TOP_K } from "../../portfolio-website/src/lib/guide/config";
import { buildRetrieval, checkRecordedSources, chooseQuestion, citationsIn, DEFAULT_QUESTION } from "./export-retrieval";

// A stand-in for the question's embedding, so the test needs no model: the vector of the chunk
// that holds Ridly's search latency.
const vector = index.chunks.find((chunk) => /p95/i.test(chunk.text))!.embedding;

describe("export-retrieval", () => {
  const data = buildRetrieval({ chunks: index.chunks, question: DEFAULT_QUESTION, queryVector: vector, answer: null });

  it("returns the top hits sorted by fused score, each with bm25 and cosine", () => {
    expect(data.hits.length).toBeGreaterThan(0);
    expect(data.hits.length).toBeLessThanOrEqual(TOP_K);
    data.hits.forEach((hit, i) => {
      expect(hit.n).toBe(i + 1);
      expect(typeof hit.bm25).toBe("number");
      expect(typeof hit.cosine).toBe("number");
      if (i > 0) expect(hit.score).toBeLessThanOrEqual(data.hits[i - 1].score);
    });
  });

  it("ranks the candidates by BM25 and by cosine for the two bar lists", () => {
    for (const ranking of [data.bm25, data.cosine]) {
      expect(ranking.length).toBeGreaterThan(0);
      ranking.slice(1).forEach((entry, i) => expect(entry.value).toBeLessThanOrEqual(ranking[i].value));
    }
  });

  it("keeps the query terms and the model name", () => {
    expect(data.terms).toEqual(["fast", "ridly", "trip", "search"]);
    expect(data.model).toMatch(/\S/);
  });

  it("lists the sources the answer cites, all among the hits", () => {
    const answer = "Ridly's search answers in 96 ms at p95 [1]. It was load tested with k6 【2†L1-L3】.";
    const cited = buildRetrieval({ chunks: index.chunks, question: DEFAULT_QUESTION, queryVector: vector, answer });
    expect(cited.cited).toEqual([1, 2]);
    for (const n of cited.cited) expect(cited.hits.map((hit) => hit.n)).toContain(n);
  });

  it("checks a recorded answer's sources against the hits, in order", () => {
    const sources = data.hits.map(({ n, title, url }) => ({ n, title, url }));
    expect(() => checkRecordedSources(sources, data.hits)).not.toThrow();
    expect(() => checkRecordedSources([...sources].reverse(), data.hits)).toThrow(/differ/);
  });

  it("refuses an answer that cites a source outside the hits", () => {
    expect(() => buildRetrieval({ chunks: index.chunks, question: DEFAULT_QUESTION, queryVector: vector, answer: "Fast [9]." })).toThrow(/9/);
  });

  it("reads both citation formats", () => {
    expect(citationsIn("a [2] b 【1†source】 c 【3】 d [2]")).toEqual([1, 2, 3]);
  });

  it("only takes a question the evaluation answers", () => {
    expect(chooseQuestion(undefined)).toBe(DEFAULT_QUESTION);
    expect(chooseQuestion("Where is he based?")).toBe("Where is he based?");
    expect(() => chooseQuestion("What is the capital of France?")).toThrow(/evaluation/);
  });
});
