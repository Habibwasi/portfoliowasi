/**
 * The hero's motion (5.1, 5.2) as plain functions, so the timing rules are testable without
 * a browser or the physics engine. Spec: phase-5-delight.md.
 */

/** Glyphs the scramble flickers through (design system AnimatedName). */
export const SCRAMBLE_GLYPHS = "ABCDEFGHJKLMNPRSTUVWXYZ#/<>{}*+=";

/** Lift wave: delay between words and each word's duration, in ms (whole words keep the kerning). */
export const LIFT_STAGGER_MS = 90;
export const LIFT_MS = 360;
/** Scramble: time per glyph, and delay between letters starting, in ms. */
export const SCRAMBLE_STEP_MS = 45;
export const SCRAMBLE_STAGGER_MS = 18;

/** The window event the hero fires when the name has settled; the physics waits for it. */
export const NAME_SETTLED_EVENT = "hw:name-settled";
/** Session key: the name animates on the first Home view of a tab session only. */
export const NAME_PLAYED_KEY = "hw-name-played";

/** "Habib Ahmed Wasi" → ["Habib Ahmed", "Wasi"]: the last name on its own line. */
export function nameLines(name: string): string[] {
  const words = name.split(" ");
  const last = words.pop()!;
  return words.length ? [words.join(" "), last] : [last];
}

/** The glyphs one letter shows (6–8 random ones), ending on the letter itself. Spaces don't scramble. */
export function scrambleSequence(letter: string, random: () => number = Math.random): string[] {
  if (letter.trim() === "") return [letter];
  const count = 6 + Math.min(2, Math.floor(random() * 3));
  const glyphs = Array.from({ length: count }, () => SCRAMBLE_GLYPHS[Math.floor(random() * SCRAMBLE_GLYPHS.length) % SCRAMBLE_GLYPHS.length]);
  return [...glyphs, letter];
}

export type Tile = { letter: string; signal?: true };

/** The physics letters beside the name; the vermilion H is the guide's body (GD1). */
export const tiles: Tile[] = [{ letter: "H", signal: true }, { letter: "W" }, { letter: "A" }, { letter: "S" }, { letter: "I" }];

/** Tile size in px, as the design system's letter tile. */
export const TILE_WIDTH = 72;
export const TILE_HEIGHT = 84;

/** A landing faster than this (px per 60 Hz step) squashes the tile and scrambles its letter. */
export const IMPACT_SPEED = 7;
export const SQUASH_MS = 120;
export const TILE_SCRAMBLE_MS = 200;

export function impactEffect(speed: number): { squash: boolean; scramble: boolean } {
  const hard = speed > IMPACT_SPEED;
  return { squash: hard, scramble: hard };
}

/** How far the shadow has grown, 0 on the floor to 1 at 300 px up. */
export function liftOf(heightAboveFloor: number): number {
  return Math.min(1, Math.max(0, heightAboveFloor / 300));
}
