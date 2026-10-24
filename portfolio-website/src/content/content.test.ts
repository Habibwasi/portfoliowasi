import { describe, expect, it } from "vitest";
import { anchors } from "./anchors";
import { caseStudies } from "./case-studies";
import { isPlaceholder, listPlaceholders, placeholder } from "./placeholder";
import { featuredProjects, moreProjects, projects } from "./projects";
import { qaRecord, site, testimonial } from "./site";

const allContent = { site, qaRecord, testimonial, projects, caseStudies };

describe("placeholders", () => {
  it("creates and detects a placeholder", () => {
    const p = placeholder("Ridly screens");
    expect(isPlaceholder(p)).toBe(true);
    expect(isPlaceholder("Ridly screens")).toBe(false);
    expect(isPlaceholder({ label: "x" })).toBe(false);
    expect(isPlaceholder(null)).toBe(false);
  });

  it("lists placeholders anywhere in nested content", () => {
    const nested = { a: [placeholder("one"), { b: placeholder("two") }], c: "done" };
    expect(listPlaceholders(nested)).toEqual(["one", "two"]);
  });

  it("lists the content still missing on the site", () => {
    const missing = listPlaceholders(allContent);
    expect(missing).not.toContain("CV PDF");
    expect(missing).toContain("Calendly URL");
    expect(missing).not.toContain("Name Surname");
  });
});

describe("projects", () => {
  it("features exactly three projects in the decided order", () => {
    expect(featuredProjects.map((p) => p.slug)).toEqual(["topictrail", "ridly", "validation-portal"]);
  });

  it("lists the other five under More projects", () => {
    expect(moreProjects.map((p) => p.slug)).toEqual([
      "ai-workflow-global",
      "undershelf",
      "heat-it",
      "deskinct",
      "medication-adherence-app",
    ]);
  });

  it("has unique slugs", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("marks TopicTrail as in progress with its due date", () => {
    const topictrail = projects.find((p) => p.slug === "topictrail")!;
    expect(topictrail.status).toBe("in-progress");
    expect(topictrail.statusNote).toMatch(/in progress/i);
    expect(topictrail.statusNote).toMatch(/Jan 2027/);
  });

  it("states Ridly's k6 number with its conditions", () => {
    const ridly = projects.find((p) => p.slug === "ridly")!;
    expect(ridly.role).toBe("Built solo");
    const search = ridly.metrics.find((m) => m.value === "96 ms")!;
    expect(search.label).toMatch(/p95/);
    expect(search.note).toMatch(/300 virtual users/);
  });

  it("keeps featured summaries under 25 words", () => {
    for (const p of featuredProjects) {
      expect(p.summary.split(/\s+/).length, p.slug).toBeLessThan(25);
    }
  });

  it("does not link to the dead Deskinct repo", () => {
    expect(JSON.stringify(projects)).not.toContain("Adymr/Desk-SemesterProject");
  });
});

describe("site", () => {
  it("keeps the intro to 20 words or fewer (C2)", () => {
    expect(site.intro.split(/\s+/).length).toBeLessThanOrEqual(20);
  });

  it("never opens with 'passionate'", () => {
    expect(site.intro.toLowerCase()).not.toContain("passionate");
  });

  it("uses the decided uTest numbers", () => {
    expect(qaRecord.rating).toBe("92.26%");
    expect(qaRecord.testCycles).toBe(268);
    expect(qaRecord.issuesReported).toBe(46);
  });

  it("credits the testimonial to the Just Eat team lead (7.4)", () => {
    expect(testimonial.name).toBe("Kasper Krogh");
    expect(testimonial.role).toBe("Team Lead, Just Eat Takeaway.com");
    // Two sentences at most (C15).
    expect(String(testimonial.quote).split(/(?<=\.) /)).toHaveLength(2);
  });
});

describe("decided names and claims", () => {
  const text = JSON.stringify(allContent);

  it.each([
    ["the old product name", /\bHop\b/],
    ["a retired model", /Llama 3\.3/i],
    ["the wrong company", /Justit/],
    ["the unproven Undershelf coverage", /80%\+/],
  ])("does not mention %s", (_, pattern) => {
    expect(text).not.toMatch(pattern);
  });
});

describe("anchors", () => {
  it("are unique", () => {
    const values = Object.values(anchors);
    expect(new Set(values).size).toBe(values.length);
  });
});
