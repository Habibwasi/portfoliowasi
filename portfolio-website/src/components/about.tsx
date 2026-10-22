import Image from "next/image";
import { about, journeyDate } from "@/content/about";
import { isPlaceholder } from "@/content/placeholder";
import { site } from "@/content/site";
import { ActionButton, Button, ContentSlot, Metric } from "./hw";

/** Three photos with captions (V3); placeholders until 7.5. */
function Photos() {
  return (
    <ul className="hw-about__photos" aria-label="Photos">
      {about.photos.map((photo, i) => (
        <li key={i}>
          <figure className="hw-about__photo">
            <ContentSlot value={photo.src}>
              {(src) => (
                <Image
                  src={src}
                  alt={isPlaceholder(photo.caption) ? "" : photo.caption}
                  width={600}
                  height={750}
                  sizes="(min-width: 1024px) 380px, 100vw"
                />
              )}
            </ContentSlot>
            <figcaption>
              <ContentSlot value={photo.caption} inline>
                {(caption) => caption}
              </ContentSlot>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}

/** The journey line (C18, V7): an ordered list; the line and dots are drawn in CSS. */
function Journey() {
  const { journey, anchors } = about;
  return (
    <section id={anchors.journey} className="hw-section hw-about__section" aria-labelledby="journey-heading">
      <div className="hw-section-head__title">
        <span className="hw-label">{journey.eyebrow}</span>
        <h2 id="journey-heading" className="hw-h2">
          {journey.heading}
        </h2>
      </div>
      <ol className="hw-journey" aria-label={journey.eyebrow}>
        {journey.entries.map((entry, i) => {
          const upcoming = i === journey.entries.length - 1;
          return (
            <li key={entry.month} className={upcoming ? "hw-journey__item hw-journey__item--upcoming" : "hw-journey__item"}>
              <time className="hw-label" dateTime={entry.month}>
                {journeyDate(entry.month)}
              </time>
              <h3 className="hw-journey__title">{entry.href ? <a href={entry.href}>{entry.title}</a> : entry.title}</h3>
              <p className="hw-journey__line">{entry.line}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function QaRecord() {
  const { qa, qaMetrics, anchors } = about;
  return (
    <section id={anchors.qaRecord} className="hw-section hw-about__section hw-about__qa" aria-labelledby="qa-heading">
      <div className="hw-section-head__title">
        <span className="hw-label">{qa.subline}</span>
        <h2 id="qa-heading" className="hw-h2">
          {qa.heading}
        </h2>
        <p className="hw-about__qa-text">{qa.description}</p>
      </div>
      <div className="hw-metrics hw-about__metrics">
        {qaMetrics.map((metric) => (
          <Metric key={metric.label} metric={metric} />
        ))}
      </div>
    </section>
  );
}

/** About (4.4, C18, C19): at the end of the flow, after the work. */
export function About() {
  return (
    <article className="hw-container hw-about">
      <header className="hw-cs-header">
        <span className="hw-label">{about.eyebrow}</span>
        <h1 className="hw-cs-header__title">{about.title}</h1>
        <p className="hw-cs-header__lede">{about.intro}</p>
      </header>
      <Photos />
      <Journey />
      <QaRecord />
      <section className="hw-section hw-about__closing" aria-labelledby="closing-heading">
        <h2 id="closing-heading" className="hw-h2">
          {about.closing}
        </h2>
        <div className="hw-actions">
          <ActionButton href={site.cv} variant="primary" download>
            Download CV
          </ActionButton>
          <Button href={`mailto:${site.email}`}>Email me</Button>
        </div>
      </section>
    </article>
  );
}
