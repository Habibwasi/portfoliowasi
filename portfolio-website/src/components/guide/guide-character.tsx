import type { GuideState } from "@/lib/guide/state";
import { cn } from "@/lib/utils";

/**
 * The guide (GD1, GD2): the vermilion "H" tile with eyes; the crossbar is its mouth. Drawn from the
 * design system's Guide preview. Each state moves the whole body with squash and stretch (CSS in
 * guide.css, from the mockup playground); `poke` plays a jelly wobble on top of any state.
 */
export function GuideCharacter({ className, state = "idle", poke = false }: { className?: string; state?: GuideState; poke?: boolean }) {
  return (
    <svg
      className={cn("hw-guide", `hw-guide--${state}`, poke && "hw-guide--poke", className)}
      width="72"
      height="84"
      viewBox="0 0 72 84"
      aria-hidden="true"
      focusable="false"
      data-state={state}
    >
      <rect width="72" height="84" rx="10" fill="var(--color-signal)" />
      <rect x="18" y="34" width="9" height="36" rx="2" fill="var(--color-paper-raised)" />
      <rect x="45" y="34" width="9" height="36" rx="2" fill="var(--color-paper-raised)" />
      <rect className="hw-guide__mouth" x="27" y="48" width="18" height="6" rx="3" fill="var(--color-paper-raised)" />
      <g className="hw-guide__dots" fill="var(--color-ink)">
        <circle cx="31" cy="51" r="1.4" />
        <circle className="hw-guide__dot2" cx="36" cy="51" r="1.4" />
        <circle className="hw-guide__dot3" cx="41" cy="51" r="1.4" />
      </g>
      <g className="hw-guide__eyes">
        <circle cx="22.5" cy="20" r="7" fill="var(--color-paper-raised)" />
        <circle cx="49.5" cy="20" r="7" fill="var(--color-paper-raised)" />
        <g className="hw-guide__pupils">
          <circle cx="23" cy="20" r="3.2" fill="var(--color-ink)" />
          <circle cx="50" cy="20" r="3.2" fill="var(--color-ink)" />
        </g>
      </g>
    </svg>
  );
}
