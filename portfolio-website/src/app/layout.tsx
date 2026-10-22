import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { GuideLauncher } from "@/components/guide/guide-launcher";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { anchors } from "@/content/anchors";
import { siteTitle, siteUrl } from "@/content/metadata";
import { site } from "@/content/site";
import "./globals.css";

// Fraunces is the display face and the LCP font, so it is the only one preloaded.
// opsz is used by the name and the Metric numbers (font-variation-settings).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteTitle, template: `%s · ${site.name}` },
  description: site.intro,
  authors: [{ name: site.name, url: siteUrl }],
  alternates: { canonical: "/" },
  openGraph: {
    title: siteTitle,
    description: site.intro,
    type: "website",
    siteName: site.name,
    locale: "en_GB",
    url: "/",
  },
  twitter: { card: "summary_large_image", title: siteTitle, description: site.intro },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${instrumentSans.variable} ${plexMono.variable}`}>
      <body>
        <SiteHeader />
        <main id={anchors.main}>{children}</main>
        <SiteFooter />
        <GuideLauncher />
        <Analytics />
      </body>
    </html>
  );
}
