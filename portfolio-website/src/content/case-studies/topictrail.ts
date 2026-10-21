import { placeholder } from "../placeholder";
import type { CaseStudy } from "../types";

/**
 * In progress (bachelor project, due January 2027): design and plans only, no results.
 * Everything still to be supplied is a placeholder (roadmap: "Content and assets to supply").
 */
export const topictrail: CaseStudy = {
  slug: "topictrail",
  contextLine:
    "A memory for what you browse: it keeps the pages you actually engaged with and finds them again by meaning, not only by keyword.",
  facts: [
    { label: "My role", value: placeholder("Role on TopicTrail") },
    { label: "Type", value: "Bachelor project, SDU" },
    { label: "Status", value: "In progress, due January 2027" },
  ],
  hero: {
    kind: "demo",
    src: placeholder("TopicTrail demo, once it runs"),
    caption: placeholder("Demo caption: one line on what it shows"),
  },
  problem: {
    heading: "Why it needs to exist",
    body: [placeholder("TopicTrail problem: who loses what they read, how they cope today, and what it costs them")],
  },
  role: {
    heading: "What I'm building",
    body: [],
    points: [
      placeholder("The part you own, in one line"),
      placeholder("A design decision you made and why"),
      placeholder("How you test it"),
    ],
  },
  aiInTheBuild: {
    heading: "AI in the build",
    body: [placeholder("Which AI tools help build TopicTrail, and where you review or overrule them")],
  },
  solution: {
    heading: "The planned pipeline",
    body: [
      "Planned: capture is local-first and opt-in. Only pages you engaged with past an engagement threshold are kept (0.1 in the current design).",
      "Planned: retrieval is a RAG pipeline that combines keyword search with semantic search over vector embeddings, so a half-remembered idea still finds the page.",
    ],
  },
  screens: [
    {
      kind: "screens",
      src: placeholder("TopicTrail screens, 3 to 5"),
      caption: placeholder("One line per screen"),
    },
  ],
  architecture: {
    heading: "How it fits together",
    body: [placeholder("TopicTrail architecture: one paragraph on how capture, indexing and search connect")],
  },
  architectureMedia: [
    {
      kind: "architecture",
      src: placeholder("TopicTrail architecture diagrams"),
      caption: placeholder("Diagram caption"),
    },
  ],
  testEvidence: {
    heading: "Evaluation plan and progress",
    body: [placeholder("TopicTrail evaluation plan: how retrieval quality is measured, against what")],
    points: [placeholder("Progress notes, each with a date")],
  },
  impact: [
    { value: "0.1", label: "Engagement threshold", note: "Design parameter from the PRD" },
    { value: "Local", label: "First, opt-in capture", note: "Planned design" },
  ],
  stack: ["RAG pipeline", "Vector embeddings", "Keyword + semantic search", "TDD"],
};
