import { slots, type CutId } from "./cuts";

export type Rect = { x: number; y: number; width: number; height: number };

/**
 * Where things go in each cut. `stage` is the area under the question; `left` and `right` split it
 * for side-by-side footage. Captions sit over the bottom of the stage on a paper chip.
 */
export function boxes(cut: CutId): Record<"full" | "stage" | "left" | "right", Rect> {
  const full = cut === "readme" ? { x: 0, y: 0, width: 1920, height: 1080 } : { x: 0, y: 0, width: 1080, height: 1350 };
  const question = slots[cut].question;
  const top = question.y + question.height + 24;
  const margin = question.x;
  // The 4:5 cut keeps the bottom 15% clear for LinkedIn's overlays.
  const bottom = cut === "readme" ? full.height - 40 : Math.floor(full.height * 0.85);
  const stage = { x: margin, y: top, width: full.width - 2 * margin, height: bottom - top };
  const gap = cut === "readme" ? 48 : 24;
  const half = (stage.width - gap) / 2;
  return {
    full,
    stage,
    left: { ...stage, width: half },
    right: { ...stage, x: stage.x + half + gap, width: half },
  };
}
