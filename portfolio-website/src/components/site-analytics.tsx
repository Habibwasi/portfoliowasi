import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { siteUrl } from "@/content/metadata";
import { umamiScript } from "@/lib/analytics";
import { AnalyticsEvents } from "./analytics-events";

/**
 * Vercel page views, plus Umami Cloud for the G4 events (6.2). Umami sets no cookies, so no
 * banner. Without NEXT_PUBLIC_UMAMI_WEBSITE_ID (previews, CI, local) its script never loads.
 */
export function SiteAnalytics() {
  const umami = umamiScript(process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID, siteUrl);
  return (
    <>
      <Analytics />
      {umami && <Script src={umami.src} data-website-id={umami.websiteId} data-domains={umami.domains} strategy="afterInteractive" />}
      <AnalyticsEvents />
    </>
  );
}
