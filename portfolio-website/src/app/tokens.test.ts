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
