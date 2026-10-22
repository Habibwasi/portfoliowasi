import { anchors, caseStudySectionId, hash, projectCardId } from "./anchors";

/**
 * Everything the AI guide says that isn't an answer from the model (3.1–3.5): labels,
 * jumps, the tour, fixed messages and the "How this guide works" page. The page text
 * is indexed too, so the guide can explain itself.
 */
export type GuideJump = { label: string; href: string };

export type TourStop = { target: string; text: string };

export const guide = {
  /** Panel header and dialog name (GD8). */
  label: "AI assistant",
  launcherLabel: "Open the AI assistant",
  intro: "Hi. I answer questions about Habib's work, skills and availability, using only what's on this site.",
  inputLabel: "Ask about Habib",
  inputPlaceholder: "When can he start?",
  jumpsHeading: "Jump to",
  tourLabel: "Take the 30-second tour",
  /** The quick jumps after the tour (GD4). Real links, so they work without the model. */
  jumps: [
    { label: "Best project", href: "/work/ridly" },
    // Until "How I build with AI" lands on Home (4.1), Ridly's "AI in the build" section proves it.
    { label: "AI workflow", href: `/work/ridly#${caseStudySectionId("AI in the build")}` },
    { label: "Proof", href: `/${hash(anchors.proof)}` },
    { label: "Contact", href: `/${hash(anchors.contact)}` },
  ] satisfies GuideJump[],
  tour: {
    stepSeconds: 6,
    stops: [
      { target: anchors.intro, text: "Habib is a software engineer graduating from SDU in January 2027, open to roles now." },
      { target: anchors.work, text: "Three projects, each with a full case study: the problem, his part, architecture and test evidence." },
      { target: projectCardId("ridly"), text: "Ridly: Android and iOS from one Kotlin codebase, built solo and load-tested with k6." },
      { target: anchors.proof, text: "His QA record at uTest, and what his team leader at Just Eat says." },
      { target: anchors.contact, text: "Email him, download the CV, book a call, or write here." },
    ] satisfies TourStop[],
  },
  offer: {
    text: "New here? Take the 30-second tour.",
    accept: "Start the tour",
    decline: "No thanks",
    /** Shown after the first scroll past this many pixels, once per browser (GD3). */
    afterScrollPx: 240,
  },
  messages: {
    thinking: "Thinking…",
    dontKnow:
      "I don't know. That isn't covered on this site. The quick jumps above might help, or you can ask Habib directly through the contact form.",
    busy: "The assistant is busy right now. The quick jumps still work.",
    error: "Something went wrong. Try again, or use the quick jumps.",
  },
  howItWorksLink: "How this guide works",
} as const;

/** The /guide page (3.5). Kept as plain text so the index can read it. */
export const howItWorks = {
  path: "/guide",
  title: "How this guide works",
  lede: "The assistant in the corner is a small retrieval-augmented generation (RAG) pipeline over this site. It answers only from the site's own text, cites where each answer comes from, and says \"I don't know\" when nothing fits.",
  buildSteps: [
    { name: "Chunk", text: "At build time, every case study section, project, the intro, availability, QA record and this page become one chunk each. Missing content is skipped, never indexed." },
    { name: "Embed", text: "Each chunk is embedded with gte-small, a 384-dimension open model that runs locally through Transformers.js. No embedding API." },
    { name: "Ship", text: "Chunks and vectors are written to a JSON file in the repository, so the index always deploys with the content it was built from." },
  ],
  requestSteps: [
    { name: "Limit", text: "Each visitor gets 10 questions per 10 minutes, and the whole site 300 a day, to stay inside the Groq free tier." },
    { name: "Embed", text: "The question is embedded with the same model, inside the serverless function." },
    { name: "Retrieve", text: "Keyword search (BM25) and vector search (cosine) each rank the chunks; reciprocal rank fusion merges them, and the top 4 become the sources." },
    { name: "Generate", text: "GPT-OSS 120B on Groq answers in a few sentences, only from the numbered sources, and cites them." },
    { name: "Cite", text: "Source links come from the chunks themselves, never from the model's text." },
  ],
  noMatch: "If no chunk shares a keyword with the question and none is close in meaning, the model isn't called at all; the guide says \"I don't know\". When sources are found but don't answer the question, the model is told to say \"I don't know\" too.",
  model: "GPT-OSS 120B (openai/gpt-oss-120b) on Groq, with low reasoning effort and a short answer limit. The model ID is one value in the code, so swapping it is a one-line change.",
  evaluation: "About 20 recruiter questions run against the real route every night: the expected source must be retrieved, the answer must cite a source and contain the key facts, and out-of-scope questions must get \"I don't know\". A few answers are checked for faithfulness by a second model call.",
  scale: "A few dozen chunks fit easily in memory, so there is no vector database. With many more documents, the same index format would move to Postgres with pgvector.",
  codeLinks: [
    { label: "Retrieval and search", path: "portfolio-website/src/lib/guide" },
    { label: "The API route", path: "portfolio-website/src/app/api/guide/route.ts" },
    { label: "The evaluation", path: "portfolio-website/evals/guide" },
  ],
} as const;
