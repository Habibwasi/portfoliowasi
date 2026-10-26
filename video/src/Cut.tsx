import { AbsoluteFill, Sequence } from "remotion";
import { Caption } from "./Caption";
import { captionsOf, scenesOf, type CutId } from "./cuts";
import { sceneComponents } from "./scenes";
import { colors } from "./theme";

/** One cut of the video: its scenes back to back, each with its question and captions on top. */
export function Cut({ cut }: { cut: CutId }) {
  const captions = captionsOf(cut);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      {scenesOf(cut).map((scene) => {
        const SceneComponent = sceneComponents[scene.id];
        return (
          <Sequence key={scene.id} name={`${scene.n} ${scene.id}`} from={scene.from} durationInFrames={scene.durationInFrames}>
            <SceneComponent cut={cut} scene={scene} />
            {captions
              .filter((caption) => caption.scene === scene.id)
              .map((caption) => (
                <Sequence key={caption.text} name={caption.text} from={caption.from} durationInFrames={caption.durationInFrames} layout="none">
                  <Caption caption={caption} />
                </Sequence>
              ))}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
