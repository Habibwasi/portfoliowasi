import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { BrowserContextOptions, Locator, Page } from "playwright";

export const footageDir = join(import.meta.dirname, "..", "public", "footage");
export const siteDir = join(import.meta.dirname, "..", "..", "portfolio-website");
export const PORT = 3300;
export const baseUrl = `http://localhost:${PORT}`;

/** A port nothing listens on: the rate limiter's Upstash calls fail at once (connection refused). */
export const UNREACHABLE_UPSTASH = "https://127.0.0.1:9";

export type Shot = {
  /** Also the file name: public/footage/<name>-<take>.mp4. */
  name: string;
  /** What the shot shows, for the README and the console. */
  shows: string;
  /** Overrides for the production server; an empty string switches a variable off over .env.local. */
  env?: Record<string, string>;
  context: BrowserContextOptions;
  /** Questions each take sends to /api/guide; they count against the real limits. */
  guideQuestions?: number;
  /** Ask an off-topic question first, so the embedding model is loaded (no model call). */
  warmUp?: boolean;
  /** The shot sends something real (an email); the runner asks for --send. */
  sendsEmail?: boolean;
  run: (page: Page, take: Take) => Promise<void>;
};

export type Take = { number: number; save: (name: string, data: unknown) => void };

/** The per-visitor limit is 10 questions per 10 minutes; one run stays inside it. */
export const MAX_QUESTIONS_PER_RUN = 10;

export function checkBudget(shot: Pick<Shot, "guideQuestions" | "warmUp">, takes: number) {
  const total = takes * (shot.guideQuestions ?? 0) + (shot.warmUp ? 1 : 0);
  if (total > MAX_QUESTIONS_PER_RUN) {
    throw new Error(`${total} guide questions in one run; the limit is ${MAX_QUESTIONS_PER_RUN} per 10 minutes. Record fewer takes.`);
  }
  return total;
}

export type GuideAnswer = { text: string; sources: { n: number; title: string; url: string }[]; busy: boolean };

/** The guide's UI message stream (server-sent events) as the raw answer text and its sources. */
export function answerFromStream(body: string): GuideAnswer {
  let text = "";
  let sources: GuideAnswer["sources"] = [];
  let busy = false;
  for (const line of body.split("\n")) {
    if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
    const event = JSON.parse(line.slice(6));
    if (event.type === "text-delta") text += event.delta;
    if (event.messageMetadata) {
      sources = (event.messageMetadata.sources ?? []).map(({ n, title, url }: GuideAnswer["sources"][number]) => ({ n, title, url }));
      busy = Boolean(event.messageMetadata.busy);
    }
  }
  return { text, sources, busy };
}

// Windows-1252's characters for bytes 0x80–0x9F; the rest of its range is Latin-1.
const CP1252 = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";

/**
 * UTF-8 text that was decoded as Windows-1252, decoded again properly. Text with a character
 * Windows-1252 can't hold was decoded right in the first place and comes back unchanged.
 */
export function fromWindows1252(text: string): string {
  const bytes: number[] = [];
  for (const char of text) {
    const high = CP1252.indexOf(char);
    const code = char.charCodeAt(0);
    if (high >= 0) bytes.push(0x80 + high);
    else if (code < 0x80 || (code >= 0xa0 && code <= 0xff)) bytes.push(code);
    else return text;
  }
  return Buffer.from(bytes).toString("utf8");
}

/** Starts `next start` on the production build with the shot's environment, and waits until it answers. */
export async function startServer(env: Record<string, string> = {}): Promise<ChildProcess> {
  if (!existsSync(join(siteDir, ".next", "BUILD_ID"))) throw new Error("No production build: run `npm run build` in portfolio-website first");
  const server = spawn(process.execPath, [join(siteDir, "node_modules", "next", "dist", "bin", "next"), "start", "--port", String(PORT)], {
    cwd: siteDir,
    env: { ...process.env, ...env, NODE_ENV: "production" },
    stdio: ["ignore", "inherit", "inherit"],
  });
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`next start exited with ${server.exitCode}`);
    try {
      if ((await fetch(baseUrl)).ok) return server;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  server.kill();
  throw new Error("next start didn't answer within 60 s");
}

/** Sends an off-topic question: the route embeds it (loading the model) and answers "I don't know" without Groq. */
export async function warmUp() {
  const response = await fetch(`${baseUrl}/api/guide`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages: [{ id: "warm-up", role: "user", parts: [{ type: "text", text: "What is the capital of France?" }] }] }),
  });
  await response.text();
}

/**
 * A drawn mouse pointer: headless recordings show none. It follows mouse events, and dips
 * slightly on press, so clicks and drags read on screen.
 */
export const cursorScript = `
addEventListener("DOMContentLoaded", () => {
  const cursor = document.createElement("div");
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML = '<svg width="28" height="28" viewBox="0 0 28 28"><path d="M4 2 L4 22 L9.5 17 L13 25 L16.5 23.5 L13 15.8 L20.5 15.5 Z" fill="black" stroke="white" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  Object.assign(cursor.style, { position: "fixed", left: "0", top: "0", zIndex: "2147483647", pointerEvents: "none", transform: "translate(-100px, -100px)", transition: "scale 80ms" });
  document.documentElement.append(cursor);
  addEventListener("mousemove", (e) => (cursor.style.transform = "translate(" + (e.clientX - 4) + "px, " + (e.clientY - 2) + "px)"), true);
  addEventListener("mousedown", () => (cursor.style.scale = "0.85"), true);
  addEventListener("mouseup", () => (cursor.style.scale = "1"), true);
});
`;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

let pointer = { x: 960, y: 540 };

/** Moves the mouse along an eased path, as a hand would, instead of jumping. */
export async function glide(page: Page, x: number, y: number, ms = 600) {
  const from = pointer;
  const steps = Math.max(8, Math.round(ms / 16));
  for (let i = 1; i <= steps; i++) {
    const t = ease(i / steps);
    await page.mouse.move(from.x + (x - from.x) * t, from.y + (y - from.y) * t);
    await page.waitForTimeout(ms / steps);
  }
  pointer = { x, y };
}

/** Glides to the middle of an element and clicks it. */
export async function glideClick(page: Page, target: Locator, ms = 600) {
  await target.scrollIntoViewIfNeeded();
  const box = (await target.boundingBox())!;
  await glide(page, box.x + box.width / 2, box.y + box.height / 2, ms);
  await page.waitForTimeout(120);
  await page.mouse.down();
  await page.waitForTimeout(70);
  await page.mouse.up();
}

/** Types at a readable pace, with a little variation. */
export async function typeLikeAPerson(page: Page, text: string) {
  for (const char of text) {
    await page.keyboard.type(char);
    await page.waitForTimeout(45 + Math.random() * 50);
  }
}

/** Scrolls by `dy` pixels over `ms`, smoothly, with the wheel. */
export async function scrollBy(page: Page, dy: number, ms = 1200) {
  const steps = Math.max(10, Math.round(ms / 16));
  let done = 0;
  for (let i = 1; i <= steps; i++) {
    const next = Math.round(dy * ease(i / steps));
    await page.mouse.wheel(0, next - done);
    done = next;
    await page.waitForTimeout(ms / steps);
  }
}

export function resetPointer(x = 960, y = 540) {
  pointer = { x, y };
}

export type Frame = { file: string; timestamp: number };

/**
 * An ffmpeg concat list for screencast frames: Chrome sends a frame only when the page paints,
 * so each one is held until the next arrives, and the last until the take ends.
 */
export function concatList(frames: Frame[], end: number): string {
  const entry = (file: string) => `file '${file.replaceAll("\\", "/")}'`;
  const lines = ["ffconcat version 1.0"];
  frames.forEach((frame, i) => {
    lines.push(entry(frame.file), `duration ${((frames[i + 1]?.timestamp ?? end) - frame.timestamp).toFixed(6)}`);
  });
  lines.push(entry(frames.at(-1)!.file), "");
  return lines.join("\n");
}

/**
 * Records the page with Chrome DevTools screencast: full-resolution JPEG frames with their
 * paint times, instead of Playwright's video (VP8 at about 0.8 Mbit/s and 25 fps, too soft for
 * text). Returns a function that stops recording and returns the frames.
 */
export async function startScreencast(page: Page, dir: string, size: { width: number; height: number }) {
  const cdp = await page.context().newCDPSession(page);
  const frames: Frame[] = [];
  const writes: Promise<void>[] = [];
  cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
    const file = join(dir, `f-${String(frames.length + 1).padStart(5, "0")}.jpg`);
    frames.push({ file, timestamp: metadata.timestamp ?? Date.now() / 1000 });
    writes.push(writeFile(file, Buffer.from(data, "base64")));
    cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 95, maxWidth: size.width, maxHeight: size.height, everyNthFrame: 1 });
  return async () => {
    const end = Date.now() / 1000;
    await cdp.send("Page.stopScreencast");
    await Promise.all(writes);
    await cdp.detach();
    return { frames, end };
  };
}

const remotionCli = join(import.meta.dirname, "..", "node_modules", "@remotion", "cli", "remotion-cli.js");

/** Encodes the frames to public/footage/<shot>-<take>.mp4: 30 fps H.264, near lossless, with Remotion's ffmpeg. */
export function encodeTake(frames: Frame[], end: number, dir: string, shot: string, take: number) {
  if (!frames.length) throw new Error("The screencast sent no frames");
  mkdirSync(footageDir, { recursive: true });
  const list = join(dir, "frames.txt");
  writeFileSync(list, concatList(frames, end));
  const target = join(footageDir, `${shot}-${take}.mp4`);
  execFileSync(process.execPath, [
    remotionCli, "ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list,
    // This ffmpeg build has no fps filter: -fps_mode cfr -r 30 repeats or drops frames instead.
    "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2:out_range=tv,format=yuv420p", "-fps_mode", "cfr", "-r", "30",
    "-c:v", "libx264", "-crf", "12", "-preset", "slow", "-movflags", "+faststart", target,
  ]);
  return target;
}

export function saveJson(name: string, data: unknown) {
  mkdirSync(footageDir, { recursive: true });
  const path = join(footageDir, `${name}.json`);
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
  return path;
}
