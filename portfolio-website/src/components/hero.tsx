import { anchors, hash } from "@/content/anchors";
import { site } from "@/content/site";
import { ActionButton, Button, Placeholder } from "./hw";

/** Splits the intro around the highlighted phrase so it can carry the marker. */
function introParts(intro: string, phrase: string): [string, string, string] {
  const at = intro.indexOf(phrase);
  if (at === -1) return [intro, "", ""];
  return [intro.slice(0, at), phrase, intro.slice(at + phrase.length)];
}

/**
 * Static, server-rendered hero (1.1): name, role, intro, availability and the two actions,
 * all visible on first paint with no JavaScript (C1, P1). Animation arrives in Phase 5.
 */
export function Hero() {
  const nameWords = site.name.split(" ");
  const lastName = nameWords.pop();
  const [before, highlight, after] = introParts(site.intro, site.introHighlight);
  const { location, status, languages } = site.availability;

  return (
    <section id={anchors.intro} className="hw-container hw-hero" aria-labelledby="hero-name">
      <div className="hw-hero__text">
        <span className="hw-label">{site.roleLine}</span>
        <h1 id="hero-name" className="hw-hero__name">
          {nameWords.join(" ")} <br />
          {lastName}
        </h1>
        <p className="hw-hero__intro">
          {before}
          {highlight && <span className="hw-mark">{highlight}</span>}
          {after}
        </p>
        <p className="hw-hero__availability">
          {location} · {status} · {languages}
        </p>
        <div className="hw-actions">
          <Button variant="primary" href={hash(anchors.work)}>
            View case studies
          </Button>
          <ActionButton href={site.cv} download>
            Download CV
          </ActionButton>
        </div>
      </div>
      <div className="hw-hero__art">
        <Placeholder label="Line-art portrait" className="hw-hero__portrait" />
        <span className="hw-hero__tile hw-hero__tile--h" aria-hidden="true">
          H
        </span>
        <span className="hw-hero__tile hw-hero__tile--w" aria-hidden="true">
          W
        </span>
      </div>
    </section>
  );
}
