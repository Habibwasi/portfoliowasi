/** The guide's five states (5.6, GD2), from what the chat is doing. */
export type GuideState = "idle" | "listening" | "thinking" | "talking" | "pointing";

/** How long after the last key the guide still counts as listening. */
export const LISTENING_MS = 1500;
/** How long the pointer stays beside a target. */
export const POINTING_MS = 8000;

export function guideState({ status, typing, pointing }: { status: string; typing: boolean; pointing: boolean }): GuideState {
  if (pointing) return "pointing";
  if (status === "submitted") return "thinking";
  if (status === "streaming") return "talking";
  if (typing) return "listening";
  return "idle";
}
