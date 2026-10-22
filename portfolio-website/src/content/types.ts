/**
 * Content types for the site. Every piece of text the page shows lives in
 * src/content, typed here, so the page and the AI guide's index read the same source.
 *
 * Missing content is a Placeholder, never invented text: it renders as a labelled
 * slot on the page and shows up in listPlaceholders().
 */

export type Placeholder = {
  readonly kind: "placeholder";
  /** What is missing, e.g. "Ridly screens". Rendered as "[Ridly screens]". */
  readonly label: string;
};

/** A value that may still be missing. */
export type Content<T> = T | Placeholder;

export type Metric = {
  value: string;
  label: string;
  /** Conditions behind the number, e.g. "p95 at 300 virtual users". */
  note?: string;
  /** Expected rather than measured; shown as such. */
  expected?: boolean;
};

export type ExternalLink = {
  label: string;
  href: string;
};

export type MediaKind = "architecture" | "demo" | "screens" | "test-run";

export type MediaItem = {
  kind: MediaKind;
  caption: Content<string>;
  /** Image path under /public, or a YouTube video id for demo and test-run. */
  src: Content<string>;
  alt?: string;
  /** Poster image under /public for a video; without one the player shows a plain paper poster. */
  poster?: string;
  /** A phone screenshot: framed tall instead of 16:10. */
  shape?: "phone";
};

export type ProjectStatus = "complete" | "in-progress";

export type Project = {
  slug: string;
  title: string;
  /** Eyebrow, e.g. "01 / Mobile + backend". */
  eyebrow: string;
  /** One sentence on what it does for the user, under 25 words. */
  summary: string;
  status: ProjectStatus;
  /** Shown on the card next to the status, e.g. "Bachelor project · due Jan 2027". */
  statusNote?: string;
  /** Who built it: "Built solo", or the module he owned on a team project. */
  role: Content<string>;
  metrics: Metric[];
  tags: string[];
  aiTags?: string[];
  links: {
    code?: ExternalLink;
    live?: ExternalLink;
  };
  /** Card media; a placeholder until real screens exist. */
  cover: Content<MediaItem>;
  /** Featured projects get a case study page; the rest list under More projects. */
  featured: boolean;
  /** Whether /work/[slug] is published yet. */
  caseStudyReady: boolean;
};

export type CaseStudySection = {
  heading: string;
  /** Paragraphs, in order. */
  body: Content<string>[];
  /** Bullet points after the paragraphs, e.g. the parts he built. */
  points?: Content<string>[];
};

/** One cell of the facts row under the title: "My role", "Timeline"… */
export type CaseStudyFact = {
  label: string;
  value: Content<string>;
};

/**
 * One case study, in the fixed order the page renders it (S2, C7, C11):
 * problem → my role → AI in the build → solution → architecture → test evidence → impact.
 */
export type CaseStudy = {
  slug: string;
  /** One sentence under the title: what it is and for whom. */
  contextLine: string;
  facts: CaseStudyFact[];
  /** The large visual under the header, usually the demo. */
  hero: MediaItem;
  problem: CaseStudySection;
  role: CaseStudySection;
  aiInTheBuild: CaseStudySection;
  solution: CaseStudySection;
  /** 3 to 5 final screens at most (C10). */
  screens: MediaItem[];
  architecture: CaseStudySection;
  architectureMedia: MediaItem[];
  testEvidence: CaseStudySection;
  /** A test-run recording; absent when the project has no automated tests. */
  testRun?: MediaItem;
  impact: Metric[];
  stack: string[];
};

export type Testimonial = {
  quote: Content<string>;
  name: Content<string>;
  role: string;
};
