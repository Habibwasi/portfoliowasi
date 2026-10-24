import { site } from "@/content/site";
import { ogImage, ogSize } from "@/lib/og";

/** Default social preview (1.11), set in Fraunces since 2.2: the role line, the name and the intro. */
export const alt = `${site.name}, software engineer`;
export const size = ogSize;
export const contentType = "image/png";

export default function OpengraphImage() {
  return ogImage({ eyebrow: site.roleLine, title: site.name, lede: site.intro, footer: site.availability.location, titleSize: 108 });
}
