import { devices } from "playwright";
import { glideClick, scrollBy } from "../lib";
import { openHome } from "../guide";
import type { Shot } from "../lib";

/** Scene 6: the phone layout: Home, then the guide as a bottom sheet. */
export const shot: Shot = {
  name: "phones-phone",
  shows: "The phone layout (Pixel 7): Home and the guide's sheet",
  context: devices["Pixel 7"],
  async run(page) {
    await openHome(page);
    await page.waitForTimeout(2000);
    await scrollBy(page, 1400, 2400);
    await page.waitForTimeout(1200);
    await glideClick(page, page.getByRole("button", { name: "Open the AI assistant" }));
    await page.getByRole("dialog", { name: "AI assistant" }).waitFor();
    await page.waitForTimeout(3000);
  },
};
