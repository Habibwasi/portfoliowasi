import { tool } from "ai";
import { z } from "zod";
import { about } from "@/content/about";
import {
  anchors,
  caseStudyDemoId,
  caseStudySectionId,
  caseStudySectionNames,
  caseStudyTitleId,
  projectCardId,
} from "@/content/anchors";
import { getCaseStudy, publishedProjects } from "@/content/case-studies";
import { isPlaceholder } from "@/content/placeholder";
import { site } from "@/content/site";

/**
 * The page tools the guide's model may call (5.6, GD6). The server sends their schemas without
 * `execute`; the browser checks the input against the same schemas and runs them. Every input
 * is an enum of places the site really has, so the model can't send the visitor anywhere else.
 */

const nonEmpty = <T extends string>(values: T[]) => values as [T, ...T[]];
const shortTitle = (title: string) => title.split(",")[0];

export const sections = {
  [anchors.work]: "Selected work",
  [anchors.ai]: "How I build with AI",
  [anchors.proof]: "Proof",
  [anchors.stack]: "Stack",
  [anchors.contact]: "Contact",
} as const;
type Section = keyof typeof sections;

const slugs = nonEmpty(publishedProjects.map((p) => p.slug));
const demoSlugs = nonEmpty(publishedProjects.filter((p) => getCaseStudy(p.slug)?.hero.kind === "demo").map((p) => p.slug));
const titleOf = (slug: string) => shortTitle(publishedProjects.find((p) => p.slug === slug)!.title);

/** Everything `highlight` may point at: Home sections and cards, case study sections, About. */
export const highlightTargets: { target: string; label: string }[] = [
  ...Object.entries(sections).map(([id, label]) => ({ target: `/#${id}`, label })),
  ...publishedProjects.map((p) => ({ target: `/#${projectCardId(p.slug)}`, label: `${shortTitle(p.title)} card` })),
  ...publishedProjects.flatMap((p) =>
    caseStudySectionNames.map((name) => ({ target: `/work/${p.slug}#${caseStudySectionId(name)}`, label: `${shortTitle(p.title)}: ${name}` })),
  ),
  { target: `${about.path}#${about.anchors.journey}`, label: "Journey" },
  { target: `${about.path}#${about.anchors.qaRecord}`, label: "QA record" },
];

export const toolInputs = {
  scroll_to: z.object({ section: z.enum(nonEmpty(Object.keys(sections) as Section[])) }),
  open_case_study: z.object({ slug: z.enum(slugs) }),
  highlight: z.object({ target: z.enum(nonEmpty(highlightTargets.map((t) => t.target))) }),
  play_demo: z.object({ slug: z.enum(demoSlugs) }),
  start_tour: z.object({}),
  download_cv: z.object({}),
};

export type ToolName = keyof typeof toolInputs;

const descriptions: Record<ToolName, string> = {
  scroll_to: "Scroll the visitor to a section of the home page.",
  open_case_study: "Open a project's case study page.",
  highlight: "Show the visitor one specific part of a page: a project card, a case study section, the journey or the QA record.",
  play_demo: "Open a case study and show (and start, if it exists) its demo video.",
  start_tour: "Start the 30-second guided tour of the site.",
  download_cv: "Offer the visitor Habib's CV as a PDF. The visitor confirms before anything downloads.",
};

/** The CV tool is only offered once the PDF exists (7.1). */
export const cvReady = (cv: unknown = site.cv) => !isPlaceholder(cv);

/** The tool set sent to the model; no `execute`, so the browser runs them. */
export function guideTools(withCv = cvReady()) {
  const all = {
    scroll_to: tool({ description: descriptions.scroll_to, inputSchema: toolInputs.scroll_to }),
    open_case_study: tool({ description: descriptions.open_case_study, inputSchema: toolInputs.open_case_study }),
    highlight: tool({ description: descriptions.highlight, inputSchema: toolInputs.highlight }),
    play_demo: tool({ description: descriptions.play_demo, inputSchema: toolInputs.play_demo }),
    start_tour: tool({ description: descriptions.start_tour, inputSchema: toolInputs.start_tour }),
    download_cv: tool({ description: descriptions.download_cv, inputSchema: toolInputs.download_cv }),
  };
  return withCv ? all : Object.fromEntries(Object.entries(all).filter(([name]) => name !== "download_cv"));
}

/** What the browser does for a tool call. */
export type ToolAction =
  | { kind: "show"; path: string; id: string; label: string; play?: true }
  | { kind: "tour"; label: string }
  | { kind: "cv"; label: string };

/** Checks a tool call against the schemas and turns it into a page action; anything unknown or invalid → null. */
export function toolAction(name: string, input: unknown): ToolAction | null {
  if (!Object.hasOwn(toolInputs, name)) return null;
  const parsed = toolInputs[name as ToolName].safeParse(input ?? {});
  if (!parsed.success) return null;
  const value = parsed.data as Record<string, string>;
  switch (name as ToolName) {
    case "scroll_to":
      return { kind: "show", path: "/", id: value.section, label: sections[value.section as Section] };
    case "open_case_study":
      return { kind: "show", path: `/work/${value.slug}`, id: caseStudyTitleId, label: titleOf(value.slug) };
    case "highlight": {
      const [path, id] = value.target.split("#");
      return { kind: "show", path, id, label: highlightTargets.find((t) => t.target === value.target)!.label };
    }
    case "play_demo":
      return { kind: "show", path: `/work/${value.slug}`, id: caseStudyDemoId, label: `${titleOf(value.slug)} demo`, play: true };
    case "start_tour":
      return { kind: "tour", label: "The 30-second tour" };
    case "download_cv":
      return cvReady() ? { kind: "cv", label: "CV" } : null;
  }
}
