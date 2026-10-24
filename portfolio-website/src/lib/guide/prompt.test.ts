import { describe, expect, it } from "vitest";
import { sourcesOf } from "./prompt";
import type { SearchHit } from "./search";

const hit = (text: string, n = 0): SearchHit => ({
  chunk: { id: `c${n}`, title: `Chunk ${n}`, url: `/#c${n}`, text, embedding: [] },
  bm25: 1,
  cosine: null,
  score: 1,
});

describe("sourcesOf", () => {
  it("numbers the hits and keeps their titles and URLs", () => {
    expect(sourcesOf([hit("One.", 0), hit("Two.", 1)])).toEqual([
      { n: 1, title: "Chunk 0", url: "/#c0", excerpt: "One." },
      { n: 2, title: "Chunk 1", url: "/#c1", excerpt: "Two." },
    ]);
  });

  it("cuts a long text at a word, about 160 characters, with an ellipsis (3.6)", () => {
    const text = "Habib builds Android and iOS apps from one Kotlin codebase. ".repeat(6);
    const [{ excerpt = "" }] = sourcesOf([hit(text)]);
    expect(excerpt.length).toBeLessThanOrEqual(161);
    expect(excerpt.endsWith("…")).toBe(true);
    expect(text.startsWith(excerpt.slice(0, -1))).toBe(true);
    expect(text[excerpt.length - 1]).toBe(" ");
  });

  it("keeps a short text whole and collapses whitespace", () => {
    expect(sourcesOf([hit("  Open to roles\n now.  ")])[0].excerpt).toBe("Open to roles now.");
  });
});
