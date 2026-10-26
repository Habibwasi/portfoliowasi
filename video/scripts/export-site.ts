/**
 * M.4: the end card's name and links, from the site's own content. Writes video/data/site.json.
 *
 *   npm run export:site
 */
import { siteUrl } from "../../portfolio-website/src/content/metadata";
import { site } from "../../portfolio-website/src/content/site";
import { isMain, today, writeData } from "./lib";

const bare = (url: string) => url.replace(/^https?:\/\//, "");

export function siteCard() {
  return { name: site.name, url: bare(siteUrl), github: bare(site.links.github), repo: bare(site.links.repo) };
}

if (isMain(import.meta.url)) {
  writeData("site", { ...siteCard(), date: today(), source: "portfolio-website/src/content/site.ts and metadata.ts (siteUrl)" });
}
