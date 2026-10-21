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
