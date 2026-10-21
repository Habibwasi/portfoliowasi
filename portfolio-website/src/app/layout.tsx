import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { MotionProvider } from "@/components/motion-provider";
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

// Phase 1 (1.11) rewrites this metadata for the new intro.
export const metadata: Metadata = {
  title: "Habib Ahmed Wasi - Full-Stack Developer Portfolio",
  description: "Software Engineering student and full-stack developer specializing in Python, C#, JavaScript, and cloud computing. Check out my projects and get in touch!",
  keywords: ["portfolio", "developer", "software engineering", "full-stack", "python", "react", "next.js"],
  authors: [{ name: "Habib Ahmed Wasi" }],
  openGraph: {
    title: "Habib Ahmed Wasi - Full-Stack Developer",
    description: "Discover my projects, skills, and experience as a Software Engineering student",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${instrumentSans.variable} ${plexMono.variable}`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
