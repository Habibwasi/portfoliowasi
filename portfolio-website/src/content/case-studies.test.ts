import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { caseStudies, getCaseStudy, nextCaseStudy, publishedProjects } from "./case-studies";
import { isPlaceholder } from "./placeholder";
import { featuredProjects } from "./projects";

describe("case studies", () => {
  it("exist for exactly the published featured projects", () => {
    const published = featuredProjects.filter((p) => p.caseStudyReady).map((p) => p.slug);
    expect(Object.keys(caseStudies).sort()).toEqual([...published].sort());
    expect(publishedProjects.map((p) => p.slug)).toEqual(["topictrail", "ridly", "validation-portal"]);
  });

  it.each(Object.values(caseStudies))("$slug has every section, each with content", (study) => {
    for (const section of [study.problem, study.role, study.aiInTheBuild, study.solution, study.architecture, study.testEvidence]) {
      expect(section.heading).not.toBe("");
      expect(section.body.length + (section.points?.length ?? 0)).toBeGreaterThan(0);
    }
    expect(study.stack.length).toBeGreaterThan(0);
  });

  it.each(Object.values(caseStudies))("$slug shows 5 screens at most (C10)", (study) => {
    expect(study.screens.length).toBeLessThanOrEqual(5);
  });

  it("cycles Next project through the published case studies", () => {
    expect(nextCaseStudy("topictrail").slug).toBe("ridly");
    expect(nextCaseStudy("ridly").slug).toBe("validation-portal");
    expect(nextCaseStudy("validation-portal").slug).toBe("topictrail");
  });

  it.each(Object.values(caseStudies))("$slug only shows images that exist, each with alt text (7.3, P4)", (study) => {
    const media = [study.hero, ...study.screens, ...study.architectureMedia, ...(study.testRun ? [study.testRun] : [])];
    for (const item of media) {
      if (isPlaceholder(item.src) || !item.src.startsWith("/")) continue;
      expect(existsSync(path.join(__dirname, "../../public", item.src)), item.src).toBe(true);
      expect(item.alt?.length, item.src).toBeGreaterThan(20);
    }
  });

  it.each(Object.values(caseStudies))("$slug uses valid YouTube IDs for its videos (2.3)", (study) => {
    const media = [study.hero, ...study.screens, ...study.architectureMedia, ...(study.testRun ? [study.testRun] : [])];
    for (const item of media) {
      if ((item.kind === "demo" || item.kind === "test-run") && !isPlaceholder(item.src) && !item.src.startsWith("/")) {
        expect(item.src, item.kind).toMatch(/^[A-Za-z0-9_-]{11}$/);
      }
    }
  });
});

describe("Ridly", () => {
  const study = getCaseStudy("ridly")!;
  const text = JSON.stringify(study);

  it("says it was built solo", () => {
    expect(study.facts).toContainEqual({ label: "My role", value: "Built solo" });
    expect(study.role.body.join(" ")).toMatch(/built Ridly alone|built solo/i);
  });

  it("states the k6 number with its percentile and stage", () => {
    const search = study.impact.find((m) => m.value === "96 ms")!;
    expect(search.label).toMatch(/p95/);
    expect(search.note).toMatch(/300 virtual users/);
    expect(study.testEvidence.body.join(" ")).toMatch(/p95 of 96 ms/);
    expect(study.testEvidence.body.join(" ")).toMatch(/300 to 600 to 1,500/);
  });

  it("names only the AI tools actually used (AI5)", () => {
    const ai = study.aiInTheBuild.body.join(" ");
    for (const tool of ["LangGraph", "Claude Code", "GitHub Copilot"]) expect(ai).toContain(tool);
    expect(text).not.toMatch(/Llama|ChatGPT|Cursor|Gemini/i);
    expect(text).not.toMatch(/Hop/);
  });

  it("has a test-run frame (C11)", () => {
    expect(study.testRun?.kind).toBe("test-run");
  });
});

describe("Validation Portal", () => {
  const study = getCaseStudy("validation-portal")!;
  const text = JSON.stringify(study);

  it("names the model it actually uses", () => {
    expect(text).toContain("gpt-oss-20b");
    expect(text).not.toMatch(/Llama/i);
  });

  it("covers the question drafts, the bias check and translation (7.3)", () => {
    const solution = study.solution.body.join(" ");
    expect(solution).toMatch(/drafts questions/);
    expect(solution).toMatch(/bias/);
    expect(solution).toMatch(/eight languages/);
    expect(study.facts).toContainEqual({ label: "My role", value: "Built solo" });
  });

  it("says plainly that it has no automated tests, and shows no test run (C11 exception)", () => {
    expect(study.testEvidence.body.join(" ")).toMatch(/no automated tests/i);
    expect(study.testRun).toBeUndefined();
  });
});

describe("TopicTrail", () => {
  const study = getCaseStudy("topictrail")!;

  it("shows no measured results while in progress", () => {
    for (const metric of study.impact) {
      expect(metric.expected || /design parameter|planned/i.test(metric.note ?? ""), metric.label).toBe(true);
    }
  });

  it("keeps screens and demo as placeholders until they exist", () => {
    expect(isPlaceholder(study.hero.src)).toBe(true);
    expect(study.screens.every((s) => isPlaceholder(s.src))).toBe(true);
  });
});
