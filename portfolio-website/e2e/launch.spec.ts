import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** Phase 1 "done when": the two journeys, the first view, the form and accessibility. */

test.describe("Home → case study", () => {
  test("opens Validation Portal from its card, then follows Next project", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Validation Portal, research for founders/ }).click();
    await expect(page).toHaveURL(/\/work\/validation-portal$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Validation Portal, research for founders");
    await expect(page).toHaveTitle(/Validation Portal case study/);

    await page.getByRole("link", { name: /^Next project/ }).click();
    await expect(page).toHaveURL(/\/work\/topictrail$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("TopicTrail, a memory for what you browse");
  });
});

test.describe("Home → contact → CV", () => {
  test("the nav reaches contact, which offers email, the CV and a call", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/#contact$/);
    const contact = page.locator("#contact");
    await expect(contact.getByRole("heading", { level: 2 })).toBeInViewport();
    await expect(contact.getByRole("link", { name: "Email me" })).toHaveAttribute("href", "mailto:habibwasi9@gmail.com");

    // The CV (7.1) downloads as a PDF.
    const [download] = await Promise.all([page.waitForEvent("download"), contact.getByRole("link", { name: "Download CV" }).click()]);
    expect(download.suggestedFilename()).toBe("Habib-Ahmed-Wasi-CV.pdf");
    const call = contact.getByRole("link", { name: "Book a call" });
    await expect(call.or(contact.getByText("[Calendly URL]"))).toBeVisible();
  });
});

test.describe("contact form", () => {
  async function fill(page: import("@playwright/test").Page) {
    await page.goto("/#contact");
    await page.getByLabel("Name").fill("Ada Lovelace");
    await page.getByLabel("Email").fill("ada@example.com");
    await page.getByLabel("Message").fill("We have a graduate role on our platform team.");
  }

  test("shows success", async ({ page }) => {
    await page.route("**/api/contact", (route) => route.fulfill({ json: { ok: true } }));
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.locator("#contact").getByRole("status")).toHaveText(/your message is on its way/);
  });

  test("shows an error with the email fallback", async ({ page }) => {
    await page.route("**/api/contact", (route) => route.fulfill({ status: 502, json: { error: "The message couldn't be sent." } }));
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    // Scoped: Next's route announcer is also role="alert".
    const alert = page.locator("#contact").getByRole("alert");
    await expect(alert).toContainText("The message couldn't be sent.");
    await expect(alert.getByRole("link", { name: "habibwasi9@gmail.com" })).toBeVisible();
  });
});

test.describe("first view without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("shows the name, intro and the route to the work", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Habib Ahmed Wasi");
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
    await expect(page.getByRole("link", { name: "View case studies" })).toBeInViewport();
  });
});

test.describe("layout", () => {
  for (const path of ["/", "/work/validation-portal", "/work/topictrail", "/work/ridly"]) {
    test(`${path} has no horizontal scroll`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test(`${path} has no accessibility violations`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
    });
  }
});

test.describe("metadata", () => {
  test("serves the sitemap, robots and social preview", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/work/validation-portal");
    expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap:");
    const og = await request.get("/opengraph-image");
    expect(og.headers()["content-type"]).toBe("image/png");
  });
});
