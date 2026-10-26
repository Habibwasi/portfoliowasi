import { scrollBy } from "../lib";
import { desktop, openHome } from "../guide";
import type { Page } from "playwright";
import type { Shot } from "../lib";

/** The same path for both halves of scene 6's split screen, so they stay in step. */
export async function homePath(page: Page) {
  await openHome(page);
  await page.waitForTimeout(3000);
  await scrollBy(page, 900, 2000);
  await page.waitForTimeout(1500);
  await scrollBy(page, 900, 2000);
  await page.waitForTimeout(1500);
}

/** Scene 6, left half: Home with motion on. */
export const shot: Shot = {
  name: "phones-motion",
  shows: "Home with motion on (left half of the split)",
  context: desktop,
  run: homePath,
};
