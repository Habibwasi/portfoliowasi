import { howItWorks } from "@/content/guide";
import { site } from "@/content/site";
import { ogImage, ogSize } from "@/lib/og";

export const alt = `${howItWorks.title}, on ${site.name}'s site`;
export const size = ogSize;
export const contentType = "image/png";

export default function GuideOpengraphImage() {
  return ogImage({ eyebrow: "AI guide · RAG pipeline", title: howItWorks.title, lede: howItWorks.lede, footer: site.name });
}
