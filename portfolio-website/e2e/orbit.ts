import type { Locator, Page } from "@playwright/test";

/**
 * Puts the mouse on a skill tag. On a wide screen the tags orbit, so Playwright's "stable" wait
 * never ends; a person aims instead, and the mouse on the tag stops the orbit (5.3).
 */
export async function aimAtTag(page: Page, tag: Locator) {
  await tag.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const box = (await tag.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
}
