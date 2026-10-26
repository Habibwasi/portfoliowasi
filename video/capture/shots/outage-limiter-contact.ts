import { glideClick, typeLikeAPerson, UNREACHABLE_UPSTASH, type Shot } from "../lib";
import { desktop, openHome } from "../guide";

/**
 * Scene 5, left half of the split: with Upstash unreachable the contact form fails open and
 * still sends. This sends a real email to Habib through Resend, so the runner asks for --send.
 */
export const shot: Shot = {
  name: "outage-limiter-contact",
  shows: "Limiter down: the contact form fails open and still sends (a real email to Habib)",
  env: { KV_REST_API_URL: UNREACHABLE_UPSTASH },
  context: desktop,
  sendsEmail: true,
  async run(page) {
    await openHome(page, "#contact");
    await page.waitForTimeout(800);
    const fields: [string, string][] = [
      ["Name", "Motion video capture"],
      ["Email", "habibwasi9@gmail.com"],
      ["Message", "Sent by the motion video's capture script: the contact form still works while the rate limiter is down."],
    ];
    for (const [label, value] of fields) {
      await glideClick(page, page.getByLabel(label), 500);
      await typeLikeAPerson(page, value);
    }
    await glideClick(page, page.getByRole("button", { name: "Send message" }), 500);
    await page.locator("#contact").getByRole("status").filter({ hasText: /on its way/ }).waitFor({ timeout: 20_000 });
    await page.waitForTimeout(3500);
  },
};
