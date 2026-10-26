import { Composition } from "remotion";
import { Cut } from "./Cut";
import { cuts, type CutId } from "./cuts";
import { loadFonts } from "./fonts";

loadFonts();

export function Root() {
  return (
    <>
      {(Object.keys(cuts) as CutId[]).map((cut) => {
        const { id, width, height, fps, durationInFrames } = cuts[cut];
        return (
          <Composition
            key={id}
            id={id}
            component={Cut}
            defaultProps={{ cut }}
            width={width}
            height={height}
            fps={fps}
            durationInFrames={durationInFrames}
          />
        );
      })}
    </>
  );
}
