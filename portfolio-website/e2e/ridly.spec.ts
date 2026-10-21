import { expect, test } from "@playwright/test";

/** Phase 2: the Ridly case study (2.1) and per-page social previews (2.2). */

test.describe("Ridly case study", () => {
  test("opens from its card on Home, then follows Next project to Validation Portal", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#work").getByText("Case study coming")).toHaveCount(0);
    await page.getByRole("link", { name: /Ridly, carpooling for Android and iOS/ }).click();
    await expect(page).toHaveURL(/\/work\/ridly$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ridly, carpooling for Android and iOS");
    await expect(page).toHaveTitle(/Ridly case study/);
    await expect(page.getByRole("group", { name: "Project facts" })).toContainText("Built solo");

    await page.getByRole("link", { name: /^Next project/ }).click();
    await expect(page).toHaveURL(/\/work\/validation-portal$/);
  });
});

test.describe("social previews", () => {
  for (const slug of ["topictrail", "ridly", "validation-portal"]) {
    test(`/work/${slug} has its own Open Graph image and Twitter title`, async ({ page, request }) => {
      await page.goto(`/work/${slug}`);
      const ogImage = await page.locator('meta[property="og:image"]').first().getAttribute("content");
      expect(ogImage).toMatch(new RegExp(`/work/${slug}/opengraph-image`));
      const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute("content");
      expect(twitterTitle).toMatch(/case study/);

      const image = await request.get(new URL(ogImage!).pathname);
      expect(image.status()).toBe(200);
      expect(image.headers()["content-type"]).toBe("image/png");
    });
  }

  test("the sitemap lists Ridly", async ({ request }) => {
    expect(await (await request.get("/sitemap.xml")).text()).toContain("/work/ridly");
  });
});
