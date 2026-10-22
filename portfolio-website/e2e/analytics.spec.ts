import { expect, test } from "@playwright/test";

/**
 * Phase 6.2: G4 actions reach Umami. CI builds without NEXT_PUBLIC_UMAMI_WEBSITE_ID, so the
 * tracker is stubbed as window.umami and the real script must not load.
 */
test.describe("analytics", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const calls: unknown[] = [];
      Object.assign(window, { umami: { track: (...args: unknown[]) => calls.push(args) }, umamiCalls: calls });
      // Keep mailto: from leaving the page; registered first, so the site's listener still sees the click.
      document.addEventListener("click", (e) => {
        if ((e.target as Element).closest?.('a[href^="mailto:"]')) e.preventDefault();
      }, true);
    });
  });

  const calls = (page: import("@playwright/test").Page) => page.evaluate(() => (window as unknown as { umamiCalls: unknown[] }).umamiCalls);

  test("doesn't load Umami without a website ID", async ({ page }) => {
    const umami: string[] = [];
    page.on("request", (r) => r.url().includes("umami") && umami.push(r.url()));
    await page.goto("/");
    await page.waitForLoadState("load");
    expect(umami).toEqual([]);
  });

  test("records Email me from Contact", async ({ page }) => {
    await page.goto("/#contact");
    await page.locator("#contact").getByRole("link", { name: "Email me" }).click();
    expect(await calls(page)).toEqual([["Email click", { place: "contact" }]]);
  });

  test("records Book a call, and Calendly still opens", async ({ page }) => {
    await page.goto("/#contact");
    const book = page.locator("#contact").getByRole("link", { name: "Book a call" });
    test.skip((await book.count()) === 0, "NEXT_PUBLIC_CALENDLY_URL isn't set in this build");
    await page.route("https://calendly.com/**", (route) => route.fulfill({ body: "calendly" }));
    const [popup] = await Promise.all([page.waitForEvent("popup"), book.click()]);
    expect(popup.url()).toContain("calendly.com");
    expect(await calls(page)).toEqual([["Calendly click", { place: "contact" }]]);
  });

  test("records a CV download from the header, and the PDF still downloads", async ({ page, isMobile }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    test.skip(isMobile && !(await nav.getByRole("link", { name: "CV" }).isVisible()), "the CV nav item is hidden on this phone");
    const [download] = await Promise.all([page.waitForEvent("download"), nav.getByRole("link", { name: "CV" }).click()]);
    expect(download.suggestedFilename()).toBe("Habib-Ahmed-Wasi-CV.pdf");
    expect(await calls(page)).toEqual([["CV download", { place: "header" }]]);
  });

  test("doesn't record other links", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Work" }).click();
    expect(await calls(page)).toEqual([]);
  });
});
