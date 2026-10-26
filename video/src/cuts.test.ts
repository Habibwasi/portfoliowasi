import { describe, expect, it } from "vitest";
import { captionsOf, cuts, holdSeconds, lineCount, minFontSize, safeArea, scenesOf, type CutId } from "./cuts";

const cutIds = Object.keys(cuts) as CutId[];

describe("the timing table", () => {
  it("gives each cut its target length", () => {
    for (const id of cutIds) {
      const { durationInFrames, fps, target, tolerance } = cuts[id];
      expect(Math.abs(durationInFrames / fps - target), id).toBeLessThanOrEqual(tolerance);
    }
  });

  it("plays the scenes back to back from frame 0 to the end of the cut", () => {
    for (const id of cutIds) {
      const scenes = scenesOf(id);
      expect(scenes[0].from, id).toBe(0);
      scenes.slice(1).forEach((scene, i) => expect(scene.from, `${id} ${scene.id}`).toBe(scenes[i].from + scenes[i].durationInFrames));
      const last = scenes.at(-1)!;
      expect(last.from + last.durationInFrames, id).toBe(cuts[id].durationInFrames);
    }
  });

  it("keeps the spec's scene order, and the LinkedIn cut has no scene 6", () => {
    expect(scenesOf("readme").map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(scenesOf("linkedin").map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 7, 8]);
  });
});

describe("captions", () => {
  it("each stay up for at least 0.5 s plus 1 s for every 3 words", () => {
    for (const id of cutIds) {
      for (const caption of captionsOf(id)) {
        expect(caption.durationInFrames / cuts[id].fps, `${id}: ${caption.text}`).toBeGreaterThanOrEqual(holdSeconds(caption.text));
      }
    }
  });

  it("start and end inside their scene", () => {
    for (const id of cutIds) {
      const scenes = scenesOf(id);
      for (const caption of captionsOf(id)) {
        const scene = scenes.find((s) => s.id === caption.scene)!;
        expect(caption.from, caption.text).toBeGreaterThanOrEqual(0);
        expect(caption.from + caption.durationInFrames, caption.text).toBeLessThanOrEqual(scene.durationInFrames);
      }
    }
  });

  it("are at least 44 px tall at 1080 px wide", () => {
    expect(minFontSize("linkedin")).toBe(44);
    for (const id of cutIds) {
      for (const caption of captionsOf(id)) expect(caption.box.fontSize, `${id}: ${caption.text}`).toBeGreaterThanOrEqual(minFontSize(id));
    }
  });

  it("sit inside the safe area of their cut, wrapped to the lines their box holds", () => {
    for (const id of cutIds) {
      const safe = safeArea(id);
      for (const { box, text } of captionsOf(id)) {
        const label = `${id}: ${text}`;
        expect(lineCount(text, box), label).toBeLessThanOrEqual(box.lines);
        expect(box.x, label).toBeGreaterThanOrEqual(safe.left);
        expect(box.y, label).toBeGreaterThanOrEqual(safe.top);
        expect(box.x + box.width, label).toBeLessThanOrEqual(safe.right);
        expect(box.y + box.height, label).toBeLessThanOrEqual(safe.bottom);
      }
    }
  });

  it("keep text out of the bottom 15% of the 4:5 cut, with a 64 px margin", () => {
    const { height, width } = cuts.linkedin;
    expect(safeArea("linkedin")).toEqual({ left: 64, top: 64, right: width - 64, bottom: height * 0.85 });
  });
});
