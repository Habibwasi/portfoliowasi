import { ask, desktop, openGuide, openHome } from "../guide";
import type { Shot } from "../lib";

/** Scene 4: an off-topic question gets the fixed "I don't know" at once, with no model call. */
export const shot: Shot = {
  name: "break-off-topic",
  shows: 'An off-topic question and the fixed "I don\'t know" (no model call)',
  context: desktop,
  guideQuestions: 1,
  async run(page) {
    await openHome(page);
    await page.waitForTimeout(800);
    await openGuide(page);
    const answer = await ask(page, "What is the capital of France?");
    if (!answer.text.startsWith("I don't know")) throw new Error(`Expected "I don't know", got: ${answer.text}`);
    await page.waitForTimeout(3000);
  },
};
