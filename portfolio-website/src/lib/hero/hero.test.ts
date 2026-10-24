import { describe, expect, it } from "vitest";
import { IMPACT_SPEED, SCRAMBLE_GLYPHS, impactEffect, liftOf, nameLines, scrambleSequence, tiles } from "./hero";

describe("name scramble (5.1)", () => {
  it("shows 6 to 8 glyphs from the set, then settles on the letter", () => {
    for (let seed = 0; seed < 20; seed++) {
      const values = [seed / 20, 0.3, 0.7, 0.1, 0.9, 0.5, 0.2, 0.8, 0.4];
      let i = 0;
      const sequence = scrambleSequence("H", () => values[i++ % values.length]);
      const glyphs = sequence.slice(0, -1);
      expect(glyphs.length).toBeGreaterThanOrEqual(6);
      expect(glyphs.length).toBeLessThanOrEqual(8);
      for (const glyph of glyphs) expect(SCRAMBLE_GLYPHS).toContain(glyph);
      expect(sequence.at(-1)).toBe("H");
    }
  });

  it("leaves spaces alone", () => {
    expect(scrambleSequence(" ")).toEqual([" "]);
  });

  it("splits the name over two lines", () => {
    expect(nameLines("Habib Ahmed Wasi")).toEqual(["Habib Ahmed", "Wasi"]);
  });
});

describe("physics tiles (5.2)", () => {
  it("are H, W, A, S, I with the H as the only signal tile", () => {
    expect(tiles.map((t) => t.letter)).toEqual(["H", "W", "A", "S", "I"]);
    expect(tiles.filter((t) => t.signal).map((t) => t.letter)).toEqual(["H"]);
  });

  it("squash and scramble only on a hard landing", () => {
    expect(impactEffect(IMPACT_SPEED - 0.1)).toEqual({ squash: false, scramble: false });
    expect(impactEffect(IMPACT_SPEED + 0.1)).toEqual({ squash: true, scramble: true });
  });

  it("grow the shadow with height above the floor, from 0 to 1", () => {
    expect(liftOf(0)).toBe(0);
    expect(liftOf(-20)).toBe(0);
    expect(liftOf(150)).toBeCloseTo(0.5);
    expect(liftOf(1000)).toBe(1);
  });
});
