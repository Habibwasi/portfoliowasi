import { qaRecord } from "./site";
import type { Metric } from "./types";

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

export type CollageImage = { src: string; alt: string; width: number; height: number };

/**
 * One photo card (7.5): a few pictures laid out as a collage. "mosaic" puts the first picture
 * across the top and the rest in a 2×2 grid; "stack" shows screenshots as cards on paper;
 * "pair" puts a wide picture over a tall one.
 */
export type Collage = {
  layout: "mosaic" | "stack" | "pair";
  caption: string;
  images: CollageImage[];
};

const anchors = {
  journey: "journey",
  qaRecord: "qa-record",
} as const;

export const about = {
  path: "/about",
  anchors,
  eyebrow: "About",
  title: "The path so far",
  description:
    "Habib Ahmed Wasi's path from Upwork, uTest and Just Eat to three projects and graduating from SDU in January 2027, with his full QA record.",
  intro:
    "I'm finishing a BSc in Software Engineering at the University of Southern Denmark in Sønderborg, graduating in January 2027. Alongside it I've supported clients on Upwork, tested software on uTest and delivered for Just Eat.",
  photos: [
    {
      layout: "mosaic",
      caption: "Sønderborg, September 2023: my first weeks in Denmark, on the harbour by the SDU campus.",
      images: [
        { src: "/about/sonderborg-campus.jpg", alt: "Red-brick and glass buildings along Sønderborg harbour on a sunny day", width: 1200, height: 900 },
        { src: "/about/sonderborg-sculpture.jpg", alt: "A steel sculpture on the grass by the harbour, with the Alsik tower behind", width: 800, height: 600 },
        { src: "/about/sonderborg-promenade.jpg", alt: "The harbour promenade and the steel sculpture under a blue sky", width: 800, height: 600 },
        { src: "/about/sonderborg-harbour.jpg", alt: "A wooden walkway curving along the water towards the town", width: 800, height: 600 },
        { src: "/about/sonderborg-boardwalk.jpg", alt: "The boardwalk along the water, with the church spire in the distance", width: 800, height: 600 },
      ],
    },
    {
      layout: "stack",
      caption: "uTest by Applause, since June 2024: my profile, community badges and my article on rating growth.",
      images: [
        { src: "/about/utest-profile-wide.png", alt: "My uTest profile: 440 uPoints, ranked 3,470 of 2,916,456", width: 1220, height: 563 },
        { src: "/about/utest-badges.png", alt: "uTest community badges, including Best of the Net and So Popular", width: 710, height: 435 },
        { src: "/about/utest-article.png", alt: "My uTest article, Quality Over Chaos: How I Jumped 25% in Rating by Focusing on Reliability, with 143 likes", width: 918, height: 224 },
      ],
    },
    {
      layout: "pair",
      caption: "Job fairs, October 2026: two of them, in Vejle and in Sønderborg.",
      images: [
        { src: "/about/job-fair-vejle.jpg", alt: "Students and company stands under the arched roof of the job fair in Vejle", width: 1024, height: 577 },
        { src: "/about/job-fair-sdu.jpg", alt: "The job fair in Sønderborg seen from above, a crowd between the stands in the atrium", width: 805, height: 1406 },
      ],
    },
  ] satisfies Collage[],
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
