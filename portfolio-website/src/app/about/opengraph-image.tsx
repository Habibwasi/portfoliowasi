import { about } from "@/content/about";
import { site } from "@/content/site";
import { ogImage, ogSize } from "@/lib/og";

export const alt = `About ${site.name}: ${about.title.toLowerCase()}`;
export const size = ogSize;
export const contentType = "image/png";

export default function AboutOpengraphImage() {
  return ogImage({ eyebrow: about.eyebrow, title: about.title, lede: about.intro, footer: site.name });
}
