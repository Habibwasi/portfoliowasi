import { placeholder } from "./placeholder";
import { qaRecord } from "./site";
import type { Content, Metric } from "./types";

/**
 * The About page (4.4, C18, C19): intro, photos, the journey line and the full QA record.
 * Journey dates and lines come from the mockup; Habib checks them in Phase 7 (7.5).
 */
export type JourneyEntry = {
  /** "YYYY-MM", so the list sorts by date. */
  month: string;
  title: string;
  line: string;
  /** Where the step is proven on the site. */
  href?: string;
};

export type Photo = {
  src: Content<string>;
  caption: Content<string>;
};

const anchors = {
  journey: "journey",
  qaRecord: "qa-record",
} as const;

const photo = (n: number): Photo => ({
  src: placeholder(`Photo ${n}`),
  caption: placeholder(`Photo ${n} caption: where, when`),
});

export const about = {
  path: "/about",
  anchors,
  eyebrow: "About",
  title: "The path so far",
  description:
    "Habib Ahmed Wasi's path from Upwork, uTest and Just Eat to three projects and graduating from SDU in January 2027, with his full QA record.",
  intro:
    "I'm finishing a BSc in Software Engineering at the University of Southern Denmark in Sønderborg, graduating in January 2027. Alongside it I've supported clients on Upwork, tested software on uTest and delivered for Just Eat.",
  photos: [photo(1), photo(2), photo(3)],
  journey: {
    eyebrow: "Journey",
    heading: "Each step led to the next",
    entries: [
      { month: "2023-01", title: "Tech Assistant, Upwork", line: "Freelance: learned to earn and support clients on my own." },
      {
        month: "2024-06",
        title: "QA Tester, uTest by Applause",
        line: `${qaRecord.testCycles} test cycles, ${qaRecord.tier} rating, ${qaRecord.issuesReported} issues reported.`,
        href: `#${anchors.qaRecord}`,
      },
      { month: "2025-02", title: "Courier, Just Eat", line: "Vejle. 91% on time, the face of the company on the ground." },
      { month: "2026-03", title: "Validation Portal", line: "LLM-powered founder research tool, live on Vercel.", href: "/work/validation-portal" },
      { month: "2026-04", title: "Ridly", line: "Kotlin Multiplatform, built with my LangGraph HITL workflow.", href: "/work/ridly" },
      { month: "2026-09", title: "TopicTrail", line: "Bachelor project: passive capture and RAG semantic search.", href: "/work/topictrail" },
      { month: "2027-01", title: "Graduation, then the next role", line: "BSc in Software Engineering, SDU." },
    ] satisfies JourneyEntry[],
  },
  qa: {
    heading: "QA record",
    subline: `${qaRecord.company}, ${qaRecord.since} to now`,
    description: `${qaRecord.description} ${qaRecord.tier} rating.`,
  },
  qaMetrics: [
    { value: qaRecord.rating, label: "Rating" },
    { value: String(qaRecord.testCycles), label: "Test cycles" },
    { value: String(qaRecord.testCasesRun), label: "Test cases run" },
    { value: String(qaRecord.productsTested), label: "Products tested" },
    { value: String(qaRecord.issuesReported), label: "Issues reported" },
  ] satisfies Metric[],
  closing: "The full story, on paper",
} as const;

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2023-01" → "Jan 2023". */
export function journeyDate(month: string): string {
  const [year, m] = month.split("-");
  return `${months[Number(m) - 1]} ${year}`;
}
