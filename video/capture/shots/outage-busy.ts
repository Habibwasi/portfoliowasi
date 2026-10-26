import { DEFAULT_QUESTION } from "../../scripts/export-retrieval";
import { ask, desktop, openGuide, openHome } from "../guide";
import type { Shot } from "../lib";

/** Scene 5: Groq unavailable (no key): the busy message, with the matching pages and excerpts (3.6). */
export const shot: Shot = {
  name: "outage-busy",
  shows: "The guide without a Groq key: the busy message with matching pages and excerpts",
  env: { GROQ_API_KEY: "" },
  context: desktop,
  guideQuestions: 1,
  warmUp: true,
  async run(page) {
    await openHome(page);
    await page.waitForTimeout(800);
    await openGuide(page);
    const answer = await ask(page, DEFAULT_QUESTION);
    if (!answer.busy || answer.sources.length === 0) throw new Error("Expected the busy message with matches");
    await page.waitForTimeout(4000);
  },
};
