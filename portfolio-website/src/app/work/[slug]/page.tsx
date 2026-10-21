import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyView } from "@/components/case-study";
import { getCaseStudy, publishedProjects } from "@/content/case-studies";
import { getProject } from "@/content/projects";

type Props = { params: Promise<{ slug: string }> };

/** Only published case studies exist; any other slug is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return publishedProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  const study = getCaseStudy(slug);
  if (!project || !study) return {};
  const title = `${project.title.split(",")[0]} case study`;
  return {
    title,
    description: study.contextLine,
    alternates: { canonical: `/work/${slug}` },
    openGraph: { title, description: study.contextLine, type: "article", url: `/work/${slug}` },
    twitter: { card: "summary_large_image", title, description: study.contextLine },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  const study = getCaseStudy(slug);
  if (!project || !study) notFound();
  return <CaseStudyView project={project} study={study} />;
}
