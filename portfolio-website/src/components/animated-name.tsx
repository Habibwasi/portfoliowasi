"use client";

import { Fragment, useEffect, useRef, type CSSProperties } from "react";
import {
  LIFT_MS,
  LIFT_STAGGER_MS,
  NAME_PLAYED_KEY,
  NAME_SETTLED_EVENT,
  SCRAMBLE_STAGGER_MS,
  SCRAMBLE_STEP_MS,
  nameLines,
  scrambleSequence,
} from "@/lib/hero/hero";

const reducedMotion = () => typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function playedThisSession(): boolean {
  try {
    return window.sessionStorage.getItem(NAME_PLAYED_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberPlayed() {
  try {
    window.sessionStorage.setItem(NAME_PLAYED_KEY, "1");
  } catch {
    // Blocked storage: the name may animate again on the next visit to Home.
  }
}

/** Tells the physics (5.2) that the name is readable and still; late listeners read the attribute. */
function settle(name: HTMLElement) {
  name.dataset.settled = "";
  window.dispatchEvent(new Event(NAME_SETTLED_EVENT));
}

/**
 * The hero name (5.1, C4): server-rendered and visible on first paint, one span per letter.
 * After `load` the words do a short lift wave, then each letter flickers through mono glyphs drawn
 * in an overlay (`data-glyph`), so the text itself never changes and nothing shifts (P1).
 */
export function AnimatedName({ name }: { name: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current!;
    if (reducedMotion() || playedThisSession()) {
      settle(el);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    let frame = 0;

    const run = () => {
      rememberPlayed();
      el.dataset.startedAt = String(Math.round(performance.now()));
      const letters = [...el.querySelectorAll<HTMLElement>(".hw-name__ch")];
      el.classList.add("is-lifting");
      const words = el.querySelectorAll(".hw-name__word").length;
      const scrambleAt = LIFT_STAGGER_MS * words + LIFT_MS;
      letters.forEach((letter, i) => {
        const sequence = scrambleSequence(letter.textContent ?? "");
        sequence.forEach((glyph, step) => {
          const last = step === sequence.length - 1;
          timers.push(
            setTimeout(() => {
              if (last) {
                letter.classList.remove("is-scrambling");
                delete letter.dataset.glyph;
              } else {
                letter.dataset.glyph = glyph;
                letter.classList.add("is-scrambling");
              }
            }, scrambleAt + i * SCRAMBLE_STAGGER_MS + step * SCRAMBLE_STEP_MS),
          );
        });
      });
      const end = scrambleAt + letters.length * SCRAMBLE_STAGGER_MS + 9 * SCRAMBLE_STEP_MS;
      timers.push(
        setTimeout(() => {
          el.classList.remove("is-lifting");
          settle(el);
        }, end),
      );
    };

    // After load and the fonts, so the animation never meets a font swap.
    let cancelled = false;
    const start = () => {
      const fonts = document.fonts?.ready ?? Promise.resolve();
      void fonts.then(() => {
        if (!cancelled) frame = requestAnimationFrame(run);
      });
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
    };
  }, []);

  let word = 0;
  return (
    <h1 ref={ref} id="hero-name" className="hw-hero__name hw-name" aria-label={name}>
      {nameLines(name).map((line, l) => (
        <Fragment key={line}>
          {l > 0 && (
            <>
              {" "}
              <br />
            </>
          )}
          {line.split(" ").map((text, w) => (
            <Fragment key={text}>
              {w > 0 && " "}
              <span className="hw-name__word" aria-hidden="true" style={{ "--w": word++ } as CSSProperties}>
                {[...text].map((ch, c) => (
                  <span key={c} className="hw-name__ch">
                    {ch}
                  </span>
                ))}
              </span>
            </Fragment>
          ))}
        </Fragment>
      ))}
    </h1>
  );
}
