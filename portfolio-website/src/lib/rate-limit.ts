import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let contactLimiter: Ratelimit | null | undefined;

/** 5 messages per IP per 10 minutes. Null when Upstash isn't configured (e.g. local dev). */
function getContactLimiter(): Ratelimit | null {
  if (contactLimiter !== undefined) return contactLimiter;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  contactLimiter =
    url && token
      ? new Ratelimit({
          redis: new Redis({ url, token }),
          limiter: Ratelimit.slidingWindow(5, "10 m"),
          prefix: "ratelimit:contact",
          timeout: 3000,
        })
      : null;
  return contactLimiter;
}

/**
 * Whether this IP may send another contact message. Fails open: if Upstash is missing
 * or down, the form still works (tech-stack.md, "Risks and fallbacks").
 */
export async function allowContact(ip: string): Promise<boolean> {
  try {
    const limiter = getContactLimiter();
    if (!limiter) return true;
    const { success } = await limiter.limit(ip);
    return success;
  } catch (error) {
    console.error("Contact rate limit unavailable:", error);
    return true;
  }
}

type GuideLimiters = { visitor: Ratelimit; site: Ratelimit };

let guideLimiters: GuideLimiters | null | undefined;

/**
 * 10 questions per IP per 10 minutes, and 90 a day across the site. Groq's free tier for
 * gpt-oss-120b allows 200K tokens a day, roughly 100 answers, so the guide goes busy first.
 */
function getGuideLimiters(): GuideLimiters | null {
  if (guideLimiters !== undefined) return guideLimiters;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return (guideLimiters = null);
  const redis = new Redis({ url, token });
  guideLimiters = {
    visitor: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "10 m"), prefix: "ratelimit:guide", timeout: 3000 }),
    site: new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(90, "1 d"), prefix: "ratelimit:guide-daily", timeout: 3000 }),
  };
  return guideLimiters;
}

/**
 * Whether this IP may ask the guide another question. Fails closed, unlike the contact form:
 * every question costs model quota. Without Upstash it is open outside production only, so
 * local dev and tests work.
 */
export async function allowGuide(ip: string): Promise<boolean> {
  try {
    const limiters = getGuideLimiters();
    if (!limiters) return process.env.NODE_ENV !== "production";
    // The visitor's limit first, so a limited visitor doesn't spend the site's daily cap.
    if (!(await limiters.visitor.limit(ip)).success) return false;
    return (await limiters.site.limit("site")).success;
  } catch (error) {
    console.error("Guide rate limit unavailable:", error);
    return false;
  }
}
