import { anchors, caseStudySectionId, hash, type CaseStudySectionName } from "@/content/anchors";
import { publishedProjects, getCaseStudy } from "@/content/case-studies";
import { howItWorks } from "@/content/guide";
import { isPlaceholder } from "@/content/placeholder";
import { projects } from "@/content/projects";
import { qaRecord, site, testimonial } from "@/content/site";
import type { CaseStudySection, Content, Metric } from "@/content/types";
import type { GuideChunk } from "./search";

/** Real text only: placeholders are dropped, never indexed. */
const known = (values: (Content<string> | undefined)[]) => values.filter((v): v is string => typeof v === "string" && v.trim() !== "");

const sentence = (text: string) => (/[.!?]$/.test(text) ? text : `${text}.`);

const metricText = (m: Metric) => `${m.label}: ${m.value}${m.note ? ` (${m.note})` : ""}${m.expected ? ", expected" : ""}.`;

const sectionText = (section: CaseStudySection) =>
  known([...section.body, ...(section.points ?? [])]).map(sentence).join(" ");

/**
 * The site's text as chunks for the guide's index (3.3): one per case study section, one per
 * project, plus the intro, availability, QA record, contact, testimonial and the /guide page.
 * Built from src/content, the same source the pages render.
 */
export function buildChunks(): GuideChunk[] {
  const chunks: GuideChunk[] = [];
  const add = (id: string, title: string, url: string, parts: string[]) => {
    const text = parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
    if (text) chunks.push({ id, title, url, text });
  };

  const { location, status, languages } = site.availability;
  add("intro", `About ${site.name}`, `/${hash(anchors.intro)}`, [
    `${site.name}: ${site.roleLine}.`,
    site.intro,
    `Location: ${location}. Availability: ${status}. Languages: ${languages}.`,
  ]);

  add("qa-record", "QA record at uTest", `/${hash(anchors.proof)}`, [
    qaRecord.line,
    `${qaRecord.company}, ${qaRecord.tier} tier, rating ${qaRecord.rating}: ${qaRecord.testCycles} test cycles, ${qaRecord.issuesReported} issues reported, ${qaRecord.testCasesRun} test cases run, ${qaRecord.productsTested} products tested.`,
  ]);

  if (!isPlaceholder(testimonial.quote) && !isPlaceholder(testimonial.name)) {
    add("testimonial", `Testimonial from ${testimonial.role}`, `/${hash(anchors.proof)}`, [
      `"${testimonial.quote}" ${testimonial.name}, ${testimonial.role}.`,
    ]);
  }

  add("contact", "Contact", `/${hash(anchors.contact)}`, [
    `Email: ${site.email}.`,
    // The Calendly URL comes from an env var, so it stays out of the committed index.
    "The contact section at the end of the home page has Email me and Book a call (Calendly) buttons, and a contact form.",
    isPlaceholder(site.cv) ? "" : `Download the CV: ${site.cv}.`,
    `GitHub: ${site.links.github}. LinkedIn: ${site.links.linkedin}.`,
  ]);

  for (const project of projects) {
    const name = project.title.split(",")[0];
    const url = project.featured && project.caseStudyReady ? `/work/${project.slug}` : `/${hash(anchors.work)}`;
    add(`project:${project.slug}`, project.title, url, [
      `${project.title}${project.featured ? " (featured project)" : ""}.`,
      sentence(project.summary),
      project.statusNote ? `Status: ${project.statusNote}.` : "",
      known([project.role]).map((role) => `Habib's role: ${role}.`).join(""),
      project.metrics.map(metricText).join(" "),
      `Technologies: ${[...project.tags, ...(project.aiTags ?? [])].join(", ")}.`,
      project.links.code ? `Code: ${project.links.code.href}.` : "",
      project.links.live ? `Live demo: ${project.links.live.href}.` : "",
    ]);

    const study = project.featured ? getCaseStudy(project.slug) : undefined;
    if (!study || !publishedProjects.includes(project)) continue;

    const sections: [CaseStudySectionName, CaseStudySection][] = [
      ["Problem", study.problem],
      ["My role", study.role],
      ["AI in the build", study.aiInTheBuild],
      ["Solution", study.solution],
      ["Architecture", study.architecture],
      ["Test evidence", study.testEvidence],
    ];
    for (const [sectionName, section] of sections) {
      const text = sectionText(section);
      if (!text) continue;
      add(`case-study:${project.slug}:${caseStudySectionId(sectionName)}`, `${name}: ${sectionName}`, `/work/${project.slug}#${caseStudySectionId(sectionName)}`, [
        sectionName === "Problem" || sectionName === "Solution" ? `${name}. ${study.contextLine}` : `${name}.`,
        `${section.heading}.`,
        text,
      ]);
    }

    const facts = study.facts.filter((f) => !isPlaceholder(f.value)).map((f) => `${f.label}: ${f.value}.`);
    add(`case-study:${project.slug}:${caseStudySectionId("Impact")}`, `${name}: Impact and stack`, `/work/${project.slug}#${caseStudySectionId("Impact")}`, [
      `${name}.`,
      facts.join(" "),
      study.impact.map(metricText).join(" "),
      `Stack: ${study.stack.join(", ")}.`,
    ]);
  }

  add("guide", howItWorks.title, howItWorks.path, [
    howItWorks.lede,
    ...howItWorks.buildSteps.map((s) => `Build step, ${s.name}: ${s.text}`),
    ...howItWorks.requestSteps.map((s) => `Request step, ${s.name}: ${s.text}`),
    howItWorks.noMatch,
    howItWorks.model,
    howItWorks.evaluation,
    howItWorks.scale,
  ]);

  return chunks;
}
