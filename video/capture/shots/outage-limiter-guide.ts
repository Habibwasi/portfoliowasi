import { DEFAULT_QUESTION } from "../../scripts/export-retrieval";
import { ask, desktop, openGuide, openHome } from "../guide";
import { UNREACHABLE_UPSTASH, type Shot } from "../lib";

/** Scene 5, right half of the split: with Upstash unreachable the guide fails closed and says it is busy. */
export const shot: Shot = {
  name: "outage-limiter-guide",
  shows: "Limiter down: the guide fails closed and says it is busy",
  env: { KV_REST_API_URL: UNREACHABLE_UPSTASH },
  context: desktop,
  async run(page) {
    await openHome(page);
    await page.waitForTimeout(800);
    await openGuide(page);
    const answer = await ask(page, DEFAULT_QUESTION);
    if (!answer.busy) throw new Error("Expected the busy message: is KV_REST_API_URL really unreachable?");
    await page.waitForTimeout(3500);
  },
};
