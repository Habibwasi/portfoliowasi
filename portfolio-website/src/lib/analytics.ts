import { isPlaceholder } from "@/content/placeholder";
import type { Content } from "@/content/types";

declare global {
  interface Window {
    /** Umami's tracker, once https://cloud.umami.is/script.js has loaded. */
    umami?: { track: (name: string, data?: Record<string, string>) => void };
  }
}

/** The G4 actions sent to Umami (6.2). Case study views are Umami's own page views of /work/<slug>. */
export const analyticsEvents = {
  cv: "CV download",
  email: "Email click",
  calendly: "Calendly click",
} as const;

export type AnalyticsEvent = (typeof analyticsEvents)[keyof typeof analyticsEvents];

type Targets = { cv: Content<string>; calendly: Content<string> };

/** Which action a link is, from its target alone, so no button needs marking. */
export function linkEvent(href: string, targets: Targets): AnalyticsEvent | null {
  if (/^mailto:/i.test(href)) return analyticsEvents.email;
  let url: URL;
  try {
    url = new URL(href, "https://site.invalid");
  } catch {
    return null;
  }
  if (!isPlaceholder(targets.cv) && url.pathname === targets.cv) return analyticsEvents.cv;
  if (!isPlaceholder(targets.calendly)) {
    const calendly = new URL(targets.calendly);
    if (url.host === calendly.host && url.pathname === calendly.pathname) return analyticsEvents.calendly;
  }
  return null;
}

/**
 * Where on the page the click happened: the guide, the site header or footer, else the enclosing
 * section's id. Only the site's own header and footer count; About and case studies have a
 * <header> inside their article.
 */
export function placeOf(el: Element): string {
  if (el.closest("[data-guide-panel]")) return "guide";
  if (el.closest("body > header")) return "header";
  if (el.closest("body > footer")) return "footer";
  return el.closest("section[id], article[id]")?.id || "page";
}

/** The Umami Cloud script, only when a website ID is set and only counting the production host. */
export function umamiScript(websiteId: string | undefined, siteUrl: string) {
  if (!websiteId) return null;
  return { src: "https://cloud.umami.is/script.js", websiteId, domains: new URL(siteUrl).hostname };
}
