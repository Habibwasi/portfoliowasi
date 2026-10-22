"use client";

import { useEffect } from "react";
import { site } from "@/content/site";
import { linkEvent, placeOf } from "@/lib/analytics";

/**
 * One listener for the G4 actions (6.2): CV, email and Calendly links are recognised by their
 * target and sent to Umami. It listens in the capture phase and never cancels the click, so
 * the CV still downloads and Calendly still opens (Umami's data-umami-event would cancel it).
 */
export function AnalyticsEvents() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!link) return;
      const name = linkEvent(link.getAttribute("href")!, site);
      if (name) window.umami?.track(name, { place: placeOf(link) });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
