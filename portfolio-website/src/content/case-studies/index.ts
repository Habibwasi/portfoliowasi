import { featuredProjects } from "../projects";
import type { CaseStudy, Project } from "../types";
import { topictrail } from "./topictrail";
import { validationPortal } from "./validation-portal";

/** Case studies by slug. Ridly's arrives in Phase 2 (2.1). */
export const caseStudies: Record<string, CaseStudy> = {
  topictrail,
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
