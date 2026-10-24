import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import tokens from "../../design-system/tokens.json";

const css = readFileSync(path.resolve(__dirname, "globals.css"), "utf8");

/** Reads `--name: value;` from globals.css. */
function cssValue(name: string): string | undefined {
  const match = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
  return match?.[1].trim();
}

describe("design tokens in globals.css", () => {
  it.each(tokens.color.tokens.map((t) => [t.name, t.value.light]))("colour %s is %s", (name, value) => {
    expect(cssValue(`color-${name}`)?.toLowerCase()).toBe(value.toLowerCase());
  });

  it.each(tokens.spacing.tokens.map((t) => [t.name, t.value]))("spacing %s is %s", (name, value) => {
    expect(cssValue(`spacing-${name}`)).toBe(value);
  });

  it.each(tokens.radius.tokens.map((t) => [t.name, t.value]))("radius %s is %s", (name, value) => {
    expect(cssValue(name)).toBe(value);
  });

  it.each(tokens.shadow.tokens.map((t) => [t.name]))("shadow %s is defined", (name) => {
    expect(cssValue(name)).toBeDefined();
  });

  const styles = tokens.type.groups.flatMap((g) => g.styles);
  it.each(styles.map((s) => [s.name, s.fontSize]))("type style %s is %s", (name, size) => {
    expect(cssValue(`text-${name}`)).toBe(size);
  });

  it("has no dark theme", () => {
    expect(css).not.toMatch(/\.dark\b/);
    expect(css).not.toMatch(/@custom-variant dark/);
  });
});

/**
 * next/font only sizes its fallbacks against Times New Roman and Arial, which Linux, ChromeOS
 * and Android don't have. There the page jumps when the web fonts arrive (CI measured CLS 0.21),
 * so each stack carries size-matched fallbacks for the fonts those systems do have.
 */
describe("font fallbacks", () => {
  it.each([
    ["font-display", ["Fraunces Fallback Clone", "Fraunces Fallback Android"]],
    ["font-sans", ["Instrument Sans Fallback Clone", "Instrument Sans Fallback Android"]],
  ])("%s lists metric-matched fallbacks after the web font", (token, families) => {
    const stack = cssValue(token)!;
    for (const family of families) expect(stack).toContain(`"${family}"`);
  });

  it.each([
    ["Fraunces Fallback Clone", ["Liberation Serif", "Tinos"]],
    ["Fraunces Fallback Android", ["Noto Serif"]],
    ["Instrument Sans Fallback Clone", ["Liberation Sans", "Arimo"]],
    ["Instrument Sans Fallback Android", ["Roboto"]],
  ])("%s is a sized @font-face over local fonts", (family, locals) => {
    const face = css.match(new RegExp(`@font-face\\s*\\{[^}]*font-family:\\s*"${family}";[^}]*\\}`))?.[0];
    expect(face).toBeDefined();
    for (const local of locals) expect(face).toContain(`local("${local}")`);
    expect(face).toMatch(/size-adjust:/);
    expect(face).toMatch(/ascent-override:/);
  });
});

/** WCAG 2.x relative luminance and contrast ratio of two #rrggbb colours. */
function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** The pairs the design actually uses (6.1): body text 4.5:1, the focus ring and input borders 3:1 (1.4.11). */
describe("colour contrast", () => {
  const color = (name: string) => cssValue(`color-${name}`)!;

  it.each([
    ["ink", "paper"],
    ["ink", "paper-raised"],
    ["ink", "paper-sunk"],
    ["ink", "marker"],
    ["ink-muted", "paper"],
    ["ink-muted", "paper-raised"],
    ["ink-muted", "paper-sunk"],
    ["ink-muted", "marker"],
    ["signal", "paper"],
    ["signal-ink", "paper"],
    ["signal-ink", "paper-sunk"],
    ["cobalt", "paper"],
    ["cobalt", "paper-raised"],
    ["cobalt", "paper-sunk"],
    ["marker-ink", "paper"],
    ["on-signal", "signal"],
    ["paper", "ink"],
  ])("text %s on %s is at least 4.5:1", (fg, bg) => {
    expect(contrast(color(fg), color(bg))).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ["cobalt", "paper"],
    ["cobalt", "paper-sunk"],
    ["line-strong", "paper"],
    ["signal", "paper-sunk"],
  ])("ring, border or large text %s on %s is at least 3:1", (fg, bg) => {
    expect(contrast(color(fg), color(bg))).toBeGreaterThanOrEqual(3);
  });
});
