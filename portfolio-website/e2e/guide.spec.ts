import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/** Phase 3: the AI guide (3.1–3.3) and "How this guide works" (3.5). */

const openGuide = async (page: Page) => {
  await page.getByRole("button", { name: "Open the AI assistant" }).click();
  const dialog = page.getByRole("dialog", { name: "AI assistant" });
  await expect(dialog).toBeVisible();
  return dialog;
};

/** A canned UI message stream, so the chat is tested without Groq. */
function streamBody(text: string, sources: { n: number; title: string; url: string }[]) {
  return [
    { type: "start", messageMetadata: { sources } },
    { type: "text-start", id: "t" },
    { type: "text-delta", id: "t", delta: text },
    { type: "text-end", id: "t" },
    { type: "finish" },
  ]
    .map((event) => `data: ${JSON.stringify(event)}\n\n`)
    .concat("data: [DONE]\n\n")
    .join("");
}

test.describe("AI guide", () => {
  for (const path of ["/", "/work/ridly", "/guide"]) {
    test(`the tile is on ${path}, and the panel isn't loaded until it is used`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("button", { name: "Open the AI assistant" })).toBeVisible();
      await expect(page.locator("[data-guide-panel]")).toHaveCount(0);
    });
  }

  test("opens as a side panel that reflows the page on desktop, or a full-width sheet on a phone", async ({ page, isMobile }) => {
    await page.goto("/");
    const before = await page.locator("main").boundingBox();
    const dialog = await openGuide(page);
    const box = (await dialog.boundingBox())!;
    const viewport = page.viewportSize()!;
    if (isMobile) {
      expect(box.width).toBeGreaterThanOrEqual(viewport.width - 1);
      expect(box.height).toBeLessThanOrEqual(viewport.height * 0.8 + 1);
    } else {
      expect(Math.round(box.width)).toBe(400);
      const after = await page.locator("main").boundingBox();
      expect(after!.width).toBeLessThanOrEqual(before!.width - 399);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: "Open the AI assistant" })).toBeFocused();
  });

  test("the Proof jump lands on the proof section", async ({ page }) => {
    await page.goto("/work/ridly");
    const dialog = await openGuide(page);
    await dialog.getByRole("link", { name: "Proof" }).click();
    await expect(page).toHaveURL(/\/#proof$/);
    await expect(page.locator("#proof")).toBeInViewport();
  });

  test("the tour walks through Home and can be stopped", async ({ page }) => {
    await page.goto("/");
    const dialog = await openGuide(page);
    await dialog.getByRole("button", { name: "Take the 30-second tour" }).click();
    await expect(dialog.getByText(/Stop 1 of 5/)).toBeVisible();
    await expect(page.locator("#intro")).toHaveClass(/hw-guide-target/);
    await dialog.getByRole("button", { name: "Next stop" }).click();
    await expect(dialog.getByText(/Stop 2 of 5/)).toBeVisible();
    await expect(page.locator("#work")).toBeInViewport();
    await dialog.getByRole("button", { name: "Stop the tour" }).click();
    await expect(page.locator(".hw-guide-target")).toHaveCount(0);
  });

  test("answers a question with its source", async ({ page }) => {
    await page.route("**/api/guide", (route) =>
      route.fulfill({
        status: 200,
        headers: { "content-type": "text/event-stream", "x-vercel-ai-ui-message-stream": "v1" },
        body: streamBody("Habib is available full-time from February 2027 [1].", [{ n: 1, title: "Availability", url: "/#intro" }]),
      }),
    );
    await page.goto("/");
    const dialog = await openGuide(page);
    await dialog.getByRole("textbox", { name: "Ask about Habib" }).fill("When can he start?");
    await dialog.getByRole("button", { name: "Send" }).click();
    await expect(dialog.getByRole("log")).toContainText("February 2027");
    await expect(dialog.getByRole("list", { name: "Sources" }).getByRole("link", { name: "Availability" })).toHaveAttribute("href", "/#intro");
  });

  test("has no axe violations with the panel open", async ({ page }) => {
    await page.goto("/");
    await openGuide(page);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("How this guide works", () => {
  test("is linked from the panel, fits the screen and has no axe violations", async ({ page }) => {
    await page.goto("/");
    const dialog = await openGuide(page);
    await dialog.getByRole("link", { name: "How this guide works" }).click();
    await expect(page).toHaveURL(/\/guide$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("How this guide works");
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(page.viewportSize()!.width);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("is in the sitemap", async ({ request }) => {
    expect(await (await request.get("/sitemap.xml")).text()).toContain("/guide");
  });
});
