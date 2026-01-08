import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
