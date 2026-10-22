import Image from "next/image";
import { projectCardId } from "@/content/anchors";
import { isPlaceholder } from "@/content/placeholder";
import type { Project } from "@/content/types";
import { Metrics } from "./metric";
import { Placeholder } from "./placeholder";
import { Tag, Tags } from "./tag";

const MAX_METRICS = 2;
const MAX_TAGS = 3;

function CardMedia({ cover }: { cover: Project["cover"] }) {
  if (isPlaceholder(cover)) return <Placeholder label={cover.label} />;
  if (isPlaceholder(cover.src)) return <Placeholder label={cover.src.label} />;
  return <Image src={cover.src} alt={cover.alt ?? ""} fill sizes="(max-width: 640px) 100vw, 600px" style={{ objectFit: "cover" }} />;
}

/**
 * A featured project on Home. The whole card is one link to the case study.
 * Until the case study is published, the card is not a link and says so.
 */
export function ProjectCard({ project }: { project: Project }) {
  const href = `/work/${project.slug}`;
  const cta = project.caseStudyReady ? "Read the case study" : "Case study coming";

  const body = (
    <>
      <div className="hw-card__media">
        <CardMedia cover={project.cover} />
      </div>
      <div className="hw-card__body">
        {project.status === "in-progress" && project.statusNote && (
          <Tag className="hw-card__status">{project.statusNote}</Tag>
        )}
        <span className="hw-label">{project.eyebrow}</span>
        <h3 className="hw-card__title">{project.title}</h3>
        <p className="hw-card__text">{project.summary}</p>
        <Metrics metrics={project.metrics.slice(0, MAX_METRICS)} />
        <Tags items={project.tags.slice(0, MAX_TAGS)} />
        <span className="hw-btn hw-btn--text">{cta}</span>
      </div>
    </>
  );

  if (!project.caseStudyReady) {
    return (
      <article id={projectCardId(project.slug)} className="hw-card" aria-label={project.title}>
        {body}
      </article>
    );
  }

  return (
    <a id={projectCardId(project.slug)} className="hw-card" href={href}>
      {body}
    </a>
  );
}
