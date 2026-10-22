import type { Metadata } from "next";
import { About } from "@/components/about";
import { about } from "@/content/about";

export const metadata: Metadata = {
  title: about.eyebrow,
  description: about.description,
  alternates: { canonical: about.path },
  openGraph: { title: about.eyebrow, description: about.description, type: "profile", url: about.path },
  twitter: { card: "summary_large_image", title: about.eyebrow, description: about.description },
};

export default function AboutPage() {
  return <About />;
}
