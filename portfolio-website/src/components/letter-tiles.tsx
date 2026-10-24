"use client";

import { useEffect, useRef } from "react";
import { NAME_SETTLED_EVENT, tiles } from "@/lib/hero/hero";
import type { PhysicsControl } from "@/lib/hero/physics";
import { cn } from "@/lib/utils";

const REDUCED = "(prefers-reduced-motion: reduce)";
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

const matches = (query: string) => typeof window.matchMedia === "function" && window.matchMedia(query).matches;

/** Physics only runs with a mouse, motion allowed, and the art column showing (phones hide it). */
function physicsAllowed(art: HTMLElement): boolean {
  return !matches(REDUCED) && matches(FINE_POINTER) && art.offsetParent !== null;
}

function whenNameSettled(callback: () => void): () => void {
  if (document.getElementById("hero-name")?.hasAttribute("data-settled")) {
    callback();
    return () => {};
  }
  window.addEventListener(NAME_SETTLED_EVENT, callback, { once: true });
  return () => window.removeEventListener(NAME_SETTLED_EVENT, callback);
}

const idle = (callback: () => void): (() => void) => {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(callback, { timeout: 2000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(callback, 200);
  return () => clearTimeout(id);
};

/**
 * The physics letters (5.2, C4, V5): five tiles beside the name, server-rendered as a still pile.
 * Where allowed, Matter.js loads once the name has settled and the browser is idle; the tiles
 * then fall in and can be dragged, flicked and poked. Paused offscreen and in a hidden tab;
 * switching to reduced motion puts them back in the pile.
 */
export function LetterTiles() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current!;
    const art = layer.parentElement!;
    if (!physicsAllowed(art)) return;

    let control: PhysicsControl | null = null;
    let cancelled = false;
    let visible = true;
    const sync = () => {
      if (!control) return;
      if (visible && document.visibilityState === "visible") control.resume();
      else control.pause();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    const reduced = window.matchMedia(REDUCED);
    const onReduced = () => {
      if (!reduced.matches) return;
      control?.stop();
      control = null;
    };

    let cancelIdle = () => {};
    const cancelWait = whenNameSettled(() => {
      cancelIdle = idle(async () => {
        const { default: Matter } = await import("matter-js");
        const { startPhysics } = await import("@/lib/hero/physics");
        if (cancelled || !physicsAllowed(art)) return;
        control = startPhysics(Matter, art, [...layer.querySelectorAll<HTMLElement>(".hw-letter")]);
        observer.observe(art);
        document.addEventListener("visibilitychange", sync);
        reduced.addEventListener("change", onReduced);
      });
    });

    return () => {
      cancelled = true;
      cancelWait();
      cancelIdle();
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", onReduced);
      control?.stop();
    };
  }, []);

  return (
    <div ref={ref} className="hw-letters" aria-hidden="true">
      {tiles.map((tile, i) => (
        <span key={tile.letter} className={cn("hw-letter", `hw-letter--${i + 1}`, tile.signal && "hw-letter--signal")}>
          <span className="hw-letter__lift" />
          <span className="hw-letter__face" data-letter={tile.letter}>
            {tile.letter}
          </span>
        </span>
      ))}
    </div>
  );
}
