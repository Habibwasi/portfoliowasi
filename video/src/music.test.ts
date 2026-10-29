import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { cuts } from "./cuts";
import { music, musicVolume, type Music } from "./music";

const track: Music = { file: "x.mp3", volume: 0.5, fadeInSeconds: 1.5, fadeOutSeconds: 3, startFromSeconds: 0 };
const fps = 30;

describe("the music", () => {
  it("starts and ends in silence, and holds its volume in between", () => {
    for (const cut of Object.values(cuts)) {
      const end = cut.durationInFrames;
      expect(musicVolume(0, end, track, fps)).toBe(0);
      expect(musicVolume(end, end, track, fps)).toBe(0);
      expect(musicVolume(Math.round(end / 2), end, track, fps)).toBe(0.5);
    }
  });

  it("fades in over its fade-in and out over its fade-out", () => {
    const end = 90 * fps;
    expect(musicVolume(22.5, end, track, fps)).toBeCloseTo(0.25);
    expect(musicVolume(end - 45, end, track, fps)).toBeCloseTo(0.25);
  });

  it("names a file that exists, if there is a track", () => {
    if (music) expect(existsSync(join(__dirname, "..", "public", "music", music.file))).toBe(true);
  });
});
