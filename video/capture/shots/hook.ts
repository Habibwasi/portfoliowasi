import { glide } from "../lib";
import { desktop, openHome } from "../guide";
import type { Shot } from "../lib";

/** Scene 1: the name scrambles in, the tiles drop and read H W A S I, then one is thrown. */
export const shot: Shot = {
  name: "hook",
  shows: "Home on a first visit: the name scramble, the tiles dropping in, a throw and a poke",
  context: desktop,
  async run(page) {
    await openHome(page);
    await page.locator('.hw-hero__art[data-physics="running"]').waitFor({ timeout: 10_000 });
    await page.waitForTimeout(2500);

    // Throw the second tile: grab it, swing up and to the left, let go mid-swing.
    const tile = (await page.locator(".hw-letter").nth(1).boundingBox())!;
    await glide(page, tile.x + tile.width / 2, tile.y + tile.height / 2, 700);
    await page.mouse.down();
    await glide(page, tile.x - 60, tile.y - 160, 260);
    await glide(page, tile.x - 220, tile.y - 300, 120);
    await page.mouse.up();
    await page.waitForTimeout(1800);

    // Poke the H.
    const h = (await page.locator(".hw-letter--signal").boundingBox())!;
    await glide(page, h.x + h.width / 2, h.y + h.height / 2, 700);
    await page.mouse.down();
    await page.waitForTimeout(80);
    await page.mouse.up();
    await page.waitForTimeout(2200);
  },
};
