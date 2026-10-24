/**
 * Line drawings for the object navigation (5.4, V1): 1.5 px ink lines with one signal detail.
 * These are the mockup's stand-ins (laptop, stopwatch, sheet, envelope). Roadmap 7.5 replaces
 * them with drawings of Habib's own objects; keep the same viewBox heights (72) when swapping.
 */
const line = { fill: "none", stroke: "var(--color-ink)", strokeWidth: 1.5, strokeLinejoin: "round" } as const;

export function LaptopDrawing() {
  return (
    <svg viewBox="0 0 96 72" width="96" height="72" {...line}>
      <rect x="16" y="8" width="64" height="42" rx="4" />
      <rect x="22" y="14" width="52" height="30" rx="2" fill="var(--color-signal)" stroke="none" />
      <path d="M6 58 H90 L84 50 H12 Z" />
      <path d="M28 24 L22 29 L28 34 M68 24 L74 29 L68 34" stroke="var(--color-paper-raised)" />
    </svg>
  );
}

export function StopwatchDrawing() {
  return (
    <svg viewBox="0 0 72 72" width="72" height="72" {...line}>
      <circle cx="36" cy="38" r="26" />
      <circle cx="36" cy="38" r="3" fill="var(--color-ink)" />
      <path d="M36 38 L48 22 M36 38 L26 52" />
      <path d="M32 8 H40 M36 8 V12" />
      <path d="M48 22 L44 24 L46 26 Z" fill="var(--color-signal)" stroke="var(--color-signal)" />
    </svg>
  );
}

export function SheetDrawing() {
  return (
    <svg viewBox="0 0 60 72" width="60" height="72" {...line}>
      <path d="M8 4 H40 L54 18 V68 H8 Z" />
      <path d="M40 4 V18 H54" />
      <path d="M16 30 H44 M16 38 H44 M16 46 H34" />
      <path d="M16 56 H30" stroke="var(--color-signal)" strokeWidth="3" />
    </svg>
  );
}

export function EnvelopeDrawing() {
  return (
    <svg viewBox="0 0 88 72" width="88" height="72" {...line}>
      <rect x="6" y="14" width="76" height="48" rx="4" />
      <path d="M6 18 L44 44 L82 18" />
      <circle cx="72" cy="16" r="7" fill="var(--color-signal)" stroke="none" />
    </svg>
  );
}
