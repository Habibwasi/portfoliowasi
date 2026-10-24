"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { isPlaceholder } from "@/content/placeholder";
import { site } from "@/content/site";

/** The CV's pages, rendered from the PDF by scripts/cv-pages.py; a PDF in a frame shows nothing on Android. */
export const cvPages = ["/cv/page-1.png", "/cv/page-2.png"];
const PAGE = { width: 1489, height: 2105 };

/** A plain left click on a CV link opens the viewer; a new-tab or modified click keeps the browser's default. */
export function opensViewer(event: MouseEvent, cv: string): HTMLAnchorElement | null {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const link = (event.target as Element | null)?.closest?.("a[href]");
  if (!(link instanceof HTMLAnchorElement) || link.getAttribute("href") !== cv) return null;
  if (link.closest(".hw-cv")) return null;
  return link;
}

/**
 * Every CV link on the site (buttons, nav, object nav, the guide's offer) opens the CV here
 * instead of downloading it, with the download at the top. One listener in the bubble phase,
 * so the analytics listener (capture phase) still records the click. Without JS the links'
 * download attribute still applies.
 */
export function CvViewer() {
  const dialog = useRef<HTMLDialogElement>(null);
  const cv = isPlaceholder(site.cv) ? null : site.cv;

  useEffect(() => {
    if (!cv) return;
    const onClick = (event: MouseEvent) => {
      if (!opensViewer(event, cv)) return;
      event.preventDefault();
      dialog.current?.showModal();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [cv]);

  if (!cv) return null;
  const close = () => dialog.current?.close();

  return (
    <dialog
      ref={dialog}
      className="hw-cv"
      aria-labelledby="hw-cv-title"
      // A click on the backdrop lands on the dialog itself; clicks inside land on its children.
      onClick={(event) => event.target === event.currentTarget && close()}
    >
      <div className="hw-cv__bar">
        <h2 id="hw-cv-title" className="hw-cv__title">
          {site.name}&apos;s CV
        </h2>
        <a className="hw-btn hw-btn--primary hw-btn--small" href={cv} download>
          Download PDF
        </a>
        <button type="button" className="hw-btn hw-btn--small" onClick={close}>
          Close
        </button>
      </div>
      <div className="hw-cv__pages">
        {cvPages.map((src, i) => (
          <Image
            key={src}
            className="hw-cv__page"
            src={src}
            alt={`${site.name}'s CV, page ${i + 1} of ${cvPages.length}. The PDF has the same text.`}
            width={PAGE.width}
            height={PAGE.height}
            sizes="(max-width: 880px) 100vw, 840px"
          />
        ))}
      </div>
    </dialog>
  );
}
