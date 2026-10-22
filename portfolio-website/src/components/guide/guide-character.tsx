/**
 * The guide (GD1): the vermilion "H" tile with eyes; the crossbar is its mouth. Drawn from the
 * design system's Guide preview. Only idle and blink exist for now (CSS); the other states come in 5.6.
 */
export function GuideCharacter({ className }: { className?: string }) {
  return (
    <svg className={className} width="72" height="84" viewBox="0 0 72 84" aria-hidden="true" focusable="false">
      <rect width="72" height="84" rx="10" fill="var(--color-signal)" />
      <rect x="18" y="34" width="9" height="36" rx="2" fill="var(--color-paper-raised)" />
      <rect x="45" y="34" width="9" height="36" rx="2" fill="var(--color-paper-raised)" />
      <rect x="27" y="48" width="18" height="6" rx="3" fill="var(--color-paper-raised)" />
      <g className="hw-guide__eyes">
        <circle cx="22.5" cy="20" r="7" fill="var(--color-paper-raised)" />
        <circle cx="49.5" cy="20" r="7" fill="var(--color-paper-raised)" />
        <circle cx="23" cy="20" r="3.2" fill="var(--color-ink)" />
        <circle cx="50" cy="20" r="3.2" fill="var(--color-ink)" />
      </g>
    </svg>
  );
}
