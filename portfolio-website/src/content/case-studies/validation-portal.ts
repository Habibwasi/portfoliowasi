import { placeholder } from "../placeholder";
import type { CaseStudy } from "../types";

/**
 * Facts come from the Validation-Portal repository (README, api/, src/, supabase/schema.sql and
 * history, checked 2026-10-22). The problem and the decisions were drafted from the repository for
 * Habib to review (7.3). Screens are frames of the demo reel on the live site (src/components/demo),
 * which renders the app's real screens with sample data; the diagram is drawn from the code.
 * The project has no tests or CI, so the evidence is the live demo, video and diagrams (C11 exception).
 */
export const validationPortal: CaseStudy = {
  slug: "validation-portal",
  contextLine:
    "A research tool for founders: surveys, customer interviews and an LLM verdict, so they test an idea before they build it.",
  facts: [
    { label: "My role", value: "Built solo" },
    { label: "Started", value: "March 2026" },
    { label: "Platform", value: "Web app" },
    { label: "Status", value: "Live" },
  ],
  hero: {
    kind: "demo",
    src: "DqSZ-N4Znnc",
    caption: "A three-minute walkthrough of the live app, from a new idea to the AI verdict, with sample data.",
    poster: "/work/validation-portal/dashboard.png",
  },
  problem: {
    heading: "Why it needed to exist",
    body: [
      "It started with an idea of my own. Before building it, I wanted to know whether anyone actually had the problem, and the evidence ended up scattered: survey answers in one tool, interview notes in another, and no honest way to tell whether the signal was strong enough.",
      "Early founders hit the same wall. They build first and ask later, or they ask leading questions and hear what they hoped to hear. Validation Portal keeps the hypotheses, the survey and the conversations in one place, and asks what the evidence actually says.",
    ],
  },
  role: {
    heading: "What I built",
    body: ["I built it alone, from the database schema to the serverless functions. All 111 commits in the repository are mine."],
    points: [
      "AI drafts, the founder decides. Generated survey questions arrive as unsaved drafts and only reach the live survey once the founder saves them, and every question is scored against The Mom Test, with a rewrite suggested for any that lead the respondent.",
      "The AI never runs in the browser. On the first day I moved the model call into a serverless function that checks the Supabase session first, so the API key stays on the server and anonymous traffic can’t spend the quota.",
      "Anyone can try it without an account. Guests sign in anonymously through Supabase behind a Cloudflare Turnstile check, and an hourly job deletes their data once it is seven days old. A guest who adds an email keeps everything, because the user ID doesn’t change.",
    ],
  },
  aiInTheBuild: {
    heading: "AI in the build",
    body: [
      "I built it with GitHub Copilot and Claude Code, reviewing what they wrote before it went in.",
      "I also used the project to try out models for the product’s own AI. It started on OpenAI, moved to Google Gemini, then to Groq, where it now runs GPT-OSS 20B. Because every call goes through the serverless functions, each switch stayed on the server side.",
      placeholder("One concrete example of reviewing or correcting Copilot or Claude Code on Validation Portal"),
    ],
  },
  solution: {
    heading: "From hunch to verdict",
    body: [
      'Founders write their assumptions as hypotheses ("I believe [customer] has [problem] and will pay [price] for [solution]"), share a public survey, and log customer interviews with pain scores, quotes and tags.',
      "An LLM reads the aggregated numbers and up to 15 quotes, then returns a verdict with themes, key quotes, next steps and a call on each hypothesis. The verdict follows fixed rules: a strong signal needs at least five interviews, 70% pain and 60% concept interest. Founders can share the result as a read-only report link.",
      "In the Survey Builder, AI drafts questions from the idea’s description and checks each one for bias. One click translates the survey into eight languages (Arabic, Bengali, Danish, French, German, Hindi, Spanish and Turkish), so respondents answer one question at a time in their own language, without logging in.",
    ],
  },
  screens: [
    {
      kind: "screens",
      src: "/work/validation-portal/hypothesis-board.png",
      caption: "Hypothesis board",
      alt: "A hypothesis written as: I believe hourly retail and café workers have no fast way to swap shifts and will pay $4 a month for a shift-swap app with manager approval. Its status is untested.",
    },
    {
      kind: "screens",
      src: "/work/validation-portal/survey-builder.png",
      caption: "Survey builder with the bias check",
      alt: "Five survey questions, four marked unbiased. The fifth, would you use an app that made swapping shifts easier, is flagged as hypothetical with a suggested rewrite.",
    },
    {
      kind: "screens",
      src: "/work/validation-portal/public-survey.png",
      caption: "Public survey, in the respondent’s language",
      alt: "A phone showing the public survey: a language picker for English, French and Spanish, and question 3 of 5 with four answer options.",
    },
    {
      kind: "screens",
      src: "/work/validation-portal/dashboard.png",
      caption: "Dashboard",
      alt: "Dashboard for the idea: 12 conversations, 47 survey responses, 67% rated the pain 7 or higher, 64% said yes to the concept.",
    },
    {
      kind: "screens",
      src: "/work/validation-portal/ai-analysis.png",
      caption: "AI analysis",
      alt: "The AI verdict: strong signal from 12 interviews and 47 responses, three patterns with their strength, and quotes from the people interviewed.",
    },
  ],
  architecture: {
    heading: "How it fits together",
    body: [
      "A React 19 single-page app (Vite, TypeScript) talks to Supabase: PostgreSQL with row-level security on every table, so each user, guest or not, only reads their own data.",
      "The AI calls run in Vercel serverless functions: one for the verdict, the question drafts and the bias check, and one for translation. They check the Supabase session before calling GPT-OSS 20B (openai/gpt-oss-20b) on Groq.",
      "Resend emails the owner on each survey response, and Cloudflare Turnstile guards every sign-in, sign-up and guest session.",
    ],
  },
  architectureMedia: [
    {
      kind: "architecture",
      src: "/work/validation-portal/architecture.svg",
      caption: "The React app, Supabase, and the serverless functions that call Groq and Resend.",
      alt: "The founder app and the public survey read and write Supabase, which has row-level security and guest sign-in behind Cloudflare Turnstile. Serverless functions check the session, then call GPT-OSS 20B on Groq or Resend for email.",
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
  stack: ["React 19", "TypeScript", "Vite", "Supabase", "PostgreSQL", "Tailwind CSS", "GPT-OSS 20B", "Groq", "Resend"],
};
