import { DEFAULT_QUESTION } from "../../scripts/export-retrieval";
import { glideClick, scrollBy } from "../lib";
import { ask, desktop, openGuide, openHome } from "../guide";
import type { Shot } from "../lib";

/**
 * Scene 2: Home, the Ridly case study, then the guide answering the video's question for real.
 * Each take saves the raw answer to public/footage/tour-<take>-answer.json; the chosen take's
 * file is copied to video/data/answer.json for scene 3 (README).
 */
export const shot: Shot = {
  name: "tour",
  shows: "Home, the Ridly case study, and the guide answering one question (real answer, Groq and Upstash on)",
  context: desktop,
  guideQuestions: 1,
  warmUp: true,
  async run(page, take) {
    await openHome(page);
    await page.waitForTimeout(1500);
    await scrollBy(page, 1000, 1600);
    await page.waitForTimeout(500);
    await glideClick(page, page.locator('a.hw-card[href="/work/ridly"]'), 800);
    await page.waitForURL("**/work/ridly");
    await page.waitForTimeout(1200);
    await scrollBy(page, 700, 1400);
    await page.waitForTimeout(600);
    await openGuide(page);
    const answer = await ask(page, DEFAULT_QUESTION);
    if (answer.busy) throw new Error("The guide said it is busy: check GROQ_API_KEY and the limits, then record again");
    take.save(`tour-${take.number}-answer`, { question: DEFAULT_QUESTION, ...answer });
    await page.waitForTimeout(4000);
  },
};
