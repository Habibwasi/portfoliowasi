import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/** Phase 6.1: the accessibility pass, kept as tests so later phases can't regress it. */

const pages = ["/", "/about", "/guide", "/work/topictrail", "/work/ridly", "/work/validation-portal", "/no-such-page"];
const wcag = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

/** Entrance animations start from low opacity, which axe reads as low contrast. */
async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== "running" || a.effect?.getComputedTiming().iterations === Infinity));
}

const violations = async (page: Page) =>
  (await new AxeBuilder({ page }).withTags(wcag).analyze()).violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`);

test.describe("WCAG 2.2 AA (axe)", () => {
  for (const path of pages) {
    test(`${path} has no violations`, async ({ page }) => {
      await page.goto(path);
      await settle(page);
      expect(await violations(page)).toEqual([]);
    });
  }

  test("Home with the guide open has no violations", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open the AI assistant" }).click();
    await expect(page.getByRole("dialog", { name: "AI assistant" })).toBeVisible();
    await settle(page);
    expect(await violations(page)).toEqual([]);
  });
});

test.describe("keyboard", () => {
  for (const path of pages) {
    test(`${path}: every tab stop shows a ring and isn't covered`, async ({ page, isMobile }) => {
      test.skip(isMobile, "phones have no Tab key");
      await page.goto(path);
      await settle(page);
      const problems: string[] = [];
      let first: string | null = null;
      let stops = 0;
      for (; stops < 150; stops++) {
        await page.keyboard.press("Tab");
        // Focus scrolls smoothly (scroll-behavior: smooth); judge the stop once the scroll has settled.
        await page.waitForFunction(
          () =>
            new Promise((resolve) => {
              const y = scrollY;
              setTimeout(() => resolve(scrollY === y), 120);
            }),
        );
        const stop = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return null;
          const style = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          const name = `${el.tagName.toLowerCase()} "${(el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40)}"`;
          const ring = style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2;
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          const top = document.elementFromPoint(x, y);
          const covered = !!top && !el.contains(top) && !top.contains(el) ? `${top.tagName.toLowerCase()}.${top.className}` : "";
          return { id: name + `@${Math.round(rect.top + scrollY)}`, name, ring, covered, size: rect.width > 0 && rect.height > 0 };
        });
        if (!stop || stop.id === first) break;
        first ??= stop.id;
        if (!stop.ring) problems.push(`${stop.name}: no focus ring`);
        if (stop.covered) problems.push(`${stop.name}: covered by ${stop.covered}`);
        if (!stop.size) problems.push(`${stop.name}: no size`);
      }
      expect(problems).toEqual([]);
      expect(stops, "Tab never wrapped back, so something traps focus").toBeLessThan(150);
    });
  }
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  for (const path of pages) {
    test(`${path}: nothing animates after load and a scroll`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("load");
      await page.mouse.wheel(0, 2500);
      await page.waitForTimeout(600);
      const running = await page.evaluate(() =>
        document
          .getAnimations()
          .filter((a) => a.playState === "running")
          .map((a) => `${(a as CSSAnimation).animationName ?? "script"} on ${((a.effect as KeyframeEffect)?.target as Element)?.className}`),
      );
      expect(running).toEqual([]);
    });
  }
});

test.describe("reflow and text spacing", () => {
  const textSpacing = "* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }";
  const sideways = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

  for (const path of pages) {
    test(`${path} fits 320 px (1.4.10) and survives text spacing (1.4.12)`, async ({ page, isMobile }) => {
      test.skip(isMobile, "the viewport is set by hand");
      await page.setViewportSize({ width: 320, height: 720 });
      await page.goto(path);
      expect(await sideways(page)).toBeLessThanOrEqual(0);
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.addStyleTag({ content: textSpacing });
      expect(await sideways(page)).toBeLessThanOrEqual(0);
    });
  }
});

test.describe("screen reader names", () => {
  test("each featured card link is named by its project title", async ({ page }) => {
    await page.goto("/");
    const work = page.locator("#work");
    for (const title of ["TopicTrail, a memory for what you browse", "Ridly, carpooling for Android and iOS", "Validation Portal, research for founders"]) {
      await expect(work.getByRole("link", { name: title, exact: true })).toHaveCount(1);
    }
  });
});

test.describe("404", () => {
  test("an unknown page says so and leads back to the work", async ({ page }) => {
    const response = await page.goto("/no-such-page");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page doesn't exist");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await page.getByRole("main").getByRole("link", { name: "See the work" }).click();
    await expect(page).toHaveURL(/\/#work$/);
  });
});
