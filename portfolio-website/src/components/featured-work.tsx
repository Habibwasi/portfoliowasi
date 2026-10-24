import { anchors } from "@/content/anchors";
import { featuredProjects, moreProjects } from "@/content/projects";
import { home, site } from "@/content/site";
import { ProjectCard } from "./hw";
import { SectionHead } from "./section-head";

/** Everything else, as a short list linking to GitHub where a public repo exists (C22). */
function MoreProjects() {
  return (
    <div className="hw-more">
      <div className="hw-more__head">
        <h3 className="hw-h3">{home.moreProjects.heading}</h3>
        <a className="hw-btn hw-btn--text" href={site.links.github} target="_blank" rel="noopener noreferrer">
          All repositories on GitHub
        </a>
      </div>
      <ul className="hw-more__list" aria-label={home.moreProjects.heading}>
        {moreProjects.map((project) => (
          <li key={project.slug} className="hw-more__item">
            {project.links.code ? (
              <a className="hw-more__title" href={project.links.code.href} target="_blank" rel="noopener noreferrer">
                {project.title}
                <span aria-hidden="true"> ↗</span>
              </a>
            ) : (
              <span className="hw-more__title">{project.title}</span>
            )}
            <span className="hw-more__summary">{project.summary}</span>
            <span className="hw-more__tags">{[...project.tags, ...(project.aiTags ?? [])].join(" · ")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Featured work, right after the hero (S1): the three projects, then More projects. */
export function FeaturedWork() {
  return (
    <section id={anchors.work} className="hw-container hw-section" aria-labelledby="work-heading">
      <SectionHead id="work-heading" eyebrow={home.work.eyebrow} heading={home.work.heading} subline={home.work.subline} />
      <div className="hw-cards">
        {featuredProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
      <MoreProjects />
    </section>
  );
}
