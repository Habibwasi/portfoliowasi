import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import tokens from "../../portfolio-website/design-system/tokens.json";
import { colors, fonts, radius, shadow, withAlpha } from "./theme";

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });

describe("the theme", () => {
  it("reads every colour from the site's tokens.json", () => {
    for (const token of tokens.color.tokens) expect(colors[token.name as keyof typeof colors]).toBe(token.value.light);
    expect(Object.keys(colors)).toHaveLength(tokens.color.tokens.length);
  });

  it("reads radii, shadows and font families from tokens.json", () => {
    expect(radius.md).toBe(tokens.radius.tokens.find((t) => t.name === "radius-md")!.value);
    expect(shadow.letter).toBe(tokens.shadow.tokens.find((t) => t.name === "shadow-letter")!.value.light);
    expect(fonts.display).toBe(tokens.type.families.display);
    expect(fonts.mono).toContain("IBM Plex Mono");
  });

  it("makes a translucent colour from a token", () => {
    expect(withAlpha("ink", 0.5)).toBe("rgba(28, 26, 22, 0.5)");
  });

  it("has no colour written by hand in video/src", () => {
    const handWritten = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\(\s*\d/i;
    const offenders = sourceFiles(import.meta.dirname).filter((file) => handWritten.test(readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });
});
