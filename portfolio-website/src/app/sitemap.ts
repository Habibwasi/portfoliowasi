import type { MetadataRoute } from "next";
import { publishedProjects } from "@/content/case-studies";
import { siteUrl } from "@/content/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    ...publishedProjects.map((project) => ({
      url: `${siteUrl}/work/${project.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
