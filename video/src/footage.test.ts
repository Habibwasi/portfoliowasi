import { describe, expect, it } from "vitest";
import { cuts, scenesOf, type CutId } from "./cuts";
import { footageScenes, planPane, takes } from "./footage";
import { boxes } from "./layout";

const cutIds = Object.keys(cuts) as CutId[];

describe("the footage plan", () => {
  it("gives every footage scene shots that run back to back for the whole scene", () => {
    for (const cut of cutIds) {
      for (const scene of scenesOf(cut)) {
        const shots = footageScenes[scene.id]?.[cut];
        if (!shots) continue;
        expect(shots[0].from, `${cut} ${scene.id}`).toBe(0);
        shots.slice(1).forEach((shot, i) => expect(shot.from, `${cut} ${scene.id}`).toBe(shots[i].to));
        expect(shots.at(-1)!.to * cuts[cut].fps, `${cut} ${scene.id}`).toBe(scene.durationInFrames);
      }
    }
  });

  it("fills each pane's time exactly, without running past the end of a take", () => {
    for (const cut of cutIds) {
      for (const scene of scenesOf(cut)) {
        for (const shot of footageScenes[scene.id]?.[cut] ?? []) {
          const frames = Math.round((shot.to - shot.from) * cuts[cut].fps);
          for (const pane of shot.panes) {
            const plan = planPane(pane, frames);
            const label = `${cut} ${scene.id} ${pane.segments[0].take}`;
            expect(plan.reduce((sum, part) => sum + part.durationInFrames, 0), label).toBe(frames);
            for (const part of plan) {
              expect(part.durationInFrames, label).toBeGreaterThan(0);
              const sourceEnd = part.from + (part.durationInFrames / cuts[cut].fps) * part.rate;
              expect(sourceEnd, label).toBeLessThanOrEqual(takes[part.take].duration + 0.001);
            }
          }
        }
      }
    }
  });

  it("crops inside the take and places every pane in a box of its cut", () => {
    for (const cut of cutIds) {
      for (const shots of Object.values(footageScenes)) {
        for (const shot of shots?.[cut] ?? []) {
          for (const pane of shot.panes) {
            expect(boxes(cut)[pane.box], `${cut} ${pane.box}`).toBeDefined();
            for (const { take, crop } of pane.segments) {
              if (!crop) continue;
              expect(crop.x + crop.width).toBeLessThanOrEqual(takes[take].width);
              expect(crop.y + crop.height).toBeLessThanOrEqual(takes[take].height);
            }
          }
        }
      }
    }
  });

  it("never speeds up the real answer", () => {
    // Scene 2's caption says "Real answer, unedited": the part where it streams in plays at 1×.
    for (const cut of cutIds) {
      const last = footageScenes.tour![cut]!.at(-1)!.panes[0].segments.at(-1)!;
      expect(last.take).toBe("tour-1");
      expect(last.rate ?? 1).toBe(1);
      expect(last.from).toBeLessThanOrEqual(takes["tour-1"].marks!.answerStarts);
    }
  });
});
