import { site } from "./site";

/** Production URL; NEXT_PUBLIC_SITE_URL overrides it (e.g. a custom domain later). */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://portfolio-habib-wasi.vercel.app").replace(/\/$/, "");

export const siteTitle = `${site.name} · Software engineer`;
