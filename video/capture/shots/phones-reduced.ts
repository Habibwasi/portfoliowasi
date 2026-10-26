import { desktop } from "../guide";
import type { Shot } from "../lib";
import { homePath } from "./phones-motion";

/** Scene 6, right half: Home with reduced motion: no scramble, a still pile of tiles, nothing animating. */
export const shot: Shot = {
  name: "phones-reduced",
  shows: "Home with reduced motion (right half of the split)",
  context: { ...desktop, reducedMotion: "reduce" },
  run: homePath,
};
