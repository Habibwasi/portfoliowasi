/**
 * M.3: records footage of the local production build. One shot per run:
 *
 *   npm run capture -- <shot> [--takes 3] [--send]
 *
 * Starts `next start` on port 3300 with the shot's environment, records each take in a fresh
 * browser context (so the name and the tour offer play as on a first visit) and writes
 * public/footage/<shot>-<take>.mp4 from Chrome's screencast frames. Shots and their
 * environments: capture/README.md.
 */
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";
import { checkBudget, cursorScript, encodeTake, resetPointer, saveJson, startScreencast, startServer, warmUp, type Shot } from "./lib";

const [name, ...flags] = process.argv.slice(2);
const takesFlag = flags.indexOf("--takes");
const takes = takesFlag >= 0 ? Number(flags[takesFlag + 1]) : 1;

const shotFile = join(import.meta.dirname, "shots", `${name}.ts`);
if (!name || !existsSync(shotFile)) {
  console.error("Usage: npm run capture -- <shot> [--takes n] [--send]. Shots are the files in capture/shots/.");
  process.exit(1);
}
const { shot } = (await import(`./shots/${name}.ts`)) as { shot: Shot };

if (shot.sendsEmail && !flags.includes("--send")) {
  console.error(`${shot.name} sends a real email to Habib through Resend for every take. Add --send to record it.`);
  process.exit(1);
}
const questions = checkBudget(shot, takes);
console.log(`${shot.name}: ${shot.shows}. ${takes} take(s), ${questions} guide question(s).`);

const server = await startServer(shot.env);
const browser = await chromium.launch();
try {
  if (shot.warmUp) await warmUp();
  for (let number = 1; number <= takes; number++) {
    const viewport = shot.context.viewport ?? { width: 1920, height: 1080 };
    const scale = shot.context.deviceScaleFactor ?? 1;
    // Frames in device pixels: the phone shot is sharp at its own resolution.
    const size = { width: Math.round(viewport.width * scale), height: Math.round(viewport.height * scale) };
    const dir = await mkdtemp(join(tmpdir(), "footage-"));
    const context = await browser.newContext(shot.context);
    if (!shot.context.isMobile) await context.addInitScript(cursorScript);
    const page = await context.newPage();
    resetPointer(viewport.width / 2, viewport.height / 2);
    const stop = await startScreencast(page, dir, size);
    try {
      await shot.run(page, { number, save: (file, data) => console.log(`  saved ${saveJson(file, data)}`) });
    } finally {
      const { frames, end } = await stop();
      await context.close();
      console.log(`  take ${number}: ${encodeTake(frames, end, dir, shot.name, number)} (${frames.length} frames)`);
      await rm(dir, { recursive: true, force: true });
    }
  }
} finally {
  await browser.close();
  server.kill();
}
