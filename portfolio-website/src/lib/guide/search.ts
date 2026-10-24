import { MIN_COSINE, MIN_TOPIC_COSINE, RRF_K, TOP_K } from "./config";

/** One piece of site text the guide can cite. */
export type GuideChunk = { id: string; title: string; url: string; text: string };

export type IndexedChunk = GuideChunk & { embedding: number[] };

export type GuideIndex = { model: string; dimensions: number; chunks: IndexedChunk[] };

export type SearchHit = { chunk: IndexedChunk; bm25: number; cosine: number | null; score: number };

// Question words and fillers that would otherwise match every chunk.
const STOPWORDS = new Set(
  ("a an and are as at be been but by can could did do does for from had has have he her him his how i if in into is it its " +
    "me my of on or our she so than that the their them then there these they this to was we were what when where which who " +
    "why will with would you your about tell habib habibs")
    .split(" "),
);

/** Lowercase, accents folded, possessive "'s" dropped, stopwords removed. */
export function tokenize(text: string): string[] {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]s\b/g, "")
    .split(/[^a-z0-9]+/)
    .filter((token) => token && !STOPWORDS.has(token));
}

const dot = (a: number[], b: number[]) => a.reduce((sum, x, i) => sum + x * b[i], 0);

/**
 * Hybrid search over the index (3.3): BM25 and cosine rank the chunks separately, and
 * reciprocal rank fusion merges them. A chunk is a candidate only with a keyword hit or a
 * cosine at or above MIN_COSINE; no candidates means the question is off-topic. With a query
 * vector, a question no chunk is at least MIN_TOPIC_COSINE close to is off-topic too.
 * Embeddings are normalised, so cosine is a dot product.
 */
export function createSearcher(chunks: IndexedChunk[], { k1 = 1.2, b = 0.75 } = {}) {
  const docs = chunks.map((chunk) => tokenize(`${chunk.title} ${chunk.text}`));
  const avgLength = docs.reduce((sum, d) => sum + d.length, 0) / Math.max(docs.length, 1);
  const termCounts = docs.map((doc) => {
    const counts = new Map<string, number>();
    for (const token of doc) counts.set(token, (counts.get(token) ?? 0) + 1);
    return counts;
  });
  const docFreq = new Map<string, number>();
  for (const counts of termCounts) for (const term of counts.keys()) docFreq.set(term, (docFreq.get(term) ?? 0) + 1);

  const bm25 = (terms: string[], i: number) =>
    [...new Set(terms)].reduce((score, term) => {
      const tf = termCounts[i].get(term) ?? 0;
      if (!tf) return score;
      const df = docFreq.get(term) ?? 0;
      const idf = Math.log(1 + (chunks.length - df + 0.5) / (df + 0.5));
      return score + (idf * tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * docs[i].length) / avgLength));
    }, 0);

  return function search(query: string, queryVector: number[] | null, topK = TOP_K): SearchHit[] {
    const terms = tokenize(query);
    const scored = chunks.map((chunk, i) => ({
      chunk,
      bm25: bm25(terms, i),
      cosine: queryVector ? dot(queryVector, chunk.embedding) : null,
      score: 0,
    }));
    if (queryVector && !scored.some((hit) => (hit.cosine ?? 0) >= MIN_TOPIC_COSINE)) return [];
    const candidates = scored.filter((hit) => hit.bm25 > 0 || (hit.cosine ?? 0) >= MIN_COSINE);
    if (candidates.length === 0) return [];

    const rankBy = (key: "bm25" | "cosine") =>
      [...candidates].filter((hit) => (hit[key] ?? 0) > 0).sort((x, y) => (y[key] ?? 0) - (x[key] ?? 0));
    for (const ranking of [rankBy("bm25"), queryVector ? rankBy("cosine") : []]) {
      ranking.forEach((hit, rank) => (hit.score += 1 / (RRF_K + rank + 1)));
    }
    return candidates.sort((x, y) => y.score - x.score).slice(0, topK);
  };
}
