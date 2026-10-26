import { AbsoluteFill } from "remotion";
import { cuts } from "../cuts";
import { colors, fonts, radius } from "../theme";
import type { SceneProps } from "./index";

/** A visible stand-in until the scene is built (M.4): its number, name and what it will show. */
export function Placeholder({ cut, scene, shows }: SceneProps & { shows: string }) {
  const { width } = cuts[cut];
  return (
    <AbsoluteFill style={{ backgroundColor: colors["paper-sunk"], alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          border: `2px dashed ${colors["line-strong"]}`,
          borderRadius: radius.md,
          padding: width * 0.03,
          maxWidth: width * 0.7,
          fontFamily: fonts.mono,
          fontWeight: 500,
          fontSize: width * 0.022,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: colors["ink-muted"],
          textAlign: "center",
        }}
      >
        Scene {scene.n} · {scene.id}
        <br />
        {shows}
      </div>
    </AbsoluteFill>
  );
}
