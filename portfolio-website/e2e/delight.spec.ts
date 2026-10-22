import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { aimAtTag } from "./orbit";

/** Phase 5: the name, the physics tiles, the orbit, the object nav and the guide's tools. */

/** Records when the Matter.js chunk arrives (its code mentions "collisionStart"), in page time. */
function watchMatter(page: Page) {
  const loads: number[] = [];
  page.on("response", async (response) => {
    if (!response.url().endsWith(".js")) return;
    const body = await response.text().catch(() => "");
    if (body.includes("collisionStart")) loads.push(await page.evaluate(() => performance.now()).catch(() => Infinity));
  });
  return loads;
}

/** Layout shift from the moment the name starts animating (the font swap before it is Phase 1's). */
const layoutShift = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        const since = Number(document.getElementById("hero-name")?.dataset.startedAt ?? 0);
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean; sources: { node?: Node }[] })[]) {
            if (entry.hadRecentInput || entry.startTime < since) continue;
            total += entry.value;
            console.log(`layout shift ${entry.value.toFixed(4)} at ${Math.round(entry.startTime)} ms: ${entry.sources.map((s) => (s.node as Element | undefined)?.className || s.node?.nodeName).join(", ")}`);
          }
        }).observe({ type: "layout-shift", buffered: true });
        setTimeout(() => resolve(total), 500);
      }),
  );

test.describe("hero name (5.1)", () => {
  test("keeps its text through the reveal and scramble, without shifting the page", async ({ page }) => {
    page.on("console", (message) => message.text().startsWith("layout shift") && console.log(message.text()));
    await page.goto("/");
    const name = page.getByRole("heading", { level: 1, name: "Habib Ahmed Wasi" });
    await expect(name).toBeVisible();
    await expect(name).toHaveAttribute("data-settled", "", { timeout: 8000 });
    await expect(name).toHaveAttribute("data-started-at");
    await expect(name).toHaveText("Habib Ahmed Wasi");
    expect(await layoutShift(page)).toBeLessThan(0.01);
  });
});

test.describe("hero name as LCP (5.1, P1)", () => {
  test("is the largest contentful paint on Home", async ({ page }) => {
    await page.goto("/");
    const lcp = await page.evaluate(
      () =>
        new Promise<string>((resolve) => {
          new PerformanceObserver((list) => {
            const last = list.getEntries().at(-1) as PerformanceEntry & { element?: Element };
            resolve(last.element?.id ?? "");
          }).observe({ type: "largest-contentful-paint", buffered: true });
        }),
    );
    expect(lcp).toBe("hero-name");
  });
});

test.describe("physics tiles (5.2)", () => {
  test("load Matter.js only after load, where there is a mouse, and pause offscreen", async ({ page, isMobile }) => {
    const matter = watchMatter(page);
    await page.goto("/");
    const art = page.locator(".hw-hero__art");
    if (isMobile) {
      await page.waitForTimeout(3000);
      await expect(art).toHaveAttribute("data-physics", "off");
      expect(matter).toEqual([]);
      return;
    }
    await expect(art).toHaveAttribute("data-physics", "running", { timeout: 8000 });
    const loadAt = await page.evaluate(() => (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming).loadEventStart);
    expect(matter.length).toBeGreaterThan(0);
    expect(matter[0]).toBeGreaterThan(loadAt);
    await expect(page.locator(".hw-letter")).toHaveCount(5);

    await page.locator("#stack").scrollIntoViewIfNeeded();
    await expect(art).toHaveAttribute("data-physics", "paused");
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("never loads Matter.js and keeps the still pile", async ({ page, isMobile }) => {
      const matter = watchMatter(page);
      await page.goto("/");
      await page.waitForTimeout(3000);
      await expect(page.locator(".hw-hero__art")).toHaveAttribute("data-physics", "off");
      expect(matter).toEqual([]);
      if (!isMobile) await expect(page.locator(".hw-letter--signal")).toBeVisible();
    });
  });
});

test.describe("skills orbit (5.3)", () => {
  test("orbits on a wide screen, pauses on hover and with the button, and still shows proofs", async ({ page, isMobile }) => {
    test.skip(isMobile, "phones get the rows");
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await expect(page.locator(".hw-orbit__core")).toBeVisible();
    const ring = page.locator(".hw-orbit__ring--ai .hw-orbit__items");
    const playState = () => ring.evaluate((el) => getComputedStyle(el).animationPlayState);
    await expect.poll(playState).toBe("running");

    const swift = page.getByRole("button", { name: "Swift" });
    await aimAtTag(page, swift);
    await expect.poll(playState).toBe("paused");
    await swift.click();
    await expect(page.getByRole("region", { name: "Where I used Swift" }).getByRole("link", { name: "Ridly" })).toBeVisible();

    // Focus inside the orbit pauses it too; move focus and the mouse away before trying the button.
    await page.mouse.move(0, 0);
    await page.locator("#stack-heading").click();
    await expect.poll(playState).toBe("running");
    const pause = page.getByRole("button", { name: "Pause rotation" });
    await pause.click();
    await expect(pause).toHaveAttribute("aria-pressed", "true");
    await page.mouse.move(0, 0);
    await page.locator("#stack-heading").click();
    await expect.poll(playState).toBe("paused");
  });

  test("shows three rows of tags on a phone", async ({ page, isMobile }) => {
    test.skip(!isMobile, "desktop gets the orbit");
    await page.goto("/#stack");
    await expect(page.locator(".hw-orbit__core")).toBeHidden();
    await expect(page.getByRole("group", { name: "Frameworks and tools" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Pause rotation" })).toBeHidden();
  });
});

test.describe("object navigation (5.4)", () => {
  test("leads to the sections and stays out of the tab order", async ({ page }) => {
    await page.goto("/");
    const objects = page.locator(".hw-objects");
    await expect(objects).toHaveAttribute("aria-hidden", "true");
    for (const link of await objects.locator("a").all()) await expect(link).toHaveAttribute("tabindex", "-1");
    await objects.locator("a", { hasText: "Contact" }).click();
    await expect(page).toHaveURL(/#contact$/);
    await objects.locator("a", { hasText: "About" }).click();
    await expect(page).toHaveURL(/\/about$/);
  });
});

/** A canned answer with one page tool call, so the tools are tested without Groq. */
function toolStream(text: string, toolName: string, input: unknown) {
  return [
    { type: "start", messageMetadata: { sources: [{ n: 1, title: "Contact", url: "/#contact" }] } },
    { type: "text-start", id: "t" },
    { type: "text-delta", id: "t", delta: text },
    { type: "text-end", id: "t" },
    { type: "tool-input-available", toolCallId: "call-1", toolName, input },
    { type: "finish" },
  ]
    .map((event) => `data: ${JSON.stringify(event)}\n\n`)
    .concat("data: [DONE]\n\n")
    .join("");
}

test.describe("guide page tools (5.6)", () => {
  test("“Take me to contact” scrolls there, outlines it and points, with no axe violations", async ({ page, isMobile }) => {
    let requests = 0;
    await page.route("**/api/guide", (route) => {
      requests++;
      return route.fulfill({
        status: 200,
        headers: { "content-type": "text/event-stream", "x-vercel-ai-ui-message-stream": "v1" },
        body: toolStream("Here is how to reach him [1].", "scroll_to", { section: "contact" }),
      });
    });
    await page.goto("/");
    await page.getByRole("button", { name: "Open the AI assistant" }).click();
    const dialog = page.getByRole("dialog", { name: "AI assistant" });
    await dialog.getByRole("textbox", { name: "Ask about Habib" }).fill("Take me to contact");
    await dialog.getByRole("button", { name: "Send" }).click();

    const contact = page.locator("#contact");
    await expect(contact).toHaveClass(/hw-guide-target/);
    await expect(contact).toBeInViewport();
    await expect(page.locator("[data-guide-pointer]")).toBeVisible();
    if (isMobile) {
      // The sheet closed so the target shows; reopening it keeps the conversation.
      await page.getByRole("button", { name: "Open the AI assistant" }).click();
    }
    await expect(dialog.getByRole("log")).toContainText("Showing: Contact");
    expect(requests).toBe(1);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
  });

  test("open_case_study goes to the case study and points at its title", async ({ page }) => {
    await page.route("**/api/guide", (route) =>
      route.fulfill({
        status: 200,
        headers: { "content-type": "text/event-stream", "x-vercel-ai-ui-message-stream": "v1" },
        body: toolStream("Ridly is his biggest project [1].", "open_case_study", { slug: "ridly" }),
      }),
    );
    await page.goto("/");
    await page.getByRole("button", { name: "Open the AI assistant" }).click();
    const dialog = page.getByRole("dialog", { name: "AI assistant" });
    await dialog.getByRole("textbox", { name: "Ask about Habib" }).fill("Show me his best project");
    await dialog.getByRole("button", { name: "Send" }).click();
    await expect(page).toHaveURL(/\/work\/ridly$/);
    await expect(page.locator("#cs-title")).toHaveClass(/hw-guide-target/);
  });
});
