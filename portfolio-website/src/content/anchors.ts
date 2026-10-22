/**
 * Stable section IDs on Home. Links, the nav and the AI guide's jumps and tour
 * all target these, so renaming one is a single change here.
 */
export const anchors = {
  main: "main",
  intro: "intro",
  work: "work",
  ai: "ai",
  proof: "proof",
  stack: "stack",
  contact: "contact",
} as const;

export type Anchor = (typeof anchors)[keyof typeof anchors];

export const hash = (anchor: Anchor) => `#${anchor}` as const;

/** ID of a featured project's card on Home, e.g. "work-ridly". */
export const projectCardId = (slug: string) => `work-${slug}`;

/** Case study sections in page order (S2); each heading gets a stable ID. */
export const caseStudySectionNames = [
  "Problem",
  "My role",
  "AI in the build",
  "Solution",
  "Architecture",
  "Test evidence",
  "Impact",
] as const;

export type CaseStudySectionName = (typeof caseStudySectionNames)[number];

/** "AI in the build" → "cs-ai-in-the-build". */
export const caseStudySectionId = (name: CaseStudySectionName) => `cs-${name.toLowerCase().replace(/[^a-z]+/g, "-")}`;

/** A case study's title and its demo (the media under the header); the guide's tools point at them (5.6). */
export const caseStudyTitleId = "cs-title";
export const caseStudyDemoId = "cs-demo";
