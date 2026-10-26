/**
 * Render smoke test (spec: Tests): one still from the middle of every scene in both cuts.
 * Fails on the first scene that throws. Stills go to out/smoke/ for a look by eye.
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { cuts, scenesOf, type CutId } from "../src/cuts";

const root = join(import.meta.dirname, "..");
const outDir = join(root, "out", "smoke");
mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: join(root, "src", "index.ts") });

for (const cut of Object.keys(cuts) as CutId[]) {
  const inputProps = { cut };
  const composition = await selectComposition({ serveUrl, id: cuts[cut].id, inputProps });
  for (const scene of scenesOf(cut)) {
    const frame = scene.from + Math.floor(scene.durationInFrames / 2);
    const output = join(outDir, `${cuts[cut].id}-${scene.n}-${scene.id}.png`);
    await renderStill({ serveUrl, composition, inputProps, frame, output });
    console.log(`${cuts[cut].id} scene ${scene.n} (${scene.id}), frame ${frame}: ok`);
  }
}
