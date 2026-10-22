import { placeholder } from "./placeholder";
import type { Content, Testimonial } from "./types";

export const site = {
  name: "Habib Ahmed Wasi",
  shortName: "Habib Wasi",
  roleLine: "Software engineer · AI-native · Denmark",
  /** 20 words or fewer (C2). */
  intro:
    "Software engineer graduating from SDU in January 2027. I build full-stack, mobile and RAG products, AI-native and test-driven.",
  /** The phrase in the intro that gets the marker highlight. */
  introHighlight: "AI-native and test-driven",
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
  /** Public path of the CV PDF (7.1); every CV button, the nav item and the guide's offer use it. */
  cv: "/cv/Habib-Ahmed-Wasi-CV.pdf" as Content<string>,
  hero: {
    /**
     * The line-art portrait beside the name (5.5, V3). Once drawn, replace the placeholder with
     * { src: "/hero/portrait.png", alt: "…" }; the 4:5 slot stays the same size (7.5).
     */
    portrait: placeholder("Line-art portrait") as Content<{ src: string; alt: string }>,
  },
  /** Set NEXT_PUBLIC_CALENDLY_URL (Vercel project settings) to switch "Book a call" on. */
  calendly: (process.env.NEXT_PUBLIC_CALENDLY_URL || placeholder("Calendly URL")) as Content<string>,
} as const;

/** Section copy on Home, in page order. */
export const home = {
  work: {
    eyebrow: "01 / Selected work",
    heading: "Three projects, end to end",
    subline: "Each gets a full case study: the problem, my part, architecture, demo, test evidence, and where AI helped build it.",
  },
  moreProjects: {
    heading: "More projects",
  },
  ai: {
    eyebrow: "02 / How I build with AI",
    heading: "AI-native, human in charge",
    subline:
      "I plan with agents, code with AI pair programmers and keep every decision reviewable. My own LangGraph workflow turns an idea into approved specs, with me as the human in the loop.",
    diagramLabel: "Agentic SDLC workflow",
    loopLabel: "rejected: revise",
    /** The loop arrow, said in words for screen readers. */
    loopText: "Rejected: back to Plan to revise.",
    toolkitHeading: "AI toolkit I use every week",
    closing:
      "AI drafts, I decide. Every AI-written change goes through my review, tests and CI before it ships. Questions? The guide in the corner knows the whole site.",
  },
  proof: {
    eyebrow: "03 / Proof from others",
    qaHeading: "QA record",
    fullRecord: "See the full record",
  },
  stack: {
    eyebrow: "04 / Stack",
    heading: "Shipped stack, AI-native toolkit",
    subline:
      "The AI toolkit I work with every day, and the languages and frameworks behind the projects above. Pick one to see where I used it.",
    aiGroup: "AI tools",
    languageGroup: "Languages and data",
    frameworkGroup: "Frameworks and tools",
    /** A toggle (aria-pressed), so its name stays the same either way. */
    pause: "Pause rotation",
  },
  contact: {
    eyebrow: "05 / Contact",
    heading: "Have a role in mind?",
    subline: "I graduate in January 2027. Tell me about the team and the problem you're solving.",
    formHeading: "Or write here",
  },
} as const;

/** "How I build with AI" (AI2): the workflow behind the projects, in order. */
export const aiWorkflow = [
  { name: "Plan", text: "LangGraph agents clarify, scope and write specs" },
  { name: "Human review", text: "I approve or reject every step (HITL)" },
  { name: "Build", text: "Claude Code and GitHub Copilot, reviewed by me" },
  { name: "Test", text: "TDD, k6 load and stress tests" },
  { name: "Ship", text: "CI/CD tests and builds every push" },
] as const;

export const qaRecord = {
  company: "uTest by Applause",
  since: "June 2024",
  tier: "Silver",
  rating: "92.26%",
  testCycles: 268,
  issuesReported: 46,
  testCasesRun: 234,
  productsTested: 100,
  /** The full record on About (4.4). */
  description: "Freelance functional testing for well-known consumer and fintech clients.",
  /** One credibility line for Home (C16). */
  line: "Silver-rated QA tester at uTest since June 2024: 268 test cycles, 46 issues reported, 92.26% rating.",
} as const;

/**
 * Two sentences, word for word, from Kasper Krogh's LinkedIn recommendation (20 October 2026;
 * he managed Habib directly). The full text: "I have been very fortunate to have Habib as one of
 * my employees during my employment as Team Lead at Just Eat Takeaway.com. Habib is incredibly
 * efficient at his tasks and his performance numbers were among the highest in the country. He is
 * reliable, good at problem solving and flexible. I can only give my warmest recommendations and
 * trust he will be a great addition in his future positions."
 */
export const testimonial: Testimonial = {
  quote:
    "Habib is incredibly efficient at his tasks and his performance numbers were among the highest in the country. He is reliable, good at problem solving and flexible.",
  name: "Kasper Krogh",
  role: "Team Lead, Just Eat Takeaway.com",
};
