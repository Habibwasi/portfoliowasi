import { describe, expect, it } from "vitest";
import { createSearcher, tokenize, type IndexedChunk } from "./search";

/** Unit vectors in 3D stand in for embeddings. */
const chunk = (id: string, text: string, embedding: number[]): IndexedChunk => ({ id, title: id, url: `/${id}`, text, embedding });

const chunks = [
  chunk("ridly", "Ridly carpooling app, k6 load test, trip search p95 96 ms", [1, 0, 0]),
  chunk("availability", "Open to roles now, full-time from February 2027, Kolding", [0, 1, 0]),
  chunk("qa", "Silver-rated QA tester at uTest, 268 test cycles", [0, 0, 1]),
  chunk("topictrail", "TopicTrail bachelor project, RAG pipeline with semantic search", [0.6, 0, 0.8]),
];

const search = createSearcher(chunks);
const norm = (v: number[]) => {
  const length = Math.hypot(...v);
  return v.map((x) => x / length);
};

describe("tokenize", () => {
  it("lowercases, folds accents and drops stopwords and punctuation", () => {
    expect(tokenize("What is Ridly's p95? Café!")).toEqual(["ridly", "p95", "cafe"]);
  });
});

describe("createSearcher", () => {
  it("ranks an exact keyword match first with keyword search alone", () => {
    const hits = search("How fast is the k6 load test?", null);
    expect(hits[0].chunk.id).toBe("ridly");
    expect(hits.every((h) => h.cosine === null)).toBe(true);
  });

  it("ranks the nearest vector first when no keyword matches", () => {
    const hits = search("zzz", norm([0.1, 0.9, 0.1]));
    expect(hits[0].chunk.id).toBe("availability");
  });

  it("fuses both rankings so a chunk strong in both wins", () => {
    const hits = search("semantic search", norm([0.7, 0, 0.75]));
    expect(hits[0].chunk.id).toBe("topictrail");
  });

  it("returns at most four chunks", () => {
    expect(search("search test", norm([1, 1, 1])).length).toBeLessThanOrEqual(4);
  });

  it("returns nothing for an off-topic question: no keyword hit and every cosine low", () => {
    // Cosine 0.5 with every chunk is under the threshold.
    const offTopic = norm([1, 1, 1]).map((x) => x * 0.3);
    expect(search("capital of France", offTopic)).toEqual([]);
    expect(search("capital of France", null)).toEqual([]);
  });

  it("ignores a stray keyword hit when nothing is close in meaning", () => {
    const farFromAll = norm([1, 1, 1]).map((x) => x * 0.3);
    expect(search("write a test poem", farFromAll)).toEqual([]);
    expect(search("write a test poem", null).length).toBeGreaterThan(0);
  });

  it("keeps a close vector match even without a keyword hit", () => {
    expect(search("when can he begin", norm([0, 1, 0.05]))[0].chunk.id).toBe("availability");
  });
});
