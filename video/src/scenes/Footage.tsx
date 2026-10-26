import { AbsoluteFill, OffthreadVideo, Sequence, staticFile } from "remotion";
import { cuts, minFontSize, type CutId } from "../cuts";
import { footageScenes, planPane, takes, type Pane, type PanePart } from "../footage";
import { boxes, type Rect } from "../layout";
import { colors, fonts, radius, shadow } from "../theme";
import type { SceneProps } from "./index";

/** One part of a take, cropped and fitted inside `rect`, in a media frame unless it fills the screen. */
function Framed({ rect, part, bare }: { rect: Rect; part: PanePart; bare: boolean }) {
  const take = takes[part.take];
  const { crop } = part;
  const scale = Math.min(rect.width / crop.width, rect.height / crop.height);
  const width = crop.width * scale;
  const height = crop.height * scale;
  return (
    <div
      style={{
        position: "absolute",
        left: rect.x + (rect.width - width) / 2,
        top: rect.y + (rect.height - height) / 2,
        width,
        height,
        overflow: "hidden",
        borderRadius: bare ? 0 : radius.md,
        boxShadow: bare ? undefined : shadow.lift,
        outline: bare ? undefined : `1px solid ${colors.line}`,
      }}
    >
      <OffthreadVideo
        src={staticFile(`footage/${part.take}.mp4`)}
        trimBefore={Math.round(part.from * cuts.readme.fps)}
        playbackRate={part.rate}
        muted
        style={{ position: "absolute", left: -crop.x * scale, top: -crop.y * scale, width: take.width * scale, height: take.height * scale, maxWidth: "none" }}
      />
    </div>
  );
}

/** A pane plays its segments one after another; a label, if any, sits above it. */
function PaneView({ cut, pane, frames }: { cut: CutId; pane: Pane; frames: number }) {
  const rect = boxes(cut)[pane.box];
  const labelSize = minFontSize(cut) * 0.75;
  const labelHeight = pane.label ? Math.round(labelSize * 1.6) : 0;
  const area = { ...rect, y: rect.y + labelHeight, height: rect.height - labelHeight };
  let at = 0;
  return (
    <>
      {pane.label && (
        <div
          style={{
            position: "absolute",
            left: rect.x,
            top: rect.y,
            width: rect.width,
            textAlign: "center",
            fontFamily: fonts.mono,
            fontWeight: 500,
            fontSize: labelSize,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: colors["ink-muted"],
          }}
        >
          {pane.label}
        </div>
      )}
      {planPane(pane, frames).map((part) => {
        const from = at;
        at += part.durationInFrames;
        return (
          <Sequence key={from} from={from} durationInFrames={part.durationInFrames} layout="none">
            <Framed rect={area} part={part} bare={pane.box === "full"} />
          </Sequence>
        );
      })}
    </>
  );
}

/** A scene made of footage, as footage.ts plans it for this cut. */
export function FootageScene({ cut, scene }: SceneProps) {
  const shots = footageScenes[scene.id]?.[cut] ?? [];
  const { fps } = cuts[cut];
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      {shots.map((shot) => {
        const frames = Math.round((shot.to - shot.from) * fps);
        return (
          <Sequence key={shot.from} from={Math.round(shot.from * fps)} durationInFrames={frames} layout="none">
            {shot.panes.map((pane) => (
              <PaneView key={pane.box} cut={cut} pane={pane} frames={frames} />
            ))}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
