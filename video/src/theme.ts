import tokens from "../../portfolio-website/design-system/tokens.json";

/**
 * The site's design tokens (portfolio-website/design-system/tokens.json), read as data. Scenes
 * take every colour, radius and shadow from here; theme.test.ts fails on a colour written by hand.
 */
type ColorName = (typeof tokens.color.tokens)[number]["name"];

const byName = <T extends { name: string }>(list: T[], prefix = "") =>
  Object.fromEntries(list.map((token) => [token.name.slice(prefix.length), token]));

export const colors = Object.fromEntries(tokens.color.tokens.map((t) => [t.name, t.value.light])) as Record<
  "paper" | "paper-raised" | "paper-sunk" | "ink" | "ink-muted" | "line" | "line-strong" | "signal" | "signal-ink" | "on-signal" | "cobalt" | "marker" | "marker-ink",
  string
>;

const radii = byName(tokens.radius.tokens, "radius-");
export const radius = { sm: radii.sm.value, md: radii.md.value, pill: radii.pill.value };

const shadows = byName(tokens.shadow.tokens, "shadow-");
export const shadow = { letter: shadows.letter.value.light, lift: shadows.lift.value.light };

export const fonts = tokens.type.families;

/** A token colour at the given opacity, for overlays and dimmed footage. */
export function withAlpha(name: ColorName, alpha: number): string {
  const hex = colors[name as keyof typeof colors].slice(1);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
