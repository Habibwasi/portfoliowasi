/**
 * The Scenes table of specs/features/motion-video.md in code: every scene's on-screen question,
 * its captions and its timing in both cuts. Times are seconds; captions are timed from the start
 * of their scene. Both compositions are assembled from this table and nothing else.
 */
export const FPS = 30;

export type CutId = "readme" | "linkedin";

export const cuts = {
  readme: { id: "Readme", width: 1920, height: 1080, fps: FPS, target: 90, tolerance: 3, durationInFrames: 90 * FPS },
  linkedin: { id: "LinkedIn", width: 1080, height: 1350, fps: FPS, target: 40, tolerance: 2, durationInFrames: 40 * FPS },
} as const;

export type SceneId = "hook" | "tour" | "answer" | "break" | "outage" | "phones" | "proof" | "end";

type Span = readonly [from: number, to: number];

type CaptionSpec = { text: string; readme: Span; linkedin: Span };

type SceneSpec = {
  n: number;
  id: SceneId;
  /** The sceptical tech lead's question, shown for the whole scene. */
  question?: string;
  captions: CaptionSpec[];
  /** Where the scene sits in each cut; null leaves it out of that cut. */
  readme: Span;
  linkedin: Span | null;
};

const table: SceneSpec[] = [
  { n: 1, id: "hook", captions: [], readme: [0, 5], linkedin: [0, 3] },
  {
    n: 2,
    id: "tour",
    question: "What does it do?",
    captions: [{ text: "Real answer, unedited", readme: [8, 15], linkedin: [3.5, 7] }],
    readme: [5, 20],
    linkedin: [3, 10],
  },
  { n: 3, id: "answer", question: "How does it answer?", captions: [], readme: [20, 40], linkedin: [10, 18] },
  {
    n: 4,
    id: "break",
    question: "What if you try to break it?",
    captions: [{ text: "No model call", readme: [2, 6], linkedin: [1.5, 3.5] }],
    readme: [40, 50],
    linkedin: [18, 24],
  },
  {
    n: 5,
    id: "outage",
    question: "What if Groq goes down?",
    captions: [{ text: "Limiter down: one fails open, one fails closed. On purpose.", readme: [5, 10], linkedin: [2, 6] }],
    readme: [50, 60],
    linkedin: [24, 30],
  },
  { n: 6, id: "phones", question: "What about phones, or motion turned off?", captions: [], readme: [60, 68], linkedin: null },
  { n: 7, id: "proof", question: "How do I know it always works?", captions: [], readme: [68, 82], linkedin: [30, 37] },
  {
    n: 8,
    id: "end",
    captions: [{ text: "This video is rendered from code", readme: [1, 8], linkedin: [0.3, 3] }],
    readme: [82, 90],
    linkedin: [37, 40],
  },
];

const frames = (seconds: number) => Math.round(seconds * FPS);

export type Scene = { n: number; id: SceneId; question?: string; from: number; durationInFrames: number };

export function scenesOf(cut: CutId): Scene[] {
  return table.flatMap(({ n, id, question, ...spec }) => {
    const span = spec[cut];
    return span ? [{ n, id, question, from: frames(span[0]), durationInFrames: frames(span[1] - span[0]) }] : [];
  });
}

/** A text box in pixels. Text wraps inside `width` and may take up to `lines` lines. */
export type Box = { x: number; y: number; width: number; height: number; fontSize: number; lines: number; lineHeight: number };

const box = (b: Omit<Box, "height">): Box => ({ ...b, height: Math.ceil(b.fontSize * b.lineHeight * b.lines) });

/** The two places text goes in each cut: the question at the top, captions near the bottom. */
export const slots: Record<CutId, Record<"question" | "caption", Box>> = {
  readme: {
    question: box({ x: 96, y: 72, width: 1400, fontSize: 80, lines: 2, lineHeight: 1.15 }),
    caption: box({ x: 96, y: 800, width: 1400, fontSize: 80, lines: 2, lineHeight: 1.2 }),
  },
  linkedin: {
    question: box({ x: 64, y: 96, width: 952, fontSize: 64, lines: 2, lineHeight: 1.15 }),
    caption: box({ x: 64, y: 920, width: 952, fontSize: 52, lines: 3, lineHeight: 1.2 }),
  },
};

export type Caption = { scene: SceneId; kind: "question" | "caption"; text: string; from: number; durationInFrames: number; box: Box };

/** Every piece of on-screen text in a cut, with its timing inside its scene and its box. */
export function captionsOf(cut: CutId): Caption[] {
  return scenesOf(cut).flatMap((scene) => {
    const spec = table.find((s) => s.id === scene.id)!;
    const question: Caption[] = scene.question
      ? [{ scene: scene.id, kind: "question", text: scene.question, from: 0, durationInFrames: scene.durationInFrames, box: slots[cut].question }]
      : [];
    const captions = spec.captions.map(({ text, ...spans }): Caption => {
      const [from, to] = spans[cut];
      return { scene: scene.id, kind: "caption", text, from: frames(from), durationInFrames: frames(to - from), box: slots[cut].caption };
    });
    return [...question, ...captions];
  });
}

/** How long a caption must stay up: 0.5 s plus 1 s for every 3 words. */
export const holdSeconds = (text: string) => 0.5 + text.trim().split(/\s+/).length / 3;

/** 44 px at 1080 px wide, scaled to the cut's width. */
export const minFontSize = (cut: CutId) => (44 * cuts[cut].width) / 1080;

/** 64 px from every edge; on the 4:5 cut, also out of the bottom 15% (LinkedIn's overlays). */
export function safeArea(cut: CutId) {
  const { width, height } = cuts[cut];
  return { left: 64, top: 64, right: width - 64, bottom: cut === "linkedin" ? height * 0.85 : height - 64 };
}

/**
 * Lines the text wraps to in a box, by word, assuming a glyph averages 0.55 em: wider than the
 * real fonts' average, so the estimate errs towards more lines.
 */
export function lineCount(text: string, { width, fontSize }: Pick<Box, "width" | "fontSize">): number {
  const perLine = Math.floor(width / (fontSize * 0.55));
  let lines = 1;
  let used = 0;
  for (const word of text.trim().split(/\s+/)) {
    const needed = used === 0 ? word.length : used + 1 + word.length;
    if (needed <= perLine) used = needed;
    else {
      lines += 1;
      used = word.length;
    }
  }
  return lines;
}
