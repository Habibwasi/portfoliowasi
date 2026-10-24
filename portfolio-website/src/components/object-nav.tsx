import type { ReactNode } from "react";
import { about } from "@/content/about";
import { anchors, hash } from "@/content/anchors";
import { isPlaceholder } from "@/content/placeholder";
import { site } from "@/content/site";
import { EnvelopeDrawing, LaptopDrawing, SheetDrawing, StopwatchDrawing } from "./object-drawings";

type ObjectLink = { label: string; href: string; drawing: ReactNode; download?: boolean };

export function objectLinks(): ObjectLink[] {
  const links: ObjectLink[] = [
    { label: "Work", href: hash(anchors.work), drawing: <LaptopDrawing /> },
    { label: "About", href: about.path, drawing: <StopwatchDrawing /> },
  ];
  if (!isPlaceholder(site.cv)) links.push({ label: "CV", href: site.cv, drawing: <SheetDrawing />, download: true });
  links.push({ label: "Contact", href: hash(anchors.contact), drawing: <EnvelopeDrawing /> });
  return links;
}

/**
 * Object navigation under the hero (5.4, V1): hand-drawn objects that lead to the sections.
 * Decorative for assistive tech (P4): hidden and out of the tab order, because the header's
 * text menu holds the same links.
 */
export function ObjectNav() {
  return (
    <div className="hw-container">
      <div className="hw-objects" aria-hidden="true">
        {objectLinks().map((link) => (
          <a key={link.label} className="hw-object" href={link.href} tabIndex={-1} download={link.download || undefined}>
            <span className="hw-object__drawing">{link.drawing}</span>
            <span className="hw-label">{link.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
