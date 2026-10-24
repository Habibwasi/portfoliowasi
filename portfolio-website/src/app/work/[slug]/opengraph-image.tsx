import { notFound } from "next/navigation";
import { caseStudyEyebrow, getCaseStudy, publishedProjects } from "@/content/case-studies";
import { getProject } from "@/content/projects";
import { site } from "@/content/site";
import { ogImage, ogSize } from "@/lib/og";

/** Per-page social preview (2.2): the case study's eyebrow, title and context line. */
export const alt = `Case study by ${site.name}`;
export const size = ogSize;
export const contentType = "image/png";
export const dynamicParams = false;

export function generateStaticParams() {
  return publishedProjects.map((project) => ({ slug: project.slug }));
}

export default async function CaseStudyOpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  const study = getCaseStudy(slug);
  if (!project || !study) notFound();
  return ogImage({ eyebrow: caseStudyEyebrow(project), title: project.title, lede: study.contextLine, footer: site.name });
}
