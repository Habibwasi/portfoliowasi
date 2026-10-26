import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { cuts } from "../cuts";
import { site } from "../data";
import { colors, fonts } from "../theme";
import type { SceneProps } from "./index";

/** Scene 8: the name, the site and GitHub; the caption "This video is rendered from code" comes from cuts.ts. */
export function EndScene({ cut }: SceneProps) {
  const frame = useCurrentFrame();
  const { width, height } = cuts[cut];
  const u = width / 1080;
  const appear = (delay: number) => interpolate(frame, [delay, delay + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line = (delay: number, content: string, mono = false) => (
    <div style={{ opacity: appear(delay), fontFamily: mono ? fonts.mono : fonts.sans, fontSize: (mono ? 26 : 34) * u, color: mono ? colors["ink-muted"] : colors.ink, marginTop: 14 * u }}>
      {content}
    </div>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper, justifyContent: "center", paddingLeft: 96 * Math.min(u, 1.2), paddingBottom: height * (cut === "linkedin" ? 0.22 : 0.12) }}>
      <div style={{ opacity: appear(0), fontFamily: fonts.display, fontWeight: 600, fontSize: (cut === "readme" ? 84 : 104) * u, lineHeight: 0.92, letterSpacing: "-0.02em", color: colors.ink }}>
        {site.name}
      </div>
      {line(8, site.url)}
      {line(14, site.repo, true)}
      {line(20, "video/ · Remotion + Playwright", true)}
    </AbsoluteFill>
  );
}
