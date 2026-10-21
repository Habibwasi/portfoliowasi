import { placeholder } from "./placeholder";
import type { Content, Testimonial } from "./types";

export const site = {
  name: "Habib Ahmed Wasi",
  shortName: "Habib Wasi",
  roleLine: "Software engineer · AI-native · Denmark",
  /** 20 words or fewer (C2). */
  intro:
    "Software engineer graduating from SDU in January 2027. I build full-stack, mobile and RAG products, AI-native and test-driven.",
  availability: {
    location: "Kolding, Denmark",
    status: "Open to roles now, full-time from February 2027",
    languages: "English, learning Danish",
  },
  email: "habibwasi9@gmail.com",
  links: {
    github: "https://github.com/Habibwasi",
    linkedin: "https://linkedin.com/in/habib-ahmed-wasi-4985091b8",
    repo: "https://github.com/Habibwasi/portfoliowasi",
    ciBadge: "https://github.com/Habibwasi/portfoliowasi/actions/workflows/ci.yml/badge.svg",
    ciRuns: "https://github.com/Habibwasi/portfoliowasi/actions/workflows/ci.yml",
  },
  /** Public path of the CV PDF in /public, once supplied. */
  cv: placeholder("CV PDF") as Content<string>,
  calendly: placeholder("Calendly URL") as Content<string>,
} as const;

export const qaRecord = {
  company: "uTest by Applause",
  since: "June 2024",
  tier: "Silver",
  rating: "92.26%",
  testCycles: 268,
  issuesReported: 46,
  testCasesRun: 234,
  productsTested: 100,
  /** One credibility line for Home (C16). */
  line: "Silver-rated QA tester at uTest since June 2024: 268 test cycles, 46 issues reported, 92.26% rating.",
} as const;

export const testimonial: Testimonial = {
  quote: placeholder("Team leader's words, two sentences at most"),
  name: placeholder("Name Surname"),
  role: "Team leader, Just Eat",
};
