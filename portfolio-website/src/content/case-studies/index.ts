import { featuredProjects } from "../projects";
import type { CaseStudy, Project } from "../types";
import { ridly } from "./ridly";
import { topictrail } from "./topictrail";
import { validationPortal } from "./validation-portal";

/** Case studies by slug. */
export const caseStudies: Record<string, CaseStudy> = {
  topictrail,
  ridly,
  "validation-portal": validationPortal,
};

/** Featured projects whose case study page is published, in featured order. */
export const publishedProjects: Project[] = featuredProjects.filter(
  (p) => p.caseStudyReady && Object.hasOwn(caseStudies, p.slug),
);

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return Object.hasOwn(caseStudies, slug) ? caseStudies[slug] : undefined;
}

/** The published case study after `slug`, wrapping round to the first. */
export function nextCaseStudy(slug: string): Project {
  const index = publishedProjects.findIndex((p) => p.slug === slug);
  return publishedProjects[(index + 1) % publishedProjects.length];
}

/** "Case study 02 / 03 · Mobile + backend · AI workflow", from the project's eyebrow. */
export function caseStudyEyebrow(project: Project): string {
  const [number, ...rest] = project.eyebrow.split(" / ");
  return `Case study ${number} / ${String(featuredProjects.length).padStart(2, "0")} · ${rest.join(" / ")}`;
}
