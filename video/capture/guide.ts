import type { Page } from "playwright";
import { answerFromStream, baseUrl, fromWindows1252, glide, glideClick, typeLikeAPerson, type GuideAnswer } from "./lib";

export const desktop = { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 } as const;

/** Home, once the name has settled (5.1). */
export async function openHome(page: Page, hash = "") {
  await page.goto(`${baseUrl}/${hash}`);
  await page.getByRole("heading", { level: 1, name: "Habib Ahmed Wasi" }).waitFor();
  await page.locator("#hero-name[data-settled]").waitFor({ timeout: 10_000 });
}

export async function openGuide(page: Page) {
  await glideClick(page, page.getByRole("button", { name: "Open the AI assistant" }));
  const dialog = page.getByRole("dialog", { name: "AI assistant" });
  await dialog.waitFor();
  await page.waitForTimeout(600);
  return dialog;
}

/** Types the question into the open panel, sends it and waits for the whole answer. Returns the raw stream's answer. */
export async function ask(page: Page, question: string): Promise<GuideAnswer> {
  const dialog = page.getByRole("dialog", { name: "AI assistant" });
  await glideClick(page, dialog.getByRole("textbox", { name: "Ask about Habib" }), 500);
  await typeLikeAPerson(page, question);
  const response = page.waitForResponse((r) => r.url().endsWith("/api/guide") && r.request().method() === "POST", { timeout: 60_000 });
  await glideClick(page, dialog.getByRole("button", { name: "Send" }), 400);
  // Off the button, so the pointer doesn't sit on it for the rest of the take.
  const panel = (await dialog.boundingBox())!;
  await glide(page, panel.x - 220, panel.y + panel.height * 0.55, 700);
  // The stream declares no charset, so DevTools hands it over decoded as Windows-1252.
  const body = fromWindows1252(await (await response).text());
  await dialog.getByRole("button", { name: "Send" }).waitFor({ timeout: 60_000 });
  return answerFromStream(body);
}
