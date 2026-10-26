import { describe, expect, it } from "vitest";
import { siteUrl } from "../../portfolio-website/src/content/metadata";
import { site } from "../../portfolio-website/src/content/site";
import { siteCard } from "./export-site";

describe("export-site", () => {
  it("takes the end card's name and links from the site's content", () => {
    expect(siteCard()).toEqual({
      name: site.name,
      url: siteUrl.replace(/^https?:\/\//, ""),
      github: site.links.github.replace(/^https?:\/\//, ""),
      repo: site.links.repo.replace(/^https?:\/\//, ""),
    });
  });
});
