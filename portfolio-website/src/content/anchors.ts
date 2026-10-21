/**
 * Stable section IDs on Home. Links, the nav and (from Phase 3) the AI guide's
 * scroll_to tool all target these, so renaming one is a single change here.
 */
export const anchors = {
  main: "main",
  work: "work",
  ai: "ai",
  proof: "proof",
  stack: "stack",
  contact: "contact",
} as const;

export type Anchor = (typeof anchors)[keyof typeof anchors];

export const hash = (anchor: Anchor) => `#${anchor}` as const;
