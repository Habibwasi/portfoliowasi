import type { ReactNode } from "react";

/** Mono eyebrow ("01 / Selected work"), the h2, and an optional one-line subline beside it. */
export function SectionHead({ id, eyebrow, heading, subline }: { id: string; eyebrow: string; heading: ReactNode; subline?: string }) {
  return (
    <div className="hw-section-head">
      <div className="hw-section-head__title">
        <span className="hw-label">{eyebrow}</span>
        <h2 id={id} className="hw-h2">
          {heading}
        </h2>
      </div>
      {subline && <p className="hw-section-head__sub">{subline}</p>}
    </div>
  );
}
