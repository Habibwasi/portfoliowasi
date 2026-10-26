import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const videoDir = join(import.meta.dirname, "..");
export const repoDir = join(videoDir, "..");
export const siteDir = join(repoDir, "portfolio-website");

export const today = () => new Date().toISOString().slice(0, 10);

/** True when the module is the script being run, not imported by a test. */
export const isMain = (moduleUrl: string) => process.argv[1] !== undefined && moduleUrl === pathToFileURL(process.argv[1]).href;

/** Writes video/data/<name>.json, the only place scenes read numbers from. */
export function writeData(name: string, data: unknown) {
  mkdirSync(join(videoDir, "data"), { recursive: true });
  const path = join(videoDir, "data", `${name}.json`);
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Wrote ${path}`);
}

/** GitHub CLI, also where it isn't on PATH (Windows installs it under Program Files). */
export function gh(args: string[]): string {
  const windows = "C:\\Program Files\\GitHub CLI\\gh.exe";
  const command = process.platform === "win32" && existsSync(windows) ? windows : "gh";
  return execFileSync(command, args, { cwd: repoDir, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

export const git = (args: string[]) => execFileSync("git", args, { cwd: repoDir, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
