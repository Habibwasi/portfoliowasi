import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Entrance animations start from low opacity, which axe reads as low contrast.
 * Wait until inline styles stop changing so axe checks the page as visitors see it.
 */
async function waitForAnimationsToSettle(page: Page) {
  const snapshot = () =>
    page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>("[style]"))
        .map((el) => el.getAttribute("style"))
        .join("|"),
    );
  let previous = await snapshot();
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(250);
    const current = await snapshot();
    if (current === previous) return;
    previous = current;
  }
}

test.describe("site shell", () => {
  test("uses the paper theme and no dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(background).toBe("rgb(245, 241, 232)");
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });

  test("skip link moves focus to the main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("main nav reaches the work section", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Work" }).click();
    await expect(page).toHaveURL(/#work$/);
    await expect(page.locator("#work")).toBeInViewport();
  });

  test("shows a visible focus ring", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const outline = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const style = getComputedStyle(el);
      return { width: style.outlineWidth, color: style.outlineColor };
    });
    expect(outline).toEqual({ width: "2px", color: "rgb(43, 74, 203)" });
  });

  test("sends a Content Security Policy", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.headers()["content-security-policy"]).toContain("default-src 'self'");
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await page.goto("/");
    await waitForAnimationsToSettle(page);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
  });
});
