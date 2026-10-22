import { describe, expect, it } from "vitest";
import { caseStudySectionId, caseStudySectionNames } from "@/content/anchors";
import { publishedProjects } from "@/content/case-studies";
import { isPlaceholder } from "@/content/placeholder";
import { testimonial } from "@/content/site";
import index from "@/generated/guide-index.json";
import { buildChunks } from "./chunks";
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "./config";

const chunks = buildChunks();

describe("buildChunks", () => {
  it("never indexes placeholder text", () => {
    for (const chunk of chunks) {
      expect(chunk.text).not.toMatch(/\[object Object\]|"kind":"placeholder"/);
      expect(chunk.text, chunk.id).not.toMatch(/\[[A-Z][^\]]*\]/);
    }
  });

  it("gives every chunk a unique id, a title, a site URL and text", () => {
    expect(new Set(chunks.map((c) => c.id)).size).toBe(chunks.length);
    for (const chunk of chunks) {
      expect(chunk.title).not.toBe("");
      expect(chunk.text.length).toBeGreaterThan(20);
      expect(chunk.url).toMatch(/^\//);
    }
  });

  it("links each case study section with content to its heading ID on the page", () => {
    const ridlyUrls = chunks.filter((c) => c.id.startsWith("case-study:ridly:")).map((c) => c.url);
    expect(ridlyUrls).toContain(`/work/ridly#${caseStudySectionId("AI in the build")}`);
    expect(ridlyUrls).toContain(`/work/ridly#${caseStudySectionId("Test evidence")}`);
    expect(ridlyUrls).toContain(`/work/ridly#${caseStudySectionId("Impact")}`);
    const allowed = caseStudySectionNames.map(caseStudySectionId);
    for (const project of publishedProjects) {
      for (const chunk of chunks.filter((c) => c.id.startsWith(`case-study:${project.slug}:`))) {
        const [path, anchor] = chunk.url.split("#");
        expect(path).toBe(`/work/${project.slug}`);
        expect(allowed).toContain(anchor);
      }
    }
  });

  it("covers the facts recruiters ask about", () => {
    const all = chunks.map((c) => c.text).join("\n");
    expect(all).toContain("February 2027");
    expect(all).toContain("Kolding");
    expect(all).toContain("92.26%");
    expect(all).toContain("p95 of 96 ms");
    expect(all).toContain("habibwasi9@gmail.com");
    expect(chunks.some((c) => c.url === "/guide")).toBe(true);
  });

  it("indexes the AI workflow, the skills and the journey (Phase 4)", () => {
    const byId = (id: string) => chunks.find((c) => c.id === id);
    expect(byId("ai-workflow")?.url).toBe("/#ai");
    expect(byId("ai-workflow")?.text).toMatch(/LangGraph/);
    expect(byId("skills")?.url).toBe("/#stack");
    expect(byId("skills")?.text).toMatch(/Kotlin/);
    expect(byId("journey")?.url).toBe("/about#journey");
    expect(byId("journey")?.text).toMatch(/uTest/);
    expect(byId("qa-record")?.url).toBe("/about#qa-record");
  });

  it("leaves the testimonial out while it is a placeholder", () => {
    expect(isPlaceholder(testimonial.quote)).toBe(true);
    expect(chunks.some((c) => c.id === "testimonial")).toBe(false);
  });
});

describe("committed index", () => {
  it("was rebuilt after the last content change (run `npm run guide:index`)", () => {
    expect(index.chunks.map(({ id, title, url, text }) => ({ id, title, url, text }))).toEqual(chunks);
  });

  it("uses gte-small vectors", () => {
    expect(index.model).toBe(EMBEDDING_MODEL);
    expect(index.dimensions).toBe(EMBEDDING_DIMENSIONS);
    for (const chunk of index.chunks) expect(chunk.embedding).toHaveLength(EMBEDDING_DIMENSIONS);
  });
});
