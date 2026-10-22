import Image from "next/image";
import { caseStudySectionId, type CaseStudySectionName } from "@/content/anchors";
import { caseStudyEyebrow, nextCaseStudy } from "@/content/case-studies";
import { isPlaceholder } from "@/content/placeholder";
import { featuredProjects } from "@/content/projects";
import { site } from "@/content/site";
import type { CaseStudy, CaseStudySection, Content, MediaItem, Project } from "@/content/types";
import { ActionButton, Button, MediaFrame, mediaLabels, Metrics, Placeholder, Tag, Tags } from "./hw";
import { VideoFacade } from "./video-facade";

function Prose({ value }: { value: Content<string> }) {
  return isPlaceholder(value) ? <Placeholder label={value.label} /> : <p>{value}</p>;
}

const isVideo = (item: MediaItem) => item.kind === "demo" || item.kind === "test-run";

/** Image under /public, a YouTube video behind the facade (2.3), or a placeholder. */
function Media({ item, className }: { item: MediaItem; className?: string }) {
  const { src } = item;
  let content = null;
  if (!isPlaceholder(src)) {
    content =
      isVideo(item) && !src.startsWith("/") ? (
        <VideoFacade videoId={src} title={isPlaceholder(item.caption) ? mediaLabels[item.kind] : item.caption} poster={item.poster} />
      ) : (
        <Image src={src} alt={item.alt ?? ""} fill sizes="(max-width: 640px) 100vw, 1200px" style={{ objectFit: "contain" }} />
      );
  }
  return (
    <MediaFrame kind={item.kind} caption={item.caption} missing={isPlaceholder(src) ? src.label : undefined} className={className}>
      {content}
    </MediaFrame>
  );
}

/** One numbered section: label and h2 on the left, the write-up on the right. */
function Section({ number, name, section, children }: { number: number; name: CaseStudySectionName; section?: CaseStudySection; children?: React.ReactNode }) {
  const id = caseStudySectionId(name);
  return (
    <section className="hw-container hw-cs-section" aria-labelledby={id}>
      <div className="hw-cs-section__grid">
        <div className="hw-cs-section__head">
          <span className="hw-label">
            {String(number).padStart(2, "0")} / {name}
          </span>
          {section && (
            <h2 id={id} className="hw-h3">
              {section.heading}
            </h2>
          )}
        </div>
        {section && (
          <div className="hw-prose">
            {section.body.map((value, i) => (
              <Prose key={i} value={value} />
            ))}
            {section.points && (
              <ul>
                {section.points.map((point, i) => (
                  <li key={i}>{isPlaceholder(point) ? <Placeholder label={point.label} inline /> : point}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

/** The case study template (1.4): the same order for every project, ending on the next one. */
export function CaseStudyView({ project, study }: { project: Project; study: CaseStudy }) {
  const eyebrow = caseStudyEyebrow(project);
  const next = nextCaseStudy(project.slug);
  const nextNumber = next.eyebrow.split(" / ")[0];
  const { code, live } = project.links;

  return (
    <article>
      <header className="hw-container hw-cs-header">
        <span className="hw-label">{eyebrow}</span>
        {project.status === "in-progress" && project.statusNote && <Tag className="hw-cs-header__status">{project.statusNote}</Tag>}
        <h1 className="hw-cs-header__title">{project.title}</h1>
        <p className="hw-cs-header__lede">{study.contextLine}</p>
        <div className="hw-cs-facts" role="group" aria-label="Project facts">
          <dl className="hw-cs-facts__list">
            {study.facts.map((fact) => (
              <div key={fact.label} className="hw-cs-facts__item">
                <dt className="hw-label">{fact.label}</dt>
                <dd>{isPlaceholder(fact.value) ? <Placeholder label={fact.value.label} inline /> : fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="hw-container hw-cs-hero">
        <Media item={study.hero} className="hw-cs-hero__frame" />
      </div>

      <Section number={1} name="Problem" section={study.problem} />
      <Section number={2} name="My role" section={study.role} />
      <Section number={3} name="AI in the build" section={study.aiInTheBuild} />
      <Section number={4} name="Solution" section={study.solution}>
        <div className="hw-cs-screens">
          {study.screens.map((screen, i) => (
            <Media key={i} item={screen} />
          ))}
        </div>
      </Section>
      <Section number={5} name="Architecture" section={study.architecture}>
        {study.architectureMedia.map((item, i) => (
          <Media key={i} item={item} />
        ))}
      </Section>
      <Section number={6} name="Test evidence" section={study.testEvidence}>
        {study.testRun && <Media item={study.testRun} />}
      </Section>
      <Section number={7} name="Impact" section={{ heading: "What came out of it", body: [] }}>
        <div className="hw-cs-impact">
          <Metrics metrics={study.impact} />
          <Tags items={study.stack} aiItems={project.aiTags} />
          <div className="hw-cs-impact__links">
            {code ? (
              <a className="hw-btn hw-btn--text" href={code.href} target="_blank" rel="noopener noreferrer">
                View the code on GitHub
              </a>
            ) : (
              <p className="hw-cs-impact__note">Code isn&apos;t public yet.</p>
            )}
            {live && (
              <a className="hw-btn hw-btn--text" href={live.href} target="_blank" rel="noopener noreferrer">
                Open the live demo
              </a>
            )}
          </div>
        </div>
      </Section>

      <aside className="hw-cs-next" aria-label="Next case study">
        <div className="hw-container hw-cs-next__inner">
          <div className="hw-cs-next__title">
            <span className="hw-label">
              Next case study · {nextNumber} / {String(featuredProjects.length).padStart(2, "0")}
            </span>
            <span className="hw-cs-next__name">{next.title.split(",")[0]}</span>
          </div>
          <div className="hw-actions">
            <Button variant="primary" href={`/work/${next.slug}`} aria-label={`Next project: ${next.title}`}>
              Next project <span aria-hidden="true">→</span>
            </Button>
            <ActionButton href={site.cv} download>
              Download CV
            </ActionButton>
          </div>
        </div>
      </aside>
    </article>
  );
}
