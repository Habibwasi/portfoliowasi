/**
 * Which part of which take each footage scene shows, per cut. Times are seconds: `from` in the
 * take, shot spans in the scene. The takes are the chosen ones in public/footage/ (git-ignored,
 * recorded with `npm run capture`); their timings were read off contact sheets of the takes.
 */
import type { CutId, SceneId } from "./cuts";
import { FPS } from "./cuts";
import type { Rect } from "./layout";

type Take = { width: number; height: number; duration: number; marks?: Record<string, number> };

export const takes = {
  "hook-1": { width: 1920, height: 1080, duration: 12.03 },
  "tour-1": { width: 1920, height: 1080, duration: 29.77, marks: { guideOpens: 19.5, sent: 24.8, answerStarts: 26.3 } },
  "break-off-topic-1": { width: 1920, height: 1080, duration: 14.1, marks: { sent: 10.3, answer: 11.5 } },
  "break-injection-1": { width: 1920, height: 1080, duration: 16.4, marks: { sent: 12.3, answer: 13.5 } },
  "outage-busy-1": { width: 1920, height: 1080, duration: 14.5, marks: { sent: 10.3, answer: 11.5 } },
  "outage-limiter-guide-1": { width: 1920, height: 1080, duration: 16.67, marks: { sent: 10.3, busy: 14.0 } },
  "outage-limiter-contact-1": { width: 1920, height: 1080, duration: 25.93, marks: { sent: 19.5, sentOk: 23.0 } },
  "phones-motion-1": { width: 1920, height: 1080, duration: 20.0 },
  "phones-reduced-1": { width: 1920, height: 1080, duration: 12.8 },
  "phones-phone-1": { width: 412, height: 839, duration: 16.7, marks: { sheet: 14.2 } },
} satisfies Record<string, Take>;

export type TakeName = keyof typeof takes;

/** Part of a take. The last segment of a pane has no `to`: it runs until the pane's time is full. */
export type Segment = { take: TakeName; from: number; to?: number; rate?: number; crop?: Rect };
export type Pane = { box: "full" | "stage" | "left" | "right"; segments: Segment[]; label?: string };
export type Shot = { from: number; to: number; panes: Pane[] };

// Crops, in take pixels.
const HERO: Rect = { x: 360, y: 150, width: 1200, height: 800 };
const PANEL: Rect = { x: 1520, y: 200, width: 400, height: 560 };
/** The guide's question, answer and sources, close up. */
const ANSWER: Rect = { x: 1520, y: 258, width: 400, height: 380 };
const PANEL_TALL: Rect = { x: 1520, y: 0, width: 400, height: 1080 };
const GUIDE_SIDE: Rect = { x: 960, y: 0, width: 960, height: 1080 };
const CASE_STUDY: Rect = { x: 160, y: 0, width: 1200, height: 1080 };
const CONTACT: Rect = { x: 360, y: 330, width: 800, height: 650 };

const one = (from: number, to: number, box: Pane["box"], ...segments: Segment[]): Shot => ({ from, to, panes: [{ box, segments }] });

export const footageScenes: Partial<Record<SceneId, Partial<Record<CutId, Shot[]>>>> = {
  hook: {
    // The name scrambles in at 2.0 s and the tiles land by 4.5 s.
    readme: [one(0, 5, "full", { take: "hook-1", from: 1.8 })],
    linkedin: [one(0, 3, "full", { take: "hook-1", from: 1.9, crop: HERO })],
  },
  tour: {
    readme: [
      one(0, 15, "stage",
        { take: "tour-1", from: 6.5, to: 11.5, rate: 1.5 }, // Home: scroll to the work, click Ridly
        { take: "tour-1", from: 11.5, to: 16.6, rate: 1.5 }, // the case study
        { take: "tour-1", from: 19.2, to: 25.8, rate: 1.5 }, // the guide opens, the question is typed
        { take: "tour-1", from: 25.8, crop: ANSWER }, // the answer streams in, at 1×, close up
      ),
    ],
    linkedin: [
      one(0, 7, "stage",
        { take: "tour-1", from: 11.5, to: 14.5, rate: 1.5, crop: CASE_STUDY },
        { take: "tour-1", from: 19.2, to: 25.8, rate: 2.2, crop: GUIDE_SIDE },
        { take: "tour-1", from: 25.8, crop: ANSWER },
      ),
    ],
  },
  break: {
    readme: [
      one(0, 5, "stage", { take: "break-off-topic-1", from: 7.5, to: 10.3, rate: 2, crop: PANEL }, { take: "break-off-topic-1", from: 10.3, crop: PANEL }),
      one(5, 10, "stage", { take: "break-injection-1", from: 8.0, to: 12.3, rate: 2.5, crop: PANEL }, { take: "break-injection-1", from: 12.3, crop: PANEL }),
    ],
    linkedin: [
      one(0, 3, "stage", { take: "break-off-topic-1", from: 10.0, crop: PANEL }),
      one(3, 6, "stage", { take: "break-injection-1", from: 12.0, crop: PANEL }),
    ],
  },
  outage: {
    readme: [
      one(0, 4.5, "stage", { take: "outage-busy-1", from: 9.9, crop: PANEL_TALL }),
      {
        from: 4.5,
        to: 10,
        panes: [
          { box: "left", label: "Contact form", segments: [{ take: "outage-limiter-contact-1", from: 18.0, crop: CONTACT }] },
          { box: "right", label: "AI guide", segments: [{ take: "outage-limiter-guide-1", from: 9.7, crop: PANEL }] },
        ],
      },
    ],
    linkedin: [
      one(0, 2.5, "stage", { take: "outage-busy-1", from: 10.1, crop: PANEL_TALL }),
      {
        from: 2.5,
        to: 6,
        panes: [
          { box: "left", label: "Contact form", segments: [{ take: "outage-limiter-contact-1", from: 19.3, rate: 1.3, crop: CONTACT }] },
          { box: "right", label: "AI guide", segments: [{ take: "outage-limiter-guide-1", from: 10.2, rate: 1.3, crop: PANEL }] },
        ],
      },
    ],
  },
  phones: {
    readme: [
      {
        from: 0,
        to: 5,
        panes: [
          { box: "left", label: "Motion on", segments: [{ take: "phones-motion-1", from: 0.5 }] },
          { box: "right", label: "Reduced motion", segments: [{ take: "phones-reduced-1", from: 0.5 }] },
        ],
      },
      one(5, 8, "stage", { take: "phones-phone-1", from: 13.4 }),
    ],
  },
};

export type PanePart = { take: TakeName; from: number; rate: number; crop: Rect; durationInFrames: number };

/** The pane's segments as frames: each segment for its own length, the last one for whatever is left. */
export function planPane(pane: Pane, frames: number): PanePart[] {
  let used = 0;
  return pane.segments.map((segment, i) => {
    const rate = segment.rate ?? 1;
    const take = takes[segment.take];
    const last = i === pane.segments.length - 1;
    const length = last ? frames - used : Math.round(((segment.to! - segment.from) / rate) * FPS);
    used += length;
    return {
      take: segment.take,
      from: segment.from,
      rate,
      crop: segment.crop ?? { x: 0, y: 0, width: take.width, height: take.height },
      durationInFrames: length,
    };
  });
}
