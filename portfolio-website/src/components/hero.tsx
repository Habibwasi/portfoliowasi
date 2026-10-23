import Image from "next/image";
import { anchors, hash } from "@/content/anchors";
import { site } from "@/content/site";
import { AnimatedName } from "./animated-name";
import { ActionButton, Button, ContentSlot } from "./hw";
import { LetterTiles } from "./letter-tiles";

/** Splits the intro around the highlighted phrase so it can carry the marker. */
function introParts(intro: string, phrase: string): [string, string, string] {
  const at = intro.indexOf(phrase);
  if (at === -1) return [intro, "", ""];
  return [intro.slice(0, at), phrase, intro.slice(at + phrase.length)];
}

/**
 * Hero (1.1, 5.1, 5.2, 5.5): name, role, intro, availability and the two actions, all
 * server-rendered and visible on first paint (C1, P1). The name then reveals and scrambles,
 * and the letter tiles beside the portrait come alive; both are extras on a page that works.
 */
export function Hero() {
  const [before, highlight, after] = introParts(site.intro, site.introHighlight);
  const { location, status, languages } = site.availability;

  return (
    <section id={anchors.intro} className="hw-container hw-hero" aria-labelledby="hero-name">
      <div className="hw-hero__text">
        <span className="hw-label">{site.roleLine}</span>
        <AnimatedName name={site.name} />
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
            View CV
          </ActionButton>
        </div>
      </div>
      <div className="hw-hero__art" data-physics="off">
        <div className="hw-hero__portrait">
          <ContentSlot value={site.hero.portrait}>
            {(portrait) => <Image src={portrait.src} alt={portrait.alt} fill preload unoptimized />}
          </ContentSlot>
        </div>
        <LetterTiles />
      </div>
    </section>
  );
}
