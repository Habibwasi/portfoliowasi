import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadPlexMono } from "@remotion/google-fonts/IBMPlexMono";
import { loadFont as loadInstrumentSans } from "@remotion/google-fonts/InstrumentSans";

/** The site's three families (its next/font set), with the weights tokens.json uses. */
export function loadFonts() {
  loadFraunces("normal", { weights: ["500", "600"], subsets: ["latin"] });
  loadFraunces("italic", { weights: ["500"], subsets: ["latin"] });
  loadInstrumentSans("normal", { weights: ["400", "600"], subsets: ["latin"] });
  loadPlexMono("normal", { weights: ["500"], subsets: ["latin"] });
}
