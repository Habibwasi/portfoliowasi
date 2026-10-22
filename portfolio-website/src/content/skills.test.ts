import { describe, expect, it } from "vitest";
import { about } from "./about";
import { anchors, caseStudySectionId, caseStudySectionNames } from "./anchors";
import { caseStudies, publishedProjects } from "./case-studies";
import { howItWorks } from "./guide";
import { projects } from "./projects";
import { aiWorkflow, home, site } from "./site";
import { aiSkills, frameworkSkills, languageSkills, skills, techSkills } from "./skills";

/** Every page and anchor a proof may point at, plus the code links the site already shows. */
function isKnownHref(href: string): boolean {
  const codeLinks = projects.flatMap((p) => (p.links.code ? [p.links.code.href] : []));
  if (href === site.links.repo || codeLinks.includes(href)) return true;
  if (href === howItWorks.path) return true;
  const homeAnchors = Object.values(anchors).map((a) => `/#${a}`);
  if (homeAnchors.includes(href)) return true;
  const aboutAnchors = Object.values(about.anchors).map((a) => `${about.path}#${a}`);
  if (href === about.path || aboutAnchors.includes(href)) return true;
  const [path, hash] = href.split("#");
  const published = publishedProjects.map((p) => `/work/${p.slug}`);
  if (!published.includes(path)) return false;
  return hash === undefined || caseStudySectionNames.map(caseStudySectionId).includes(hash as never);
}

describe("skills (C14, AI6)", () => {
  it("proves every skill with at least one project, each with a link and one line", () => {
    for (const skill of skills) {
      expect(skill.proofs.length, skill.name).toBeGreaterThan(0);
      for (const proof of skill.proofs) {
        expect(proof.title, skill.name).not.toBe("");
        expect(proof.note.length, `${skill.name}: ${proof.title}`).toBeGreaterThan(10);
        expect(isKnownHref(proof.href), `${skill.name} → ${proof.href}`).toBe(true);
      }
    }
  });

  it("names each skill once", () => {
    const names = skills.map((s) => s.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it("has exactly the decided AI toolkit, without Llama 3.3 or RAGAS", () => {
    expect(aiSkills.map((s) => s.name)).toEqual([
      "Claude Code",
      "GitHub Copilot",
      "LangGraph",
      "Human-in-the-loop",
      "RAG pipelines",
      "Vector embeddings",
      "Cosine similarity",
      "Prompt engineering",
      "GPT-OSS via Groq",
    ]);
    expect(techSkills.length).toBeGreaterThan(0);
  });

  it("names no AI tool on a project that the toolkit doesn't prove", () => {
    const toolkit = aiSkills.map((s) => s.name.toLowerCase());
    for (const tag of projects.flatMap((p) => p.aiTags ?? [])) {
      const known = toolkit.some((name) => tag.toLowerCase().includes(name.split(" ")[0].toLowerCase()));
      expect(known, tag).toBe(true);
    }
  });

  it("puts every tech skill in one family, six per inner orbit ring (5.3)", () => {
    for (const skill of techSkills) expect(skill.family, skill.name).toMatch(/^(language|framework)$/);
    for (const skill of aiSkills) expect(skill.family, skill.name).toBeUndefined();
    expect(languageSkills.map((s) => s.name)).toEqual(["Kotlin", "Swift", "TypeScript", "Python", "PostgreSQL", "C#"]);
    expect(frameworkSkills.map((s) => s.name)).toEqual(["React", "Next.js", "NestJS", "Supabase", "k6", "TDD"]);
  });

  it("marks TopicTrail proofs as planned", () => {
    for (const proof of skills.flatMap((s) => s.proofs).filter((p) => p.href.startsWith("/work/topictrail"))) {
      expect(proof.note).toMatch(/^Planned/);
    }
  });
});

describe("AI workflow (AI2)", () => {
  it("has the five steps in order, with the human review in the loop", () => {
    expect(aiWorkflow.map((s) => s.name)).toEqual(["Plan", "Human review", "Build", "Test", "Ship"]);
    expect(aiWorkflow[1].text).toMatch(/HITL/);
    expect(aiWorkflow[2].text).toMatch(/Claude Code and GitHub Copilot/);
    expect(aiWorkflow[3].text).toMatch(/k6/);
  });

  it("numbers Home's sections in page order", () => {
    expect([home.work.eyebrow, home.ai.eyebrow, home.proof.eyebrow, home.stack.eyebrow, home.contact.eyebrow]).toEqual([
      "01 / Selected work",
      "02 / How I build with AI",
      "03 / Proof from others",
      "04 / Stack",
      "05 / Contact",
    ]);
  });
});

describe("old names stay off the site", () => {
  it("never says Hop, Llama or RAGAS", () => {
    const text = JSON.stringify({ site, home, aiWorkflow, skills, about, projects, caseStudies });
    expect(text).not.toMatch(/\bHop\b|Llama|RAGAS|Justit/);
  });
});
