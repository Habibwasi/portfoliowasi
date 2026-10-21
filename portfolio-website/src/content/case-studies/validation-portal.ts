import { placeholder } from "../placeholder";
import type { CaseStudy } from "../types";

/**
 * Facts come from the Validation-Portal repository (README and history, checked 2026-10-21).
 * The project has no tests or CI, so the evidence is the live demo, video and diagrams (C11 exception).
 */
export const validationPortal: CaseStudy = {
  slug: "validation-portal",
  contextLine:
    "A research tool for founders: surveys, customer interviews and an LLM verdict, so they test an idea before they build it.",
  facts: [
    { label: "My role", value: placeholder("Role on Validation Portal") },
    { label: "Started", value: "March 2026" },
    { label: "Platform", value: "Web app" },
    { label: "Status", value: "Live" },
  ],
  hero: {
    kind: "demo",
    src: placeholder("Validation Portal demo video"),
    caption: placeholder("Demo caption: one line on what the video shows"),
  },
  problem: {
    heading: "Why it needed to exist",
    body: [placeholder("Validation Portal problem: who struggled with what, how they handled it before, and why that was slow")],
  },
  role: {
    heading: "What I built",
    body: ["All 111 commits in the repository are mine."],
    points: [
      placeholder("The part you owned, in one line"),
      placeholder("A decision you made and why"),
      placeholder("What you checked and how"),
    ],
  },
  aiInTheBuild: {
    heading: "AI in the build",
    body: [placeholder("Which AI tools helped build Validation Portal, and where you reviewed or corrected them")],
  },
  solution: {
    heading: "From hunch to verdict",
    body: [
      'Founders write their assumptions as hypotheses ("I believe [customer] has [problem] and will pay [price] for [solution]"), share a public survey, and log customer interviews with pain scores, quotes and tags.',
      "An LLM reads the aggregated numbers and up to 15 quotes, then returns a verdict with themes, key quotes, next steps and a call on each hypothesis. The verdict follows fixed rules: a strong signal needs at least five interviews, 70% pain and 60% concept interest.",
      "Anyone can try it as a guest without signing up. Guest accounts and their data are deleted after seven days.",
    ],
  },
  screens: [
    { kind: "screens", src: placeholder("Hypothesis board screen"), caption: "Hypothesis board" },
    { kind: "screens", src: placeholder("Survey builder screen"), caption: "Survey builder" },
    { kind: "screens", src: placeholder("Dashboard screen"), caption: "Dashboard" },
    { kind: "screens", src: placeholder("AI analysis screen"), caption: "AI analysis" },
  ],
  architecture: {
    heading: "How it fits together",
    body: [
      "A React 19 single-page app (Vite, TypeScript) talks to Supabase: PostgreSQL with row-level security on every table, so each user, guest or not, only reads their own data.",
      "The AI calls run in Vercel serverless functions. They check the Supabase session before calling GPT-OSS 20B (openai/gpt-oss-20b) on Groq, so the API key never reaches the browser and anonymous traffic can't spend the quota.",
      "Resend emails the owner on each survey response, and Cloudflare Turnstile guards every sign-in, sign-up and guest session.",
    ],
  },
  architectureMedia: [
    {
      kind: "architecture",
      src: placeholder("Validation Portal architecture diagram"),
      caption: "The React app, Supabase, and the serverless functions that call Groq and Resend.",
    },
  ],
  testEvidence: {
    heading: "Proof it works",
    body: [
      "Validation Portal has no automated tests or CI yet. The evidence is the live demo, which anyone can use as a guest, plus the demo video and the diagrams above.",
    ],
  },
  impact: [
    { value: "111", label: "Commits" },
    { value: "Live", label: "Demo online", note: "validation-portal.vercel.app" },
  ],
  stack: ["React 19", "TypeScript", "Vite", "Supabase", "PostgreSQL", "Tailwind CSS", "Resend"],
};
