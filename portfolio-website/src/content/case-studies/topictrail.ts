import { placeholder } from "../placeholder";
import type { CaseStudy } from "../types";

/**
 * In progress (bachelor project with one teammate, due January 2027): design and plans only, no
 * results. Facts come from the project files (proposal, PRD, requirements, ToS feasibility, research
 * themes, biweekly report of 13 October, tech stack options of 14 October, class diagram of
 * 15 October; read 2026-10-22). Nothing runs yet, so the hero is the planned architecture and
 * there are no screens.
 */
export const topictrail: CaseStudy = {
  slug: "topictrail",
  contextLine:
    "A memory for what you browse: it keeps the videos and pages you actually engaged with and finds them again by meaning, not only by keyword.",
  facts: [
    { label: "My role", value: "Team of two" },
    { label: "Type", value: "Bachelor project, SDU" },
    { label: "Started", value: "September 2026" },
    { label: "Status", value: "In design, building next" },
  ],
  hero: {
    kind: "architecture",
    src: "/work/topictrail/architecture.svg",
    caption: "The planned system: a Chrome extension that keeps only engaged content, a server that searches it, and a dashboard.",
    alt: "Planned architecture. A Chrome extension asks for consent, captures what the user watches or reads, keeps items with a watch ratio of 0.1 or more, and queues them until they sync. A server searches by keyword and meaning and runs embeddings and summaries with self-hosted models. Content is stored in PostgreSQL, encrypted with a per-user key. A web dashboard shows topics, search, summaries and privacy controls.",
  },
  problem: {
    heading: "Why it needs to exist",
    body: [
      "Every day people pass useful things online: a video, an article, a post in a feed. A day later it is gone. Browser history records where you have been, not what you took in, and bookmarks and note apps only work if you stop to save something at the moment you see it.",
      "Short-video feeds make it worse, because they are built for scrolling on. TopicTrail asks whether the keeping and organising can happen by itself: notice what someone actually engaged with, and let them find it again later by what it was about.",
    ],
  },
  role: {
    heading: "What I'm building",
    body: [
      "We are two students, supervised at SDU. We wrote the requirements together and split the rest: my parts are the research on implicit interaction, short-form video and how to evaluate retrieval, the system architecture and the API design. The tech stack is a joint decision.",
    ],
    points: [
      "Engagement is measured, not guessed. A watch ratio divides the seconds watched by the video's length, and only items at 0.1 or more are kept: 10 seconds of a 60-second video counts, 5 seconds doesn’t. The threshold is a setting, and per-category thresholds are left for later.",
      "Keyword search is the baseline. Semantic search over embeddings is added on top, and the plan compares keyword, semantic and the combination instead of assuming that the newer method wins.",
      "Privacy is part of the design, not a checkbox. Capture starts only after an explicit opt-in, an indicator shows whenever tracking is on, sensitive sites such as banking, email and health are excluded by default, and pausing, excluding a site and deleting an item or a date range are real API endpoints. A terms-of-service review sets the scope: read only what the page already shows the user, never fetch anything in the background, keep titles and metadata only.",
      "The design changed when it had to. The first version kept everything in the browser and showed it in an Electron app. The October design moves search and summaries to a server, with each user’s content encrypted under their own key, so deleting an account makes every copy, backups included, unreadable.",
    ],
  },
  aiInTheBuild: {
    heading: "AI in the build",
    body: [placeholder("Which AI tools help build TopicTrail, and where you review or overrule them")],
  },
  solution: {
    heading: "The planned pipeline",
    body: [
      "A Chrome extension watches what the user plays or reads on YouTube and ordinary web pages, and filters it by engagement. Only engaged items are kept, with their title, link, date and type; query strings are stripped so search terms and tokens are never stored. They wait in a local queue and sync when they can.",
      "On the dashboard the user can browse by topic or search by words or meaning, and ask for a short summary that links back to every source. Summaries are written only after a search, not for every item, to keep the work and the cost down.",
    ],
  },
  screens: [],
  architecture: {
    heading: "How it fits together",
    body: [
      "Three parts. The extension holds the consent manager, the capture script, the engagement detector and a sync client with an offline queue. The web app is the dashboard. The server has a sync service, a privacy service for settings, export and deletion, a search service, and a summarizer that calls a self-hosted model.",
      "Embeddings and summaries run as background jobs on our own servers, so captured content never goes to an outside AI provider. The source link, title, text and embedding of every item are stored encrypted with a key that belongs to that user.",
      "Six complete stacks were compared in October, from a Supabase or TypeScript start to an EU self-hosted setup, against how fast each ships and how few parties touch user content. The choice is the next step.",
    ],
  },
  architectureMedia: [
    {
      kind: "architecture",
      src: "/work/topictrail/class-diagram.png",
      caption: "The simplified class diagram (15 October 2026): extension, web app, server services and the stored data.",
      alt: "UML class diagram. Browser extension: ConsentManager, ContentCaptureScript, BrowserExtension, EngagementDetector with a threshold, ExtensionStorage and SyncClient. Web app: WebApp. Server services: SyncService, PrivacyService, SearchService with keyword and semantic search, and Summarizer with a self-hosted model. Stored data in PostgreSQL: UserSettings, User, ContentItem, Topic and Summary.",
    },
  ],
  testEvidence: {
    heading: "Evaluation plan and progress",
    body: [
      "Personal search can’t be tested on a shared benchmark, because everyone’s archive is different and private. So each participant will be tested on their own TopicTrail archive, with tasks built from what they actually watched: find a known item (“what article did I read last week?”), look up a fact (“what did I read about AI?”) and gather everything on a subject.",
      "Search is judged by comparing keyword, semantic and combined retrieval on those tasks. Summaries are judged with RAGAS (faithfulness, context precision and recall, answer relevance) plus human spot checks. The research behind the plan also recommends MRR and Hit@k for re-finding and V-measure for topics; those are kept for after the first version.",
    ],
    points: [
      "September 2026: project proposal, scoped to Chrome and YouTube first.",
      "30 September to 13 October 2026: literature review in six themes, three of them mine, and the product requirements document.",
      "6 October 2026: terms-of-service and GDPR review: feasible, with conditions.",
      "14 October 2026: six complete tech stacks compared.",
      "15 October 2026: class diagram for the extension, web app and server design.",
      "Next: choose the stack, design the API and data model, then build the extension’s capture and engagement detection.",
    ],
  },
  impact: [
    { value: "0.1", label: "Engagement threshold", note: "Design parameter from the PRD" },
    { value: "3", label: "Search task types", note: "Planned evaluation: known item, fact, gather" },
  ],
  stack: ["Chrome extension (MV3)", "RAG pipeline", "Vector embeddings", "Keyword + semantic search", "PostgreSQL", "Per-user encryption", "Self-hosted LLM"],
};
