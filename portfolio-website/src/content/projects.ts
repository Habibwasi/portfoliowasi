import { placeholder } from "./placeholder";
import type { Project } from "./types";

/**
 * Featured projects in display order, then More projects.
 * Facts follow the roadmap's "Facts to check" table (2026-10-21).
 */
export const projects: Project[] = [
  {
    slug: "topictrail",
    title: "TopicTrail, a memory for what you browse",
    eyebrow: "01 / AI + RAG · Bachelor project",
    summary:
      "Keeps the content you actually engaged with and finds it again through a RAG pipeline: keyword search plus semantic search over vector embeddings.",
    status: "in-progress",
    statusNote: "Bachelor project · in progress · due Jan 2027",
    role: placeholder("Role on TopicTrail"),
    metrics: [
      { value: "0.1", label: "Engagement threshold", note: "Design parameter from the PRD" },
      { value: "Local", label: "First, opt-in capture" },
    ],
    tags: ["RAG pipeline", "Embeddings", "TDD"],
    links: {},
    cover: placeholder("TopicTrail architecture diagram"),
    featured: true,
    caseStudyReady: true,
  },
  {
    slug: "ridly",
    title: "Ridly, carpooling for Android and iOS",
    eyebrow: "02 / Mobile + backend · AI workflow",
    summary:
      "Drivers post trips, passengers book seats, and both chat in real time. Planned with my LangGraph workflow, load-tested with k6.",
    status: "complete",
    role: "Built solo",
    metrics: [
      { value: "96 ms", label: "Trip search p95", note: "At 300 virtual users, in a k6 ramp to 1,200" },
      { value: "387", label: "Commits, built solo" },
    ],
    tags: ["Kotlin MP", "SwiftUI", "NestJS"],
    aiTags: ["LangGraph", "Claude Code", "GitHub Copilot"],
    links: {
      code: { label: "HOP-KMP on GitHub", href: "https://github.com/Habibwasi/HOP-KMP" },
    },
    cover: {
      kind: "screens",
      src: "/work/ridly/cover.png",
      caption: "Search results, trip detail and settlement",
      alt: "Three Ridly screens: rides from Copenhagen to Aarhus, a trip at DKK 173.28 per seat, and paying the driver in MobilePay.",
    },
    featured: true,
    caseStudyReady: true,
  },
  {
    slug: "validation-portal",
    title: "Validation Portal, research for founders",
    eyebrow: "03 / Full-stack + LLM",
    summary:
      "Surveys, customer interviews and an LLM verdict with themes, key quotes and next steps, so founders test ideas before building.",
    status: "complete",
    role: "Built solo",
    metrics: [
      { value: "111", label: "Commits" },
      { value: "Live", label: "Demo online" },
    ],
    tags: ["TypeScript", "React", "Supabase"],
    aiTags: ["GPT-OSS 20B via Groq"],
    links: {
      code: { label: "Validation-Portal on GitHub", href: "https://github.com/Habibwasi/Validation-Portal" },
      live: { label: "validation-portal.vercel.app", href: "https://validation-portal.vercel.app" },
    },
    cover: {
      kind: "screens",
      src: "/work/validation-portal/ai-analysis.png",
      caption: "AI analysis",
      alt: "Validation Portal's AI verdict: a strong signal from 12 interviews and 47 survey responses, with the patterns it found.",
    },
    featured: true,
    caseStudyReady: true,
  },
  {
    slug: "ai-workflow-global",
    title: "AI_Workflow_Global",
    eyebrow: "LangGraph SDLC orchestrator",
    summary:
      "Turns a feature idea into approved specs, with a human-in-the-loop gate at every step. 33 tests.",
    status: "complete",
    role: "Built solo",
    metrics: [{ value: "33", label: "Tests" }],
    tags: ["Python", "LangGraph"],
    aiTags: ["Claude Code"],
    links: {
      code: { label: "GitHub", href: "https://github.com/Habibwasi/AI_Workflow_Global" },
    },
    cover: placeholder("AI_Workflow_Global screenshot"),
    featured: false,
    caseStudyReady: false,
  },
  {
    slug: "undershelf",
    title: "Undershelf",
    eyebrow: "Team project",
    summary: "Book search on a binary search tree with a hybrid TF-IDF and graph recommender.",
    status: "complete",
    role: placeholder("Undershelf: the part I built"),
    metrics: [],
    tags: ["Python", "Django", "SQLite"],
    links: {
      code: { label: "GitHub", href: "https://github.com/SP-SDU/Undershelf" },
    },
    cover: placeholder("Undershelf screenshot"),
    featured: false,
    caseStudyReady: false,
  },
  {
    slug: "heat-it",
    title: "Heat.IT",
    eyebrow: "Team project",
    summary: "Desktop app that optimises district heating schedules. I built the Asset Manager module.",
    status: "complete",
    role: "Asset Manager module",
    metrics: [],
    tags: ["C#", ".NET", "Avalonia"],
    links: {
      code: { label: "GitHub", href: "https://github.com/Bobike123/HeatIT" },
    },
    cover: placeholder("Heat.IT screenshot"),
    featured: false,
    caseStudyReady: false,
  },
  {
    slug: "deskinct",
    title: "Deskinct",
    eyebrow: "Team project",
    summary: "IoT smart-desk tracking with REST integration and a usage dashboard.",
    status: "complete",
    role: placeholder("Deskinct: the part I built"),
    metrics: [],
    tags: ["PHP", "Laravel", "IoT"],
    // The old repo link (Adymr/Desk-SemesterProject) is a 404; no public link until a new one exists.
    links: {},
    cover: placeholder("Deskinct screenshot"),
    featured: false,
    caseStudyReady: false,
  },
  {
    slug: "medication-adherence-app",
    title: "Medication Adherence App",
    eyebrow: "Android",
    summary: "Android app to track and manage medication.",
    status: "complete",
    role: placeholder("Medication Adherence App: role"),
    metrics: [],
    tags: ["Kotlin", "Android"],
    // No public repo found; link once it is public.
    links: {},
    cover: placeholder("Medication Adherence App screenshot"),
    featured: false,
    caseStudyReady: false,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const moreProjects = projects.filter((p) => !p.featured);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
