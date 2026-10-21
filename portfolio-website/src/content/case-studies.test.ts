import { describe, expect, it } from "vitest";
import { caseStudies, getCaseStudy, nextCaseStudy, publishedProjects } from "./case-studies";
import { isPlaceholder } from "./placeholder";
import { featuredProjects } from "./projects";

describe("case studies", () => {
  it("exist for exactly the published featured projects", () => {
    const published = featuredProjects.filter((p) => p.caseStudyReady).map((p) => p.slug);
    expect(Object.keys(caseStudies).sort()).toEqual([...published].sort());
    expect(publishedProjects.map((p) => p.slug)).toEqual(["topictrail", "validation-portal"]);
  });

  it("keep Ridly unpublished until its case study ships (2.1)", () => {
    expect(getCaseStudy("ridly")).toBeUndefined();
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
    expect(nextCaseStudy("topictrail").slug).toBe("validation-portal");
    expect(nextCaseStudy("validation-portal").slug).toBe("topictrail");
  });
});

describe("Validation Portal", () => {
  const study = getCaseStudy("validation-portal")!;
  const text = JSON.stringify(study);

  it("names the model it actually uses", () => {
    expect(text).toContain("gpt-oss-20b");
    expect(text).not.toMatch(/Llama/i);
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
