import { caseStudySectionId, type CaseStudySectionName } from "./anchors";
import { howItWorks } from "./guide";
import { getProject } from "./projects";
import { site } from "./site";

/**
 * Every skill the site names, once, with the work that proves it (C14, AI6). The AI toolkit
 * on Home (4.1) and the Stack row (4.3) both read this list; the orbit (5.3) will too.
 */
export type SkillProof = {
  /** Project or page name, e.g. "Ridly". */
  title: string;
  href: string;
  /** One line on what the skill did there. */
  note: string;
};

export type Skill = {
  name: string;
  /** AI tools use dark tags so they read apart from languages and frameworks. */
  kind: "ai" | "tech";
  proofs: SkillProof[];
};

/** A project's case study (or a section of it), or its code link when it has no case study. */
function project(slug: string, note: string, section?: CaseStudySectionName): SkillProof {
  const p = getProject(slug);
  if (!p) throw new Error(`Unknown project: ${slug}`);
  const title = p.title.split(",")[0];
  if (p.featured && p.caseStudyReady) {
    return { title, href: `/work/${slug}${section ? `#${caseStudySectionId(section)}` : ""}`, note };
  }
  if (!p.links.code) throw new Error(`${slug} has no case study or code link to prove a skill`);
  return { title, href: p.links.code.href, note };
}

const guidePage = (note: string): SkillProof => ({ title: "This site's AI guide", href: howItWorks.path, note });
const thisSite = (note: string): SkillProof => ({ title: "This site", href: site.links.repo, note });

export const skills: Skill[] = [
  {
    name: "Claude Code",
    kind: "ai",
    proofs: [
      project("ridly", "Wrote code against Agent.md, the architecture rules kept in the repository", "AI in the build"),
      project("ai-workflow-global", "Built the LangGraph orchestrator and its 33 tests"),
      thisSite("Built test-first, with CI on every push"),
    ],
  },
  {
    name: "GitHub Copilot",
    kind: "ai",
    proofs: [project("ridly", "A bug-audit skill checks Ridly's own failure modes", "AI in the build")],
  },
  {
    name: "LangGraph",
    kind: "ai",
    proofs: [
      project("ridly", "Planning workflow with me as the human in the loop", "AI in the build"),
      project("ai-workflow-global", "SDLC orchestrator from idea to approved specs"),
    ],
  },
  {
    name: "Human-in-the-loop",
    kind: "ai",
    proofs: [
      project("ai-workflow-global", "A human approval gate at every step"),
      project("ridly", "The agent stops and asks when a request conflicts with the architecture", "AI in the build"),
    ],
  },
  {
    name: "RAG pipelines",
    kind: "ai",
    proofs: [
      guidePage("Chunking, hybrid retrieval, citations and an evaluation set"),
      project("topictrail", "Planned: keyword plus semantic search over what you browsed"),
    ],
  },
  {
    name: "Vector embeddings",
    kind: "ai",
    proofs: [
      guidePage("gte-small, 384 dimensions, run locally without an API"),
      project("topictrail", "Planned: semantic search over vector embeddings"),
    ],
  },
  {
    name: "Cosine similarity",
    kind: "ai",
    proofs: [guidePage("Vector search, fused with BM25 keyword search")],
  },
  {
    name: "Prompt engineering",
    kind: "ai",
    proofs: [
      guidePage("Answers only from numbered sources, cites them, and says \"I don't know\""),
      project("validation-portal", "An LLM verdict with themes, key quotes and next steps"),
    ],
  },
  {
    name: "GPT-OSS via Groq",
    kind: "ai",
    proofs: [
      project("validation-portal", "GPT-OSS 20B writes the research verdict"),
      guidePage("GPT-OSS 120B answers questions about this site"),
    ],
  },
  {
    name: "Kotlin",
    kind: "tech",
    proofs: [project("ridly", "Shared Kotlin Multiplatform module and the Android app")],
  },
  {
    name: "Swift",
    kind: "tech",
    proofs: [project("ridly", "The iOS app in SwiftUI, over the shared module")],
  },
  {
    name: "TypeScript",
    kind: "tech",
    proofs: [
      project("validation-portal", "The React app and the serverless functions that call Groq"),
      project("ridly", "The NestJS API"),
      thisSite("Next.js, tested with Vitest and Playwright"),
    ],
  },
  {
    name: "Python",
    kind: "tech",
    proofs: [project("ai-workflow-global", "LangGraph orchestrator with 33 tests")],
  },
  {
    name: "React",
    kind: "tech",
    proofs: [project("validation-portal", "React 19 front end"), thisSite("Next.js and React")],
  },
  {
    name: "Next.js",
    kind: "tech",
    proofs: [thisSite("App Router, static pages and the guide's API route")],
  },
  {
    name: "NestJS",
    kind: "tech",
    proofs: [project("ridly", "API with Prisma, Socket.IO chat and BullMQ push notifications", "Architecture")],
  },
  {
    name: "PostgreSQL",
    kind: "tech",
    proofs: [
      project("ridly", "PostGIS geography points with spatial indexes for trip search", "Architecture"),
      project("validation-portal", "Row-level security on every table, through Supabase"),
    ],
  },
  {
    name: "Supabase",
    kind: "tech",
    proofs: [project("validation-portal", "Database and sessions; the functions check the session before calling Groq"), project("ridly", "Sign-in and auth")],
  },
  {
    name: "C#",
    kind: "tech",
    proofs: [project("heat-it", "The Asset Manager module, in .NET and Avalonia")],
  },
  {
    name: "k6",
    kind: "tech",
    proofs: [project("ridly", "Load test ramped 300 → 600 → 1,500 virtual users", "Test evidence")],
  },
  {
    name: "TDD",
    kind: "tech",
    proofs: [thisSite("Tests first; CI runs unit, end-to-end and Lighthouse checks"), project("ai-workflow-global", "33 tests over the LangGraph workflow")],
  },
];

export const aiSkills = skills.filter((s) => s.kind === "ai");
export const techSkills = skills.filter((s) => s.kind === "tech");
