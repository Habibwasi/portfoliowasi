import { interpolate, useCurrentFrame } from "remotion";
import type { Caption as CaptionData } from "./cuts";
import { colors, fonts, radius } from "./theme";

const FADE = 8;

/**
 * A question or caption in its box from cuts.ts. It fades in and out over FADE frames; nothing
 * flashes. Questions are set in the display face, captions as a label on a paper chip.
 */
export function Caption({ caption }: { caption: CaptionData }) {
  const frame = useCurrentFrame();
  const { box, kind, text, durationInFrames } = caption;
  const opacity = interpolate(frame, [0, FADE, durationInFrames - FADE, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const question = kind === "question";
  return (
    <div
      style={{
        position: "absolute",
        left: box.x,
        top: box.y,
        width: box.width,
        height: box.height,
        display: "flex",
        alignItems: question ? "flex-start" : "flex-end",
        opacity,
      }}
    >
      <span
        style={{
          fontFamily: question ? fonts.display : fonts.sans,
          fontWeight: question ? 500 : 600,
          fontSize: box.fontSize,
          lineHeight: box.lineHeight,
          letterSpacing: question ? "-0.015em" : undefined,
          color: colors.ink,
          backgroundColor: question ? undefined : colors["paper-raised"],
          borderRadius: question ? undefined : radius.md,
          padding: question ? undefined : "0 0.25em",
          boxDecorationBreak: "clone",
          WebkitBoxDecorationBreak: "clone",
        }}
      >
        {text}
      </span>
    </div>
  );
}
