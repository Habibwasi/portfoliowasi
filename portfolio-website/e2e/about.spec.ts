import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** Phase 4: How I build with AI (4.1), Stack (4.3) and the About page (4.4). */

test.describe("Home", () => {
  test("has the sections in order: work, AI, proof, stack, contact", async ({ page }) => {
    await page.goto("/");
    const ids = await page.locator("main section[id]").evaluateAll((sections) => sections.map((s) => s.id));
    expect(ids.filter((id) => ["work", "ai", "proof", "stack", "contact"].includes(id))).toEqual([
      "work",
      "ai",
      "proof",
      "stack",
      "contact",
    ]);
  });

  test("a toolkit tag leads to the project that proves it", async ({ page }) => {
    await page.goto("/");
    const toolkit = page.getByRole("list", { name: "AI toolkit I use every week" });
    await toolkit.getByRole("link", { name: "GitHub Copilot" }).click();
    await expect(page).toHaveURL(/\/work\/ridly#cs-ai-in-the-build$/);
  });

  test("picking a skill in Stack shows where it was used", async ({ page }) => {
    await page.goto("/#stack");
    await page.getByRole("button", { name: "Swift" }).click();
    const panel = page.getByRole("region", { name: "Where I used Swift" });
    await panel.getByRole("link", { name: "Ridly" }).click();
    await expect(page).toHaveURL(/\/work\/ridly$/);
  });
});

test.describe("About", () => {
  test("is in the nav and connects the journey back to the work", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("The path so far");
    await expect(page).toHaveTitle(/About/);
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "About" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    const journey = page.getByRole("list", { name: "Journey" });
    await expect(journey.getByRole("listitem")).toHaveCount(7);
    await journey.getByRole("link", { name: /Ridly/ }).click();
    await expect(page).toHaveURL(/\/work\/ridly$/);
  });

  test("Home's proof links to the full QA record", async ({ page }) => {
    await page.goto("/#proof");
    await page.getByRole("link", { name: "See the full record" }).click();
    await expect(page).toHaveURL(/\/about#qa-record$/);
    await expect(page.locator("#qa-record").getByRole("heading", { level: 2 })).toBeInViewport();
  });

  test("has no horizontal scroll and no accessibility violations", async ({ page }) => {
    await page.goto("/about");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
  });

  test("has its own social preview and is in the sitemap", async ({ page, request }) => {
    await page.goto("/about");
    const ogImage = await page.locator('meta[property="og:image"]').first().getAttribute("content");
    expect(ogImage).toMatch(/\/about\/opengraph-image/);
    const image = await request.get(new URL(ogImage!).pathname);
    expect(image.headers()["content-type"]).toBe("image/png");
    expect(await (await request.get("/sitemap.xml")).text()).toContain("/about");
  });
});
